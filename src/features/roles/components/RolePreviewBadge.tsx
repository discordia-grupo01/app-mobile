import { Text, View } from "react-native";

import { hexToRgba, isValidHex } from "../constants";
import { styles } from "../styles";

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
      style={[
        styles.namePreviewBadge,
        {
          borderColor: hexToRgba(color, 0.4),
          backgroundColor: hexToRgba(color, 0.12),
        },
      ]}
    >
      <View style={[styles.namePreviewDot, { backgroundColor: color }]} />
      <Text style={[styles.namePreviewText, { color }]} numberOfLines={1}>
        {name.trim() || "Rol"}
      </Text>
    </View>
  );
}
