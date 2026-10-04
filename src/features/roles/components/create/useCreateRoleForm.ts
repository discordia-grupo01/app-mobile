import {
  COLOR_PALETTE,
  type Role,
  type RolePermission,
  validateRole,
} from "@discordia/client-shared";

import { useState } from "react";

import { createRole, updateRole } from "../../api";

interface UseCreateRoleFormOptions {
  roles: Role[] | null;
  everyoneRole: Role | undefined;
  onContinueToPermissions: () => void;
  onReturnToNameStep: () => void;
  onCreated: (role: Role) => void;
  onToast: (message: string) => void;
}

export function useCreateRoleForm(
  serverId: string,
  {
    roles,
    everyoneRole,
    onContinueToPermissions,
    onReturnToNameStep,
    onCreated,
    onToast,
  }: UseCreateRoleFormOptions,
) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLOR_PALETTE[0]);
  const [newPerms, setNewPerms] = useState<RolePermission[]>([]);
  const [newNameError, setNewNameError] = useState("");
  const [newColorError, setNewColorError] = useState("");
  const [creating, setCreating] = useState(false);

  function resetForCreate() {
    setNewName("");
    setNewColor(COLOR_PALETTE[0]);
    setNewPerms(everyoneRole ? [...everyoneRole.permissions] : []);
    setNewNameError("");
    setNewColorError("");
  }

  function handleNewNameChange(text: string) {
    setNewName(text);
    setNewNameError("");
  }

  function handleNewColorChange(color: string) {
    setNewColor(color);
    setNewColorError("");
  }

  function handleToggleNewPerm(perm: RolePermission, on: boolean) {
    setNewPerms((prev) =>
      on ? [...prev, perm] : prev.filter((p) => p !== perm),
    );
  }

  function handleContinueToPermissions() {
    setNewNameError("");
    setNewColorError("");
    const trimmed = newName.trim();
    const errors = validateRole(
      { name: trimmed, color: newColor },
      { existingRoles: roles ?? [] },
    );
    if (errors.name || errors.color) {
      setNewNameError(errors.name ?? "");
      setNewColorError(errors.color ?? "");
      return;
    }
    onContinueToPermissions();
  }

  async function handleCreate() {
    setNewNameError("");
    setNewColorError("");
    const trimmed = newName.trim();
    const errors = validateRole(
      { name: trimmed, color: newColor },
      { existingRoles: roles ?? [] },
    );
    if (errors.name || errors.color) {
      setNewNameError(errors.name ?? "");
      setNewColorError(errors.color ?? "");
      onReturnToNameStep();
      return;
    }

    setCreating(true);
    const result = await createRole(serverId, {
      name: trimmed,
      color: newColor,
    });

    if (!result.ok) {
      setCreating(false);
      if (result.fieldErrors?.name) setNewNameError(result.fieldErrors.name);
      if (result.fieldErrors?.color) setNewColorError(result.fieldErrors.color);
      if (result.fieldErrors) {
        onReturnToNameStep();
        return;
      }
      onToast(result.message);
      return;
    }

    let createdRole = result.role;
    let toastMessage = `Rol "${trimmed}" creado`;

    if (newPerms.length > 0) {
      const permsResult = await updateRole(createdRole.id, {
        permissions: newPerms,
      });
      if (permsResult.ok) {
        createdRole = permsResult.role;
      } else {
        toastMessage = `Rol "${trimmed}" creado, pero no se pudieron guardar los permisos: ${permsResult.message}`;
      }
    }

    setCreating(false);
    onToast(toastMessage);
    onCreated(createdRole);
  }

  return {
    newName,
    newColor,
    newPerms,
    newNameError,
    newColorError,
    creating,
    resetForCreate,
    handleNewNameChange,
    handleNewColorChange,
    handleToggleNewPerm,
    handleContinueToPermissions,
    handleCreate,
  };
}
