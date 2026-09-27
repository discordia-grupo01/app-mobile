import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";
import { TwoFactorVerifyForm } from "./TwoFactorVerifyForm";

interface TwoFactorLoginStepProps {
  challengeToken: string;
  expiresIn: number;
  onBack: () => void;
  onChallengeLost: (message: string) => void;
  onRecoveryCodeUsed: (remaining: number) => void;
}

export function TwoFactorLoginStep({
  challengeToken,
  expiresIn,
  onBack,
  onChallengeLost,
  onRecoveryCodeUsed,
}: TwoFactorLoginStepProps) {
  const colors = useThemeColors();

  return (
    <View className="w-full">
      <TouchableOpacity
        className="mb-6 flex-row items-center"
        activeOpacity={0.7}
        onPress={onBack}
      >
        <Feather name="arrow-left" size={14} color={colors.textSubtle} />
        <Text className="ml-1.5 text-[13px] text-content-subtle">
          Volver al inicio de sesión
        </Text>
      </TouchableOpacity>

      <Text className="mb-1.5 text-[24px] font-bold text-content">
        Verificación en dos pasos
      </Text>
      <Text className="mb-[26px] text-[14px] text-content-muted">
        Confirmá tu identidad para terminar de iniciar sesión.
      </Text>

      <TwoFactorVerifyForm
        challengeToken={challengeToken}
        expiresIn={expiresIn}
        onChallengeLost={onChallengeLost}
        onRecoveryCodeUsed={onRecoveryCodeUsed}
      />
    </View>
  );
}
