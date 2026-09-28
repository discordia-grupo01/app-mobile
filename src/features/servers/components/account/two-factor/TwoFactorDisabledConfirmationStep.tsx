import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { withAlpha } from "../../../../../lib/color";
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
      <View className="items-center">
        <View
          className="mb-4 size-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: withAlpha(colors.success, 0.15) }}
        >
          <Feather name="check-circle" size={30} color={colors.success} />
        </View>
        <Text className="text-center text-[17px] font-bold text-content">
          Verificación en dos pasos desactivada
        </Text>
        <Text className="mt-2 text-center text-[13px] leading-[18px] text-content-muted">
          El cambio se guardó correctamente. A partir de ahora, tus próximos
          inicios de sesión solo requerirán la contraseña.
        </Text>
      </View>

      <View className="my-4 rounded-2xl border border-line bg-surface-raised p-4">
        <Text className="text-[13px] font-bold text-info">
          Podés volver a activarla cuando quieras
        </Text>
        <Text className="mt-1 text-[12px] leading-[17px] text-content-muted">
          Necesitarás conectar nuevamente tu app autenticadora y guardar una
          nueva lista de códigos de recuperación.
        </Text>
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
