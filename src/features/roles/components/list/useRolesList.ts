import { sortRolesByPosition, type Role } from "@discordia/client-shared";

import { useEffect, useState } from "react";

import { listRoles, reorderRoles as reorderRolesRequest } from "../../api";

/**
 * Carga los roles del server y deriva las listas que usa el resto del modal.
 *
 * El reset al reabrir el modal (o cambiar de server) se ajusta durante el
 * render, comparando contra la clave `visible|serverId` de la ultima vez
 * que se corrio: es el patron que React documenta para resetear estado al
 * cambiar una prop, sin disparar el lint `react-hooks/set-state-in-effect`
 * que si dispara hacerlo con un `setState` sincrono dentro de un efecto. El
 * fetch en si (hablar con la API) se queda en el `useEffect`, que es donde
 * corresponde.
 */
export function useRolesList(serverId: string, visible: boolean) {
  const [roles, setRoles] = useState<Role[] | null>(null);
  const [loadError, setLoadError] = useState("");

  const resetKey = `${visible ? "1" : "0"}|${serverId}`;
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (lastResetKey !== resetKey) {
    setLastResetKey(resetKey);
    if (visible) {
      setRoles(null);
      setLoadError("");
    }
  }

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    listRoles(serverId).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setLoadError(result.message);
        setRoles([]);
        return;
      }
      setRoles(result.roles);
    });
    return () => {
      cancelled = true;
    };
  }, [visible, serverId]);

  const sortedRoles = sortRolesByPosition(roles ?? []);
  const draggableRoles = sortedRoles.filter((role) => !role.is_everyone);
  const everyoneRole = sortedRoles.find((role) => role.is_everyone);
  const isLoading = roles === null;

  async function reorder(orderedIds: string[]) {
    const previousRoles = roles ?? [];
    const byId = new Map(previousRoles.map((role) => [role.id, role]));
    const reordered = orderedIds
      .map((id, index) => {
        const role = byId.get(id);
        return role ? { ...role, position: index + 1 } : null;
      })
      .filter((role): role is Role => role !== null);

    setRoles(reordered);

    const result = await reorderRolesRequest(serverId, orderedIds);
    if (!result.ok) {
      setRoles(previousRoles);
      return result;
    }
    setRoles(result.roles);
    return result;
  }

  function updateRoleInList(updated: Role) {
    setRoles(
      (prev) => prev?.map((r) => (r.id === updated.id ? updated : r)) ?? null,
    );
  }

  function removeRoleFromList(roleId: string) {
    setRoles((prev) => prev?.filter((r) => r.id !== roleId) ?? null);
  }

  function appendRoleToList(role: Role) {
    setRoles((prev) => [...(prev ?? []), role]);
  }

  return {
    roles,
    loadError,
    isLoading,
    sortedRoles,
    draggableRoles,
    everyoneRole,
    reorder,
    updateRoleInList,
    removeRoleFromList,
    appendRoleToList,
  };
}
