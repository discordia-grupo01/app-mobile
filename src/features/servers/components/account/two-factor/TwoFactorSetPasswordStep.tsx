import type { SetPasswordErrors } from "@discordia/client-shared";

import { Text } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { TextField } from "../../../../../components/ui/TextField";
import { FormErrorBanner } from "../../../../../components/ui/FormErrorBanner";

export interface SetPasswordStepCopy {
  /** Va en el encabezado de la hoja, no en el contenido. */
  title: string;
  description: string;
  submitLabel: string;
  continueLabel: string;
}

export const TWO_FACTOR_SET_PASSWORD_COPY: SetPasswordStepCopy = {
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
}

export function TwoFactorSetPasswordStep({
  copy = TWO_FACTOR_SET_PASSWORD_COPY,
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
}: TwoFactorSetPasswordStepProps) {
  return (
    <>
      <Text className="mb-5 text-[14px] leading-5 text-content-muted">
        {copy.description}
      </Text>

      <TextField
        requiredMark
        label="Nueva contraseña"
        placeholder="Mínimo 8 caracteres"
        isPassword
        iconName="lock"
        value={password}
        onChangeText={onPasswordChange}
        error={errors.password}
      />

      <TextField
        requiredMark
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
    </>
  );
}
