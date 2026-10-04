import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../lib/cn";
import { useThemeColors } from "../../../theme/theme-context";
import { type Step } from "../constants";

interface RolesModalHeaderProps {
  step: Step;
  roleName: string | undefined;
  onBack: () => void;
  onClose: () => void;
}

export function RolesModalHeader({
  step,
  roleName,
  onBack,
  onClose,
}: RolesModalHeaderProps) {
  const colors = useThemeColors();

  const title =
    step === "list"
      ? "Roles"
      : step === "create"
        ? "Crear rol"
        : step === "create-permissions"
          ? "Permisos del rol"
          : (roleName ?? "Rol");

  return (
    <View className="flex-row items-center gap-2 px-3 py-3 border-b border-b-line">
      {step !== "list" ? (
        <TouchableOpacity
          onPress={onBack}
          className="w-8 h-8 rounded-2xl items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Volver"
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
        {title}
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
  );
}

interface RoleDetailTabsProps {
  activeTab: "edit" | "members";
  onChange: (tab: "edit" | "members") => void;
}

/** Pestañas "Editar rol" / "Miembros" dentro del detalle de un rol. */
export function RoleDetailTabs({ activeTab, onChange }: RoleDetailTabsProps) {
  return (
    <View className="flex-row gap-1 px-4 border-b border-b-line">
      <TouchableOpacity
        onPress={() => onChange("edit")}
        className="py-2.5 px-1 mr-4"
        accessibilityRole="button"
      >
        <Text
          className={cn(
            "text-[13px] font-semibold",
            activeTab === "edit" ? "text-content" : "text-content-subtle",
          )}
        >
          Editar rol
        </Text>
        {activeTab === "edit" ? (
          <View className="mt-2 h-0.5 rounded-[1px] bg-accent-strong" />
        ) : null}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onChange("members")}
        className="py-2.5 px-1 mr-4"
        accessibilityRole="button"
      >
        <Text
          className={cn(
            "text-[13px] font-semibold",
            activeTab === "members" ? "text-content" : "text-content-subtle",
          )}
        >
          Miembros
        </Text>
        {activeTab === "members" ? (
          <View className="mt-2 h-0.5 rounded-[1px] bg-accent-strong" />
        ) : null}
      </TouchableOpacity>
    </View>
  );
}
