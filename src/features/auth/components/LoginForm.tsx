import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "../auth-context";
import type { LoginErrors } from "../types";
import { hasErrors, validateLogin } from "../validation";
import { colors } from "../../../theme/colors";

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
    <View style={styles.formContainer}>
      {justRegistered ? (
        <View style={styles.successBanner}>
          <Text style={styles.successBannerText}>
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
      <View style={styles.forgotPasswordContainer}>
        <TouchableOpacity activeOpacity={0.7} onPress={onForgotPassword}>
          <Text style={styles.forgotPasswordText}>
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>
      </View>

      {formError ? (
        <View style={styles.errorBanner} accessibilityRole="alert">
          <Text style={styles.errorBannerText}>{formError}</Text>
        </View>
      ) : null}

      {/* Submit Button */}
      <Button
        title="Iniciar Sesión"
        onPress={handleSubmit}
        isLoading={isSubmitting}
        iconRight="arrow-right"
        style={styles.submitButton}
      />

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>o continúa con</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Google Button */}
      <Button
        title="Continuar con Google"
        variant="secondary"
        disabled
        iconLeft={<GoogleIcon size={18} />}
        style={styles.googleButton}
      />

      {/* Footer link */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>¿No tienes cuenta? </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onSwitchToRegister}>
          <Text style={styles.registerLink}>Regístrate gratis</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: -6,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: colors.info,
    fontSize: 12,
    fontWeight: "500",
  },
  errorBanner: {
    backgroundColor: "rgba(224, 82, 82, 0.12)",
    borderColor: "rgba(224, 82, 82, 0.3)",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
  },
  errorBannerText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: "center",
  },
  successBanner: {
    backgroundColor: "rgba(56, 161, 105, 0.12)",
    borderColor: "rgba(56, 161, 105, 0.3)",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
  },
  successBannerText: {
    color: colors.success,
    fontSize: 13,
    textAlign: "center",
  },
  submitButton: {
    marginBottom: 24,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: "500",
    marginHorizontal: 12,
  },
  googleButton: {
    marginBottom: 24,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: colors.textSubtle,
    fontSize: 13,
  },
  registerLink: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
});
