import Svg, { Circle, G, Path, Polygon, Rect } from "react-native-svg";

/**
 * Colores del manual de marca (`logos.png`). Son fijos en los dos temas: el
 * amarillo es el acento de todo lo Premium y el token `warning` del tema claro
 * es más oscuro, así que el botón se veía apagado.
 */
export const LOGO = {
  deep: "#1C293B",
  petrol: "#245C6B",
  sky: "#A8C6DF",
  steel: "#6B95BD",
  yellow: "#F0B232",
  paper: "#F5F2EB",
} as const;

type IconProps = { size?: number };

export function DiscordiaPremiumIcon({ size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={5} y={14} width={7} height={7} rx={1.2} fill={LOGO.petrol} />
      <Rect x={5} y={6} width={7} height={7} rx={1.2} fill={LOGO.sky} />
      <Rect x={13} y={3} width={7} height={7} rx={1.2} fill={LOGO.yellow} />
      <Path
        d="M12 9.5h1"
        stroke={LOGO.deep}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function DiscordiaPointIcon({ size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 5v5c0 3 2 5 5 5h3"
        fill="none"
        stroke={LOGO.sky}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle
        cx={16.5}
        cy={15}
        r={4.5}
        fill={LOGO.yellow}
        stroke={LOGO.petrol}
        strokeWidth={1.5}
      />
      <Circle cx={16.5} cy={15} r={1.2} fill={LOGO.deep} />
    </Svg>
  );
}

export function DiscordiaPremiumMark({ size = 120 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Rect x={4} y={4} width={112} height={112} rx={26} fill={LOGO.yellow} />
      <G transform="translate(60 60) scale(0.84) translate(-68.75 -65)">
        <Path
          d="M62 26 h4 a34 34 0 0 1 0 68 h-4"
          fill="none"
          stroke={LOGO.deep}
          strokeWidth={15}
        />
        <Rect x={46} y={19} width={15} height={14} rx={1.5} fill={LOGO.deep} />
        <Rect x={46} y={35} width={15} height={11} rx={1.5} fill={LOGO.steel} />
        <Rect x={46} y={48} width={15} height={11} rx={1.5} fill={LOGO.sky} />
        <Rect x={46} y={61} width={15} height={11} rx={1.5} fill={LOGO.steel} />
        <Rect x={46} y={74} width={15} height={10} rx={1.5} fill={LOGO.sky} />
        <Rect x={46} y={86} width={15} height={15} rx={1.5} fill={LOGO.deep} />
        <Path
          d="M39 53.5 h7 M34.5 58 V98 a8 8 0 0 0 8 8 H86"
          fill="none"
          stroke={LOGO.deep}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
        <Rect x={30} y={49} width={9} height={9} rx={1.2} fill={LOGO.petrol} />
        <Circle cx={90} cy={106} r={5} fill={LOGO.deep} />
      </G>
    </Svg>
  );
}

const BADGE_HEXAGON = "0,-50 43.3,-25 43.3,25 0,50 -43.3,25 -43.3,-25";
// Por debajo de esto los módulos celestes se vuelven manchas.
const BADGE_DETAIL_MIN_SIZE = 28;

/** Insignia Premium: la D del logo en un hexágono con borde amarillo. */
export function DiscordiaPremiumBadge({ size = 40 }: IconProps) {
  const showModules = size >= BADGE_DETAIL_MIN_SIZE;
  // Fino en grande y sin desaparecer en chico.
  const outlineWidth = Math.max(2, 108 / size);

  return (
    <Svg width={(size * 96) / 108} height={size} viewBox="-48 -54 96 108">
      <Polygon
        points={BADGE_HEXAGON}
        fill={LOGO.deep}
        stroke={LOGO.yellow}
        strokeWidth={outlineWidth}
        strokeLinejoin="round"
      />
      <G transform="scale(0.8) translate(-340 -100)">
        <Path d="M326 68 H342 A32 32 0 0 1 342 132 H326 Z" fill={LOGO.paper} />
        <Path d="M334 82 H342 A18 18 0 0 1 342 118 H334 Z" fill={LOGO.deep} />
        {showModules ? (
          <>
            <Rect
              x={310}
              y={70}
              width={13}
              height={12}
              rx={2}
              fill={LOGO.sky}
            />
            <Rect
              x={310}
              y={85}
              width={13}
              height={12}
              rx={2}
              fill={LOGO.sky}
            />
            <Rect
              x={310}
              y={118}
              width={13}
              height={12}
              rx={2}
              fill={LOGO.sky}
            />
          </>
        ) : null}
        <Rect
          x={306}
          y={100}
          width={17}
          height={15}
          rx={2}
          fill={LOGO.yellow}
        />
      </G>
    </Svg>
  );
}
