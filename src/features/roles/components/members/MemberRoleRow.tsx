import { type MemberInfo, resolveImageUrl } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { env } from "../../../../lib/env";
import { useThemeColors } from "../../../../theme/theme-context";
import { Avatar } from "../../../../components/ui/Avatar";
import { cn } from "../../../../lib/cn";

interface MemberRoleRowProps {
  member: MemberInfo;
  hasRole: boolean;
  isBusy: boolean;
  /** Sin esto (ej. @everyone, que no se puede quitar) no hay boton. */
  onToggle?: () => void;
}

export function MemberRoleRow({
  member,
  hasRole,
  isBusy,
  onToggle,
}: MemberRoleRowProps) {
  const colors = useThemeColors();
  const avatarUri = resolveImageUrl(member.avatarUrl, env.apiUrl);

  return (
    <View className="flex-row items-center gap-2.5 rounded-xl border border-line bg-surface-input px-2.5 py-2">
      <Avatar name={member.name} uri={avatarUri} size={32} />
      <Text
        className="flex-1 text-[13px] font-semibold text-content"
        numberOfLines={1}
      >
        {member.name}
      </Text>
      {onToggle ? (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onToggle}
          disabled={isBusy}
          className={cn(
            "flex-row items-center gap-[5px] rounded-lg border px-2.5 py-[7px]",
            hasRole
              ? "border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)]"
              : "border-[rgba(107,149,189,0.35)] bg-[rgba(107,149,189,0.12)]",
            isBusy ? "opacity-[0.5]" : null,
          )}
        >
          <Feather
            name={hasRole ? "minus" : "plus"}
            size={11}
            color={hasRole ? colors.danger : colors.info}
          />
          <Text
            className={cn(
              "text-[11px] font-bold",
              hasRole ? "text-danger" : "text-info",
            )}
          >
            {hasRole ? "Quitar" : "Asignar"}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
