import {
  BOOSTED_BADGE,
  BOOSTED_BADGE_COPY,
  boostedBadgeStrokeWidth,
  brandViewBox,
  PREMIUM_BRAND_COLORS,
  THEMES,
} from "@discordia/client-shared";
import Svg, { Polygon, Rect } from "react-native-svg";

import { useThemeColors } from "../../../theme/theme-context";

interface BoostedBadgeProps {
  size?: number;
  surface?: "theme" | "dark" | "light";
  decorative?: boolean;
}

export function BoostedBadge({
  size = 16,
  surface = "theme",
  decorative = false,
}: BoostedBadgeProps) {
  const colors = useThemeColors();
  const outline =
    surface === "theme"
      ? colors.boostBadgeOutline
      : THEMES[surface].boostBadgeOutline;
  const { viewBox, hexagon, bars, piece } = BOOSTED_BADGE;

  return (
    <Svg
      width={size}
      height={size}
      viewBox={brandViewBox(viewBox)}
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : "image"}
      accessibilityLabel={decorative ? undefined : BOOSTED_BADGE_COPY.label}
    >
      <Polygon
        points={hexagon.points}
        fill={PREMIUM_BRAND_COLORS[hexagon.fill]}
        stroke={outline}
        strokeWidth={boostedBadgeStrokeWidth(size)}
        strokeLinejoin="round"
      />
      {bars.map(({ fill, ...bar }) => (
        <Rect key={bar.y} {...bar} fill={PREMIUM_BRAND_COLORS[fill]} />
      ))}
      <Rect
        x={piece.x}
        y={piece.y}
        width={piece.width}
        height={piece.height}
        rx={piece.rx}
        fill={PREMIUM_BRAND_COLORS[piece.fill]}
        stroke={PREMIUM_BRAND_COLORS[piece.stroke]}
        strokeWidth={piece.strokeWidth}
      />
    </Svg>
  );
}
