import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet, View } from "react-native";

import type { Channel } from "../../types";

/**
 * Alto fijo de cada fila mientras se arrastra. No hay ninguna librería de
 * gestos/drag instalada en el proyecto (ver package.json), así que esto se
 * implementa a mano con `PanResponder` + `Animated`, calculando posiciones
 * a partir de este alto en vez de medir cada fila con `onLayout`.
 */
export const DRAG_ROW_HEIGHT = 48;

interface DraggableChannelListProps {
  /** Canales de este balde (categoría o "sin categoría"), ya ordenados por `position`. */
  channels: Channel[];
  renderChannel: (channel: Channel) => React.ReactNode;
  /** Se llama al soltar, solo si el orden final cambió, con los ids en el nuevo orden. */
  onReorder: (orderedIds: string[]) => void;
  /** Avisa al padre para bloquear el scroll del contenedor mientras se arrastra. */
  onDragActiveChange?: (active: boolean) => void;
}

/**
 * Lista de canales reordenable por drag-and-drop, equivalente a
 * `SortableChannelRow` + `useSortable` de web-client (que usa `@dnd-kit`),
 * pero sin dependencias externas. Solo reordena dentro del mismo balde
 * (no mueve canales entre categorías), como pide la historia de usuario.
 *
 * Nota sobre refs: cada fila (`DraggableRow`) es dueña de su propio
 * `Animated.Value` (vía `useMemo`, no `useRef`), porque necesitamos leerlo
 * durante el render (en el `style`) -- y eso no está permitido para un valor
 * que salga de `ref.current`. Los `ref`s de este archivo solo se escriben
 * desde efectos o desde los callbacks del gesto, nunca durante el render.
 */
export function DraggableChannelList({
  channels,
  renderChannel,
  onReorder,
  onDragActiveChange,
}: DraggableChannelListProps) {
  const channelIds = channels.map((channel) => channel.id);
  const channelsKey = channelIds.join("|");

  const [order, setOrder] = useState<string[]>(channelIds);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Si el set de canales cambia desde afuera (se creó/borró uno en otro
  // lado) y no se está arrastrando, resincroniza el orden local. Se ajusta
  // el estado acá, durante el render (el patrón que recomienda React para
  // "adjust state when a prop changes"), no en un efecto, para no disparar
  // un render en cascada.
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

  function handleDragStart(id: string) {
    startIndexRef.current = orderRef.current.indexOf(id);
    setDraggingId(id);
    onDragActiveChange?.(true);
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

  function handleDragEnd(id: string) {
    setDraggingId(null);
    onDragActiveChange?.(false);

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
      style={[styles.container, { height: order.length * DRAG_ROW_HEIGHT }]}
    >
      {order.map((id, index) => {
        const channel = channelById.get(id);
        if (!channel) return null;

        return (
          <DraggableRow
            key={id}
            index={index}
            isDragging={draggingId === id}
            onDragStart={() => handleDragStart(id)}
            onDragMove={(dy) => handleDragMove(id, dy)}
            onDragEnd={() => handleDragEnd(id)}
          >
            {renderChannel(channel)}
          </DraggableRow>
        );
      })}
    </View>
  );
}

function DraggableRow({
  index,
  isDragging,
  onDragStart,
  onDragMove,
  onDragEnd,
  children,
}: {
  index: number;
  isDragging: boolean;
  onDragStart: () => void;
  onDragMove: (dy: number) => void;
  onDragEnd: () => void;
  children: React.ReactNode;
}) {
  // `top` se crea una sola vez con `useMemo` (no `useRef`): lo leemos
  // durante el render (en el `style`), y es un objeto mutable de una
  // librería externa (no estado de React), así que después está bien
  // mutarlo imperativamente desde efectos y handlers.
  const top = useMemo(
    () => new Animated.Value(index * DRAG_ROW_HEIGHT),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- valor inicial nada más, a propósito no seguimos actualizando `index` acá
    [],
  );

  // Refs actualizados solo desde efectos/handlers (nunca durante el
  // render), para que el PanResponder -- creado una única vez -- siempre
  // pueda leer los valores más recientes sin quedar con closures viejas.
  const indexRef = useRef(index);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const callbacksRef = useRef({ onDragStart, onDragMove, onDragEnd });
  useEffect(() => {
    callbacksRef.current = { onDragStart, onDragMove, onDragEnd };
  });

  const startTopRef = useRef(0);

  // Cuando cambia el índice lógico de esta fila (por un drag en curso en
  // otra fila) y esta fila no es la que se está arrastrando, anima su
  // posición a la nueva -- mientras se arrastra, la posición la maneja
  // directamente el gesto (más abajo).
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
      // El responder tiene que mantener la misma identidad durante todo un
      // gesto (si se recreara a mitad de un drag se perdería el punto de
      // partida y el cálculo de posición quedaría mal). Por eso sus
      // callbacks leen de refs en vez de closures frescas -- es el patrón
      // estándar de RN para `PanResponder`, aunque la regla `react-hooks/refs`
      // (pensada para el React Compiler, que este proyecto no usa) todavía
      // no lo reconoce como seguro.
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        // Como el `activationConstraint: { distance: 6 }` de dnd-kit en
        // web: un toque corto pasa como tap normal (abre el canal / el
        // menú "..."); recién si se mueve más de ~6px se toma como
        // inicio de un drag.
        onMoveShouldSetPanResponderCapture: (_evt, gesture) =>
          Math.abs(gesture.dy) > 6 || Math.abs(gesture.dx) > 6,
        onPanResponderGrant: () => {
          startTopRef.current = indexRef.current * DRAG_ROW_HEIGHT;
          callbacksRef.current.onDragStart();
        },
        onPanResponderMove: (_evt, gesture) => {
          top.setValue(startTopRef.current + gesture.dy);
          callbacksRef.current.onDragMove(gesture.dy);
        },
        onPanResponderRelease: () => {
          callbacksRef.current.onDragEnd();
        },
        onPanResponderTerminate: () => {
          callbacksRef.current.onDragEnd();
        },
      }),
    [top],
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
