import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useThemeColors } from "../../theme/theme-context";

export function FieldError({ message }: { message?: string }) {
  const colors = useThemeColors();
  if (!message) return null;
  return (
    <View className="flex-row items-center gap-1.5 mt-1.5">
      <Feather name="alert-circle" size={13} color={colors.danger} />
      <Text className="flex-1 text-danger text-[12px]">{message}</Text>
    </View>
  );
}
