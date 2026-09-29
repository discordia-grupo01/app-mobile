import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

import { cn } from "../../../lib/cn";

interface ComposerIconButtonProps {
  name: keyof typeof Feather.glyphMap;
  label: string;
  color: string;
  onPress?: () => void;
  disabled?: boolean;
}

export function ComposerIconButton({
  name,
  label,
  color,
  onPress,
  disabled = false,
}: ComposerIconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      className={cn(
        "h-10 w-10 items-center justify-center",
        disabled && "opacity-50",
      )}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Feather name={name} size={20} color={color} />
    </TouchableOpacity>
  );
}
