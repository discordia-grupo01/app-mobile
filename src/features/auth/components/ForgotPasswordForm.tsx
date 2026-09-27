import {
  type ForgotPasswordErrors,
  hasErrors,
  validateForgotPassword,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { forgotPasswordService } from "../service";
import { useThemeColors } from "../../../theme/theme-context";

import { Button } from "../../../components/ui/Button";
import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { TextField } from "../../../components/ui/TextField";
import { withAlpha } from "../../../lib/color";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const colors = useThemeColors();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<ForgotPasswordErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    setFormError(null);

    const nextErrors = validateForgotPassword({ email });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setIsSubmitting(true);
    const result = await forgotPasswordService(email);
    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <View className="w-full items-center">
        <View
          className="mb-5 h-16 w-16 items-center justify-center rounded-[20px]"
          style={{ backgroundColor: withAlpha(colors.success, 0.15) }}
        >
          <Feather name="check-circle" size={32} color={colors.success} />
        </View>

        <Text className="mb-2.5 text-center text-[24px] font-bold text-content">
          Revisa tu correo
        </Text>
        <Text className="mb-2 text-center text-[14px] leading-5 text-content-muted">
          Si <Text className="font-bold text-content">{email.trim()}</Text> está
          registrado en Discordia, recibirás un enlace para restablecer tu
          contraseña en los próximos minutos.
        </Text>
        <Text className="mb-8 text-center text-[12px] text-content-subtle">
          Recordá revisar tu carpeta de spam por si acaso.
        </Text>

        <TouchableOpacity activeOpacity={0.7} onPress={onBack}>
          <Text className="text-[13px] text-content-subtle">
            Volver al inicio de sesión
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="w-full">
      <TouchableOpacity
        className="mb-6 flex-row items-center"
        activeOpacity={0.7}
        onPress={onBack}
      >
        <Feather name="arrow-left" size={14} color={colors.textSubtle} />
        <Text className="ml-1.5 text-[13px] text-content-subtle">
          Volver al inicio de sesión
        </Text>
      </TouchableOpacity>

      <Text className="mb-1.5 text-[24px] font-bold text-content">
        Recuperar contraseña
      </Text>
      <Text className="mb-[26px] text-[14px] leading-5 text-content-muted">
        Ingresa tu correo y te enviaremos un enlace para restablecer tu
        contraseña.
      </Text>

      <TextField
        label="CORREO ELECTRÓNICO"
        placeholder="tu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        iconName="mail"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />

      <FormErrorBanner message={formError} />

      <Button
        title="Enviar enlace"
        onPress={handleSubmit}
        isLoading={isSubmitting}
        iconRight="arrow-right"
      />
    </View>
  );
}
