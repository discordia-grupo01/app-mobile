import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";

interface EditFieldButtonProps {
  label: string;
  onPress: () => void;
}

export function EditFieldButton({ label, onPress }: EditFieldButtonProps) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      className="w-7 h-7 items-center justify-center rounded-md"
    >
      <Feather name="edit-2" size={13} color={colors.textSubtle} />
    </TouchableOpacity>
  );
}
