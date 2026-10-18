import {
  displayNameOf,
  type Member,
  type MemberInfo,
  type MemberPageQuery,
  MEMBERS_EMPTY_SEARCH,
  MEMBERS_SEARCH_LABEL,
  MEMBERS_SEARCH_PLACEHOLDER,
  ROLE_MEMBERS_EMPTY,
  ROLE_MEMBERS_EVERYONE_HINT,
  ROLE_MEMBERS_WITHOUT_EMPTY,
  roleMembersWithoutTab,
  roleMembersWithTab,
} from "@discordia/client-shared";

import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { FormErrorBanner } from "../../../../components/ui/FormErrorBanner";
import { PaginationFooter } from "../../../../components/ui/PaginationFooter";
import { SearchInput } from "../../../../components/ui/SearchInput";
import { SegmentedTabs } from "../../../../components/ui/SegmentedTabs";
import { useMemberPages } from "../../../../hooks/useMemberPages";
import { useThemeColors } from "../../../../theme/theme-context";
import { assignRole, listRoleMembers, removeRole } from "../../api";

import { MemberRoleRow } from "./MemberRoleRow";

type Tab = "with" | "without";

interface RoleMembersStepProps {
  serverId: string;
  roleId: string;
  /** @everyone lo tienen todos y no se puede quitar: no hay "Sin este rol". */
  isEveryoneSelected: boolean;
  /** Se asigno (+1) o quito (-1) el rol a alguien, para el contador. */
  onMembershipChange: (delta: 1 | -1) => void;
  onToast: (message: string) => void;
}

function infoOf(member: Member): MemberInfo {
  return {
    userId: member.user_id,
    name: displayNameOf(member.profile),
    avatarUrl: member.profile?.avatar_url ?? null,
    roleIds: [],
  };
}

/**
 * Pestaña "Miembros" de un rol: quienes lo tienen y quienes no, cada lista
 * buscada y paginada en el back (`GET /roles/:id/members`, con
 * `has_role=false` para los que no lo tienen). Para asignar rapido: pestaña
 * "Sin este rol", buscar el nombre y Asignar. Montarlo con `key={roleId}`
 * para que al cambiar de rol arranque de cero.
 */
export function RoleMembersStep({
  serverId,
  roleId,
  isEveryoneSelected,
  onMembershipChange,
  onToast,
}: RoleMembersStepProps) {
  const colors = useThemeColors();
  const [tab, setTab] = useState<Tab>("with");
  const [search, setSearch] = useState("");
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);

  const fetchWith = useCallback(
    (query: MemberPageQuery) => listRoleMembers(roleId, query),
    [roleId],
  );
  const fetchWithout = useCallback(
    (query: MemberPageQuery) =>
      listRoleMembers(roleId, { ...query, hasRole: false }),
    [roleId],
  );
  const withRole = useMemberPages({ fetchPage: fetchWith, search });
  const withoutRole = useMemberPages({
    fetchPage: fetchWithout,
    search,
    enabled: !isEveryoneSelected,
  });

  const showsHolders = isEveryoneSelected || tab === "with";
  const list = showsHolders ? withRole : withoutRole;
  const emptyMessage = list.isSearching
    ? MEMBERS_EMPTY_SEARCH
    : showsHolders
      ? ROLE_MEMBERS_EMPTY
      : ROLE_MEMBERS_WITHOUT_EMPTY;

  async function handleToggle(member: Member) {
    setBusyMemberId(member.user_id);
    const result = showsHolders
      ? await removeRole(serverId, member.user_id, roleId)
      : await assignRole(serverId, member.user_id, roleId);
    setBusyMemberId(null);
    if (!result.ok) {
      onToast(result.message);
      return;
    }
    onMembershipChange(showsHolders ? -1 : 1);
    // Paso de una lista a la otra: las dos cambian.
    withRole.reload();
    withoutRole.reload();
  }

  return (
    <View className="shrink">
      <View className="gap-3 border-b border-line px-5 py-4">
        {isEveryoneSelected ? (
          <Text className="text-content-subtle text-[13px]">
            {ROLE_MEMBERS_EVERYONE_HINT}
          </Text>
        ) : (
          <SegmentedTabs
            label="Miembros del rol"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: "with", label: roleMembersWithTab(withRole.total) },
              {
                value: "without",
                label: roleMembersWithoutTab(withoutRole.total),
              },
            ]}
          />
        )}
        <SearchInput
          value={search}
          onChange={setSearch}
          label={MEMBERS_SEARCH_LABEL}
          placeholder={MEMBERS_SEARCH_PLACEHOLDER}
        />
      </View>

      <ScrollView
        className="shrink"
        contentContainerClassName="gap-1.5 px-5 py-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormErrorBanner message={list.errorMessage} />
        {list.members === null ? (
          list.errorMessage ? null : (
            <ActivityIndicator
              size="small"
              color={colors.accentBright}
              className="mt-6"
            />
          )
        ) : list.members.length === 0 ? (
          <Text className="text-content-subtle text-[13px] mt-2">
            {emptyMessage}
          </Text>
        ) : (
          list.members.map((member) => (
            <MemberRoleRow
              key={member.user_id}
              member={infoOf(member)}
              hasRole={showsHolders}
              isBusy={busyMemberId === member.user_id}
              onToggle={
                isEveryoneSelected ? undefined : () => handleToggle(member)
              }
            />
          ))
        )}
      </ScrollView>

      {list.pageCount > 1 ? (
        <PaginationFooter
          page={list.page}
          pageCount={list.pageCount}
          range={list.range}
          total={list.total}
          noun={list.isSearching ? "resultados" : "miembros"}
          onPageChange={list.setPage}
        />
      ) : null}
    </View>
  );
}
