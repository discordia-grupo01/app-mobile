import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../../theme/colors";
import { formatMemberSince } from "../format-member-since";

export function MemberSince({ isoDate }: { isoDate: string }) {
  return (
    <View>
      <Text style={styles.label}>MIEMBRO DESDE</Text>
      <View style={styles.row}>
        <Feather name="calendar" size={14} color={colors.textSubtle} />
        <Text style={styles.value}>{formatMemberSince(isoDate)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.textSubtle,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  value: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
