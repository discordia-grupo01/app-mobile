import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../../../theme/theme-context";

interface AccountSettingsMenuProps {
  onSelectAppearance: () => void;
  onSelectNotifications: () => void;
  onSelectSecurity: () => void;
  onLogout: () => void;
}

export function AccountSettingsMenu({
  onSelectAppearance,
  onSelectNotifications,
  onSelectSecurity,
  onLogout,
}: AccountSettingsMenuProps) {
  const colors = useThemeColors();

  return (
    <View className="px-4.5 pt-5">
      <Text className="mb-4 text-[14px] leading-[19px] text-content-muted">
        Elegí qué aspecto de tu cuenta querés configurar.
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
        className="mb-3 flex-row items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4"
        onPress={onSelectNotifications}
      >
        <View className="w-11 h-11 rounded-xl items-center justify-center bg-[rgba(107,149,189,0.15)]">
          <Feather name="bell" size={20} color={colors.sky} />
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-bold text-content mb-0.5">
            Notificaciones
          </Text>
          <Text className="text-[13px] text-content-subtle">Avisos push</Text>
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

      <TouchableOpacity
        activeOpacity={0.75}
        className="mt-3 flex-row items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4"
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
