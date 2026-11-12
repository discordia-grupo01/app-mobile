import {
  BOOST_ACTION_ICON,
  brandViewBox,
  PREMIUM_BRAND_COLORS,
} from "@discordia/client-shared";
import Svg, { Path, Rect } from "react-native-svg";

export function BoostActionIcon({ size = 16 }: { size?: number }) {
  const { viewBox, blocks, connector } = BOOST_ACTION_ICON;
  return (
    <Svg width={size} height={size} viewBox={brandViewBox(viewBox)}>
      {blocks.map(({ fill, ...block }) => (
        <Rect key={block.y} {...block} fill={PREMIUM_BRAND_COLORS[fill]} />
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
