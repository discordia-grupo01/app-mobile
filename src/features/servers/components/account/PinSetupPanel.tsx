import { Feather } from "@expo/vector-icons";
import {
  hasErrors,
  PIN_MAX_LENGTH,
  type PinSetupErrors,
  validatePinSetup,
} from "@discordia/client-shared";
import { useEffect, useState, type RefObject } from "react";
import { ScrollView, Text, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { TextField } from "../../../../components/ui/TextField";
import { useThemeColors } from "../../../../theme/theme-context";
import { configurePinService } from "../../../auth/service";

interface PinSetupPanelProps {
  onClose: () => void;
  scrollRef: RefObject<ScrollView | null>;
}

export function PinSetupPanel({ onClose, scrollRef }: PinSetupPanelProps) {
  const colors = useThemeColors();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [errors, setErrors] = useState<PinSetupErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Pasar del formulario a la confirmación achica mucho el contenido; sin
  // esto el ScrollView queda con el scroll viejo y se ve un salto/parpadeo.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [isDone, scrollRef]);

  async function handleSubmit() {
    const nextErrors = validatePinSetup({ pin, confirmPin });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setFormError(null);
    setIsSubmitting(true);
    const result = await configurePinService(pin);
    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    setIsDone(true);
  }

  if (isDone) {
    return (
      <View className="px-4.5 pt-6 items-center">
        <View className="w-14 h-14 rounded-2xl items-center justify-center bg-success/12 mb-4">
          <Feather name="check" size={26} color={colors.success} />
        </View>
        <Text className="text-[17px] font-bold text-content mb-1.5">
          PIN activado
        </Text>
        <Text className="text-[13px] text-content-muted text-center mb-5">
          Ya podés usarlo para entrar más rápido en este dispositivo.
        </Text>
        <Button title="Listo" onPress={onClose} />
      </View>
    );
  }

  return (
    <View className="px-4.5 pt-6">
      <Text className="text-[13px] leading-[18px] text-content-muted mb-4">
        Entrá más rápido en este dispositivo sin escribir tu email y contraseña
        cada vez. Elegí un PIN de 6 a 8 dígitos.
      </Text>

      <TextField
        label="ELEGÍ TU PIN"
        placeholder="••••••"
        keyboardType="number-pad"
        maxLength={PIN_MAX_LENGTH}
        isPassword
        iconName="lock"
        value={pin}
        onChangeText={(text) => setPin(text.replace(/\D/g, ""))}
        error={errors.pin}
      />

      <TextField
        label="CONFIRMÁ TU PIN"
        placeholder="••••••"
        keyboardType="number-pad"
        maxLength={PIN_MAX_LENGTH}
        isPassword
        iconName="lock"
        value={confirmPin}
        onChangeText={(text) => setConfirmPin(text.replace(/\D/g, ""))}
        error={errors.confirmPin}
      />

      {formError ? (
        <View
          className="mb-4 rounded-lg border border-danger/30 bg-danger/12 p-3"
          accessibilityRole="alert"
        >
          <Text className="text-center text-[13px] text-danger">
            {formError}
          </Text>
        </View>
      ) : null}

      <Button title="Activar" onPress={handleSubmit} isLoading={isSubmitting} />
    </View>
  );
}
