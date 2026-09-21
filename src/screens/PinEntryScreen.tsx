import {
  PIN_MAX_LENGTH,
  PIN_MIN_LENGTH,
  type User,
} from "@discordia/client-shared";
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
import { getStoredUser } from "../lib/storage";

interface PinEntryScreenProps {
  /** Salta el ingreso con PIN por esta sesion (no desactiva el PIN del
   * dispositivo) y vuelve al login normal con email y contraseña. */
  onUseAnotherAccount: () => void;
}

/**
 * Pantalla de ingreso rapido con PIN (historia "Registro con PIN", CA2):
 * reemplaza a AuthTabs/LoginScreen cuando este dispositivo ya activo un PIN
 * antes (ver App.tsx). No pide email, solo el PIN de 6 a 8 digitos.
 */
export function PinEntryScreen({ onUseAnotherAccount }: PinEntryScreenProps) {
  const { loginWithPin } = useAuth();

  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    getStoredUser<User>()
      .then((user) => setUserName(user?.name ?? null))
      .catch(() => {});
  }, []);

  async function handleSubmit(candidatePin: string) {
    if (candidatePin.length < PIN_MIN_LENGTH || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);
    const result = await loginWithPin(candidatePin);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      setPin("");
    }
    // En exito no hace falta nada aca: AuthProvider actualiza
    // isAuthenticated y App.tsx cambia a HomeScreen solo.
  }

  function handleChangePin(text: string) {
    const digits = text.replace(/\D/g, "").slice(0, PIN_MAX_LENGTH);
    setPin(digits);
    if (error) setError(null);

    // Autosubmit al llegar al largo maximo (8). Con largos intermedios
    // (6-7) el usuario confirma con el boton "Ingresar", porque un PIN
    // valido de 6 digitos es indistinguible de alguien que todavia esta
    // tipeando uno de 7 u 8.
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
          />

          {error ? (
            <View
              className="mb-[18px] rounded-lg border border-danger/30 bg-danger/12 p-3"
              accessibilityRole="alert"
            >
              <Text className="text-center text-[13px] text-danger">
                {error}
              </Text>
            </View>
          ) : null}

          <Button
            title="Ingresar"
            onPress={() => handleSubmit(pin)}
            isLoading={isSubmitting}
            disabled={pin.length < PIN_MIN_LENGTH}
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
