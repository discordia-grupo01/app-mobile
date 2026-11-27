import { ACCOUNT_PASSWORD_COPY } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { SettingsMenuRow } from "../../../../../components/ui/SettingsMenuRow";
import { useThemeColors } from "../../../../../theme/theme-context";

interface SecuritySettingsStepProps {
  isPinEnabled: boolean;
  hasPassword: boolean | null;
  onOpenTwoFactor: () => void;
  onOpenPassword: () => void;
  onOpenPinSetup: () => void;
}

export function SecuritySettingsStep({
  isPinEnabled,
  hasPassword,
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

      <SettingsMenuRow
        icon="shield"
        title="Verificación en dos pasos"
        subtitle="Pedí un código además de tu contraseña."
        onPress={onOpenTwoFactor}
      />

      {hasPassword !== null ? (
        <SettingsMenuRow
          icon="lock"
          title={
            hasPassword
              ? ACCOUNT_PASSWORD_COPY.changeRowTitle
              : ACCOUNT_PASSWORD_COPY.setRowTitle
          }
          subtitle={
            hasPassword
              ? ACCOUNT_PASSWORD_COPY.changeRowDescription
              : ACCOUNT_PASSWORD_COPY.setRowDescription
          }
          onPress={onOpenPassword}
        />
      ) : null}

      <SettingsMenuRow
        icon={<Feather name="key" size={20} color={colors.highlight} />}
        title={
          isPinEnabled
            ? "Modificar PIN de acceso rápido"
            : "PIN de acceso rápido"
        }
        subtitle={
          isPinEnabled
            ? "Cambiá el PIN de este dispositivo."
            : "Creá un PIN para entrar más rápido desde este dispositivo."
        }
        onPress={onOpenPinSetup}
      />
    </View>
  );
}
