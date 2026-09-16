import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { forgotPasswordService } from "../service";
import type { ForgotPasswordErrors } from "../types";
import { hasErrors, validateForgotPassword } from "../validation";
import { colors } from "../../../theme/colors";

import { Button } from "../../../components/ui/Button";
import { TextField } from "../../../components/ui/TextField";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
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
      <View style={styles.sentContainer}>
        <View style={styles.sentIconWrapper}>
          <Feather name="check-circle" size={32} color={colors.success} />
        </View>

        <Text style={styles.sentTitle}>Revisa tu correo</Text>
        <Text style={styles.sentText}>
          Si <Text style={styles.sentEmail}>{email.trim()}</Text> está
          registrado en Discordia, recibirás un enlace para restablecer tu
          contraseña en los próximos minutos.
        </Text>
        <Text style={styles.sentHint}>
          Recordá revisar tu carpeta de spam por si acaso.
        </Text>

        <TouchableOpacity activeOpacity={0.7} onPress={onBack}>
          <Text style={styles.backLink}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.formContainer}>
      <TouchableOpacity
        style={styles.backRow}
        activeOpacity={0.7}
        onPress={onBack}
      >
        <Feather name="arrow-left" size={14} color={colors.textSubtle} />
        <Text style={styles.backText}>Volver al inicio de sesión</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Recuperar contraseña</Text>
      <Text style={styles.subtitle}>
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

      {formError ? (
        <View style={styles.errorBanner} accessibilityRole="alert">
          <Text style={styles.errorBannerText}>{formError}</Text>
        </View>
      ) : null}

      <Button
        title="Enviar enlace"
        onPress={handleSubmit}
        isLoading={isSubmitting}
        iconRight="arrow-right"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backText: {
    color: colors.textSubtle,
    fontSize: 13,
    marginLeft: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 26,
    lineHeight: 20,
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
  sentContainer: {
    width: "100%",
    alignItems: "center",
  },
  sentIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(56, 161, 105, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  sentTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 10,
    textAlign: "center",
  },
  sentText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  sentEmail: {
    color: colors.text,
    fontWeight: "700",
  },
  sentHint: {
    fontSize: 12,
    color: colors.textSubtle,
    textAlign: "center",
    marginBottom: 32,
  },
  backLink: {
    color: colors.textSubtle,
    fontSize: 13,
  },
});
