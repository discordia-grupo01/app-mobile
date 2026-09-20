import { PERMISSION_COPY, type RolePermission } from "@discordia/client-shared";

import { Text, TouchableOpacity, View } from "react-native";

import { styles } from "../styles";

interface PermissionToggleProps {
  perm: RolePermission;
  enabled: boolean;
  onChange: (value: boolean) => void;
}

export function PermissionToggle({
  perm,
  enabled,
  onChange,
}: PermissionToggleProps) {
  const copy = PERMISSION_COPY[perm];
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onChange(!enabled)}
      style={[styles.permRow, enabled ? styles.permRowEnabled : null]}
    >
      <View style={styles.permTextWrap}>
        <Text style={styles.permLabel}>{copy.label}</Text>
        <Text style={styles.permDesc}>{copy.desc}</Text>
      </View>
      <View style={[styles.permSwitch, enabled ? styles.permSwitchOn : null]}>
        <View style={[styles.permKnob, enabled ? styles.permKnobOn : null]} />
      </View>
    </TouchableOpacity>
  );
}
