import { ACCOUNT_PASSWORD_COPY } from "@discordia/client-shared";

import { View } from "react-native";

import { useSetPasswordForm } from "../../../../auth/useSetPasswordForm";
import {
  type SetPasswordStepCopy,
  TwoFactorSetPasswordStep,
} from "../two-factor/TwoFactorSetPasswordStep";

export const SET_PASSWORD_COPY: SetPasswordStepCopy = {
  title: ACCOUNT_PASSWORD_COPY.setFormTitle,
  description: ACCOUNT_PASSWORD_COPY.setFormDescription,
  submitLabel: ACCOUNT_PASSWORD_COPY.submit,
  continueLabel: "Continuar",
};

interface SetPasswordStepProps {
  onPasswordReady: () => void;
}

export function SetPasswordStep({ onPasswordReady }: SetPasswordStepProps) {
  const form = useSetPasswordForm(onPasswordReady);

  return (
    <View className="px-4.5 pt-6">
      <TwoFactorSetPasswordStep
        copy={SET_PASSWORD_COPY}
        password={form.password}
        confirmPassword={form.confirmPassword}
        errors={form.errors}
        formError={form.formError}
        alreadySet={form.alreadySet}
        isSubmitting={form.isSubmitting}
        onPasswordChange={form.setPassword}
        onConfirmPasswordChange={form.setConfirmPassword}
        onSubmit={() => void form.submit()}
        onContinueAnyway={onPasswordReady}
      />
    </View>
  );
}
