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
}

export function BoostLevelIcon({
  level,
  size = 16,
  dimmed = false,
  bare = false,
}: BoostLevelIconProps) {
  const colors = useThemeColors();
  const { viewBox, bars, strokeWidth, filledStrokeWidth, emptyDash } =
    BOOST_LEVEL_ICON;
  const svg = (
    <Svg width={size} height={size} viewBox={brandViewBox(viewBox)}>
      {bars.map(({ fill, ...bar }, index) => {
        const filled = index < level;
        return (
          <Rect
            key={bar.y}
            {...bar}
            fill={filled ? PREMIUM_BRAND_COLORS[fill] : "none"}
            stroke={filled ? colors.boostLevelOutline : colors.boostLevelEmpty}
            strokeWidth={filled ? filledStrokeWidth : strokeWidth}
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
