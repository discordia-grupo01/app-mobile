import { hexToRgba, type Role } from "@discordia/client-shared";

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

import { cn } from "../../../lib/cn";
import { useThemeColors } from "../../../theme/theme-context";
import { assignRole, listMemberRoles, listRoles, removeRole } from "../api";

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
  const colors = useThemeColors();
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
        <Text className="text-[11px] font-bold tracking-[1.2px] text-content-subtle mb-1.5">
          ROLES
        </Text>
        <ActivityIndicator
          size="small"
          color={colors.accentBright}
          className="self-start mt-0.5"
        />
      </View>
    );
  }

  const visibleAssignedRoles = assignedRoles.filter(
    (role) => !role.is_everyone,
  );
  const assignedIds = new Set(assignedRoles.map((role) => role.id));
  const query = search.trim().toLowerCase();
  const addableRoles = availableRoles
    .filter((role) => !role.is_everyone && !assignedIds.has(role.id))
    .filter((role) => !query || role.name.toLowerCase().includes(query));

  return (
    <View>
      <Text className="text-[11px] font-bold tracking-[1.2px] text-content-subtle mb-1.5">
        ROLES
      </Text>
      {errorMessage ? (
        <Text className="text-danger text-[12px] mb-1.5">{errorMessage}</Text>
      ) : null}

      <View className="flex-row flex-wrap items-center gap-1.5">
        {visibleAssignedRoles.map((role) => (
          <View
            key={role.id}
            className="flex-row items-center gap-1.5 rounded-full border px-2.5 py-1.5 max-w-45"
            style={{
              borderColor: hexToRgba(role.color, 0.4),
              backgroundColor: hexToRgba(role.color, 0.12),
            }}
          >
            <View
              className="w-2 h-2 rounded-sm"
              style={{ backgroundColor: role.color }}
            />
            <Text
              className="text-[12px] font-bold shrink"
              style={{ color: role.color }}
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
                className="ml-0.5"
              >
                <Feather name="x" size={10} color={role.color} />
              </TouchableOpacity>
            ) : null}
          </View>
        ))}

        {visibleAssignedRoles.length === 0 ? (
          <Text className="text-content-subtle text-[12px]">
            Sin roles asignados.
          </Text>
        ) : null}

        {canManage ? (
          <TouchableOpacity
            onPress={openPicker}
            className="flex-row items-center gap-[5px] rounded-full border border-line bg-surface-input px-2.5 py-1.5"
            accessibilityRole="button"
            accessibilityLabel="Añadir rol"
          >
            <Feather name="plus" size={11} color={colors.info} />
            <Text className="text-[12px] font-bold text-info">Añadir rol</Text>
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
          <View className="flex-1 justify-end bg-[rgba(0,0,0,0.6)]">
            <Pressable style={StyleSheet.absoluteFill} onPress={closePicker} />

            <View
              className="max-h-[70%] bg-surface-modal rounded-tl-[22px] rounded-tr-[22px] border-t border-line-strong px-4 pt-2.5"
              style={{ paddingBottom: insets.bottom + 16 }}
            >
              <View className="self-center w-9 h-1 rounded-xs bg-line-strong mb-3.5" />

              <View className="flex-row items-center gap-2 rounded-xl border border-line bg-surface-input px-3 min-h-11 mb-3">
                <Feather name="search" size={15} color={colors.textSubtle} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Buscar rol..."
                  placeholderTextColor={colors.textSubtle}
                  autoFocus
                  className="flex-1 text-[14px] text-content py-0.5"
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
                <Text className="text-content-subtle text-[13px] text-center py-6">
                  No hay más roles para añadir
                </Text>
              ) : (
                <ScrollView
                  className="mb-1"
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {addableRoles.map((role, index) => (
                    <TouchableOpacity
                      key={role.id}
                      onPress={() => handleAdd(role)}
                      disabled={pendingRoleId === role.id}
                      className={cn(
                        "flex-row items-center gap-2.5 px-1.5 py-3 border-b-line",
                        index === addableRoles.length - 1
                          ? "border-b-0"
                          : "border-b",
                      )}
                    >
                      <View
                        className="w-2 h-2 rounded-sm"
                        style={{ backgroundColor: role.color }}
                      />
                      <Text
                        className="flex-1 text-[14px] text-content"
                        numberOfLines={1}
                      >
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
