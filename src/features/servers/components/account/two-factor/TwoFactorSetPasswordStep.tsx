import type { SetPasswordErrors } from "@discordia/client-shared";

import { Text, TouchableOpacity } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { TextField } from "../../../../../components/ui/TextField";
import { TwoFactorErrorBanner } from "./TwoFactorErrorBanner";

interface TwoFactorSetPasswordStepProps {
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

/**
 * Paso previo al QR para una cuenta sin contraseña propia (alta puramente
 * federada por Google): sin una, no habría forma de reingresarla después
 * para desactivar el 2FA o regenerar códigos de recuperación.
 */
export function TwoFactorSetPasswordStep({
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
  return (
    <>
      <Text className="mb-1.5 text-[17px] font-bold text-content">
        Creá una contraseña primero
      </Text>
      <Text className="mb-4 text-[13px] leading-[18px] text-content-muted">
        Tu cuenta usa Google y todavía no tiene una contraseña propia. La vas a
        necesitar para recuperar códigos o desactivar el segundo factor más
        adelante.
      </Text>

      <TextField
        label="NUEVA CONTRASEÑA"
        placeholder="Mínimo 8 caracteres"
        isPassword
        iconName="lock"
        value={password}
        onChangeText={onPasswordChange}
        error={errors.password}
      />

      <TextField
        label="CONFIRMAR CONTRASEÑA"
        placeholder="Repetí la contraseña"
        isPassword
        iconName="lock"
        value={confirmPassword}
        onChangeText={onConfirmPasswordChange}
        error={errors.confirmPassword}
      />

      {formError ? <TwoFactorErrorBanner message={formError} /> : null}

      {alreadySet ? (
        <Button
          title="Continuar al QR"
          onPress={onContinueAnyway}
          isLoading={isSubmitting}
        />
      ) : (
        <Button
          title="Guardar y continuar"
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
