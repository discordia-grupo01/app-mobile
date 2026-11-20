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
      className="max-w-full shrink flex-row items-center gap-1.5 self-start rounded-full border px-2.5 py-1.5"
      style={{
        borderColor: hexToRgba(color, 0.4),
        backgroundColor: hexToRgba(color, 0.12),
      }}
    >
      <View className="h-2 w-2 rounded-sm" style={{ backgroundColor: color }} />
      <Text
        className="shrink text-[12px] font-bold"
        style={{ color }}
        numberOfLines={1}
      >
        {name.trim() || "Rol"}
      </Text>
    </View>
  );
}

/** Debajo del nombre y no adentro del input: un nombre largo no le deja lugar al texto. */
export function RolePreviewRow({
  name,
  color,
}: {
  name: string;
  color: string;
}) {
  return (
    <View className="mt-2.5 flex-row items-center gap-2">
      <Text className="text-[12px] text-content-subtle">Vista previa</Text>
      <RolePreviewBadge name={name} color={color} />
    </View>
  );
}
