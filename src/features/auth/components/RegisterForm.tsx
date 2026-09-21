import {
  hasErrors,
  type RegisterErrors,
  validateRegister,
} from "@discordia/client-shared";

import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "../auth-context";

import { GoogleIcon } from "../../../components/icons/GoogleIcon";
import { Button } from "../../../components/ui/Button";
import { TextField } from "../../../components/ui/TextField";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onRegistered: () => void;
}

export function RegisterForm({
  onSwitchToLogin,
  onRegistered,
}: RegisterFormProps) {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setFormError(null);

    const nextErrors = validateRegister({ name, email, password });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setIsSubmitting(true);
    const result = await register({
      name: name.trim(),
      email: email.trim(),
      password,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    onRegistered();
  }

  return (
    <View className="w-full">
      <TextField
        label="NOMBRE DE USUARIO"
        placeholder="tucoolusername"
        autoCapitalize="none"
        autoComplete="username"
        iconName="at-sign"
        value={name}
        onChangeText={setName}
        error={errors.name}
      />

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
        title="Crear Cuenta"
        onPress={handleSubmit}
        isLoading={isSubmitting}
        iconRight="arrow-right"
        className="mb-6 mt-1.5"
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
          ¿Ya tienes cuenta?{" "}
        </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onSwitchToLogin}>
          <Text className="text-[13px] font-bold text-content-muted">
            Inicia sesión
          </Text>
        </TouchableOpacity>
      </View>

      {/* Terms / privacy — sin pantallas propias todavia, texto informativo */}
      <Text className="mt-4 text-center text-[11px] leading-4 text-content-subtle">
        Al registrarte aceptas nuestros Términos de Servicio y Política de
        Privacidad.
      </Text>
    </View>
  );
}
