import { type Channel } from "@discordia/client-shared";

import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet, View } from "react-native";

import { useChannelDrag } from "./ChannelDragContext";

export const DRAG_ROW_HEIGHT = 48;

interface DraggableChannelListProps {
  channels: Channel[];
  bucketKey: string;
  renderChannel: (channel: Channel) => React.ReactNode;
  onReorder: (orderedIds: string[]) => void;
  onMoveToOtherBucket: (
    channel: Channel,
    targetCategoryId: string | null,
  ) => void;
  onDragActiveChange?: (active: boolean) => void;
}

export function DraggableChannelList({
  channels,
  bucketKey,
  renderChannel,
  onReorder,
  onMoveToOtherBucket,
  onDragActiveChange,
}: DraggableChannelListProps) {
  const listRef = useRef<View>(null);
  const channelDrag = useChannelDrag();

  const channelIds = channels.map((channel) => channel.id);
  const channelsKey = channelIds.join("|");

  const [order, setOrder] = useState<string[]>(channelIds);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [syncedKey, setSyncedKey] = useState(channelsKey);
  if (channelsKey !== syncedKey && !draggingId) {
    setSyncedKey(channelsKey);
    setOrder(channelIds);
  }

  const orderRef = useRef(order);
  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  const startIndexRef = useRef(0);

  function handleDragStart(channel: Channel) {
    startIndexRef.current = orderRef.current.indexOf(channel.id);
    setDraggingId(channel.id);
    onDragActiveChange?.(true);
    channelDrag.beginDrag(channel, bucketKey, DRAG_ROW_HEIGHT, listRef);
  }

  function handleDragMove(id: string, dy: number) {
    const rawIndex = Math.round(
      (startIndexRef.current * DRAG_ROW_HEIGHT + dy) / DRAG_ROW_HEIGHT,
    );
    const targetIndex = Math.min(
      Math.max(rawIndex, 0),
      orderRef.current.length - 1,
    );
    const currentIndex = orderRef.current.indexOf(id);
    if (targetIndex !== currentIndex && currentIndex !== -1) {
      const next = [...orderRef.current];
      next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, id);
      orderRef.current = next;
      setOrder(next);
    }
  }

  function handleDragEnd() {
    setDraggingId(null);
    onDragActiveChange?.(false);

    const crossBucket = channelDrag.endDrag();
    if (crossBucket) {
      onMoveToOtherBucket(crossBucket.channel, crossBucket.targetCategoryId);
      return;
    }

    const changed =
      orderRef.current.length !== channelIds.length ||
      orderRef.current.some(
        (channelId, index) => channelIds[index] !== channelId,
      );
    if (changed) {
      onReorder(orderRef.current);
    }
  }

  const channelById = new Map(channels.map((channel) => [channel.id, channel]));

  return (
    <View
      ref={listRef}
      collapsable={false}
      style={[styles.container, { height: order.length * DRAG_ROW_HEIGHT }]}
    >
      {order.map((id, index) => {
        const channel = channelById.get(id);
        if (!channel) return null;

        return (
          <DraggableRow
            key={id}
            bucketKey={bucketKey}
            index={index}
            isDragging={draggingId === id}
            onDragStart={() => handleDragStart(channel)}
            onDragMove={(dy) => handleDragMove(id, dy)}
            onDragEnd={handleDragEnd}
          >
            {renderChannel(channel)}
          </DraggableRow>
        );
      })}
    </View>
  );
}

function DraggableRow({
  bucketKey,
  index,
  isDragging,
  onDragStart,
  onDragMove,
  onDragEnd,
  children,
}: {
  bucketKey: string;
  index: number;
  isDragging: boolean;
  onDragStart: () => void;
  onDragMove: (dy: number) => void;
  onDragEnd: () => void;
  children: React.ReactNode;
}) {
  const channelDrag = useChannelDrag();

  const top = useMemo(
    () => new Animated.Value(index * DRAG_ROW_HEIGHT),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- valor inicial nada más, a propósito no seguimos actualizando `index` acá
    [],
  );

  const indexRef = useRef(index);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const callbacksRef = useRef({ onDragStart, onDragMove, onDragEnd });
  useEffect(() => {
    callbacksRef.current = { onDragStart, onDragMove, onDragEnd };
  });

  const channelDragRef = useRef(channelDrag);
  useEffect(() => {
    channelDragRef.current = channelDrag;
  });

  const startTopRef = useRef(0);
  const isAwayRef = useRef(false);

  useEffect(() => {
    if (isDragging) return;
    Animated.timing(top, {
      toValue: index * DRAG_ROW_HEIGHT,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [index, isDragging, top]);

  const panResponder = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponderCapture: (_evt, gesture) =>
          Math.abs(gesture.dy) > 6 || Math.abs(gesture.dx) > 6,
        onPanResponderGrant: () => {
          startTopRef.current = indexRef.current * DRAG_ROW_HEIGHT;
          isAwayRef.current = false;
          callbacksRef.current.onDragStart();
        },
        onPanResponderMove: (_evt, gesture) => {
          const homeTop = channelDragRef.current.getHomeTop();
          if (homeTop !== null) {
            const centerY =
              homeTop + startTopRef.current + gesture.dy + DRAG_ROW_HEIGHT / 2;
            const hovered = channelDragRef.current.updateDrag(centerY);
            isAwayRef.current = hovered !== null && hovered !== bucketKey;
          }

          if (!isAwayRef.current) {
            top.setValue(startTopRef.current + gesture.dy);
            callbacksRef.current.onDragMove(gesture.dy);
          }
        },
        onPanResponderRelease: () => {
          callbacksRef.current.onDragEnd();
        },
        onPanResponderTerminate: () => {
          callbacksRef.current.onDragEnd();
        },
      }),
    [bucketKey, top],
  );

  return (
    <Animated.View
      style={[
        styles.row,
        { top, height: DRAG_ROW_HEIGHT },
        isDragging ? styles.rowDragging : null,
      ]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  row: {
    position: "absolute",
    left: 0,
    right: 0,
    justifyContent: "center",
  },
  rowDragging: {
    zIndex: 10,
    opacity: 0.85,
  },
});
