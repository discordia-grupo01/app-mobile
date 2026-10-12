import Svg, { Path } from "react-native-svg";

export type OverrideIconName = "deny" | "inherit" | "allow";

const PATHS: Record<OverrideIconName, readonly string[]> = {
  deny: ["M18 6 6 18", "m6 6 12 12"],
  inherit: ["M22 2 2 22"],
  allow: ["M20 6 9 17l-5-5"],
};

interface OverrideIconProps {
  name: OverrideIconName;
  size: number;
  color: string;
  strokeWidth?: number;
}

export function OverrideIcon({
  name,
  size,
  color,
  strokeWidth = 2.5,
}: OverrideIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name].map((d) => (
        <Path key={d} d={d} />
      ))}
    </Svg>
  );
}
