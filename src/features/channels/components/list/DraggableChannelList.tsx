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
  rowHeightOf?: (channel: Channel) => number;
}

function offsetsOf(heights: readonly number[]): number[] {
  const offsets: number[] = [];
  let top = 0;
  for (const height of heights) {
    offsets.push(top);
    top += height;
  }
  return offsets;
}

export function DraggableChannelList({
  channels,
  bucketKey,
  renderChannel,
  onReorder,
  onMoveToOtherBucket,
  onDragActiveChange,
  rowHeightOf = () => DRAG_ROW_HEIGHT,
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

  const channelById = new Map(channels.map((channel) => [channel.id, channel]));
  const heightOf = (id: string) => {
    const channel = channelById.get(id);
    return channel ? rowHeightOf(channel) : DRAG_ROW_HEIGHT;
  };
  const heights = order.map(heightOf);
  const offsets = offsetsOf(heights);

  const startOffsetRef = useRef(0);

  function handleDragStart(channel: Channel) {
    const index = orderRef.current.indexOf(channel.id);
    startOffsetRef.current = offsetsOf(orderRef.current.map(heightOf))[index];
    setDraggingId(channel.id);
    onDragActiveChange?.(true);
    channelDrag.beginDrag(channel, bucketKey, DRAG_ROW_HEIGHT, listRef);
  }

  function handleDragMove(id: string, dy: number) {
    const center = startOffsetRef.current + dy + DRAG_ROW_HEIGHT / 2;
    const others = orderRef.current.filter((other) => other !== id);
    let targetIndex = 0;
    let top = 0;
    for (const other of others) {
      const height = heightOf(other);
      if (center > top + height / 2) targetIndex += 1;
      top += height;
    }
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

  const totalHeight = heights.reduce((sum, height) => sum + height, 0);

  return (
    <View
      ref={listRef}
      collapsable={false}
      style={[styles.container, { height: totalHeight }]}
    >
      {order.map((id, index) => {
        const channel = channelById.get(id);
        if (!channel) return null;

        return (
          <DraggableRow
            key={id}
            bucketKey={bucketKey}
            top={offsets[index]}
            height={heights[index]}
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
  top: rowTop,
  height,
  isDragging,
  onDragStart,
  onDragMove,
  onDragEnd,
  children,
}: {
  bucketKey: string;
  top: number;
  height: number;
  isDragging: boolean;
  onDragStart: () => void;
  onDragMove: (dy: number) => void;
  onDragEnd: () => void;
  children: React.ReactNode;
}) {
  const channelDrag = useChannelDrag();

  const top = useMemo(
    () => new Animated.Value(rowTop),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- valor inicial nada más, a propósito no seguimos actualizando `rowTop` acá
    [],
  );

  const rowTopRef = useRef(rowTop);
  useEffect(() => {
    rowTopRef.current = rowTop;
  }, [rowTop]);

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
      toValue: rowTop,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [rowTop, isDragging, top]);

  const panResponder = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponderCapture: (_evt, gesture) =>
          Math.abs(gesture.dy) > 6 || Math.abs(gesture.dx) > 6,
        onPanResponderGrant: () => {
          startTopRef.current = rowTopRef.current;
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
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
      }),
    [bucketKey, top],
  );

  return (
    <Animated.View
      style={[
        styles.row,
        { top, height },
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
