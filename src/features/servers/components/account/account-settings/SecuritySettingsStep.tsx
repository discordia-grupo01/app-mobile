import { ACCOUNT_PASSWORD_COPY } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { SuccessNotice } from "../../../../../components/ui/SuccessNotice";
import { useThemeColors } from "../../../../../theme/theme-context";

interface SecuritySettingsStepProps {
  isPinEnabled: boolean;
  hasPassword: boolean | null;
  notice: string | null;
  onOpenTwoFactor: () => void;
  onOpenPassword: () => void;
  onOpenPinSetup: () => void;
}

export function SecuritySettingsStep({
  isPinEnabled,
  hasPassword,
  notice,
  onOpenTwoFactor,
  onOpenPassword,
  onOpenPinSetup,
}: SecuritySettingsStepProps) {
  const colors = useThemeColors();

  return (
    <View className="px-4.5 pt-5">
      <Text className="mb-4 text-[13px] leading-[18px] text-content-muted">
        Administrá las medidas que protegen tu cuenta.
      </Text>

      {notice ? (
        <View className="mb-3">
          <SuccessNotice message={notice} />
        </View>
      ) : null}

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

      {hasPassword !== null ? (
        <TouchableOpacity
          activeOpacity={0.75}
          className="mb-3 flex-row items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4"
          onPress={onOpenPassword}
        >
          <View className="w-11 h-11 rounded-xl items-center justify-center bg-[rgba(36,92,107,0.3)]">
            <Feather name="lock" size={20} color={colors.sky} />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-bold text-content mb-0.5">
              {hasPassword
                ? ACCOUNT_PASSWORD_COPY.changeRowTitle
                : ACCOUNT_PASSWORD_COPY.setRowTitle}
            </Text>
            <Text className="text-[12px] leading-[17px] text-content-muted">
              {hasPassword
                ? ACCOUNT_PASSWORD_COPY.changeRowDescription
                : ACCOUNT_PASSWORD_COPY.setRowDescription}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textSubtle} />
        </TouchableOpacity>
      ) : null}

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
            {isPinEnabled
              ? "Modificar PIN de acceso rápido"
              : "PIN de acceso rápido"}
          </Text>
          <Text className="text-[12px] leading-[17px] text-content-muted">
            {isPinEnabled
              ? "Cambiá el PIN de este dispositivo."
              : "Creá un PIN para entrar más rápido desde este dispositivo."}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.textSubtle} />
      </TouchableOpacity>
    </View>
  );
}
