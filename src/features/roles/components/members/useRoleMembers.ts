import {
  displayNameOf,
  type MemberInfo,
  type Role,
} from "@discordia/client-shared";

import { useEffect, useState } from "react";

import { useServerMembers } from "../../../servers/useServerMembers";
import { assignRole, listRoleMembers, removeRole } from "../../api";

interface UseRoleMembersOptions {
  onToast: (message: string) => void;
}

/**
 * Quien tiene el rol elegido (#58): los ids salen de `GET /roles/:id/members`
 * (se piden al elegir el rol, asi el contador ya es el real) y el resto de los
 * miembros, para "Sin este rol", de la lista completa del servidor.
 */
export function useRoleMembers(
  serverId: string,
  role: Role | undefined,
  { onToast }: UseRoleMembersOptions,
) {
  const serverMembers = useServerMembers(serverId);
  const [roleMemberIds, setRoleMemberIds] = useState<Record<string, string[]>>(
    {},
  );
  const [roleErrors, setRoleErrors] = useState<Record<string, string>>({});
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);
  const selectedRoleId = role?.id ?? "";

  useEffect(() => {
    if (
      !selectedRoleId ||
      roleMemberIds[selectedRoleId] ||
      roleErrors[selectedRoleId]
    ) {
      return;
    }
    let cancelled = false;
    listRoleMembers(selectedRoleId).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setRoleErrors((prev) => ({
          ...prev,
          [selectedRoleId]: result.message,
        }));
        return;
      }
      setRoleMemberIds((prev) => ({
        ...prev,
        [selectedRoleId]: result.members.map((m) => m.user_id),
      }));
    });
    return () => {
      cancelled = true;
    };
  }, [selectedRoleId, roleMemberIds, roleErrors]);

  const selectedIds = roleMemberIds[selectedRoleId] ?? null;
  const membersError = roleErrors[selectedRoleId] ?? "";
  const membersInfo: MemberInfo[] | null =
    serverMembers === null || selectedIds === null
      ? null
      : serverMembers.map((member) => ({
          userId: member.user_id,
          name: displayNameOf(member.profile),
          avatarUrl: member.profile?.avatar_url ?? null,
          roleIds: selectedIds.includes(member.user_id) ? [selectedRoleId] : [],
        }));
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
    setRoleMemberIds((prev) => {
      const current = prev[selectedRoleId] ?? [];
      return {
        ...prev,
        [selectedRoleId]: hasRole
          ? current.filter((id) => id !== member.userId)
          : [...current, member.userId],
      };
    });
  }

  return {
    membersInfo,
    membersError,
    busyMemberId,
    membersWithRole,
    membersWithoutRole,
    /** `null` hasta saber cuantos tienen el rol. */
    memberCount: selectedIds?.length ?? null,
    handleToggleMember,
  };
}
