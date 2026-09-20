import {
  type Role,
  ROLE_PERMISSIONS,
  type RolePermission,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getPublicUser } from "../auth/service";
import { Button } from "../../components/ui/Button";
import { colors } from "../../theme/colors";
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
import {
  COLOR_PALETTE,
  isValidHex,
  MAX_NAME,
  type MemberInfo,
  type Step,
} from "./constants";
import { styles } from "./styles";

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
  const insets = useSafeAreaInsets();
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
    setNewNameError("");
    setNewColorError("");
    setStep("create");
  }

  function loadMembers() {
    if (membersInfo !== null || membersError) return;
    setMembersError("");
    listMembers(serverId, { limit: 100 }).then((result) => {
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
    if (!trimmed) {
      setNameError("El nombre del rol no puede estar vacío.");
      return;
    }
    if (trimmed.length > MAX_NAME) {
      setNameError("El nombre no puede superar los 100 caracteres.");
      return;
    }
    if (!isValidHex(editColor)) {
      setColorError("Seleccioná un color válido.");
      return;
    }
    const dup = (roles ?? []).find(
      (r) =>
        r.id !== selectedId && r.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (dup) {
      setNameError("Ya existe un rol con ese nombre.");
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
    if (!trimmed) {
      setNewNameError("El nombre del rol no puede estar vacío.");
      return;
    }
    if (trimmed.length > MAX_NAME) {
      setNewNameError("El nombre no puede superar los 100 caracteres.");
      return;
    }
    if (!isValidHex(newColor)) {
      setNewColorError("Seleccioná un color válido.");
      return;
    }
    const dup = (roles ?? []).find(
      (r) => r.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (dup) {
      setNewNameError("Ya existe un rol con ese nombre.");
      return;
    }

    setCreating(true);
    const result = await createRole(serverId, {
      name: trimmed,
      color: newColor,
    });
    setCreating(false);

    if (!result.ok) {
      if (result.fieldErrors?.name) setNewNameError(result.fieldErrors.name);
      if (result.fieldErrors?.color) setNewColorError(result.fieldErrors.color);
      if (!result.fieldErrors) showToast(result.message);
      return;
    }

    setRoles((prev) => [...(prev ?? []), result.role]);
    showToast(`Rol "${trimmed}" creado`);
    openRoleForEdit(result.role);
  }

  const isLoadingRoles = roles === null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.card,
            { marginTop: insets.top + 12, marginBottom: insets.bottom + 12 },
          ]}
        >
          <View style={styles.topBar}>
            {step !== "list" ? (
              <TouchableOpacity
                onPress={() => setStep("list")}
                style={styles.navButton}
                accessibilityRole="button"
                accessibilityLabel="Volver a la lista de roles"
              >
                <Feather
                  name="chevron-left"
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.navButton}>
                <Feather name="shield" size={16} color={colors.text} />
              </View>
            )}
            <Text style={styles.topBarTitle} numberOfLines={1}>
              {step === "list"
                ? "Roles"
                : step === "create"
                  ? "Crear rol"
                  : (selectedRole?.name ?? "Rol")}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.navButton}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
            >
              <Feather name="x" size={16} color={colors.textSubtle} />
            </TouchableOpacity>
          </View>

          {(step === "edit" || step === "members") && selectedRole ? (
            <View style={styles.tabsRow}>
              <TouchableOpacity
                onPress={() => goToTab("edit")}
                style={styles.tabButton}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.tabText,
                    step === "edit" && styles.tabTextActive,
                  ]}
                >
                  Editar rol
                </Text>
                {step === "edit" ? <View style={styles.tabIndicator} /> : null}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => goToTab("members")}
                style={styles.tabButton}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.tabText,
                    step === "members" && styles.tabTextActive,
                  ]}
                >
                  Miembros
                </Text>
                {step === "members" ? (
                  <View style={styles.tabIndicator} />
                ) : null}
              </TouchableOpacity>
            </View>
          ) : null}

          {/* ── LISTA DE ROLES ─────────────────────────── */}
          {step === "list" ? (
            <View style={styles.flexOne}>
              <View style={styles.listHeader}>
                <Text style={styles.listHeaderSubtitle} numberOfLines={1}>
                  {serverName}
                </Text>
                <Button
                  title="Crear rol"
                  iconLeft={<Feather name="plus" size={13} color="#fff" />}
                  onPress={openCreateForm}
                />
              </View>
              <ScrollView
                style={styles.flexOne}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              >
                {isLoadingRoles ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.accentBright}
                    style={styles.loadingIndicator}
                  />
                ) : loadError ? (
                  <Text style={styles.errorText}>{loadError}</Text>
                ) : (roles ?? []).length === 0 ? (
                  <Text style={styles.emptyText}>Todavía no hay roles.</Text>
                ) : (
                  (roles ?? []).map((role) => (
                    <TouchableOpacity
                      key={role.id}
                      activeOpacity={0.75}
                      style={styles.roleRow}
                      onPress={() => openRoleForEdit(role)}
                    >
                      <View
                        style={[
                          styles.roleDot,
                          { backgroundColor: role.color },
                        ]}
                      />
                      <Text style={styles.roleName} numberOfLines={1}>
                        {role.name}
                      </Text>
                      {role.id === defaultRoleId ? (
                        <Feather
                          name="star"
                          size={12}
                          color={colors.highlight}
                          style={styles.roleDefaultIcon}
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
            <View style={styles.flexOne}>
              <ScrollView
                style={styles.flexOne}
                contentContainerStyle={styles.formContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.formHint}>
                  El nuevo rol se crea sin permisos. Podés configurarlos
                  después.
                </Text>

                <View style={styles.field}>
                  <View style={styles.fieldLabelRow}>
                    <Text style={styles.fieldLabel}>
                      Nombre <Text style={styles.required}>*</Text>
                    </Text>
                    <Text style={styles.charCount}>
                      {newName.length}/{MAX_NAME}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.input,
                      newNameError ? styles.inputError : null,
                    ]}
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
                      style={styles.inputText}
                    />
                    <RolePreviewBadge name={newName} color={newColor} />
                  </View>
                  <FieldError message={newNameError} />
                </View>

                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, styles.fieldLabelBlock]}>
                    Color <Text style={styles.required}>*</Text>
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
              </ScrollView>

              <View style={styles.footer}>
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
            <View style={styles.flexOne}>
              <ScrollView
                style={styles.flexOne}
                contentContainerStyle={styles.formContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.roleSummary}>
                  <View
                    style={[
                      styles.roleSummaryDot,
                      { backgroundColor: selectedRole.color },
                    ]}
                  />
                  <View style={styles.flexOne}>
                    {selectedRole.id === defaultRoleId ? (
                      <View style={styles.defaultBadgeRow}>
                        <Feather
                          name="star"
                          size={10}
                          color={colors.highlight}
                        />
                        <Text style={styles.defaultBadgeText}>
                          Rol por defecto
                        </Text>
                      </View>
                    ) : null}
                    <Text style={styles.roleSummaryMeta}>
                      {membersWithRole.length}{" "}
                      {membersWithRole.length === 1 ? "miembro" : "miembros"}
                    </Text>
                  </View>
                </View>

                <View style={styles.field}>
                  <View style={styles.fieldLabelRow}>
                    <Text style={styles.fieldLabel}>
                      Nombre <Text style={styles.required}>*</Text>
                    </Text>
                    <Text style={styles.charCount}>
                      {editName.length}/{MAX_NAME}
                    </Text>
                  </View>
                  <View
                    style={[styles.input, nameError ? styles.inputError : null]}
                  >
                    <TextInput
                      value={editName}
                      onChangeText={handleEditName}
                      maxLength={MAX_NAME + 10}
                      style={styles.inputText}
                    />
                    <RolePreviewBadge name={editName} color={editColor} />
                  </View>
                  <FieldError message={nameError} />
                </View>

                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, styles.fieldLabelBlock]}>
                    Color <Text style={styles.required}>*</Text>
                  </Text>
                  <ColorGrid value={editColor} onChange={handleEditColor} />
                  <FieldError message={colorError} />
                </View>

                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, styles.fieldLabelBlock]}>
                    Permisos
                  </Text>
                  <View style={styles.permList}>
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

                <View style={styles.dangerZone}>
                  <Text style={styles.dangerZoneTitle}>Zona peligrosa</Text>

                  {selectedRole.id !== defaultRoleId ? (
                    <View style={styles.dangerRow}>
                      <View style={styles.flexOne}>
                        <Text style={styles.dangerRowTitle}>
                          Definir como rol por defecto
                        </Text>
                        <Text style={styles.dangerRowDesc}>
                          Se asigna automáticamente a los nuevos miembros.
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={handleSetDefault}
                        disabled={settingDefault}
                        style={styles.defaultButton}
                      >
                        <Feather
                          name="star"
                          size={11}
                          color={colors.highlight}
                        />
                        <Text style={styles.defaultButtonText}>
                          {settingDefault ? "Definiendo..." : "Definir"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.defaultNote}>
                      <Feather
                        name="star"
                        size={11}
                        color={colors.textSubtle}
                      />
                      <Text style={styles.defaultNoteText}>
                        Este es el rol por defecto. Para eliminarlo, primero
                        definí otro rol como predeterminado.
                      </Text>
                    </View>
                  )}

                  {!deleteConfirm ? (
                    <TouchableOpacity
                      onPress={() => {
                        setDeleteError("");
                        setDeleteConfirm(true);
                      }}
                      style={styles.deleteButton}
                    >
                      <Feather name="trash-2" size={12} color={colors.danger} />
                      <Text style={styles.deleteButtonText}>Eliminar rol</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.deleteConfirmWrap}>
                      <Text style={styles.deleteConfirmText}>
                        ¿Confirmar eliminación de &quot;{selectedRole.name}
                        &quot;?
                      </Text>
                      {deleteError ? (
                        <View style={styles.errorBanner}>
                          <Feather
                            name="alert-circle"
                            size={13}
                            color={colors.danger}
                          />
                          <Text style={styles.errorBannerText}>
                            {deleteError}
                          </Text>
                        </View>
                      ) : null}
                      <View style={styles.deleteConfirmButtons}>
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
                  <View style={styles.savedBanner}>
                    <Feather name="check" size={14} color={colors.success} />
                    <Text style={styles.savedBannerText}>
                      Cambios guardados.
                    </Text>
                  </View>
                ) : null}
              </ScrollView>

              <View style={styles.footer}>
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
              style={styles.flexOne}
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
            >
              {membersError ? (
                <Text style={styles.errorText}>{membersError}</Text>
              ) : membersInfo === null ? (
                <ActivityIndicator
                  size="small"
                  color={colors.accentBright}
                  style={styles.loadingIndicator}
                />
              ) : (
                <>
                  <View style={styles.field}>
                    <Text style={[styles.fieldLabel, styles.fieldLabelBlock]}>
                      Con este rol ({membersWithRole.length})
                    </Text>
                    {membersWithRole.length === 0 ? (
                      <Text style={styles.emptyText}>
                        Ningún miembro tiene este rol.
                      </Text>
                    ) : null}
                    <View style={styles.memberList}>
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
                    <View style={styles.field}>
                      <Text style={[styles.fieldLabel, styles.fieldLabelBlock]}>
                        Sin este rol ({membersWithoutRole.length})
                      </Text>
                      <View style={styles.memberList}>
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
        </View>

        {toast ? (
          <View style={[styles.toast, { bottom: insets.bottom + 24 }]}>
            <View style={styles.toastDot} />
            <Text style={styles.toastText} numberOfLines={2}>
              {toast}
            </Text>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
