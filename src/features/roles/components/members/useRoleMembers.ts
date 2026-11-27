import { type Role } from "@discordia/client-shared";

import { useEffect, useState } from "react";

import { listRoleMembers } from "../../api";

/**
 * Cuantos tienen cada rol (#58), para la lista y el encabezado. Alcanza con
 * una pagina de 1 porque solo interesa el total. Las listas en si las pagina
 * `RoleMembersStep`.
 */
export function useRoleMembers(roles: Role[] | null, selectedId: string) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const roleIdsKey = (roles ?? [])
    .filter((role) => !role.is_everyone)
    .map((role) => role.id)
    .join(",");
  useEffect(() => {
    if (!roleIdsKey) return;
    let cancelled = false;
    for (const roleId of roleIdsKey.split(",")) {
      listRoleMembers(roleId, { limit: 1 }).then((result) => {
        if (cancelled || !result.ok) return;
        setCounts((prev) =>
          prev[roleId] === undefined
            ? { ...prev, [roleId]: result.total }
            : prev,
        );
      });
    }
    return () => {
      cancelled = true;
    };
  }, [roleIdsKey]);

  // @everyone no entra en la lista de arriba; se pide al elegirlo.
  useEffect(() => {
    if (!selectedId || counts[selectedId] !== undefined) return;
    let cancelled = false;
    listRoleMembers(selectedId, { limit: 1 }).then((result) => {
      if (cancelled || !result.ok) return;
      setCounts((prev) => ({ ...prev, [selectedId]: result.total }));
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId, counts]);

  /** Se asigno (+1) o quito (-1) el rol elegido a alguien. */
  function handleMembershipChange(delta: 1 | -1) {
    setCounts((prev) =>
      prev[selectedId] === undefined
        ? prev
        : { ...prev, [selectedId]: prev[selectedId] + delta },
    );
  }

  return {
    counts,
    /** `null` hasta saber cuantos tienen el rol. */
    memberCount: counts[selectedId] ?? null,
    handleMembershipChange,
  };
}
