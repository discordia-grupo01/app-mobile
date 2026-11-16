import {
  BOOST_LEVEL_ICON,
  type BoostLevel,
  brandViewBox,
  PREMIUM_BRAND_COLORS,
} from "@discordia/client-shared";
import { View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import { useThemeColors } from "../../../theme/theme-context";

const TILE_PADDING_RATIO = 0.2;
const TILE_BORDER = 1;

export function boostLevelIconBox(size: number): number {
  return size + 2 * (Math.round(size * TILE_PADDING_RATIO) + TILE_BORDER);
}

interface BoostLevelIconProps {
  level: BoostLevel;
  size?: number;
  dimmed?: boolean;
  bare?: boolean;
  /** Sobre un fondo `accent`: el borde de las barras llenas va claro. */
  onAccent?: boolean;
  /** Recorta el aire alrededor de las barras: para tamaños chicos. */
  tight?: boolean;
}

const ON_ACCENT_STROKE_WIDTH = 0.4;

export function BoostLevelIcon({
  level,
  size = 16,
  dimmed = false,
  bare = false,
  onAccent = false,
  tight = false,
}: BoostLevelIconProps) {
  const colors = useThemeColors();
  const {
    viewBox,
    tightViewBox,
    bars,
    strokeWidth,
    filledStrokeWidth,
    emptyDash,
  } = BOOST_LEVEL_ICON;
  const filledStroke = onAccent
    ? PREMIUM_BRAND_COLORS.paper
    : colors.boostLevelOutline;
  const svg = (
    <Svg
      width={size}
      height={size}
      viewBox={brandViewBox(tight ? tightViewBox : viewBox)}
    >
      {bars.map(({ fill, ...bar }, index) => {
        const filled = index < level;
        return (
          <Rect
            key={bar.y}
            {...bar}
            fill={filled ? PREMIUM_BRAND_COLORS[fill] : "none"}
            stroke={filled ? filledStroke : colors.boostLevelEmpty}
            strokeWidth={
              filled
                ? onAccent
                  ? ON_ACCENT_STROKE_WIDTH
                  : filledStrokeWidth
                : strokeWidth
            }
            strokeDasharray={filled ? undefined : emptyDash}
          />
        );
      })}
    </Svg>
  );
  if (bare) return svg;

  return (
    <View
      className="items-center justify-center rounded-md border border-line bg-surface-input"
      style={{
        padding: Math.round(size * TILE_PADDING_RATIO),
        opacity: dimmed ? 0.6 : 1,
      }}
    >
      {svg}
    </View>
  );
}
