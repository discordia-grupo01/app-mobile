import {
  ADD_ROLE_OVERRIDE_LABEL,
  ALL_ROLES_HAVE_OVERRIDES,
  canAllowOverride,
  canEditRoleOverride,
  type Channel,
  type ChannelOverridePermission,
  CHANNEL_PERMISSIONS_ADMINS_NOTE,
  CHANNEL_PERMISSIONS_ROLES_LABEL,
  channelPermissionGroupsFor,
  type HierarchyContext,
  type Role,
  ROLE_ABOVE_OWN_HINT,
  type RoleOverrideDraft,
  sortRolesByPosition,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { FormErrorBanner } from "../../../../../components/ui/FormErrorBanner";
import { cn } from "../../../../../lib/cn";
import { useThemeColors } from "../../../../../theme/theme-context";
import type { ChannelOverridesState } from "../../../useChannelOverrides";
import { RoleOverrideEditor } from "./RoleOverrideEditor";

const NO_OVERRIDES_SUMMARY = "Sin excepciones · hereda del servidor";

interface ChannelPermissionsStepProps {
  channelKind: Channel["kind"];
  overrides: ChannelOverridesState;
  /** Todos los roles del servidor, @everyone incluido. */
  serverRoles: readonly Role[];
  actor: HierarchyContext & { serverPermissions: readonly string[] };
  /** Rol abierto en el editor; `null` muestra la lista de roles. */
  editingRoleId: string | null;
  onEditingRoleChange: (roleId: string | null) => void;
}

export function ChannelPermissionsStep({
  channelKind,
  overrides,
  serverRoles,
  actor,
  editingRoleId,
  onEditingRoleChange,
}: ChannelPermissionsStepProps) {
  const colors = useThemeColors();
  const everyone = serverRoles.find((role) => role.is_everyone) ?? null;
  const { draft } = overrides;

  const { listedRoles, addableRoles } = useMemo(() => {
    const ranked = sortRolesByPosition(
      serverRoles.filter((role) => !role.is_everyone),
    );
    const inDraft = (role: Role) => draft !== null && role.id in draft;
    return {
      listedRoles: [...(everyone ? [everyone] : []), ...ranked.filter(inDraft)],
      addableRoles: ranked.filter((role) => !inDraft(role)),
    };
  }, [serverRoles, everyone, draft]);

  if (overrides.status === "error") {
    return (
      <View>
        <FormErrorBanner message={overrides.loadError} />
        <Button
          title="Reintentar"
          variant="secondary"
          onPress={overrides.retry}
        />
      </View>
    );
  }

  if (overrides.status === "loading" || !draft) {
    return (
      <View
        className="items-center justify-center py-16"
        accessibilityLabel="Cargando permisos"
      >
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  const editingRole = listedRoles.find((role) => role.id === editingRoleId);

  if (editingRole) {
    return (
      <RoleOverrideEditor
        role={editingRole}
        channelKind={channelKind}
        values={draft[editingRole.id]}
        disabled={!canEditRoleOverride(actor, editingRole)}
        canAllow={(permission) => canAllowOverride(actor, permission)}
        onChange={(permission, value) =>
          overrides.setValue(editingRole.id, permission, value)
        }
        onClear={() => {
          overrides.clearRole(editingRole.id);
          // Un rol sin excepciones deja de estar en la lista: volvemos a ella.
          if (!editingRole.is_everyone) onEditingRoleChange(null);
        }}
      />
    );
  }

  return (
    <RoleList
      channelKind={channelKind}
      roles={listedRoles}
      addableRoles={addableRoles}
      draft={draft}
      canEdit={(role) => canEditRoleOverride(actor, role)}
      onOpen={onEditingRoleChange}
      onAdd={(roleId) => {
        overrides.addRole(roleId);
        onEditingRoleChange(roleId);
      }}
    />
  );
}

interface RoleListProps {
  channelKind: Channel["kind"];
  /** Roles con excepcion en el borrador, @everyone primero. */
  roles: readonly Role[];
  addableRoles: readonly Role[];
  draft: Readonly<Record<string, RoleOverrideDraft>>;
  canEdit: (role: Role) => boolean;
  onOpen: (roleId: string) => void;
  onAdd: (roleId: string) => void;
}

function RoleList({
  channelKind,
  roles,
  addableRoles,
  draft,
  canEdit,
  onOpen,
  onAdd,
}: RoleListProps) {
  const colors = useThemeColors();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const permissions = channelPermissionGroupsFor(channelKind).flatMap(
    (group) => group.permissions,
  );

  return (
    <View>
      <Text className="text-[12px] leading-[17px] text-content-subtle mb-5">
        {CHANNEL_PERMISSIONS_ADMINS_NOTE}
      </Text>

      <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle uppercase mb-2 ml-1">
        {CHANNEL_PERMISSIONS_ROLES_LABEL}
      </Text>

      <View className="overflow-hidden rounded-2xl border border-line bg-surface-raised">
        {roles.map((role, index) => {
          const isEditable = canEdit(role);
          return (
            <TouchableOpacity
              key={role.id}
              activeOpacity={0.7}
              onPress={() => onOpen(role.id)}
              accessibilityRole="button"
              accessibilityLabel={role.name}
              accessibilityHint={isEditable ? undefined : ROLE_ABOVE_OWN_HINT}
              className={cn(
                "flex-row items-center gap-3 px-4 py-3.5",
                index > 0 && "border-t border-t-line",
              )}
            >
              <RoleDot color={role.color} size="lg" />
              <View className="flex-1">
                <Text
                  className="text-[15px] font-semibold text-content"
                  numberOfLines={1}
                >
                  {role.name}
                </Text>
                <OverrideSummary
                  values={draft[role.id]}
                  permissions={permissions}
                />
              </View>
              {isEditable ? null : (
                <Feather name="lock" size={14} color={colors.textSubtle} />
              )}
              <Feather
                name="chevron-right"
                size={18}
                color={colors.textSubtle}
              />
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsPickerOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityLabel={ADD_ROLE_OVERRIDE_LABEL}
          accessibilityState={{ expanded: isPickerOpen }}
          className="flex-row items-center gap-3 border-t border-t-line px-4 py-3.5"
        >
          <View className="w-7 h-7 items-center justify-center rounded-full bg-surface-hover">
            <Feather
              name={isPickerOpen ? "chevron-up" : "plus"}
              size={15}
              color={colors.text}
            />
          </View>
          <Text className="flex-1 text-[14px] font-semibold text-content">
            {ADD_ROLE_OVERRIDE_LABEL}
          </Text>
        </TouchableOpacity>

        {isPickerOpen ? (
          <View className="border-t border-t-line bg-surface-sunken px-2 py-2">
            {addableRoles.length === 0 ? (
              <Text className="px-2 py-2 text-[13px] text-content-subtle">
                {ALL_ROLES_HAVE_OVERRIDES}
              </Text>
            ) : (
              addableRoles.map((role) => {
                const isEditable = canEdit(role);
                return (
                  <TouchableOpacity
                    key={role.id}
                    activeOpacity={0.7}
                    disabled={!isEditable}
                    accessibilityRole="menuitem"
                    accessibilityState={{ disabled: !isEditable }}
                    accessibilityHint={
                      isEditable ? undefined : ROLE_ABOVE_OWN_HINT
                    }
                    onPress={() => {
                      setIsPickerOpen(false);
                      onAdd(role.id);
                    }}
                    className={cn(
                      "flex-row items-center gap-3 rounded-lg px-2.5 py-2.5",
                      !isEditable && "opacity-40",
                    )}
                  >
                    <RoleDot color={role.color} />
                    <Text
                      className="flex-1 text-[14px] text-content-muted"
                      numberOfLines={1}
                    >
                      {role.name}
                    </Text>
                    {isEditable ? (
                      <Feather
                        name="plus"
                        size={14}
                        color={colors.textSubtle}
                      />
                    ) : (
                      <Feather
                        name="lock"
                        size={13}
                        color={colors.textSubtle}
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function OverrideSummary({
  values,
  permissions,
}: {
  values: RoleOverrideDraft | undefined;
  permissions: readonly ChannelOverridePermission[];
}) {
  const picked = permissions.map((permission) => values?.[permission]);
  const allowed = picked.filter((value) => value === "allow").length;
  const denied = picked.filter((value) => value === "deny").length;

  if (allowed === 0 && denied === 0) {
    return (
      <Text className="text-[12px] text-content-subtle mt-0.5">
        {NO_OVERRIDES_SUMMARY}
      </Text>
    );
  }

  return (
    <View className="flex-row items-center gap-2 mt-0.5">
      {allowed > 0 ? (
        <Text className="text-[12px] font-semibold text-success">
          {allowed} {allowed === 1 ? "permitido" : "permitidos"}
        </Text>
      ) : null}
      {allowed > 0 && denied > 0 ? (
        <Text className="text-[12px] text-content-subtle">·</Text>
      ) : null}
      {denied > 0 ? (
        <Text className="text-[12px] font-semibold text-danger">
          {denied} {denied === 1 ? "denegado" : "denegados"}
        </Text>
      ) : null}
    </View>
  );
}

function RoleDot({
  color,
  size = "md",
}: {
  color: string;
  size?: "md" | "lg";
}) {
  return (
    <View
      className={cn(
        "rounded-full",
        size === "lg" ? "w-3.5 h-3.5" : "w-2.5 h-2.5",
      )}
      style={{ backgroundColor: color }}
    />
  );
}
