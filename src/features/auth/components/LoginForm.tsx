import {
  EMAIL_NOT_VERIFIED,
  GOOGLE_CONNECT_FAILED,
  hasErrors,
  type LoginErrors,
  TWO_FACTOR_RECOVERY_CODE_USED,
  twoFactorRecoveryCodesRemaining,
  validateLogin,
} from "@discordia/client-shared";

import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "../auth-context";
import { extractGoogleIdToken, useGoogleAuthRequest } from "../google-auth";

import { GoogleIcon } from "../../../components/icons/GoogleIcon";
import { Button } from "../../../components/ui/Button";
import { TextField } from "../../../components/ui/TextField";
import { TwoFactorLoginStep } from "./TwoFactorLoginStep";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  onEmailNotVerified: (email: string) => void;
  onTwoFactorChallengeChange?: (active: boolean) => void;
  justRegistered?: boolean;
}

export function LoginForm({
  onSwitchToRegister,
  onForgotPassword,
  onEmailNotVerified,
  onTwoFactorChallengeChange,
  justRegistered = false,
}: LoginFormProps) {
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [challengeExpiresIn, setChallengeExpiresIn] = useState(0);

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
          return;
        }

        if (result.twoFactorRequired) {
          setChallengeExpiresIn(result.expiresIn);
          setChallengeToken(result.challengeToken);
          onTwoFactorChallengeChange?.(true);
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

    const nextErrors = validateLogin({ email, password });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setIsSubmitting(true);
    const result = await login({ email: email.trim(), password });
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.message === EMAIL_NOT_VERIFIED) {
        onEmailNotVerified(email.trim());
        return;
      }
      setFormError(result.message);
      return;
    }

    if (result.twoFactorRequired) {
      setPassword("");
      setChallengeExpiresIn(result.expiresIn);
      setChallengeToken(result.challengeToken);
      onTwoFactorChallengeChange?.(true);
    }
    // Sin segundo factor no hay nada mas que hacer: `login` ya guardo la
    // sesion y el arbol de la app reacciona a `isAuthenticated`.
  }

  function handleChallengeLost(message: string) {
    setChallengeToken(null);
    setPassword("");
    setFormError(message);
    onTwoFactorChallengeChange?.(false);
  }

  function handleBack() {
    setChallengeToken(null);
    setPassword("");
    onTwoFactorChallengeChange?.(false);
  }

  function handleRecoveryCodeUsed(remaining: number) {
    Alert.alert(
      "Usaste un código de recuperación",
      `${TWO_FACTOR_RECOVERY_CODE_USED} ${twoFactorRecoveryCodesRemaining(remaining)}`,
    );
  }

  if (challengeToken) {
    return (
      <TwoFactorLoginStep
        challengeToken={challengeToken}
        expiresIn={challengeExpiresIn}
        onBack={handleBack}
        onChallengeLost={handleChallengeLost}
        onRecoveryCodeUsed={handleRecoveryCodeUsed}
      />
    );
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
        onPress={handleGooglePress}
        disabled={!googleRequest}
        isLoading={isGoogleSubmitting}
        iconLeft={<GoogleIcon size={18} />}
        className="mb-6"
      />

      {/* Footer link */}
      <View className="flex-row items-center justify-center">
        <Text className="text-[13px] text-content-subtle">
          ¿No tienes cuenta?{" "}
        </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onSwitchToRegister}>
          <Text className="text-[13px] font-bold text-sky">
            Regístrate gratis
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
