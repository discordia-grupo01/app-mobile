import type { TwoFactorPasswordErrors } from "@discordia/client-shared";

import { Text, TouchableOpacity } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { TextField } from "../../../../../components/ui/TextField";
import { TwoFactorErrorBanner } from "./TwoFactorErrorBanner";

interface TwoFactorPasswordStepProps {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  password: string;
  passwordErrors: TwoFactorPasswordErrors;
  formError: string | null;
  isSubmitting: boolean;
  onPasswordChange: (password: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function TwoFactorPasswordStep({
  title,
  description,
  confirmLabel,
  danger,
  password,
  passwordErrors,
  formError,
  isSubmitting,
  onPasswordChange,
  onConfirm,
  onCancel,
}: TwoFactorPasswordStepProps) {
  return (
    <>
      <Text
        className={
          danger
            ? "mb-1.5 text-[17px] font-bold text-danger"
            : "mb-1.5 text-[17px] font-bold text-content"
        }
      >
        {title}
      </Text>
      <Text className="mb-4 text-[13px] leading-[18px] text-content-muted">
        {description}
      </Text>

      <TextField
        label="CONTRASEÑA"
        placeholder="••••••••"
        isPassword
        iconName="lock"
        value={password}
        onChangeText={onPasswordChange}
        error={passwordErrors.password}
      />

      {formError ? <TwoFactorErrorBanner message={formError} /> : null}

      <Button
        title={confirmLabel}
        variant={danger ? "danger" : "primary"}
        onPress={onConfirm}
        isLoading={isSubmitting}
      />

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
