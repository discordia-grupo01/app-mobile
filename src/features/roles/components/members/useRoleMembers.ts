import {
  displayNameOf,
  MEMBER_PAGE_LIMIT,
  type MemberInfo,
  type Role,
} from "@discordia/client-shared";

import { useState } from "react";

import { listMembers } from "../../../servers/api";
import { assignRole, listMemberRoles, removeRole } from "../../api";

interface UseRoleMembersOptions {
  onToast: (message: string) => void;
}

export function useRoleMembers(
  serverId: string,
  role: Role | undefined,
  { onToast }: UseRoleMembersOptions,
) {
  const [membersInfo, setMembersInfo] = useState<MemberInfo[] | null>(null);
  const [membersError, setMembersError] = useState("");
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);

  const [lastRoleId, setLastRoleId] = useState(role?.id);
  if (lastRoleId !== role?.id) {
    setLastRoleId(role?.id);
    setMembersInfo(null);
    setMembersError("");
    setBusyMemberId(null);
  }

  function ensureLoaded() {
    if (membersInfo !== null || membersError) return;
    setMembersError("");
    listMembers(serverId, { limit: MEMBER_PAGE_LIMIT }).then((result) => {
      if (!result.ok) {
        setMembersError(result.message);
        setMembersInfo([]);
        return;
      }
      Promise.all(
        result.members.map(async (member) => {
          const memberRolesResult = await listMemberRoles(
            serverId,
            member.user_id,
          );
          return {
            userId: member.user_id,
            name: displayNameOf(member.profile),
            avatarUrl: member.profile?.avatar_url ?? null,
            roleIds: memberRolesResult.ok
              ? memberRolesResult.roles.map((r) => r.id)
              : [],
          };
        }),
      ).then((infos) => setMembersInfo(infos));
    });
  }

  const selectedRoleId = role?.id ?? "";
  const membersWithRole = (membersInfo ?? []).filter((m) =>
    m.roleIds.includes(selectedRoleId),
  );
  const membersWithoutRole = (membersInfo ?? []).filter(
    (m) => !m.roleIds.includes(selectedRoleId),
  );

  async function handleToggleMember(member: MemberInfo, hasRole: boolean) {
    setBusyMemberId(member.userId);
    const result = hasRole
      ? await removeRole(serverId, member.userId, selectedRoleId)
      : await assignRole(serverId, member.userId, selectedRoleId);
    setBusyMemberId(null);
    if (!result.ok) {
      onToast(result.message);
      return;
    }
    setMembersInfo(
      (prev) =>
        prev?.map((m) =>
          m.userId === member.userId
            ? {
                ...m,
                roleIds: hasRole
                  ? m.roleIds.filter((id) => id !== selectedRoleId)
                  : [...m.roleIds, selectedRoleId],
              }
            : m,
        ) ?? null,
    );
  }

  return {
    membersInfo,
    membersError,
    busyMemberId,
    membersWithRole,
    membersWithoutRole,
    ensureLoaded,
    handleToggleMember,
  };
}
