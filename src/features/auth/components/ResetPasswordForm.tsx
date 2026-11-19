import {
  type ResetPasswordErrors,
  hasErrors,
  validateResetPassword,
  RESET_LINK_INVALID,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { resetPasswordService } from "../service";
import { useThemeColors } from "../../../theme/theme-context";

import { Button } from "../../../components/ui/Button";
import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { TextField } from "../../../components/ui/TextField";
import { withAlpha } from "../../../lib/color";

interface ResetPasswordFormProps {
  token: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function ResetPasswordForm({
  token,
  onBack,
  onSuccess,
}: ResetPasswordFormProps) {
  const colors = useThemeColors();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  // Sin token no hay nada que resetear: el link del mail estaba mal formado.
  if (!token) {
    return (
      <View className="w-full items-center">
        <View
          className="mb-5 h-16 w-16 items-center justify-center rounded-[20px]"
          style={{ backgroundColor: withAlpha(colors.danger, 0.15) }}
        >
          <Feather name="alert-triangle" size={32} color={colors.danger} />
        </View>

        <Text className="mb-2.5 text-center text-[24px] font-bold text-content">
          Enlace inválido
        </Text>
        <Text className="mb-8 text-center text-[14px] leading-5 text-content-muted">
          {RESET_LINK_INVALID} Solicitá un nuevo enlace desde la pantalla de
          recuperación.
        </Text>

        <Button
          title="Volver al inicio de sesión"
          onPress={onBack}
          iconRight="arrow-right"
        />
      </View>
    );
  }

  if (succeeded) {
    return (
      <View className="w-full items-center">
        <View
          className="mb-5 h-16 w-16 items-center justify-center rounded-[20px]"
          style={{ backgroundColor: withAlpha(colors.success, 0.15) }}
        >
          <Feather name="check-circle" size={32} color={colors.success} />
        </View>

        <Text className="mb-2.5 text-center text-[24px] font-bold text-content">
          ¡Contraseña actualizada!
        </Text>
        <Text className="mb-8 text-center text-[14px] leading-5 text-content-muted">
          Tu contraseña fue restablecida correctamente. Ya podés iniciar sesión
          con tu nueva contraseña.
        </Text>

        <Button
          title="Iniciar sesión"
          onPress={onSuccess}
          iconRight="arrow-right"
        />
      </View>
    );
  }

  async function handleSubmit() {
    setFormError(null);

    const nextErrors = validateResetPassword({ newPassword, confirmPassword });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setIsSubmitting(true);
    const result = await resetPasswordService({
      token,
      newPassword,
      confirmPassword,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    setSucceeded(true);
  }

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
        Nueva contraseña
      </Text>
      <Text className="mb-[26px] text-[14px] leading-5 text-content-muted">
        Elegí una contraseña segura para tu cuenta. Mínimo 8 caracteres.
      </Text>

      <TextField
        label="NUEVA CONTRASEÑA"
        placeholder="••••••••"
        isPassword
        autoComplete="new-password"
        value={newPassword}
        onChangeText={setNewPassword}
        error={errors.newPassword}
      />

      <TextField
        label="CONFIRMAR CONTRASEÑA"
        placeholder="••••••••"
        isPassword
        autoComplete="new-password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={errors.confirmPassword}
      />

      <FormErrorBanner message={formError} />

      <Button
        title="Restablecer contraseña"
        onPress={handleSubmit}
        isLoading={isSubmitting}
        iconRight="arrow-right"
      />
    </View>
  );
}
