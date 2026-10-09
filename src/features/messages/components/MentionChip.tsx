import { hexToRgba } from "@discordia/client-shared";

import { Text } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";

interface MentionChipProps {
  text: string;
  color?: string | null;
  isStrong?: boolean;
}

export function MentionChip({
  text,
  color,
  isStrong = false,
}: MentionChipProps) {
  const colors = useThemeColors();

  if (!color) {
    return (
      <Text
        className={
          isStrong
            ? "rounded font-bold text-highlight"
            : "rounded font-medium text-highlight"
        }
        style={{ backgroundColor: hexToRgba(colors.highlight, 0.15) }}
      >
        {text}
      </Text>
    );
  }
  return (
    <Text
      className="rounded font-medium"
      style={{ backgroundColor: hexToRgba(color, 0.16), color }}
    >
      {text}
    </Text>
  );
}
