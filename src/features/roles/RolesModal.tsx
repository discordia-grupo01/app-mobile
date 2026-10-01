import {
  COLOR_PALETTE,
  MAX_NAME,
  MEMBER_PAGE_LIMIT,
  type MemberInfo,
  NO_ROLES_YET,
  type Role,
  ROLE_PERMISSIONS,
  type RolePermission,
  validateRole,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getPublicUser } from "../auth/service";
import { Button } from "../../components/ui/Button";
import { useThemeColors } from "../../theme/theme-context";
import { listMembers } from "../servers/api";

import { ColorGrid } from "./components/ColorGrid";
import { FieldError } from "./components/FieldError";
import { MemberRoleRow } from "./components/MemberRoleRow";
import { PermissionToggle } from "./components/PermissionToggle";
import { RolePreviewBadge } from "./components/RolePreviewBadge";
import {
  assignRole,
  createRole,
  deleteRole,
  listMemberRoles,
  listRoles,
  removeRole,
  setDefaultRole,
  updateRole,
} from "./api";
import { type Step } from "./constants";
import { cn } from "../../lib/cn";
import { ModalShell } from "../../components/ui/ModalShell";

interface RolesModalProps {
  visible: boolean;
  serverId: string;
  serverName: string;
  onClose: () => void;
}

export function RolesModal({
  visible,
  serverId,
  serverName,
  onClose,
}: RolesModalProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [wasVisible, setWasVisible] = useState(visible);
  const [step, setStep] = useState<Step>("list");

  const [roles, setRoles] = useState<Role[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [defaultRoleId, setDefaultRoleId] = useState<string | null>(null);

  // Edit form
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editPerms, setEditPerms] = useState<RolePermission[]>([]);
  const [nameError, setNameError] = useState("");
  const [colorError, setColorError] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Set default
  const [settingDefault, setSettingDefault] = useState(false);

  // Create form
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLOR_PALETTE[0]);
  const [newPerms, setNewPerms] = useState<RolePermission[]>([]);
  const [newNameError, setNewNameError] = useState("");
  const [newColorError, setNewColorError] = useState("");
  const [creating, setCreating] = useState(false);

  // Members tab
  const [membersInfo, setMembersInfo] = useState<MemberInfo[] | null>(null);
  const [membersError, setMembersError] = useState("");
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setStep("list");
      setRoles(null);
      setLoadError("");
      setSelectedId("");
      setDefaultRoleId(null);
      setMembersInfo(null);
      setMembersError("");
      setToast(null);
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

  const selectedRole = (roles ?? []).find((role) => role.id === selectedId);
  const membersWithRole = (membersInfo ?? []).filter((m) =>
    m.roleIds.includes(selectedId),
  );
  const membersWithoutRole = (membersInfo ?? []).filter(
    (m) => !m.roleIds.includes(selectedId),
  );

  function openRoleForEdit(role: Role) {
    setSelectedId(role.id);
    setEditName(role.name);
    setEditColor(role.color);
    setEditPerms([...role.permissions]);
    setNameError("");
    setColorError("");
    setIsDirty(false);
    setSavedOk(false);
    setDeleteConfirm(false);
    setDeleteError("");
    setStep("edit");
  }

  function openCreateForm() {
    setNewName("");
    setNewColor(COLOR_PALETTE[0]);
    setNewPerms([]);
    setNewNameError("");
    setNewColorError("");
    setStep("create");
  }

  function handleToggleNewPerm(perm: RolePermission, on: boolean) {
    setNewPerms((prev) =>
      on ? [...prev, perm] : prev.filter((p) => p !== perm),
    );
  }

  function loadMembers() {
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
          const [profile, memberRolesResult] = await Promise.all([
            getPublicUser(member.user_id),
            listMemberRoles(serverId, member.user_id),
          ]);
          return {
            userId: member.user_id,
            name: profile?.name ?? member.user_id,
            avatarUrl: profile?.avatar_url ?? null,
            roleIds: memberRolesResult.ok
              ? memberRolesResult.roles.map((r) => r.id)
              : [],
          };
        }),
      ).then((infos) => setMembersInfo(infos));
    });
  }

  function goToTab(tab: "edit" | "members") {
    if (tab === "members") loadMembers();
    setStep(tab);
  }

  async function handleToggleMember(member: MemberInfo, hasRole: boolean) {
    setBusyMemberId(member.userId);
    const result = hasRole
      ? await removeRole(serverId, member.userId, selectedId)
      : await assignRole(serverId, member.userId, selectedId);
    setBusyMemberId(null);
    if (!result.ok) {
      showToast(result.message);
      return;
    }
    setMembersInfo(
      (prev) =>
        prev?.map((m) =>
          m.userId === member.userId
            ? {
                ...m,
                roleIds: hasRole
                  ? m.roleIds.filter((id) => id !== selectedId)
                  : [...m.roleIds, selectedId],
              }
            : m,
        ) ?? null,
    );
  }

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
    setEditPerms((prev) =>
      on ? [...prev, perm] : prev.filter((p) => p !== perm),
    );
    setIsDirty(true);
  }

  function handleDiscard() {
    if (!selectedRole) return;
    setEditName(selectedRole.name);
    setEditColor(selectedRole.color);
    setEditPerms([...selectedRole.permissions]);
    setIsDirty(false);
    setNameError("");
    setColorError("");
  }

  async function handleSave() {
    setNameError("");
    setColorError("");
    const trimmed = editName.trim();
    const errors = validateRole(
      { name: trimmed, color: editColor },
      { existingRoles: roles ?? [], currentRoleId: selectedId },
    );
    if (errors.name || errors.color) {
      setNameError(errors.name ?? "");
      setColorError(errors.color ?? "");
      return;
    }

    setSaving(true);
    const result = await updateRole(selectedId, {
      name: trimmed,
      color: editColor,
      permissions: editPerms,
    });
    setSaving(false);

    if (!result.ok) {
      if (result.fieldErrors?.name) setNameError(result.fieldErrors.name);
      if (result.fieldErrors?.color) setColorError(result.fieldErrors.color);
      if (!result.fieldErrors) showToast(result.message);
      return;
    }

    setRoles(
      (prev) =>
        prev?.map((r) => (r.id === result.role.id ? result.role : r)) ?? null,
    );
    setIsDirty(false);
    setSavedOk(true);
    showToast(`Rol "${trimmed}" actualizado`);
    setTimeout(() => setSavedOk(false), 2000);
  }

  async function handleSetDefault() {
    if (!selectedRole) return;
    setSettingDefault(true);
    const result = await setDefaultRole(serverId, selectedRole.id);
    setSettingDefault(false);
    if (!result.ok) {
      showToast(result.message);
      return;
    }
    setDefaultRoleId(selectedRole.id);
    showToast(`"${selectedRole.name}" es ahora el rol por defecto`);
  }

  async function handleDelete() {
    if (!selectedRole) return;
    setDeleting(true);
    const result = await deleteRole(selectedRole.id);
    setDeleting(false);

    if (!result.ok) {
      setDeleteError(result.message);
      return;
    }

    const remaining = (roles ?? []).filter((r) => r.id !== selectedRole.id);
    setRoles(remaining);
    setSelectedId("");
    setDeleteConfirm(false);
    showToast(`Rol "${selectedRole.name}" eliminado`);
    setStep("list");
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
      if (!result.fieldErrors) showToast(result.message);
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
    setRoles((prev) => [...(prev ?? []), createdRole]);
    showToast(toastMessage);
    openRoleForEdit(createdRole);
  }

  const isLoadingRoles = roles === null;

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      className="max-w-120"
      style={{ maxHeight: windowHeight - insets.top - insets.bottom - 48 }}
      floating={
        toast ? (
          <View
            className="absolute left-6 right-6 flex-row items-center gap-2.5 self-center max-w-105 rounded-[14px] border border-line-strong bg-surface-raised px-4 py-3"
            style={{ bottom: insets.bottom + 24 }}
          >
            <View className="w-2 h-2 rounded-sm bg-accent-strong" />
            <Text
              className="flex-1 text-[13px] font-semibold text-content"
              numberOfLines={2}
            >
              {toast}
            </Text>
          </View>
        ) : null
      }
    >
      <View className="flex-row items-center gap-2 px-3 py-3 border-b border-b-line">
        {step !== "list" ? (
          <TouchableOpacity
            onPress={() => setStep("list")}
            className="w-8 h-8 rounded-2xl items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Volver a la lista de roles"
          >
            <Feather name="chevron-left" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : (
          <View className="w-8 h-8 rounded-2xl items-center justify-center">
            <Feather name="shield" size={16} color={colors.text} />
          </View>
        )}
        <Text
          className="flex-1 text-center text-[15px] font-bold text-content"
          numberOfLines={1}
        >
          {step === "list"
            ? "Roles"
            : step === "create"
              ? "Crear rol"
              : (selectedRole?.name ?? "Rol")}
        </Text>
        <TouchableOpacity
          onPress={onClose}
          className="w-8 h-8 rounded-2xl items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        >
          <Feather name="x" size={16} color={colors.textSubtle} />
        </TouchableOpacity>
      </View>

      {(step === "edit" || step === "members") && selectedRole ? (
        <View className="flex-row gap-1 px-4 border-b border-b-line">
          <TouchableOpacity
            onPress={() => goToTab("edit")}
            className="py-2.5 px-1 mr-4"
            accessibilityRole="button"
          >
            <Text
              className={cn(
                "text-[13px] font-semibold",
                step === "edit" ? "text-content" : "text-content-subtle",
              )}
            >
              Editar rol
            </Text>
            {step === "edit" ? (
              <View className="mt-2 h-0.5 rounded-[1px] bg-accent-strong" />
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => goToTab("members")}
            className="py-2.5 px-1 mr-4"
            accessibilityRole="button"
          >
            <Text
              className={cn(
                "text-[13px] font-semibold",
                step === "members" ? "text-content" : "text-content-subtle",
              )}
            >
              Miembros
            </Text>
            {step === "members" ? (
              <View className="mt-2 h-0.5 rounded-[1px] bg-accent-strong" />
            ) : null}
          </TouchableOpacity>
        </View>
      ) : null}

      {/* ── LISTA DE ROLES ─────────────────────────── */}
      {step === "list" ? (
        <View className="shrink">
          <View className="gap-2.5 px-4 pt-3.5 pb-1">
            <Text className="text-[12px] text-content-subtle" numberOfLines={1}>
              {serverName}
            </Text>
            <Button
              title="Crear rol"
              iconLeft={<Feather name="plus" size={13} color="#fff" />}
              onPress={openCreateForm}
            />
          </View>
          <ScrollView
            className="shrink"
            contentContainerClassName="px-3 pt-2.5 pb-5 gap-1"
            showsVerticalScrollIndicator={false}
          >
            {isLoadingRoles ? (
              <ActivityIndicator
                size="small"
                color={colors.accentBright}
                className="mt-6"
              />
            ) : loadError ? (
              <Text className="text-danger text-[13px] text-center mt-4">
                {loadError}
              </Text>
            ) : (roles ?? []).length === 0 ? (
              <Text className="text-content-subtle text-[13px] mt-2">
                {NO_ROLES_YET}
              </Text>
            ) : (
              (roles ?? []).map((role) => (
                <TouchableOpacity
                  key={role.id}
                  activeOpacity={0.75}
                  className="flex-row items-center gap-2.5 rounded-xl px-2.5 py-3"
                  onPress={() => openRoleForEdit(role)}
                >
                  <View
                    className="w-3 h-3 rounded-md"
                    style={{ backgroundColor: role.color }}
                  />
                  <Text
                    className="flex-1 text-[14px] font-semibold text-content"
                    numberOfLines={1}
                  >
                    {role.name}
                  </Text>
                  {role.id === defaultRoleId ? (
                    <Feather
                      name="star"
                      size={12}
                      color={colors.highlight}
                      style={{ marginRight: 2 }}
                    />
                  ) : null}
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={colors.textSubtle}
                  />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      ) : null}

      {/* ── CREAR ROL ──────────────────────────────── */}
      {step === "create" ? (
        <View className="shrink">
          <ScrollView
            className="shrink"
            contentContainerClassName="p-5 gap-5.5"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-[12px] text-content-subtle leading-[17px] -mt-1.5">
              Elegí un nombre, un color y, si querés, los permisos iniciales del
              rol. Podés cambiar todo esto después desde &quot;Editar rol&quot;.
            </Text>

            <View className="gap-0">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[11px] font-bold tracking-[1px] uppercase text-content-subtle">
                  Nombre <Text className="text-danger">*</Text>
                </Text>
                <Text className="text-[11px] text-content-subtle">
                  {newName.length}/{MAX_NAME}
                </Text>
              </View>
              <View
                className={cn(
                  "flex-row items-center rounded-xl border bg-surface-input px-3.5 min-h-12",
                  newNameError ? "border-danger" : "border-line",
                )}
              >
                <TextInput
                  value={newName}
                  onChangeText={(text) => {
                    setNewName(text);
                    setNewNameError("");
                  }}
                  placeholder="Nombre del rol"
                  placeholderTextColor={colors.textSubtle}
                  autoFocus
                  maxLength={MAX_NAME + 10}
                  className="flex-1 text-content text-[14px]"
                />
                <RolePreviewBadge name={newName} color={newColor} />
              </View>
              <FieldError message={newNameError} />
            </View>

            <View className="gap-0">
              <Text
                className={cn(
                  "text-[11px] font-bold tracking-[1px] uppercase text-content-subtle",
                  "mb-2.5",
                )}
              >
                Color <Text className="text-danger">*</Text>
              </Text>
              <ColorGrid
                value={newColor}
                onChange={(color) => {
                  setNewColor(color);
                  setNewColorError("");
                }}
              />
              <FieldError message={newColorError} />
            </View>

            <View className="gap-0">
              <Text
                className={cn(
                  "text-[11px] font-bold tracking-[1px] uppercase text-content-subtle",
                  "mb-2.5",
                )}
              >
                Permisos
              </Text>
              <View className="gap-2">
                {ROLE_PERMISSIONS.map((perm) => (
                  <PermissionToggle
                    key={perm}
                    perm={perm}
                    enabled={newPerms.includes(perm)}
                    onChange={(on) => handleToggleNewPerm(perm, on)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          <View className="flex-row gap-3 p-4 border-t border-t-line">
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={() => setStep("list")}
              style={{ flex: 1, width: undefined }}
            />
            <Button
              title="Crear rol"
              onPress={handleCreate}
              isLoading={creating}
              style={{ flex: 1, width: undefined }}
            />
          </View>
        </View>
      ) : null}

      {/* ── EDITAR ROL ─────────────────────────────── */}
      {step === "edit" && selectedRole ? (
        <View className="shrink">
          <ScrollView
            className="shrink"
            contentContainerClassName="p-5 gap-5.5"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row items-center gap-3 -mt-1.5">
              <View
                className="w-8.5 h-8.5 rounded-[17px]"
                style={{ backgroundColor: selectedRole.color }}
              />
              <View className="flex-1">
                {selectedRole.id === defaultRoleId ? (
                  <View className="flex-row items-center gap-1 mb-0.5">
                    <Feather name="star" size={10} color={colors.highlight} />
                    <Text className="text-[10px] font-bold tracking-[0.6px] uppercase text-highlight">
                      Rol por defecto
                    </Text>
                  </View>
                ) : null}
                <Text className="text-[12px] text-content-subtle">
                  {membersWithRole.length}{" "}
                  {membersWithRole.length === 1 ? "miembro" : "miembros"}
                </Text>
              </View>
            </View>

            <View className="gap-0">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[11px] font-bold tracking-[1px] uppercase text-content-subtle">
                  Nombre <Text className="text-danger">*</Text>
                </Text>
                <Text className="text-[11px] text-content-subtle">
                  {editName.length}/{MAX_NAME}
                </Text>
              </View>
              <View
                className={cn(
                  "flex-row items-center rounded-xl border bg-surface-input px-3.5 min-h-12",
                  nameError ? "border-danger" : "border-line",
                )}
              >
                <TextInput
                  value={editName}
                  onChangeText={handleEditName}
                  maxLength={MAX_NAME + 10}
                  className="flex-1 text-content text-[14px]"
                />
                <RolePreviewBadge name={editName} color={editColor} />
              </View>
              <FieldError message={nameError} />
            </View>

            <View className="gap-0">
              <Text
                className={cn(
                  "text-[11px] font-bold tracking-[1px] uppercase text-content-subtle",
                  "mb-2.5",
                )}
              >
                Color <Text className="text-danger">*</Text>
              </Text>
              <ColorGrid value={editColor} onChange={handleEditColor} />
              <FieldError message={colorError} />
            </View>

            <View className="gap-0">
              <Text
                className={cn(
                  "text-[11px] font-bold tracking-[1px] uppercase text-content-subtle",
                  "mb-2.5",
                )}
              >
                Permisos
              </Text>
              <View className="gap-2">
                {ROLE_PERMISSIONS.map((perm) => (
                  <PermissionToggle
                    key={perm}
                    perm={perm}
                    enabled={editPerms.includes(perm)}
                    onChange={(on) => handleTogglePerm(perm, on)}
                  />
                ))}
              </View>
            </View>

            <View className="rounded-[14px] border border-[rgba(224,82,82,0.2)] bg-[rgba(224,82,82,0.06)] p-3.5 gap-3">
              <Text className="text-[10px] font-bold tracking-[1px] uppercase text-danger">
                Zona peligrosa
              </Text>

              {selectedRole.id !== defaultRoleId ? (
                <View className="flex-row items-center gap-2.5">
                  <View className="flex-1">
                    <Text className="text-[13px] font-semibold text-content">
                      Definir como rol por defecto
                    </Text>
                    <Text className="text-[12px] text-content-subtle mt-[1px]">
                      Se asigna automáticamente a los nuevos miembros.
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleSetDefault}
                    disabled={settingDefault}
                    className="flex-row items-center gap-1.5 rounded-[10px] border border-[rgba(252,227,164,0.3)] bg-[rgba(252,227,164,0.12)] px-3 py-[9px]"
                  >
                    <Feather name="star" size={11} color={colors.highlight} />
                    <Text className="text-[12px] font-bold text-highlight">
                      {settingDefault ? "Definiendo..." : "Definir"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="flex-row items-start gap-2">
                  <Feather name="star" size={11} color={colors.textSubtle} />
                  <Text className="flex-1 text-[12px] leading-[17px] text-content-subtle">
                    Este es el rol por defecto. Para eliminarlo, primero definí
                    otro rol como predeterminado.
                  </Text>
                </View>
              )}

              {!deleteConfirm ? (
                <TouchableOpacity
                  onPress={() => {
                    setDeleteError("");
                    setDeleteConfirm(true);
                  }}
                  className="flex-row items-center justify-center gap-1.5 self-start rounded-[10px] border border-[rgba(224,82,82,0.25)] bg-[rgba(224,82,82,0.1)] px-3 py-[9px]"
                >
                  <Feather name="trash-2" size={12} color={colors.danger} />
                  <Text className="text-[12px] font-bold text-danger">
                    Eliminar rol
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="gap-2">
                  <Text className="text-[13px] font-semibold text-danger">
                    ¿Confirmar eliminación de &quot;{selectedRole.name}
                    &quot;?
                  </Text>
                  {deleteError ? (
                    <View className="flex-row items-start gap-2 rounded-[10px] border border-[rgba(224,82,82,0.2)] bg-[rgba(224,82,82,0.1)] px-2.5 py-2">
                      <Feather
                        name="alert-circle"
                        size={13}
                        color={colors.danger}
                      />
                      <Text className="flex-1 text-[12px] text-danger">
                        {deleteError}
                      </Text>
                    </View>
                  ) : null}
                  <View className="flex-row gap-2.5">
                    <Button
                      title="Cancelar"
                      variant="secondary"
                      onPress={() => {
                        setDeleteConfirm(false);
                        setDeleteError("");
                      }}
                      style={{ flex: 1, width: undefined }}
                    />
                    <Button
                      title="Eliminar"
                      variant="danger"
                      onPress={handleDelete}
                      isLoading={deleting}
                      style={{ flex: 1, width: undefined }}
                    />
                  </View>
                </View>
              )}
            </View>

            {savedOk ? (
              <View className="flex-row items-center gap-2 rounded-xl border border-[rgba(56,161,105,0.3)] bg-[rgba(56,161,105,0.12)] px-3.5 py-[11px]">
                <Feather name="check" size={14} color={colors.success} />
                <Text className="text-[13px] text-success">
                  Cambios guardados.
                </Text>
              </View>
            ) : null}
          </ScrollView>

          <View className="flex-row gap-3 p-4 border-t border-t-line">
            <Button
              title="Descartar"
              variant="secondary"
              onPress={handleDiscard}
              disabled={!isDirty}
              style={{ flex: 1, width: undefined }}
            />
            <Button
              title="Guardar cambios"
              onPress={handleSave}
              disabled={!isDirty}
              isLoading={saving}
              style={{ flex: 1, width: undefined }}
            />
          </View>
        </View>
      ) : null}

      {/* ── MIEMBROS DEL ROL ───────────────────────── */}
      {step === "members" && selectedRole ? (
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
                    Ningún miembro tiene este rol.
                  </Text>
                ) : null}
                <View className="gap-1.5 mt-1">
                  {membersWithRole.map((member) => (
                    <MemberRoleRow
                      key={member.userId}
                      member={member}
                      hasRole
                      isBusy={busyMemberId === member.userId}
                      onToggle={() => handleToggleMember(member, true)}
                    />
                  ))}
                </View>
              </View>

              {membersWithoutRole.length > 0 ? (
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
                        onToggle={() => handleToggleMember(member, false)}
                      />
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      ) : null}
    </ModalShell>
  );
}
