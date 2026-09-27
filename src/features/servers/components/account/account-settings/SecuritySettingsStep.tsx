import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../../../theme/theme-context";

interface SecuritySettingsStepProps {
  onOpenTwoFactor: () => void;
  onOpenPinSetup: () => void;
}

export function SecuritySettingsStep({
  onOpenTwoFactor,
  onOpenPinSetup,
}: SecuritySettingsStepProps) {
  const colors = useThemeColors();

  return (
    <View className="px-4.5 pt-5">
      <Text className="mb-1 text-[17px] font-bold text-content">
        Seguridad y acceso
      </Text>
      <Text className="mb-4 text-[13px] leading-[18px] text-content-muted">
        Administrá las medidas que protegen tu cuenta.
      </Text>

      <TouchableOpacity
        activeOpacity={0.75}
        className="mb-3 flex-row items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4"
        onPress={onOpenTwoFactor}
      >
        <View className="w-11 h-11 rounded-xl items-center justify-center bg-[rgba(36,92,107,0.3)]">
          <Feather name="shield" size={20} color={colors.sky} />
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-content mb-0.5">
            Verificación en dos pasos
          </Text>
          <Text className="text-[12px] leading-[17px] text-content-muted">
            Pedí un código además de tu contraseña.
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.75}
        className="flex-row items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4"
        onPress={onOpenPinSetup}
      >
        <View className="w-11 h-11 rounded-xl items-center justify-center bg-[rgba(36,92,107,0.3)]">
          <Feather name="key" size={20} color={colors.highlight} />
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-content mb-0.5">
            PIN de acceso rápido
          </Text>
          <Text className="text-[12px] leading-[17px] text-content-muted">
            Creá un PIN para entrar más rápido desde este dispositivo.
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.textSubtle} />
      </TouchableOpacity>
    </View>
  );
}
