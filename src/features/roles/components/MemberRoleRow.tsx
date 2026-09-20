import { type MemberInfo } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { resolveImageUri } from "../../../lib/image-url";
import { colors } from "../../../theme/colors";
import { ServerAvatar } from "../../servers/components/ServerAvatar";
import { styles } from "../styles";

interface MemberRoleRowProps {
  member: MemberInfo;
  hasRole: boolean;
  isBusy: boolean;
  onToggle: () => void;
}

export function MemberRoleRow({
  member,
  hasRole,
  isBusy,
  onToggle,
}: MemberRoleRowProps) {
  const avatarUri = resolveImageUri(member.avatarUrl);

  return (
    <View style={styles.memberRow}>
      <ServerAvatar name={member.name} uri={avatarUri} size={32} />
      <Text style={styles.memberName} numberOfLines={1}>
        {member.name}
      </Text>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onToggle}
        disabled={isBusy}
        style={[
          styles.memberToggle,
          hasRole ? styles.memberToggleRemove : styles.memberToggleAdd,
          isBusy ? styles.memberToggleDisabled : null,
        ]}
      >
        <Feather
          name={hasRole ? "minus" : "plus"}
          size={11}
          color={hasRole ? colors.danger : colors.info}
        />
        <Text
          style={[
            styles.memberToggleText,
            hasRole
              ? styles.memberToggleTextRemove
              : styles.memberToggleTextAdd,
          ]}
        >
          {hasRole ? "Quitar" : "Asignar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
