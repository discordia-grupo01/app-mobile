import { type Role } from "@discordia/client-shared";

import { useEffect, useState } from "react";

import { listRoleMembers } from "../../api";

/**
 * Cuantos tienen el rol elegido (#58), para el encabezado. Se pide al elegir
 * el rol, asi el contador ya es el real; alcanza con una pagina de 1 porque
 * solo interesa el total. Las listas en si las pagina `RoleMembersStep`.
 */
export function useRoleMembers(role: Role | undefined) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const selectedRoleId = role?.id ?? "";

  useEffect(() => {
    if (!selectedRoleId || counts[selectedRoleId] !== undefined) return;
    let cancelled = false;
    listRoleMembers(selectedRoleId, { limit: 1 }).then((result) => {
      if (cancelled || !result.ok) return;
      setCounts((prev) => ({ ...prev, [selectedRoleId]: result.total }));
    });
    return () => {
      cancelled = true;
    };
  }, [selectedRoleId, counts]);

  /** Se asigno (+1) o quito (-1) el rol a alguien. */
  function handleMembershipChange(delta: 1 | -1) {
    setCounts((prev) =>
      prev[selectedRoleId] === undefined
        ? prev
        : { ...prev, [selectedRoleId]: prev[selectedRoleId] + delta },
    );
  }

  return {
    /** `null` hasta saber cuantos tienen el rol. */
    memberCount: counts[selectedRoleId] ?? null,
    handleMembershipChange,
  };
}
