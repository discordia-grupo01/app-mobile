import { Feather } from "@expo/vector-icons";
import { type ComponentProps } from "react";
import { Text, View } from "react-native";

import { withAlpha } from "../../lib/color";
import { useThemeColors } from "../../theme/theme-context";
import { Button } from "./Button";
import { FormErrorBanner } from "./FormErrorBanner";
import { ModalCloseButton } from "./ModalCloseButton";
import { ModalShell } from "./ModalShell";

interface ConfirmDialogProps {
  visible: boolean;
  icon: ComponentProps<typeof Feather>["name"];
  title: string;
  body: string;
  confirmLabel: string;
  isLoading?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmacion de una accion destructiva, como el `ConfirmDialog` de web. */
export function ConfirmDialog({
  visible,
  icon,
  title,
  body,
  confirmLabel,
  isLoading = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const colors = useThemeColors();

  return (
    <ModalShell
      visible={visible}
      onClose={onCancel}
      dismissOnBackdrop={!isLoading}
      className="max-w-80 items-center p-7 pt-6"
    >
      <ModalCloseButton variant="subtle" onPress={onCancel} />

      <View
        className="mb-5 mt-2 h-16 w-16 items-center justify-center rounded-[18px]"
        style={{ backgroundColor: withAlpha(colors.danger, 0.14) }}
      >
        <Feather name={icon} size={26} color={colors.danger} />
      </View>
      <Text className="text-center text-[19px] font-bold text-content">
        {title}
      </Text>
      <Text className="mb-6 mt-2.5 text-center text-[14px] leading-5 text-content-muted">
        {body}
      </Text>

      <View className="w-full gap-2.5">
        <FormErrorBanner message={error} />
        <Button
          title={confirmLabel}
          variant="danger"
          isLoading={isLoading}
          onPress={onConfirm}
        />
        <Button
          title="Cancelar"
          variant="secondary"
          disabled={isLoading}
          onPress={onCancel}
        />
      </View>
    </ModalShell>
  );
}
