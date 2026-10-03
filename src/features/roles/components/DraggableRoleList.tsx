import { type Role } from "@discordia/client-shared";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GestureResponderHandlers } from "react-native";
import { Animated, PanResponder, View } from "react-native";

const FALLBACK_ROW_HEIGHT = 48;

interface DraggableRoleListProps {
  roles: Role[];
  renderRole: (
    role: Role,
    panHandlers: GestureResponderHandlers,
  ) => React.ReactNode;
  onReorder: (orderedIds: string[]) => void;
  onDragActiveChange?: (active: boolean) => void;
}

export function DraggableRoleList({
  roles,
  renderRole,
  onReorder,
  onDragActiveChange,
}: DraggableRoleListProps) {
  const roleIds = roles.map((role) => role.id);
  const idsKey = roleIds.join("|");

  const [order, setOrder] = useState<string[]>(roleIds);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [syncedKey, setSyncedKey] = useState(idsKey);
  if (idsKey !== syncedKey && !draggingId) {
    setSyncedKey(idsKey);
    setOrder(roleIds);
  }

  const orderRef = useRef(order);
  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  const [heights, setHeights] = useState<Record<string, number>>({});

  function heightOf(id: string): number {
    return heights[id] ?? FALLBACK_ROW_HEIGHT;
  }

  function handleMeasure(id: string, height: number) {
    setHeights((prev) => {
      const previousHeight = prev[id];
      if (
        previousHeight !== undefined &&
        Math.abs(previousHeight - height) < 0.5
      ) {
        return prev;
      }
      return { ...prev, [id]: height };
    });
  }

  const allMeasured = order.every((id) => id in heights);
  const [canAnimate, setCanAnimate] = useState(false);
  if (allMeasured && !canAnimate) {
    setCanAnimate(true);
  }

  function offsetsFor(ids: string[]): Map<string, number> {
    const map = new Map<string, number>();
    let acc = 0;
    for (const id of ids) {
      map.set(id, acc);
      acc += heightOf(id);
    }
    return map;
  }

  function totalHeight(ids: string[]): number {
    return ids.reduce((sum, id) => sum + heightOf(id), 0);
  }

  const startTopRef = useRef(0);

  function handleDragStart(id: string) {
    startTopRef.current = offsetsFor(orderRef.current).get(id) ?? 0;
    setDraggingId(id);
    onDragActiveChange?.(true);
  }

  function handleDragMove(id: string, dy: number) {
    const currentOrder = orderRef.current;
    const others = currentOrder.filter((otherId) => otherId !== id);
    const draggedCenter = startTopRef.current + dy + heightOf(id) / 2;

    let acc = 0;
    let targetIndex = others.length;
    for (let i = 0; i < others.length; i++) {
      const otherHeight = heightOf(others[i]);
      if (draggedCenter < acc + otherHeight / 2) {
        targetIndex = i;
        break;
      }
      acc += otherHeight;
    }

    const next = [...others];
    next.splice(targetIndex, 0, id);

    if (next.some((roleId, index) => currentOrder[index] !== roleId)) {
      orderRef.current = next;
      setOrder(next);
    }
  }

  function handleDragEnd(id: string) {
    setDraggingId(null);
    onDragActiveChange?.(false);

    const changed =
      orderRef.current.length !== roleIds.length ||
      orderRef.current.some((roleId, index) => roleIds[index] !== roleId);
    if (changed) {
      onReorder(orderRef.current);
    }
  }

  const roleById = new Map(roles.map((role) => [role.id, role]));
  const offsets = offsetsFor(order);

  return (
    <View style={{ height: totalHeight(order) }}>
      {order.map((id) => {
        const role = roleById.get(id);
        if (!role) return null;

        return (
          <DraggableRoleRow
            key={id}
            top={offsets.get(id) ?? 0}
            isDragging={draggingId === id}
            canAnimate={canAnimate}
            onDragStart={() => handleDragStart(id)}
            onDragMove={(dy) => handleDragMove(id, dy)}
            onDragEnd={() => handleDragEnd(id)}
            onMeasure={(height) => handleMeasure(id, height)}
          >
            {(panHandlers) => renderRole(role, panHandlers)}
          </DraggableRoleRow>
        );
      })}
    </View>
  );
}

function DraggableRoleRow({
  top,
  isDragging,
  canAnimate,
  onDragStart,
  onDragMove,
  onDragEnd,
  onMeasure,
  children,
}: {
  top: number;
  isDragging: boolean;
  canAnimate: boolean;
  onDragStart: () => void;
  onDragMove: (dy: number) => void;
  onDragEnd: () => void;
  onMeasure: (height: number) => void;
  children: (panHandlers: GestureResponderHandlers) => React.ReactNode;
}) {
  const topAnim = useMemo(() => new Animated.Value(top), []); // eslint-disable-line react-hooks/exhaustive-deps -- valor inicial nada mas

  const topRef = useRef(top);
  useEffect(() => {
    topRef.current = top;
  }, [top]);

  useEffect(() => {
    if (isDragging) return;
    if (!canAnimate) {
      topAnim.setValue(top);
      return;
    }
    Animated.timing(topAnim, {
      toValue: top,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [top, isDragging, canAnimate, topAnim]);

  const callbacksRef = useRef({ onDragStart, onDragMove, onDragEnd });
  useEffect(() => {
    callbacksRef.current = { onDragStart, onDragMove, onDragEnd };
  });

  const startTopValueRef = useRef(0);

  const panResponder = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponderCapture: (_evt, gesture) =>
          Math.abs(gesture.dy) > 6 || Math.abs(gesture.dx) > 6,
        onPanResponderGrant: () => {
          startTopValueRef.current = topRef.current;
          callbacksRef.current.onDragStart();
        },
        onPanResponderMove: (_evt, gesture) => {
          topAnim.setValue(startTopValueRef.current + gesture.dy);
          callbacksRef.current.onDragMove(gesture.dy);
        },
        onPanResponderRelease: () => {
          callbacksRef.current.onDragEnd();
        },
        onPanResponderTerminate: () => {
          callbacksRef.current.onDragEnd();
        },
      }),
    [topAnim],
  );

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: topAnim,
        zIndex: isDragging ? 10 : 0,
        opacity: isDragging ? 0.9 : 1,
      }}
      onLayout={(event) => onMeasure(event.nativeEvent.layout.height)}
    >
      {children(panResponder.panHandlers)}
    </Animated.View>
  );
}
