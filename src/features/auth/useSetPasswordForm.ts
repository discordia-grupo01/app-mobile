import {
  hasErrors,
  type SetPasswordErrors,
  validateSetPassword,
} from "@discordia/client-shared";

import { useState } from "react";

import { useAuth } from "./auth-context";
import { setPasswordService } from "./service";

export function useSetPasswordForm(onPasswordReady: () => void) {
  const { user, updateUser } = useAuth();
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPasswordValue] = useState("");
  const [errors, setErrors] = useState<SetPasswordErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [alreadySet, setAlreadySet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function markPasswordSet() {
    if (user && !user.has_password) {
      updateUser({ ...user, has_password: true });
    }
  }

  async function submit() {
    const nextErrors = validateSetPassword({ password, confirmPassword });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setFormError(null);
    setIsSubmitting(true);
    const result = await setPasswordService(password);
    setIsSubmitting(false);

    if (!result.ok) {
      // Carrera entre dispositivos: la cuenta ya consiguió una contraseña
      // mientras se completaba este paso. No bloquea: se puede seguir.
      if (result.alreadySet) {
        setAlreadySet(true);
        markPasswordSet();
      }
      setFormError(result.message);
      return;
    }

    markPasswordSet();
    onPasswordReady();
  }

  function reset() {
    setPasswordValue("");
    setConfirmPasswordValue("");
    setErrors({});
    setFormError(null);
    setAlreadySet(false);
  }

  return {
    password,
    confirmPassword,
    errors,
    formError,
    alreadySet,
    isSubmitting,
    setPassword: setPasswordValue,
    setConfirmPassword: setConfirmPasswordValue,
    submit,
    reset,
  };
}
