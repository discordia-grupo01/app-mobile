import { type Role } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
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

import { colors } from "../../../theme/colors";
import { assignRole, listMemberRoles, listRoles, removeRole } from "../api";
import { hexToRgba } from "../constants";

interface MemberRoleBadgesProps {
  serverId: string;
  userId: string;
  canManage: boolean;
}

export function MemberRoleBadges({
  serverId,
  userId,
  canManage,
}: MemberRoleBadgesProps) {
  const insets = useSafeAreaInsets();
  const [assignedRoles, setAssignedRoles] = useState<Role[] | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingRoleId, setPendingRoleId] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const memberKey = `${serverId}::${userId}::${canManage}`;
  const [lastMemberKey, setLastMemberKey] = useState(memberKey);
  if (memberKey !== lastMemberKey) {
    setLastMemberKey(memberKey);
    setAssignedRoles(null);
    setAvailableRoles([]);
    setErrorMessage("");
    setIsPickerOpen(false);
    setSearch("");
  }

  useEffect(() => {
    let cancelled = false;

    listMemberRoles(serverId, userId).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setErrorMessage(result.message);
        setAssignedRoles([]);
        return;
      }
      setAssignedRoles(result.roles);
    });

    if (canManage) {
      listRoles(serverId).then((result) => {
        if (!cancelled && result.ok) setAvailableRoles(result.roles);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [serverId, userId, canManage]);

  function openPicker() {
    setSearch("");
    setIsPickerOpen(true);
  }

  function closePicker() {
    setIsPickerOpen(false);
    setSearch("");
  }

  async function handleAdd(role: Role) {
    setPendingRoleId(role.id);
    const result = await assignRole(serverId, userId, role.id);
    setPendingRoleId(null);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }
    setErrorMessage("");
    closePicker();
    setAssignedRoles((prev) => [...(prev ?? []), result.role]);
  }

  async function handleRemove(role: Role) {
    setPendingRoleId(role.id);
    const result = await removeRole(serverId, userId, role.id);
    setPendingRoleId(null);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }
    setErrorMessage("");
    setAssignedRoles((prev) => (prev ?? []).filter((r) => r.id !== role.id));
  }

  if (assignedRoles === null) {
    return (
      <View>
        <Text style={styles.label}>ROLES</Text>
        <ActivityIndicator
          size="small"
          color={colors.accentBright}
          style={styles.loadingIndicator}
        />
      </View>
    );
  }

  const assignedIds = new Set(assignedRoles.map((role) => role.id));
  const query = search.trim().toLowerCase();
  const addableRoles = availableRoles
    .filter((role) => !assignedIds.has(role.id))
    .filter((role) => !query || role.name.toLowerCase().includes(query));

  return (
    <View>
      <Text style={styles.label}>ROLES</Text>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <View style={styles.badgeRow}>
        {assignedRoles.map((role) => (
          <View
            key={role.id}
            style={[
              styles.badge,
              {
                borderColor: hexToRgba(role.color, 0.4),
                backgroundColor: hexToRgba(role.color, 0.12),
              },
            ]}
          >
            <View style={[styles.badgeDot, { backgroundColor: role.color }]} />
            <Text
              style={[styles.badgeText, { color: role.color }]}
              numberOfLines={1}
            >
              {role.name}
            </Text>
            {canManage ? (
              <TouchableOpacity
                onPress={() => handleRemove(role)}
                disabled={pendingRoleId === role.id}
                accessibilityRole="button"
                accessibilityLabel={`Quitar rol ${role.name}`}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={styles.badgeRemove}
              >
                <Feather name="x" size={10} color={role.color} />
              </TouchableOpacity>
            ) : null}
          </View>
        ))}

        {assignedRoles.length === 0 ? (
          <Text style={styles.emptyText}>Sin roles asignados.</Text>
        ) : null}

        {canManage ? (
          <TouchableOpacity
            onPress={openPicker}
            style={styles.addButton}
            accessibilityRole="button"
            accessibilityLabel="Añadir rol"
          >
            <Feather name="plus" size={11} color={colors.info} />
            <Text style={styles.addButtonText}>Añadir rol</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {canManage ? (
        <Modal
          transparent
          visible={isPickerOpen}
          animationType="fade"
          onRequestClose={closePicker}
        >
          <View style={styles.backdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closePicker} />

            <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
              <View style={styles.handle} />

              <View style={styles.searchRow}>
                <Feather name="search" size={15} color={colors.textSubtle} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Buscar rol..."
                  placeholderTextColor={colors.textSubtle}
                  autoFocus
                  style={styles.searchInput}
                />
                {search ? (
                  <TouchableOpacity
                    onPress={() => setSearch("")}
                    accessibilityRole="button"
                    accessibilityLabel="Limpiar búsqueda"
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Feather name="x" size={15} color={colors.textSubtle} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {addableRoles.length === 0 ? (
                <Text style={styles.pickerEmptyText}>
                  No hay más roles para añadir
                </Text>
              ) : (
                <ScrollView
                  style={styles.pickerList}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {addableRoles.map((role, index) => (
                    <TouchableOpacity
                      key={role.id}
                      onPress={() => handleAdd(role)}
                      disabled={pendingRoleId === role.id}
                      style={[
                        styles.pickerRow,
                        index === addableRoles.length - 1
                          ? styles.pickerRowLast
                          : null,
                      ]}
                    >
                      <View
                        style={[
                          styles.badgeDot,
                          { backgroundColor: role.color },
                        ]}
                      />
                      <Text style={styles.pickerRowText} numberOfLines={1}>
                        {role.name}
                      </Text>
                      {pendingRoleId === role.id ? (
                        <ActivityIndicator
                          size="small"
                          color={colors.accentBright}
                        />
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.textSubtle,
    marginBottom: 6,
  },
  loadingIndicator: {
    alignSelf: "flex-start",
    marginTop: 2,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 180,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    flexShrink: 1,
  },
  badgeRemove: {
    marginLeft: 2,
  },
  emptyText: {
    color: colors.textSubtle,
    fontSize: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.info,
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    maxHeight: "70%",
    backgroundColor: colors.bgModal,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: 14,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 12,
    minHeight: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 2,
  },
  pickerList: {
    marginBottom: 4,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 6,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerRowLast: {
    borderBottomWidth: 0,
  },
  pickerRowText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  pickerEmptyText: {
    color: colors.textSubtle,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 24,
  },
});
