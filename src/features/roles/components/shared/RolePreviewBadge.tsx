import { hexToRgba, isValidHex } from "@discordia/client-shared";

import { Text, View } from "react-native";

export function RolePreviewBadge({
  name,
  color,
}: {
  name: string;
  color: string;
}) {
  if (!isValidHex(color)) return null;
  return (
    <View
      className="flex-row items-center gap-1.5 shrink-0 max-w-37.5 ml-2 rounded-full border px-2.5 py-1.5"
      style={{
        borderColor: hexToRgba(color, 0.4),
        backgroundColor: hexToRgba(color, 0.12),
      }}
    >
      <View className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
      <Text
        className="text-[12px] font-bold"
        style={{ color }}
        numberOfLines={1}
      >
        {name.trim() || "Rol"}
      </Text>
    </View>
  );
}
