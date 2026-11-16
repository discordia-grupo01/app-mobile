import {
  BOOST_ACTION_ICON,
  brandViewBox,
  PREMIUM_BRAND_COLORS,
} from "@discordia/client-shared";
import Svg, { Path, Rect } from "react-native-svg";

interface BoostActionIconProps {
  size?: number;
  /** Borde claro en los bloques, para que el petrol no se pierda sobre `accent`. */
  outlined?: boolean;
}

const OUTLINE_WIDTH = 0.6;

export function BoostActionIcon({
  size = 16,
  outlined = false,
}: BoostActionIconProps) {
  const { viewBox, blocks, connector } = BOOST_ACTION_ICON;
  return (
    <Svg width={size} height={size} viewBox={brandViewBox(viewBox)}>
      {blocks.map(({ fill, ...block }) => (
        <Rect
          key={block.y}
          {...block}
          fill={PREMIUM_BRAND_COLORS[fill]}
          stroke={outlined ? PREMIUM_BRAND_COLORS.paper : undefined}
          strokeWidth={outlined ? OUTLINE_WIDTH : undefined}
        />
      ))}
      <Path
        d={connector.d}
        stroke={PREMIUM_BRAND_COLORS[connector.stroke]}
        strokeWidth={connector.strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
