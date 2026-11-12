import { type PresetBanner } from "@discordia/client-shared";
import { StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

interface PresetGradientFillProps {
  preset: PresetBanner;
  idPrefix: string;
  radius?: number;
}

export function PresetGradientFill({
  preset,
  idPrefix,
  radius = 0,
}: PresetGradientFillProps) {
  const gradientId = `${idPrefix}-${preset.id}`;
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          {preset.colors.map((color, index) => (
            <Stop
              key={color}
              offset={preset.locations[index]}
              stopColor={color}
            />
          ))}
        </LinearGradient>
      </Defs>
      <Rect
        x={0}
        y={0}
        width="100%"
        height="100%"
        rx={radius}
        ry={radius}
        fill={`url(#${gradientId})`}
      />
    </Svg>
  );
}
