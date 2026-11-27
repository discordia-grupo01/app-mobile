import { PERMISSION_COPY, type RolePermission } from "@discordia/client-shared";

import { Text, TouchableOpacity, View } from "react-native";
import { Switch } from "../../../../components/ui/Switch";
import { cn } from "../../../../lib/cn";

interface PermissionToggleProps {
  perm: RolePermission;
  enabled: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

export function PermissionToggle({
  perm,
  enabled,
  disabled = false,
  onChange,
}: PermissionToggleProps) {
  const copy = PERMISSION_COPY[perm];
  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.75}
      disabled={disabled}
      onPress={() => onChange(!enabled)}
      className={cn(
        "flex-row items-center justify-between gap-3 rounded-xl border px-3.5 py-3",
        enabled
          ? "border-accent/40 bg-accent/12"
          : "border-line bg-surface-input",
        disabled && "opacity-50",
      )}
    >
      <View className="flex-1">
        <Text className="text-[14px] font-semibold text-content">
          {copy.label}
        </Text>
        <Text className="text-[12px] text-content-subtle mt-0.5">
          {copy.desc}
        </Text>
      </View>
      <Switch
        checked={enabled}
        onChange={onChange}
        label={copy.label}
        disabled={disabled}
      />
    </TouchableOpacity>
  );
}
