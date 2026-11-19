import {
  type ChangePasswordErrors,
  hasErrors,
  validateChangePassword,
} from "@discordia/client-shared";

import { useState } from "react";

import { changePasswordService } from "./service";

interface ChangePasswordHandlers {
  onChanged: () => void;
  onPasswordNotSet: () => void;
}

export function useChangePasswordForm({
  onChanged,
  onPasswordNotSet,
}: ChangePasswordHandlers) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ChangePasswordErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    const values = { currentPassword, newPassword, confirmPassword };
    const nextErrors = validateChangePassword(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setFormError(null);
    setIsSubmitting(true);
    const result = await changePasswordService(values);
    setIsSubmitting(false);

    if (result.ok) {
      onChanged();
      return;
    }
    if (result.passwordNotSet) {
      onPasswordNotSet();
      return;
    }
    setFormError(result.message);
  }

  function withClearedError(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setFormError(null);
    };
  }

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    errors,
    formError,
    isSubmitting,
    setCurrentPassword: withClearedError(setCurrentPassword),
    setNewPassword: withClearedError(setNewPassword),
    setConfirmPassword: withClearedError(setConfirmPassword),
    submit,
  };
}
