import { ACCOUNT_PASSWORD_COPY } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { FormErrorBanner } from "../../../../../components/ui/FormErrorBanner";
import { TextField } from "../../../../../components/ui/TextField";
import { withAlpha } from "../../../../../lib/color";
import { useThemeColors } from "../../../../../theme/theme-context";
import { useChangePasswordForm } from "../../../../auth/useChangePasswordForm";

interface ChangePasswordStepProps {
  onCancel: () => void;
  onChanged: () => void;
  onPasswordNotSet: () => void;
}

export function ChangePasswordStep({
  onCancel,
  onChanged,
  onPasswordNotSet,
}: ChangePasswordStepProps) {
  const colors = useThemeColors();
  const form = useChangePasswordForm({ onChanged, onPasswordNotSet });

  return (
    <View className="px-4.5 pt-6">
      <View className="mb-4 items-center">
        <View
          className="mb-4 h-14 w-14 items-center justify-center rounded-2xl border"
          style={{
            borderColor: withAlpha(colors.info, 0.35),
            backgroundColor: withAlpha(colors.info, 0.15),
          }}
        >
          <Feather name="key" size={26} color={colors.info} />
        </View>
        <Text className="text-center text-[17px] font-bold text-content">
          {ACCOUNT_PASSWORD_COPY.changeFormTitle}
        </Text>
        <Text className="mt-2 text-center text-[13px] leading-[18px] text-content-muted">
          {ACCOUNT_PASSWORD_COPY.changeFormDescription}
        </Text>
      </View>

      <TextField
        label={ACCOUNT_PASSWORD_COPY.currentPasswordLabel.toUpperCase()}
        isPassword
        iconName="lock"
        value={form.currentPassword}
        onChangeText={form.setCurrentPassword}
        error={form.errors.currentPassword}
      />

      <TextField
        label={ACCOUNT_PASSWORD_COPY.newPasswordLabel.toUpperCase()}
        placeholder="Mínimo 8 caracteres"
        isPassword
        iconName="lock"
        value={form.newPassword}
        onChangeText={form.setNewPassword}
        error={form.errors.newPassword}
      />

      <TextField
        label={ACCOUNT_PASSWORD_COPY.confirmPasswordLabel.toUpperCase()}
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

      <TouchableOpacity
        activeOpacity={0.75}
        className="mt-2.5 items-center py-3"
        onPress={onCancel}
      >
        <Text className="text-[13px] font-bold text-content-muted">
          {ACCOUNT_PASSWORD_COPY.cancel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
