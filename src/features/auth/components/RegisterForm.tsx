import {
  hasErrors,
  type RegisterErrors,
  validateRegister,
} from "@discordia/client-shared";

import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "../auth-context";
import { colors } from "../../../theme/colors";

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
    <View style={styles.formContainer}>
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
        <View style={styles.errorBanner} accessibilityRole="alert">
          <Text style={styles.errorBannerText}>{formError}</Text>
        </View>
      ) : null}

      {/* Submit Button */}
      <Button
        title="Crear Cuenta"
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
        <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onSwitchToLogin}>
          <Text style={styles.loginLink}>Inicia sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Terms / privacy — sin pantallas propias todavia, texto informativo */}
      <Text style={styles.termsText}>
        Al registrarte aceptas nuestros Términos de Servicio y Política de
        Privacidad.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
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
  submitButton: {
    marginTop: 6,
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
  loginLink: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  termsText: {
    color: colors.textSubtle,
    fontSize: 11,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 16,
  },
});
