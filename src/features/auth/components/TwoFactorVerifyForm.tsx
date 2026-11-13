import {
  hasErrors,
  RECOVERY_CODE_LENGTH,
  TWO_FACTOR_VERIFY_INSTRUCTIONS,
  type TwoFactorCodeErrors,
  validateTwoFactorCode,
} from "@discordia/client-shared";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { TextField } from "../../../components/ui/TextField";
import { withAlpha } from "../../../lib/color";
import { useThemeColors } from "../../../theme/theme-context";
import { useAuth } from "../auth-context";

interface TwoFactorVerifyFormProps {
  challengeToken: string;
  onChallengeLost: (message: string) => void;
  onRecoveryCodeUsed: (remaining: number) => void;
}

export function TwoFactorVerifyForm({
  challengeToken,
  onChallengeLost,
  onRecoveryCodeUsed,
}: TwoFactorVerifyFormProps) {
  const colors = useThemeColors();
  const { verifyTwoFactor } = useAuth();

  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<TwoFactorCodeErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setFormError(null);

    const nextErrors = validateTwoFactorCode({ code });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setIsSubmitting(true);
    const result = await verifyTwoFactor(challengeToken, code);
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.expired) {
        onChallengeLost(result.message);
        return;
      }
      setCode("");
      setFormError(result.message);
      return;
    }

    if (result.recoveryCodeUsed) {
      onRecoveryCodeUsed(result.recoveryCodesRemaining);
    }
  }

  return (
    <View className="w-full">
      <View
        className="mb-[18px] flex-row items-start gap-3 rounded-lg border p-3"
        style={{
          borderColor: withAlpha(colors.info, 0.3),
          backgroundColor: withAlpha(colors.info, 0.12),
        }}
      >
        <MaterialCommunityIcons
          name="shield-check"
          size={16}
          color={colors.info}
        />
        <Text className="flex-1 text-[13px] leading-[18px] text-content-muted">
          {TWO_FACTOR_VERIFY_INSTRUCTIONS}
        </Text>
      </View>

      <TextField
        label="CÓDIGO DE SEGURIDAD"
        placeholder="123456 o A1B2C-D3E4F"
        autoCapitalize="characters"
        autoComplete="one-time-code"
        maxLength={RECOVERY_CODE_LENGTH + 1}
        iconName="key"
        value={code}
        onChangeText={setCode}
        error={errors.code}
      />

      <FormErrorBanner message={formError} />

      <Button
        title="Verificar"
        onPress={handleSubmit}
        isLoading={isSubmitting}
        iconRight="arrow-right"
      />
    </View>
  );
}
