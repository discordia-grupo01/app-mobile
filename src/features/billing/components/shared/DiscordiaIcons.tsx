import {
  type BrandRect,
  type BrandStroke,
  brandViewBox,
  POINT_ICON,
  PREMIUM_BADGE,
  PREMIUM_BRAND_COLORS as COLORS,
  PREMIUM_ICON,
  PREMIUM_MARK,
  premiumBadgeOutlineWidth,
  premiumBadgeWidth,
  showsPremiumBadgeModules,
} from "@discordia/client-shared";

import Svg, { Circle, G, Path, Polygon, Rect } from "react-native-svg";

type IconProps = { size?: number };

function BrandRectShape({ fill, ...rect }: BrandRect) {
  return <Rect {...rect} fill={COLORS[fill]} />;
}

function BrandStrokeShape({
  stroke,
  rounded = false,
  ...path
}: BrandStroke & { rounded?: boolean }) {
  return (
    <Path
      {...path}
      fill="none"
      stroke={COLORS[stroke]}
      strokeLinecap={rounded ? "round" : undefined}
    />
  );
}

export function DiscordiaPremiumIcon({ size = 16 }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={brandViewBox(PREMIUM_ICON.viewBox)}
    >
      {PREMIUM_ICON.blocks.map((block) => (
        <BrandRectShape key={`${block.x}-${block.y}`} {...block} />
      ))}
      <BrandStrokeShape {...PREMIUM_ICON.connector} rounded />
    </Svg>
  );
}

export function DiscordiaPointIcon({ size = 16 }: IconProps) {
  const { coin, coinCenter } = POINT_ICON;
  return (
    <Svg width={size} height={size} viewBox={brandViewBox(POINT_ICON.viewBox)}>
      <BrandStrokeShape {...POINT_ICON.cable} rounded />
      <Circle
        cx={coin.cx}
        cy={coin.cy}
        r={coin.r}
        fill={COLORS[coin.fill]}
        stroke={COLORS[coin.stroke]}
        strokeWidth={coin.strokeWidth}
      />
      <Circle
        cx={coinCenter.cx}
        cy={coinCenter.cy}
        r={coinCenter.r}
        fill={COLORS[coinCenter.fill]}
      />
    </Svg>
  );
}

export function DiscordiaPremiumMark({ size = 120 }: IconProps) {
  const { dot } = PREMIUM_MARK;
  return (
    <Svg
      width={size}
      height={size}
      viewBox={brandViewBox(PREMIUM_MARK.viewBox)}
    >
      <BrandRectShape {...PREMIUM_MARK.tile} />
      <G transform={PREMIUM_MARK.transform}>
        <BrandStrokeShape {...PREMIUM_MARK.arc} />
        {PREMIUM_MARK.modules.map((module) => (
          <BrandRectShape key={module.y} {...module} />
        ))}
        <BrandStrokeShape {...PREMIUM_MARK.cable} rounded />
        <BrandRectShape {...PREMIUM_MARK.connector} />
        <Circle cx={dot.cx} cy={dot.cy} r={dot.r} fill={COLORS[dot.fill]} />
      </G>
    </Svg>
  );
}

export function DiscordiaPremiumBadge({ size = 40 }: IconProps) {
  const { hexagon, outerD, innerD } = PREMIUM_BADGE;
  return (
    <Svg
      width={premiumBadgeWidth(size)}
      height={size}
      viewBox={brandViewBox(PREMIUM_BADGE.viewBox)}
    >
      <Polygon
        points={hexagon.points}
        fill={COLORS[hexagon.fill]}
        stroke={COLORS[hexagon.stroke]}
        strokeWidth={premiumBadgeOutlineWidth(size)}
        strokeLinejoin="round"
      />
      <G transform={PREMIUM_BADGE.transform}>
        <Path d={outerD.d} fill={COLORS[outerD.fill]} />
        <Path d={innerD.d} fill={COLORS[innerD.fill]} />
        {showsPremiumBadgeModules(size)
          ? PREMIUM_BADGE.modules.map((module) => (
              <BrandRectShape key={module.y} {...module} />
            ))
          : null}
        <BrandRectShape {...PREMIUM_BADGE.piece} />
      </G>
    </Svg>
  );
}
