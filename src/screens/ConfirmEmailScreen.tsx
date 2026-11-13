import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { CHECK_SPAM_HINT } from "@discordia/client-shared";
import { Text, View } from "react-native";

import { AuthScreen } from "../components/auth/AuthScreen";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/auth-context";
import { confirmEmailService } from "../features/auth/service";
import { withAlpha } from "../lib/color";
import { useThemeColors } from "../theme/theme-context";

interface ConfirmEmailScreenProps {
  email?: string;
  token?: string;
  canResend: boolean;
  onBackToLogin: () => void;
}

export function ConfirmEmailScreen({
  email,
  token,
  canResend,
  onBackToLogin,
}: ConfirmEmailScreenProps) {
  const { requestEmailConfirmation } = useAuth();
  const colors = useThemeColors();
  const [isConfirming, setIsConfirming] = useState(Boolean(token));
  const [isResending, setIsResending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [expired, setExpired] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const confirmationToken = token;

    let active = true;
    async function confirm() {
      const result = await confirmEmailService(confirmationToken);
      if (!active) return;
      setIsConfirming(false);
      if (result.ok) {
        setConfirmed(true);
      } else {
        setExpired(true);
        setMessage(result.message);
      }
    }

    void confirm();
    return () => {
      active = false;
    };
  }, [token]);

  async function handleResend() {
    if (!email || !canResend) return;
    setMessage(null);
    setIsResending(true);
    const result = await requestEmailConfirmation(email);
    setIsResending(false);
    setMessage(
      result.ok
        ? "Te enviamos un nuevo correo de confirmación."
        : result.message,
    );
  }

  return (
    <AuthScreen>
      <View className="items-center">
        <View
          className="mb-5 size-16 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: withAlpha(
              confirmed
                ? colors.success
                : expired
                  ? colors.danger
                  : colors.accent,
              0.15,
            ),
          }}
        >
          {confirmed ? (
            <Feather name="check-circle" size={32} color={colors.success} />
          ) : expired ? (
            <Feather name="alert-triangle" size={32} color={colors.danger} />
          ) : (
            <Feather name="mail" size={32} color={colors.sky} />
          )}
        </View>

        <Text className="mb-2 text-center text-[24px] font-bold text-content">
          {confirmed
            ? "Correo confirmado"
            : expired
              ? "El enlace expiró"
              : "Revisa tu correo"}
        </Text>
        <View className="mb-8 w-full gap-2">
          <Text className="text-center text-[14px] leading-6 text-content-muted">
            {confirmed
              ? "Tu cuenta está lista. Ya puedes iniciar sesión en Discordia."
              : expired
                ? "Este enlace ya no es válido. Volvé a iniciar sesión para solicitar una nueva confirmación."
                : "Te enviamos un enlace para confirmar tu correo y activar tu cuenta."}
          </Text>

          {email ? (
            <Text className="text-center text-[14px] font-semibold text-content">
              {email}
            </Text>
          ) : null}
          {confirmed || expired ? null : (
            <Text className="text-center text-[12px] text-content-subtle">
              {CHECK_SPAM_HINT}
            </Text>
          )}
        </View>

        {isConfirming ? (
          <View className="flex-row items-center gap-2 py-3">
            <Feather name="refresh-cw" size={16} color={colors.textSubtle} />
            <Text className="text-[14px] text-content-muted">
              Confirmando tu correo...
            </Text>
          </View>
        ) : confirmed ? (
          <Button
            title="Ir a iniciar sesión"
            onPress={onBackToLogin}
            iconRight="arrow-right"
          />
        ) : canResend ? (
          <View className="w-full gap-3">
            <Button
              title="Reenviar confirmación"
              onPress={handleResend}
              isLoading={isResending}
              iconRight="arrow-right"
            />
            <Button
              title="Volver al inicio de sesión"
              onPress={onBackToLogin}
              variant="secondary"
            />
          </View>
        ) : (
          <Button
            title="Volver al inicio de sesión"
            onPress={onBackToLogin}
            iconRight="arrow-right"
          />
        )}

        {message ? (
          <Text className="mt-4 text-center text-[13px] text-content-muted">
            {message}
          </Text>
        ) : null}
      </View>
    </AuthScreen>
  );
}
