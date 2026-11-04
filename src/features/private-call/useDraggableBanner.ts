import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  type LayoutChangeEvent,
  type LayoutRectangle,
  PanResponder,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { clampOffset, dragBoundsOf, type Offset } from "./bannerDrag";

const SCREEN_MARGIN = 8;
const DRAG_THRESHOLD = 6;

export function useDraggableBanner(top: number) {
  const screen = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [position] = useState(() => new Animated.ValueXY());
  const [frame, setFrame] = useState<LayoutRectangle | null>(null);
  const offsetRef = useRef<Offset>({ x: 0, y: 0 });
  const dragStartRef = useRef<Offset>({ x: 0, y: 0 });

  const bounds = useMemo(
    () =>
      frame
        ? dragBoundsOf({
            banner: { ...frame, y: top + frame.y },
            screen,
            insets,
            margin: SCREEN_MARGIN,
          })
        : null,
    [frame, top, screen, insets],
  );
  const boundsRef = useRef(bounds);

  const moveTo = useCallback(
    (offset: Offset) => {
      const current = boundsRef.current;
      const next = current ? clampOffset(offset, current) : offset;
      offsetRef.current = next;
      position.setValue(next);
    },
    [position],
  );

  useEffect(() => {
    boundsRef.current = bounds;
    moveTo(offsetRef.current);
  }, [bounds, moveTo]);

  const panResponder = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_event, gesture) =>
          Math.abs(gesture.dx) > DRAG_THRESHOLD ||
          Math.abs(gesture.dy) > DRAG_THRESHOLD,
        onPanResponderGrant: () => {
          dragStartRef.current = offsetRef.current;
        },
        onPanResponderMove: (_event, gesture) => {
          const start = dragStartRef.current;
          moveTo({ x: start.x + gesture.dx, y: start.y + gesture.dy });
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [moveTo],
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => setFrame(event.nativeEvent.layout),
    [],
  );

  return {
    panHandlers: panResponder.panHandlers,
    transform: position.getTranslateTransform(),
    onLayout,
  };
}
