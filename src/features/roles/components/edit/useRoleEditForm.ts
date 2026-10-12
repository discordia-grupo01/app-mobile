import {
  EVERYONE_VIEW_CHANNELS_OFF_BODY,
  EVERYONE_VIEW_CHANNELS_OFF_CONFIRM,
  EVERYONE_VIEW_CHANNELS_OFF_TITLE,
  removesViewChannelsFromEveryone,
  type Role,
  type RolePermission,
  validateRole,
} from "@discordia/client-shared";

import { useState } from "react";
import { Alert } from "react-native";

import { deleteRole, setDefaultRole, updateRole } from "../../api";

interface UseRoleEditFormOptions {
  serverId: string;
  roles: Role[] | null;
  canManage: boolean;
  isEveryoneSelected: boolean;
  onSaved: (role: Role) => void;
  onDeleted: () => void;
  onDefaultChanged: (roleId: string) => void;
  onToast: (message: string) => void;
}

export function useRoleEditForm(
  role: Role,
  {
    serverId,
    roles,
    canManage,
    isEveryoneSelected,
    onSaved,
    onDeleted,
    onDefaultChanged,
    onToast,
  }: UseRoleEditFormOptions,
) {
  const [editName, setEditName] = useState(role.name);
  const [editColor, setEditColor] = useState(role.color);
  const [editPerms, setEditPerms] = useState<RolePermission[]>([
    ...role.permissions,
  ]);
  const [nameError, setNameError] = useState("");
  const [colorError, setColorError] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);

  function handleEditName(value: string) {
    setEditName(value);
    setNameError("");
    setIsDirty(true);
  }

  function handleEditColor(value: string) {
    setEditColor(value);
    setColorError("");
    setIsDirty(true);
  }

  function handleTogglePerm(perm: RolePermission, on: boolean) {
    if (!canManage) return;
    setEditPerms((prev) =>
      on ? [...prev, perm] : prev.filter((p) => p !== perm),
    );
    setIsDirty(true);
  }

  function handleDiscard() {
    setEditName(role.name);
    setEditColor(role.color);
    setEditPerms([...role.permissions]);
    setIsDirty(false);
    setNameError("");
    setColorError("");
  }

  function requestSave() {
    if (removesViewChannelsFromEveryone(role, editPerms)) {
      Alert.alert(
        EVERYONE_VIEW_CHANNELS_OFF_TITLE,
        EVERYONE_VIEW_CHANNELS_OFF_BODY,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: EVERYONE_VIEW_CHANNELS_OFF_CONFIRM,
            style: "destructive",
            onPress: () => void handleSave(),
          },
        ],
      );
      return;
    }
    void handleSave();
  }

  async function handleSave() {
    setNameError("");
    setColorError("");

    if (isEveryoneSelected) {
      setSaving(true);
      const result = await updateRole(role.id, { permissions: editPerms });
      setSaving(false);

      if (!result.ok) {
        onToast(result.message);
        return;
      }

      onSaved(result.role);
      setIsDirty(false);
      setSavedOk(true);
      onToast(`Permisos de "${result.role.name}" actualizados`);
      setTimeout(() => setSavedOk(false), 2000);
      return;
    }

    const trimmed = editName.trim();
    const errors = validateRole(
      { name: trimmed, color: editColor },
      { existingRoles: roles ?? [], currentRoleId: role.id },
    );
    if (errors.name || errors.color) {
      setNameError(errors.name ?? "");
      setColorError(errors.color ?? "");
      return;
    }

    setSaving(true);
    const result = await updateRole(role.id, {
      name: trimmed,
      color: editColor,
      permissions: editPerms,
    });
    setSaving(false);

    if (!result.ok) {
      if (result.fieldErrors?.name) setNameError(result.fieldErrors.name);
      if (result.fieldErrors?.color) setColorError(result.fieldErrors.color);
      if (result.fieldErrors?.permissions) {
        onToast(result.fieldErrors.permissions);
      }
      if (!result.fieldErrors) onToast(result.message);
      return;
    }

    onSaved(result.role);
    setIsDirty(false);
    setSavedOk(true);
    onToast(`Rol "${trimmed}" actualizado`);
    setTimeout(() => setSavedOk(false), 2000);
  }

  function requestDelete() {
    setDeleteError("");
    setDeleteConfirm(true);
  }

  function cancelDelete() {
    setDeleteConfirm(false);
    setDeleteError("");
  }

  async function handleSetDefault() {
    if (!canManage) return;
    setSettingDefault(true);
    const result = await setDefaultRole(serverId, role.id);
    setSettingDefault(false);
    if (!result.ok) {
      onToast(result.message);
      return;
    }
    onDefaultChanged(role.id);
    onToast(`"${role.name}" es ahora el rol por defecto`);
  }

  async function handleDelete() {
    if (!canManage) return;
    setDeleting(true);
    const result = await deleteRole(role.id);
    setDeleting(false);

    if (!result.ok) {
      setDeleteError(result.message);
      return;
    }

    setDeleteConfirm(false);
    onToast(`Rol "${role.name}" eliminado`);
    onDeleted();
  }

  return {
    editName,
    editColor,
    editPerms,
    nameError,
    colorError,
    isDirty,
    saving,
    savedOk,
    handleEditName,
    handleEditColor,
    handleTogglePerm,
    handleDiscard,
    requestSave,
    deleteConfirm,
    deleteError,
    deleting,
    settingDefault,
    requestDelete,
    cancelDelete,
    handleSetDefault,
    handleDelete,
  };
}
