import { ACCOUNT_PASSWORD_COPY } from "@discordia/client-shared";

import { Text, View } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { FormErrorBanner } from "../../../../../components/ui/FormErrorBanner";
import { TextField } from "../../../../../components/ui/TextField";
import { useChangePasswordForm } from "../../../../auth/useChangePasswordForm";

interface ChangePasswordStepProps {
  onChanged: () => void;
  onPasswordNotSet: () => void;
}

export function ChangePasswordStep({
  onChanged,
  onPasswordNotSet,
}: ChangePasswordStepProps) {
  const form = useChangePasswordForm({ onChanged, onPasswordNotSet });

  return (
    <View className="px-4.5 pt-6">
      <Text className="mb-5 text-[14px] leading-5 text-content-muted">
        {ACCOUNT_PASSWORD_COPY.changeFormDescription}
      </Text>

      <TextField
        requiredMark
        label={ACCOUNT_PASSWORD_COPY.currentPasswordLabel}
        isPassword
        iconName="lock"
        value={form.currentPassword}
        onChangeText={form.setCurrentPassword}
        error={form.errors.currentPassword}
      />

      <TextField
        requiredMark
        label={ACCOUNT_PASSWORD_COPY.newPasswordLabel}
        placeholder="Mínimo 8 caracteres"
        isPassword
        iconName="lock"
        value={form.newPassword}
        onChangeText={form.setNewPassword}
        error={form.errors.newPassword}
      />

      <TextField
        requiredMark
        label={ACCOUNT_PASSWORD_COPY.confirmPasswordLabel}
        placeholder="Repetí la contraseña"
        isPassword
        iconName="lock"
        value={form.confirmPassword}
        onChangeText={form.setConfirmPassword}
        error={form.errors.confirmPassword}
      />

      {form.formError ? <FormErrorBanner message={form.formError} /> : null}

      <Button
        title={ACCOUNT_PASSWORD_COPY.submit}
        onPress={() => void form.submit()}
        isLoading={form.isSubmitting}
      />
    </View>
  );
}
