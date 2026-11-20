import type { SetPasswordErrors } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { TextField } from "../../../../../components/ui/TextField";
import { withAlpha } from "../../../../../lib/color";
import { useThemeColors } from "../../../../../theme/theme-context";
import { FormErrorBanner } from "../../../../../components/ui/FormErrorBanner";

export interface SetPasswordStepCopy {
  title: string;
  description: string;
  submitLabel: string;
  continueLabel: string;
}

const TWO_FACTOR_COPY: SetPasswordStepCopy = {
  title: "Creá una contraseña primero",
  description:
    "Tu cuenta usa Google y todavía no tiene una contraseña propia. La vas a necesitar para recuperar códigos o desactivar el segundo factor más adelante.",
  submitLabel: "Guardar y continuar",
  continueLabel: "Continuar al QR",
};

interface TwoFactorSetPasswordStepProps {
  copy?: SetPasswordStepCopy;
  password: string;
  confirmPassword: string;
  errors: SetPasswordErrors;
  formError: string | null;
  alreadySet: boolean;
  isSubmitting: boolean;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  onSubmit: () => void;
  onContinueAnyway: () => void;
  onCancel: () => void;
}

export function TwoFactorSetPasswordStep({
  copy = TWO_FACTOR_COPY,
  password,
  confirmPassword,
  errors,
  formError,
  alreadySet,
  isSubmitting,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onContinueAnyway,
  onCancel,
}: TwoFactorSetPasswordStepProps) {
  const colors = useThemeColors();

  return (
    <>
      <View className="mb-4 items-center">
        <View
          className="mb-4 h-14 w-14 items-center justify-center rounded-2xl border"
          style={{
            borderColor: withAlpha(colors.info, 0.35),
            backgroundColor: withAlpha(colors.info, 0.15),
          }}
        >
          <Feather name="lock" size={26} color={colors.info} />
        </View>
        <Text className="text-center text-[17px] font-bold text-content">
          {copy.title}
        </Text>
        <Text className="mt-2 text-center text-[13px] leading-[18px] text-content-muted">
          {copy.description}
        </Text>
      </View>

      <TextField
        labelVariant="sentence"
        label="Nueva contraseña"
        placeholder="Mínimo 8 caracteres"
        isPassword
        iconName="lock"
        value={password}
        onChangeText={onPasswordChange}
        error={errors.password}
      />

      <TextField
        labelVariant="sentence"
        label="Confirmar contraseña"
        placeholder="Repetí la contraseña"
        isPassword
        iconName="lock"
        value={confirmPassword}
        onChangeText={onConfirmPasswordChange}
        error={errors.confirmPassword}
      />

      {formError ? <FormErrorBanner message={formError} /> : null}

      {alreadySet ? (
        <Button
          title={copy.continueLabel}
          onPress={onContinueAnyway}
          isLoading={isSubmitting}
        />
      ) : (
        <Button
          title={copy.submitLabel}
          onPress={onSubmit}
          isLoading={isSubmitting}
        />
      )}

      <TouchableOpacity
        activeOpacity={0.75}
        className="mt-2.5 items-center py-3"
        onPress={onCancel}
      >
        <Text className="text-[13px] font-bold text-content-muted">
          Cancelar
        </Text>
      </TouchableOpacity>
    </>
  );
}
