import {
  GOOGLE_CONNECT_FAILED,
  hasErrors,
  type RegisterErrors,
  validateRegister,
} from "@discordia/client-shared";

import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "../auth-context";
import { extractGoogleIdToken, useGoogleAuthRequest } from "../google-auth";

import { GoogleIcon } from "../../../components/icons/GoogleIcon";
import { Button } from "../../../components/ui/Button";
import { TextField } from "../../../components/ui/TextField";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onRegistered: (email: string) => void;
}

export function RegisterForm({
  onSwitchToLogin,
  onRegistered,
}: RegisterFormProps) {
  const { register, loginWithGoogle } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const [googleRequest, , promptGoogleAsync] = useGoogleAuthRequest();

  // Se resuelve el resultado de Google directamente en el event handler
  // (en vez de observarlo con un useEffect sobre `response`): evita
  // "cascading renders" de setState dentro de un efecto y ademas asegura
  // que el resultado se procese una sola vez por cada tap del boton.
  async function handleGooglePress() {
    setFormError(null);
    setIsGoogleSubmitting(true);

    try {
      const response = await promptGoogleAsync();

      if (response.type === "success") {
        const idToken = extractGoogleIdToken(response);
        if (!idToken) {
          setFormError(GOOGLE_CONNECT_FAILED);
          return;
        }

        const result = await loginWithGoogle(idToken);
        if (!result.ok) {
          setFormError(result.message);
        }
        return;
      }

      if (response.type === "error") {
        setFormError(GOOGLE_CONNECT_FAILED);
      }
      // "cancel" / "dismiss" / "locked": el usuario cerro el flujo de
      // Google sin completar el login, no es un error a mostrar.
    } catch {
      setFormError(GOOGLE_CONNECT_FAILED);
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

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

    onRegistered(email.trim());
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
        onPress={handleGooglePress}
        disabled={!googleRequest}
        isLoading={isGoogleSubmitting}
        iconLeft={<GoogleIcon size={18} />}
        className="mb-6"
      />

      {/* Footer link */}
      <View className="flex-row items-center justify-center">
        <Text className="text-[13px] text-content-subtle">
          ¿Ya tienes cuenta?{" "}
        </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onSwitchToLogin}>
          <Text className="text-[13px] font-bold text-sky">
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
