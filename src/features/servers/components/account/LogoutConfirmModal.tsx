import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { ModalCloseButton } from "../../../../components/ui/ModalCloseButton";
import { ModalShell } from "../../../../components/ui/ModalShell";
import { useThemeColors } from "../../../../theme/theme-context";

interface LogoutConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({
  visible,
  onClose,
  onConfirm,
}: LogoutConfirmModalProps) {
  const colors = useThemeColors();

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      className="max-w-80 p-7 pt-6 items-center"
    >
      <ModalCloseButton variant="subtle" onPress={onClose} />

      <View className="w-16 h-16 rounded-[18px] items-center justify-center bg-[rgba(224,82,82,0.14)] mt-2 mb-5">
        <Feather name="log-out" size={26} color={colors.danger} />
      </View>
      <Text className="text-[19px] font-bold text-content">¿Cerrar sesión?</Text>
      <Text className="text-[14px] leading-5 text-content-muted text-center mt-2.5 mb-6.5">
        Vas a salir de tu cuenta. Podés volver a iniciar sesión cuando quieras.
      </Text>

      <View className="flex-col gap-2.5 w-full">
        <Button title="Cerrar sesión" variant="danger" onPress={onConfirm} />
        <Button title="Cancelar" variant="secondary" onPress={onClose} />
      </View>
    </ModalShell>
  );
}
