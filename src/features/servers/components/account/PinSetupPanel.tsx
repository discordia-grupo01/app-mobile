import { Feather } from "@expo/vector-icons";
import {
  hasErrors,
  PIN_MAX_LENGTH,
  type PinSetupErrors,
  validatePinSetup,
} from "@discordia/client-shared";
import { useEffect, useState, type RefObject, type ComponentRef } from "react";
import { ScrollView, Text, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { FormErrorBanner } from "../../../../components/ui/FormErrorBanner";
import { TextField } from "../../../../components/ui/TextField";
import { setPinOwner } from "../../../../lib/storage";
import { useThemeColors } from "../../../../theme/theme-context";
import { useAuth } from "../../../auth/auth-context";
import { configurePinService } from "../../../auth/service";

interface PinSetupPanelProps {
  isPinEnabled: boolean;
  onClose: () => void;
  scrollRef: RefObject<ComponentRef<typeof ScrollView> | null>;
}

export function PinSetupPanel({
  isPinEnabled,
  onClose,
  scrollRef,
}: PinSetupPanelProps) {
  const colors = useThemeColors();
  const { setPinEnabled, user } = useAuth();
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

    await setPinEnabled(true);
    await setPinOwner({ name: user?.name ?? null, email: user?.email ?? null });
    setIsDone(true);
  }

  if (isDone) {
    return (
      <View className="px-4.5 pt-6">
        <View className="mb-5 flex-row items-start gap-3 rounded-2xl border border-line bg-surface-raised p-4">
          <Feather name="check-circle" size={18} color={colors.success} />
          <View className="flex-1">
            <Text className="text-[14px] font-bold text-content">
              {isPinEnabled ? "PIN actualizado" : "PIN activado"}
            </Text>
            <Text className="mt-1 text-[13px] leading-[18px] text-content-muted">
              {isPinEnabled
                ? "Tu PIN de acceso rápido en este dispositivo se actualizó correctamente."
                : "Ya podés usarlo para entrar más rápido en este dispositivo."}
            </Text>
          </View>
        </View>
        <Button title="Listo" onPress={onClose} />
      </View>
    );
  }

  return (
    <View className="px-4.5 pt-6">
      <Text className="mb-5 text-[14px] leading-5 text-content-muted">
        {isPinEnabled
          ? "Este dispositivo ya tiene un PIN configurado. Elegí uno nuevo para reemplazarlo."
          : "Entrá más rápido en este dispositivo sin escribir tu email y contraseña cada vez. Elegí un PIN de 6 a 8 dígitos."}
      </Text>

      <TextField
        requiredMark
        label="Elegí tu PIN"
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
        requiredMark
        label="Confirmá tu PIN"
        placeholder="••••••"
        keyboardType="number-pad"
        maxLength={PIN_MAX_LENGTH}
        isPassword
        iconName="lock"
        value={confirmPin}
        onChangeText={(text) => setConfirmPin(text.replace(/\D/g, ""))}
        error={errors.confirmPin}
      />

      <FormErrorBanner message={formError} />

      <Button
        title={isPinEnabled ? "Guardar" : "Activar"}
        onPress={handleSubmit}
        isLoading={isSubmitting}
      />
    </View>
  );
}
