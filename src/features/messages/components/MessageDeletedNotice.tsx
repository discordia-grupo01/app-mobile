import { MESSAGE_DELETED_NOTICE } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";

/** Placeholder de un mensaje borrado: reemplaza el contenido, no la fila. */
export function MessageDeletedNotice() {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-1.5">
      <Feather name="slash" size={13} color={colors.textSubtle} />
      <Text className="text-[14px] italic text-content-subtle">
        {MESSAGE_DELETED_NOTICE}
      </Text>
    </View>
  );
}
