import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { useThemeColors } from "../../../../../theme/theme-context";

interface TwoFactorDisabledConfirmationStepProps {
  onClose: () => void;
  onReactivate: () => void;
}

export function TwoFactorDisabledConfirmationStep({
  onClose,
  onReactivate,
}: TwoFactorDisabledConfirmationStepProps) {
  const colors = useThemeColors();

  return (
    <>
      <Text className="mb-5 text-[14px] leading-5 text-content-muted">
        El cambio se guardó correctamente. A partir de ahora, tus próximos
        inicios de sesión solo requerirán la contraseña.
      </Text>

      <View className="mb-5 flex-row items-start gap-3 rounded-2xl border border-line bg-surface-raised p-4">
        <Feather name="check-circle" size={18} color={colors.success} />
        <View className="flex-1">
          <Text className="text-[13px] font-bold text-info">
            Podés volver a activarla cuando quieras
          </Text>
          <Text className="mt-1 text-[12px] leading-[17px] text-content-muted">
            Necesitarás conectar nuevamente tu app autenticadora y guardar una
            nueva lista de códigos de recuperación.
          </Text>
        </View>
      </View>

      <Button
        title="Volver a activar"
        onPress={onReactivate}
        className="mb-2.5"
      />
      <Button title="Cerrar" variant="secondary" onPress={onClose} />
    </>
  );
}
