import {
  EMAIL_NOT_VERIFIED,
  formatPinLockRemaining,
  hasErrors,
  PIN_LOCKED,
  PIN_MAX_LENGTH,
  type PinLoginErrors,
  type User,
  validatePinLogin,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/TextField";
import { useAuth } from "../features/auth/auth-context";
import { useThemeColors } from "../theme/theme-context";
import { getStoredUser } from "../lib/storage";

interface PinEntryScreenProps {
  onUseAnotherAccount: () => void;
  onEmailNotVerified: (email: string) => void;
}

export function PinEntryScreen({
  onUseAnotherAccount,
  onEmailNotVerified,
}: PinEntryScreenProps) {
  const { loginWithPin } = useAuth();
  const colors = useThemeColors();

  const [pin, setPin] = useState("");
  const [errors, setErrors] = useState<PinLoginErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [isLocked, setIsLocked] = useState(false);
  const [lockSecondsLeft, setLockSecondsLeft] = useState(0);

  useEffect(() => {
    getStoredUser<User>()
      .then((user) => {
        setUserName(user?.name ?? null);
        setUserEmail(user?.email ?? null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLocked) return;

    const id = setInterval(() => {
      setLockSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isLocked]);

  async function handleSubmit(candidatePin: string) {
    if (isSubmitting || isLocked) return;

    const nextErrors = validatePinLogin({ pin: candidatePin });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setFormError(null);
    setIsSubmitting(true);
    const result = await loginWithPin(candidatePin);
    setIsSubmitting(false);

    if (!result.ok) {
      setPin("");

      if ("locked" in result && result.locked) {
        setIsLocked(true);
        setLockSecondsLeft(result.retryAfterSeconds);
        return;
      }

      if (result.message === EMAIL_NOT_VERIFIED && userEmail) {
        onEmailNotVerified(userEmail);
        return;
      }

      setFormError("El PIN no es correcto. Probá de nuevo.");
    }
  }

  function handleChangePin(text: string) {
    const digits = text.replace(/\D/g, "").slice(0, PIN_MAX_LENGTH);
    setPin(digits);
    if (errors.pin) setErrors({});
    if (formError) setFormError(null);

    if (digits.length === PIN_MAX_LENGTH) {
      handleSubmit(digits);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface-servers"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerClassName="grow items-center justify-center p-5"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[420px] px-7">
          <View className="mb-5 items-center">
            <Image
              source={require("../../assets/logo-light.png")}
              className="h-[52px] w-[200px]"
              resizeMode="contain"
            />
          </View>

          {isLocked ? (
            <>
              <View className="mb-4 items-center">
                <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-danger/12">
                  <Feather name="lock" size={26} color={colors.danger} />
                </View>
                <Text className="mb-1.5 text-center text-[19px] font-bold text-content">
                  PIN bloqueado temporalmente
                </Text>
                <Text className="mb-4 text-center text-[14px] leading-5 text-content-muted">
                  {PIN_LOCKED}
                </Text>
                <Text className="mb-2 text-[28px] font-bold text-content">
                  {formatPinLockRemaining(lockSecondsLeft)}
                </Text>
              </View>

              <Button
                title="Iniciar sesión con email y contraseña"
                onPress={onUseAnotherAccount}
                iconRight="arrow-right"
              />
            </>
          ) : (
            <>
              <Text className="mb-1.5 text-[24px] font-bold text-content">
                {userName ? `Hola de nuevo, ${userName}` : "Hola de nuevo"}
              </Text>
              <Text className="mb-[26px] text-[14px] text-content-muted">
                Ingresá tu PIN de acceso rápido para este dispositivo.
              </Text>

              <TextField
                label="TU PIN"
                placeholder="••••••"
                keyboardType="number-pad"
                maxLength={PIN_MAX_LENGTH}
                isPassword
                iconName="lock"
                autoFocus
                value={pin}
                onChangeText={handleChangePin}
                error={errors.pin}
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

              <Button
                title="Ingresar"
                onPress={() => handleSubmit(pin)}
                isLoading={isSubmitting}
                iconRight="arrow-right"
              />

              <TouchableOpacity
                activeOpacity={0.75}
                className="mt-4 items-center py-3"
                onPress={onUseAnotherAccount}
              >
                <Text className="text-[13px] font-bold text-content-muted">
                  ¿No sos vos? Iniciar sesión con otra cuenta
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
