export interface Offset {
  x: number;
  y: number;
}

export interface DragBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface Frame {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function dragBoundsOf({
  banner,
  screen,
  insets,
  margin,
}: {
  banner: Frame;
  screen: { width: number; height: number };
  insets: Insets;
  margin: number;
}): DragBounds {
  return {
    minX: insets.left + margin - banner.x,
    maxX: screen.width - insets.right - margin - (banner.x + banner.width),
    minY: insets.top + margin - banner.y,
    maxY: screen.height - insets.bottom - margin - (banner.y + banner.height),
  };
}

export function clampOffset(offset: Offset, bounds: DragBounds): Offset {
  return {
    x: clamp(offset.x, bounds.minX, bounds.maxX),
    y: clamp(offset.y, bounds.minY, bounds.maxY),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
