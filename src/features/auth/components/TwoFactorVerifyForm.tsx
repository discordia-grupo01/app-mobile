import {
  formatTwoFactorChallengeCountdown,
  hasErrors,
  RECOVERY_CODE_LENGTH,
  TWO_FACTOR_CHALLENGE_EXPIRED,
  TWO_FACTOR_VERIFY_INSTRUCTIONS,
  type TwoFactorCodeErrors,
  validateTwoFactorCode,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { TextField } from "../../../components/ui/TextField";
import { useThemeColors } from "../../../theme/theme-context";
import { useAuth } from "../auth-context";

interface TwoFactorVerifyFormProps {
  challengeToken: string;
  expiresIn: number;
  onChallengeLost: (message: string) => void;
  onRecoveryCodeUsed: (remaining: number) => void;
}

export function TwoFactorVerifyForm({
  challengeToken,
  expiresIn,
  onChallengeLost,
  onRecoveryCodeUsed,
}: TwoFactorVerifyFormProps) {
  const colors = useThemeColors();
  const { verifyTwoFactor } = useAuth();

  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<TwoFactorCodeErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(expiresIn);

  const onChallengeLostRef = useRef(onChallengeLost);
  useEffect(() => {
    onChallengeLostRef.current = onChallengeLost;
  }, [onChallengeLost]);

  // Un solo interval para toda la vida del componente: al llegar a 0 se
  // comporta igual que si el backend respondiera "vencido".
  useEffect(() => {
    if (expiresIn <= 0) {
      onChallengeLostRef.current(TWO_FACTOR_CHALLENGE_EXPIRED);
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          clearInterval(interval);
          onChallengeLostRef.current(TWO_FACTOR_CHALLENGE_EXPIRED);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <View className="mb-[18px] flex-row items-start gap-3 rounded-lg border border-info/30 bg-info/12 p-3">
        <Feather name="shield" size={16} color={colors.info} />
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

      {formError ? (
        <View
          className="mb-[18px] rounded-lg border border-danger/30 bg-danger/12 p-3"
          accessibilityRole="alert"
        >
          <Text className="text-center text-[13px] text-danger">
            {formError}
          </Text>
        </View>
      ) : null}

      <Button
        title="Verificar"
        onPress={handleSubmit}
        isLoading={isSubmitting}
        iconRight="arrow-right"
        className="mb-4"
      />

      <View className="flex-row items-center justify-between px-1">
        <Text className="text-[12px] text-content-subtle">
          Sesión aún no iniciada
        </Text>
        <Text className="text-[12px] font-medium tabular-nums text-content-subtle">
          {formatTwoFactorChallengeCountdown(secondsLeft)}
        </Text>
      </View>
    </View>
  );
}
