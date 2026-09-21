import {
  hasErrors,
  type LoginErrors,
  validateLogin,
} from "@discordia/client-shared";

import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "../auth-context";

import { GoogleIcon } from "../../../components/icons/GoogleIcon";
import { Button } from "../../../components/ui/Button";
import { TextField } from "../../../components/ui/TextField";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  justRegistered?: boolean;
}

export function LoginForm({
  onSwitchToRegister,
  onForgotPassword,
  justRegistered = false,
}: LoginFormProps) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setFormError(null);

    const nextErrors = validateLogin({ email, password });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setIsSubmitting(true);
    const result = await login({ email: email.trim(), password });
    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(result.message);
    }
  }

  return (
    <View className="w-full">
      {justRegistered ? (
        <View className="mb-[18px] rounded-lg border border-success/30 bg-success/12 p-3">
          <Text className="text-center text-[13px] text-success">
            ¡Cuenta creada con éxito! Ingresa tus datos para continuar.
          </Text>
        </View>
      ) : null}

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

      <TextField
        label="CONTRASEÑA"
        placeholder="••••••••"
        isPassword
        iconName="lock"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />

      {/* Forgot Password link */}
      <View className="-mt-1.5 mb-5 items-end">
        <TouchableOpacity activeOpacity={0.7} onPress={onForgotPassword}>
          <Text className="text-[12px] font-medium text-info">
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>
      </View>

      {formError ? (
        <View
          className="mb-[18px] rounded-lg border border-danger/30 bg-danger/12 p-3"
          accessibilityRole="alert"
        >
          <Text className="text-center text-[13px] text-danger">
            {formError}
          </Text>
        </View>
      ) : null}

      {/* Submit Button */}
      <Button
        title="Iniciar Sesión"
        onPress={handleSubmit}
        isLoading={isSubmitting}
        iconRight="arrow-right"
        className="mb-6"
      />

      {/* Divider */}
      <View className="mb-5 flex-row items-center">
        <View className="h-px flex-1 bg-line" />
        <Text className="mx-3 text-[12px] font-medium text-content-subtle">
          o continúa con
        </Text>
        <View className="h-px flex-1 bg-line" />
      </View>

      {/* Google Button */}
      <Button
        title="Continuar con Google"
        variant="secondary"
        disabled
        iconLeft={<GoogleIcon size={18} />}
        className="mb-6"
      />

      {/* Footer link */}
      <View className="flex-row items-center justify-center">
        <Text className="text-[13px] text-content-subtle">
          ¿No tienes cuenta?{" "}
        </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onSwitchToRegister}>
          <Text className="text-[13px] font-bold text-content-muted">
            Regístrate gratis
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
