import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../../../theme/theme-context";

interface AccountSettingsMenuProps {
  onSelectAppearance: () => void;
  onSelectSecurity: () => void;
  onSelectStatus: () => void;
  onLogout: () => void;
}

export function AccountSettingsMenu({
  onSelectAppearance,
  onSelectSecurity,
  onSelectStatus,
  onLogout,
}: AccountSettingsMenuProps) {
  const colors = useThemeColors();

  return (
    <View className="px-4.5 pt-5">
      <Text className="mb-2.5 px-1 text-[14px] font-semibold text-content-muted">
        Mi cuenta
      </Text>

      <TouchableOpacity
        activeOpacity={0.75}
        className="mb-3 flex-row items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4"
        onPress={onSelectAppearance}
      >
        <View className="w-11 h-11 rounded-xl items-center justify-center bg-[rgba(107,149,189,0.15)]">
          <Feather name="sun" size={20} color={colors.sky} />
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-bold text-content mb-0.5">
            Apariencia
          </Text>
          <Text className="text-[13px] text-content-subtle">
            Tema de la aplicación
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.75}
        className="flex-row items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4"
        onPress={onSelectSecurity}
      >
        <View className="w-11 h-11 rounded-xl items-center justify-center bg-[rgba(36,92,107,0.3)]">
          <Feather name="shield" size={20} color={colors.sky} />
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-bold text-content mb-0.5">
            Seguridad
          </Text>
          <Text className="text-[13px] text-content-subtle">
            Acceso y verificación
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <Text className="mb-2.5 mt-6 px-1 text-[14px] font-semibold text-content-muted">
        Plataforma
      </Text>
      <TouchableOpacity
        activeOpacity={0.75}
        className="flex-row items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4"
        onPress={onSelectStatus}
      >
        <View className="w-11 h-11 rounded-xl items-center justify-center bg-info/15">
          <Feather name="activity" size={20} color={colors.sky} />
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-bold text-content mb-0.5">
            Estado de la plataforma
          </Text>
          <Text className="text-[13px] text-content-subtle">
            Servicios e incidentes
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.75}
        className="mt-6 flex-row items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4"
        onPress={onLogout}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
      >
        <View className="w-11 h-11 rounded-xl items-center justify-center bg-[rgba(224,82,82,0.14)]">
          <Feather name="log-out" size={20} color={colors.danger} />
        </View>
        <Text className="flex-1 text-[16px] font-bold text-danger">
          Cerrar sesión
        </Text>
      </TouchableOpacity>

      <Text className="mt-4 px-1 text-[12px] text-content-subtle">
        Más opciones estarán disponibles próximamente.
      </Text>
    </View>
  );
}
