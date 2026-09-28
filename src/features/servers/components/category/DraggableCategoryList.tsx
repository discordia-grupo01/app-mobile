import { type Category } from "@discordia/client-shared";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GestureResponderHandlers } from "react-native";
import { Animated, PanResponder, View } from "react-native";

const FALLBACK_ROW_HEIGHT = 40;

interface DraggableCategoryListProps {
  categories: Category[];
  renderCategory: (
    category: Category,
    panHandlers: GestureResponderHandlers,
  ) => React.ReactNode;
  onReorder: (orderedIds: string[]) => void;
  onDragActiveChange?: (active: boolean) => void;
}

export function DraggableCategoryList({
  categories,
  renderCategory,
  onReorder,
  onDragActiveChange,
}: DraggableCategoryListProps) {
  const categoryIds = categories.map((category) => category.id);
  const idsKey = categoryIds.join("|");

  const [order, setOrder] = useState<string[]>(categoryIds);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [syncedKey, setSyncedKey] = useState(idsKey);
  if (idsKey !== syncedKey && !draggingId) {
    setSyncedKey(idsKey);
    setOrder(categoryIds);
  }

  const orderRef = useRef(order);
  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  const heightsRef = useRef<Map<string, number>>(new Map());
  const [, setHeightsVersion] = useState(0);

  function heightOf(id: string): number {
    return heightsRef.current.get(id) ?? FALLBACK_ROW_HEIGHT;
  }

  function handleMeasure(id: string, height: number) {
    if (heightsRef.current.get(id) === height) return;
    heightsRef.current.set(id, height);
    setHeightsVersion((v) => v + 1);
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

    if (next.some((catId, index) => currentOrder[index] !== catId)) {
      orderRef.current = next;
      setOrder(next);
    }
  }

  function handleDragEnd(id: string) {
    setDraggingId(null);
    onDragActiveChange?.(false);

    const changed =
      orderRef.current.length !== categoryIds.length ||
      orderRef.current.some((catId, index) => categoryIds[index] !== catId);
    if (changed) {
      onReorder(orderRef.current);
    }
  }

  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );
  const offsets = offsetsFor(order);

  return (
    <View style={{ height: totalHeight(order) }}>
      {order.map((id) => {
        const category = categoryById.get(id);
        if (!category) return null;

        return (
          <DraggableCategoryRow
            key={id}
            top={offsets.get(id) ?? 0}
            isDragging={draggingId === id}
            onDragStart={() => handleDragStart(id)}
            onDragMove={(dy) => handleDragMove(id, dy)}
            onDragEnd={() => handleDragEnd(id)}
            onMeasure={(height) => handleMeasure(id, height)}
          >
            {(panHandlers) => renderCategory(category, panHandlers)}
          </DraggableCategoryRow>
        );
      })}
    </View>
  );
}

function DraggableCategoryRow({
  top,
  isDragging,
  onDragStart,
  onDragMove,
  onDragEnd,
  onMeasure,
  children,
}: {
  top: number;
  isDragging: boolean;
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
    Animated.timing(topAnim, {
      toValue: top,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [top, isDragging, topAnim]);

  const callbacksRef = useRef({ onDragStart, onDragMove, onDragEnd });
  useEffect(() => {
    callbacksRef.current = { onDragStart, onDragMove, onDragEnd };
  });

  const startTopValueRef = useRef(0);

  const panResponder = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs -- mismo caso que DraggableChannelList: el responder tiene que mantener identidad durante todo el gesto
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
