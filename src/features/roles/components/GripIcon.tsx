import { View } from "react-native";

interface GripIconProps {
  size?: number;
  color: string;
  opacity?: number;
}

const DOT_POSITIONS = [
  { x: 8 / 24, y: 6 / 24 },
  { x: 16 / 24, y: 6 / 24 },
  { x: 8 / 24, y: 12 / 24 },
  { x: 16 / 24, y: 12 / 24 },
  { x: 8 / 24, y: 18 / 24 },
  { x: 16 / 24, y: 18 / 24 },
];

export function GripIcon({ size = 14, color, opacity = 1 }: GripIconProps) {
  const dotSize = size * (3 / 24);

  return (
    <View style={{ width: size, height: size, opacity }}>
      {DOT_POSITIONS.map((position, index) => (
        <View
          key={index}
          style={{
            position: "absolute",
            left: position.x * size - dotSize / 2,
            top: position.y * size - dotSize / 2,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}
