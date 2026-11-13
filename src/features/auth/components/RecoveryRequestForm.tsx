import {
  ACCOUNT_RECOVERY_DELAY_WARNING,
  ACCOUNT_RECOVERY_DESCRIPTION,
  ACCOUNT_RECOVERY_MESSAGE_MAX_LENGTH,
  ACCOUNT_RECOVERY_MESSAGE_PLACEHOLDER,
  type AccountRecoveryErrors,
  accountRecoveryMessageLength,
  hasErrors,
  validateAccountRecovery,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { cn } from "../../../lib/cn";
import { withAlpha } from "../../../lib/color";
import { useThemeColors } from "../../../theme/theme-context";
import { requestAccountRecoveryService } from "../../two-factor/service";

const MESSAGE_LABEL = "CONTANOS QUÉ PASÓ";

interface RecoveryRequestFormProps {
  challengeToken: string;
  onCancel: () => void;
  onSent: (emailHint: string) => void;
  onAlreadyPending: () => void;
  onChallengeLost: (message: string) => void;
}

export function RecoveryRequestForm({
  challengeToken,
  onCancel,
  onSent,
  onAlreadyPending,
  onChallengeLost,
}: RecoveryRequestFormProps) {
  const colors = useThemeColors();

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<AccountRecoveryErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const length = accountRecoveryMessageLength(message);

  async function handleSubmit() {
    setFormError(null);

    const nextErrors = validateAccountRecovery({ message });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setIsSubmitting(true);
    const result = await requestAccountRecoveryService(challengeToken, message);
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.expired) {
        onChallengeLost(result.message);
        return;
      }
      setFormError(result.message);
      return;
    }

    if ("alreadyPending" in result) {
      onAlreadyPending();
      return;
    }
    onSent(result.emailHint);
  }

  return (
    <View className="w-full">
      <TouchableOpacity
        className="mb-6 flex-row items-center"
        activeOpacity={0.7}
        onPress={onCancel}
      >
        <Feather name="arrow-left" size={14} color={colors.textSubtle} />
        <Text className="ml-1.5 text-[13px] text-content-subtle">
          Volver a la verificación
        </Text>
      </TouchableOpacity>

      <Text className="mb-1.5 text-[24px] font-bold text-content">
        Recuperar acceso a tu cuenta
      </Text>
      <Text className="mb-[26px] text-[14px] leading-5 text-content-muted">
        {ACCOUNT_RECOVERY_DESCRIPTION}
      </Text>

      <View
        className="mb-[18px] flex-row items-start gap-3 rounded-lg border p-3"
        style={{
          borderColor: withAlpha(colors.warning, 0.3),
          backgroundColor: withAlpha(colors.warning, 0.12),
        }}
      >
        <Feather name="alert-triangle" size={16} color={colors.warning} />
        <Text className="flex-1 text-[13px] leading-[18px] text-content-muted">
          {ACCOUNT_RECOVERY_DELAY_WARNING}
        </Text>
      </View>

      <View className="mb-[18px]">
        <View className="mb-1.5 flex-row items-center justify-between gap-2">
          <Text className="shrink text-[11px] font-bold uppercase tracking-[1.2px] text-content-subtle">
            {MESSAGE_LABEL}{" "}
            <Text className="font-normal normal-case">(opcional)</Text>
          </Text>
          <Text
            className={cn(
              "text-xs",
              length > ACCOUNT_RECOVERY_MESSAGE_MAX_LENGTH
                ? "text-danger"
                : "text-content-subtle",
            )}
          >
            {length}/{ACCOUNT_RECOVERY_MESSAGE_MAX_LENGTH}
          </Text>
        </View>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder={ACCOUNT_RECOVERY_MESSAGE_PLACEHOLDER}
          placeholderTextColor={colors.textSubtle}
          multiline
          textAlignVertical="top"
          accessibilityLabel={MESSAGE_LABEL}
          className={cn(
            "min-h-[96px] max-h-40 rounded-xl border bg-surface-input p-3 text-[14px] text-content",
            errors.message ? "border-danger" : "border-line",
          )}
        />
        {errors.message ? (
          <Text className="mt-1.5 text-xs text-danger">{errors.message}</Text>
        ) : null}
      </View>

      <FormErrorBanner message={formError} />

      <Button
        title="Enviar solicitud"
        onPress={handleSubmit}
        isLoading={isSubmitting}
        iconRight="arrow-right"
        className="mb-4"
      />
    </View>
  );
}
