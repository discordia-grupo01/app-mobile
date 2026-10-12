import {
  type Channel,
  CHANNEL_PERMISSION_COPY,
  channelPermissionGroupsFor,
  type ChannelOverridePermission,
  CLEAR_ROLE_OVERRIDE_LABEL,
  INHERITED_ALLOWED_LABEL,
  INHERITED_DENIED_LABEL,
  OVERRIDE_ALLOW_LABEL,
  OVERRIDE_DENY_LABEL,
  OVERRIDE_INHERIT_LABEL,
  type OverrideValue,
  PERMISSION_NOT_HELD_HINT,
  type Role,
  ROLE_ABOVE_OWN_HINT,
  type RoleOverrideDraft,
  type ThemeColors,
  type ThemeName,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../../../lib/cn";
import { withAlpha } from "../../../../../lib/color";
import { useTheme, useThemeColors } from "../../../../../theme/theme-context";
import { OverrideIcon, type OverrideIconName } from "./OverrideIcon";

const ROLE_EDITOR_HINT =
  "Lo que quede en Heredar usa los permisos del rol en el servidor.";

interface RoleOverrideEditorProps {
  role: Role;
  channelKind: Channel["kind"];
  values: RoleOverrideDraft | undefined;
  /** El actor no supera a este rol en la jerarquia. */
  disabled: boolean;
  canAllow: (permission: ChannelOverridePermission) => boolean;
  onChange: (
    permission: ChannelOverridePermission,
    value: OverrideValue,
  ) => void;
  onClear: () => void;
}

export function RoleOverrideEditor({
  role,
  channelKind,
  values,
  disabled,
  canAllow,
  onChange,
  onClear,
}: RoleOverrideEditorProps) {
  const colors = useThemeColors();

  return (
    <View>
      <View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface-raised px-4 py-3.5">
        <View
          className="w-9 h-9 items-center justify-center rounded-full"
          style={{ backgroundColor: withAlpha(role.color, 0.18) }}
        >
          <View
            className="w-3.5 h-3.5 rounded-full"
            style={{ backgroundColor: role.color }}
          />
        </View>
        <View className="flex-1">
          <Text
            className="text-[16px] font-bold text-content"
            numberOfLines={1}
          >
            {role.name}
          </Text>
          <Text className="text-[12px] leading-[16px] text-content-subtle mt-0.5">
            {ROLE_EDITOR_HINT}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClear}
          disabled={disabled}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          className={cn(
            "rounded-full border border-line-strong px-3 py-1.5",
            disabled && "opacity-40",
          )}
        >
          <Text className="text-[12px] font-semibold text-content-muted">
            {CLEAR_ROLE_OVERRIDE_LABEL}
          </Text>
        </TouchableOpacity>
      </View>

      {disabled ? (
        <View className="flex-row items-center gap-2 mt-3 rounded-xl bg-surface-sunken px-3 py-2.5">
          <Feather name="lock" size={13} color={colors.textSubtle} />
          <Text className="flex-1 text-[12px] text-content-muted">
            {ROLE_ABOVE_OWN_HINT}
          </Text>
        </View>
      ) : null}

      {channelPermissionGroupsFor(channelKind).map((group) => (
        <View key={group.title} className="mt-6">
          <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle uppercase mb-2 ml-1">
            {group.title}
          </Text>
          <View className="overflow-hidden rounded-2xl border border-line">
            {group.permissions.map((permission, index) => (
              <PermissionOverrideRow
                key={permission}
                label={CHANNEL_PERMISSION_COPY[permission].label}
                description={CHANNEL_PERMISSION_COPY[permission].desc}
                value={values?.[permission] ?? "inherit"}
                inheritedAllowed={role.permissions.includes(permission)}
                disabled={disabled}
                canAllow={canAllow(permission)}
                isFirst={index === 0}
                onChange={(value) => onChange(permission, value)}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

interface ActiveLook {
  fill: string;
  border: string;
  icon: string;
}

interface OverrideOption {
  value: OverrideValue;
  label: string;
  icon: OverrideIconName;
  /** Color del icono cuando no esta elegida. */
  idleColor: (colors: ThemeColors) => string;
  active: (colors: ThemeColors, theme: ThemeName) => ActiveLook;
}

const OPTIONS: readonly OverrideOption[] = [
  {
    value: "deny",
    label: OVERRIDE_DENY_LABEL,
    icon: "deny",
    idleColor: (colors) => colors.danger,
    active: (colors) => ({
      fill: colors.danger,
      border: colors.danger,
      icon: colors.onAccent,
    }),
  },
  {
    value: "inherit",
    label: OVERRIDE_INHERIT_LABEL,
    icon: "inherit",
    idleColor: (colors) => colors.textSubtle,
    // En oscuro el gris lleno resalta demasiado sobre el azul.
    active: (colors, theme) =>
      theme === "dark"
        ? {
            fill: colors.borderStrong,
            border: colors.textSubtle,
            icon: colors.text,
          }
        : {
            fill: colors.textSubtle,
            border: colors.textSubtle,
            icon: colors.bgModal,
          },
  },
  {
    value: "allow",
    label: OVERRIDE_ALLOW_LABEL,
    icon: "allow",
    idleColor: (colors) => colors.success,
    active: (colors) => ({
      fill: colors.success,
      border: colors.success,
      icon: colors.onAccent,
    }),
  },
];

interface PermissionOverrideRowProps {
  label: string;
  description: string;
  value: OverrideValue;
  /** Lo que el rol tiene en el servidor: es lo que vale si queda en "Heredar". */
  inheritedAllowed: boolean;
  disabled: boolean;
  /** El actor no tiene el permiso: puede denegarlo pero no permitirlo. */
  canAllow: boolean;
  isFirst: boolean;
  onChange: (value: OverrideValue) => void;
}

/**
 * Nombre y botones en la misma linea; la descripcion va abajo a todo el
 * ancho para que no se apile en tres renglones al lado de los botones.
 */
function PermissionOverrideRow({
  label,
  description,
  value,
  inheritedAllowed,
  disabled,
  canAllow,
  isFirst,
  onChange,
}: PermissionOverrideRowProps) {
  const colors = useThemeColors();
  const { theme } = useTheme();

  return (
    <View className={cn("px-4 py-3.5", !isFirst && "border-t border-t-line")}>
      <View className="flex-row items-center gap-3">
        <Text className="flex-1 text-[15px] font-semibold text-content">
          {label}
        </Text>

        <View className="flex-row" accessibilityRole="radiogroup">
          {OPTIONS.map((option, index) => {
            const isActive = value === option.value;
            const isBlocked =
              disabled || (option.value === "allow" && !canAllow);
            const look = isActive ? option.active(colors, theme) : null;
            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.75}
                disabled={isBlocked}
                onPress={() => onChange(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive, disabled: isBlocked }}
                accessibilityLabel={`${option.label}: ${label}`}
                className={cn(
                  "w-10 h-8 items-center justify-center border",
                  index === 0 && "rounded-l-lg",
                  index === OPTIONS.length - 1 && "rounded-r-lg",
                  index > 0 && "-ml-px",
                  !look && "border-line-strong",
                  isBlocked && "opacity-35",
                )}
                style={
                  look
                    ? { backgroundColor: look.fill, borderColor: look.border }
                    : null
                }
              >
                <OverrideIcon
                  name={option.icon}
                  size={15}
                  color={look ? look.icon : option.idleColor(colors)}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Text className="text-[13px] leading-[18px] text-content-subtle mt-1">
        {description}
      </Text>

      {value === "inherit" ? (
        <View
          className="flex-row items-center gap-1 self-start mt-2 rounded-full px-2 py-0.5"
          style={{
            backgroundColor: withAlpha(
              inheritedAllowed ? colors.success : colors.danger,
              0.12,
            ),
          }}
        >
          <OverrideIcon
            name={inheritedAllowed ? "allow" : "deny"}
            size={11}
            strokeWidth={3}
            color={inheritedAllowed ? colors.success : colors.danger}
          />
          <Text
            className={cn(
              "text-[11px] font-semibold",
              inheritedAllowed ? "text-success" : "text-danger",
            )}
          >
            {inheritedAllowed
              ? INHERITED_ALLOWED_LABEL
              : INHERITED_DENIED_LABEL}
          </Text>
        </View>
      ) : null}

      {!canAllow && !disabled ? (
        <Text className="text-[11px] text-content-subtle mt-1.5">
          {PERMISSION_NOT_HELD_HINT}
        </Text>
      ) : null}
    </View>
  );
}
