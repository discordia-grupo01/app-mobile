import type { TwoFactorPasswordErrors } from "@discordia/client-shared";

import { Text } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { TextField } from "../../../../../components/ui/TextField";
import { FormErrorBanner } from "../../../../../components/ui/FormErrorBanner";

interface TwoFactorPasswordStepProps {
  description: string;
  confirmLabel: string;
  danger?: boolean;
  password: string;
  passwordErrors: TwoFactorPasswordErrors;
  formError: string | null;
  isSubmitting: boolean;
  onPasswordChange: (password: string) => void;
  onConfirm: () => void;
}

export function TwoFactorPasswordStep({
  description,
  confirmLabel,
  danger,
  password,
  passwordErrors,
  formError,
  isSubmitting,
  onPasswordChange,
  onConfirm,
}: TwoFactorPasswordStepProps) {
  return (
    <>
      <Text className="mb-5 text-[14px] leading-5 text-content-muted">
        {description}
      </Text>

      <TextField
        requiredMark
        label="Contraseña"
        placeholder="••••••••"
        isPassword
        iconName="lock"
        value={password}
        onChangeText={onPasswordChange}
        error={passwordErrors.password}
      />

      {formError ? <FormErrorBanner message={formError} /> : null}

      <Button
        title={confirmLabel}
        variant={danger ? "danger" : "primary"}
        onPress={onConfirm}
        isLoading={isSubmitting}
      />
    </>
  );
}
