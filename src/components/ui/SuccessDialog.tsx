import { Feather } from "@expo/vector-icons";
import { type ComponentProps } from "react";
import { Text, View } from "react-native";

import { withAlpha } from "../../lib/color";
import { useThemeColors } from "../../theme/theme-context";
import { Button } from "./Button";
import { ModalCloseButton } from "./ModalCloseButton";
import { ModalShell } from "./ModalShell";

interface SuccessDialogProps {
  visible: boolean;
  title: string;
  body: string;
  icon?: ComponentProps<typeof Feather>["name"];
  actionLabel?: string;
  onClose: () => void;
}

export function SuccessDialog({
  visible,
  title,
  body,
  icon = "check-circle",
  actionLabel = "Cerrar",
  onClose,
}: SuccessDialogProps) {
  const colors = useThemeColors();

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      className="max-w-80 items-center p-7 pt-6"
    >
      <ModalCloseButton variant="subtle" onPress={onClose} />

      <View
        className="mb-5 mt-2 h-16 w-16 items-center justify-center rounded-[18px]"
        style={{ backgroundColor: withAlpha(colors.success, 0.14) }}
      >
        <Feather name={icon} size={26} color={colors.success} />
      </View>
      <Text
        accessibilityRole="header"
        className="text-center text-[19px] font-bold text-content"
      >
        {title}
      </Text>
      <Text className="mb-6 mt-2.5 text-center text-[14px] leading-5 text-content-muted">
        {body}
      </Text>

      <View className="w-full">
        <Button title={actionLabel} onPress={onClose} />
      </View>
    </ModalShell>
  );
}
