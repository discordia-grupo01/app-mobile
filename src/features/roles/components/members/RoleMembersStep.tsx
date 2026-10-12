import { type MemberInfo, ROLE_MEMBERS_EMPTY } from "@discordia/client-shared";

import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";

import { MemberRoleRow } from "./MemberRoleRow";

interface RoleMembersStepProps {
  isEveryoneSelected: boolean;
  membersInfo: MemberInfo[] | null;
  membersError: string;
  membersWithRole: MemberInfo[];
  membersWithoutRole: MemberInfo[];
  busyMemberId: string | null;
  onToggleMember: (member: MemberInfo, hasRole: boolean) => void;
}

export function RoleMembersStep({
  isEveryoneSelected,
  membersInfo,
  membersError,
  membersWithRole,
  membersWithoutRole,
  busyMemberId,
  onToggleMember,
}: RoleMembersStepProps) {
  const colors = useThemeColors();

  return (
    <ScrollView
      className="shrink"
      contentContainerClassName="p-5 gap-5.5"
      showsVerticalScrollIndicator={false}
    >
      {membersError ? (
        <Text className="text-danger text-[13px] text-center mt-4">
          {membersError}
        </Text>
      ) : membersInfo === null ? (
        <ActivityIndicator
          size="small"
          color={colors.accentBright}
          className="mt-6"
        />
      ) : (
        <>
          <View className="gap-0">
            {isEveryoneSelected ? (
              <Text className="text-content-subtle text-[13px] mb-3">
                Todos los miembros del servidor tienen este rol automáticamente.
              </Text>
            ) : null}
            <Text
              className={cn(
                "text-[11px] font-bold tracking-[1px] uppercase text-content-subtle",
                "mb-2.5",
              )}
            >
              Con este rol ({membersWithRole.length})
            </Text>
            {membersWithRole.length === 0 ? (
              <Text className="text-content-subtle text-[13px] mt-2">
                {ROLE_MEMBERS_EMPTY}
              </Text>
            ) : null}
            <View className="gap-1.5 mt-1">
              {membersWithRole.map((member) => (
                <MemberRoleRow
                  key={member.userId}
                  member={member}
                  hasRole
                  isBusy={busyMemberId === member.userId}
                  onToggle={
                    isEveryoneSelected
                      ? undefined
                      : () => onToggleMember(member, true)
                  }
                />
              ))}
            </View>
          </View>

          {!isEveryoneSelected && membersWithoutRole.length > 0 ? (
            <View className="gap-0">
              <Text
                className={cn(
                  "text-[11px] font-bold tracking-[1px] uppercase text-content-subtle",
                  "mb-2.5",
                )}
              >
                Sin este rol ({membersWithoutRole.length})
              </Text>
              <View className="gap-1.5 mt-1">
                {membersWithoutRole.map((member) => (
                  <MemberRoleRow
                    key={member.userId}
                    member={member}
                    hasRole={false}
                    isBusy={busyMemberId === member.userId}
                    onToggle={() => onToggleMember(member, false)}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}
