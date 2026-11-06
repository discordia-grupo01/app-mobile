import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { ModalCloseButton } from "../../../../components/ui/ModalCloseButton";
import { ModalShell } from "../../../../components/ui/ModalShell";
import { withAlpha } from "../../../../lib/color";
import { useThemeColors } from "../../../../theme/theme-context";
import { BILLING_COPY } from "../../billingCopy";

interface CancelPremiumModalProps {
  visible: boolean;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function CancelPremiumModal({
  visible,
  body,
  confirmLabel,
  onConfirm,
  onClose,
}: CancelPremiumModalProps) {
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
        style={{ backgroundColor: withAlpha(colors.danger, 0.14) }}
      >
        <Feather name="x-circle" size={26} color={colors.danger} />
      </View>
      <Text className="text-center text-[19px] font-bold text-content">
        {BILLING_COPY.cancelTitle}
      </Text>
      <Text className="mb-6 mt-2.5 text-center text-[14px] leading-5 text-content-muted">
        {body}
      </Text>

      <View className="w-full gap-2.5">
        <Button title={confirmLabel} variant="danger" onPress={onConfirm} />
        <Button
          title={BILLING_COPY.keepPremium}
          variant="secondary"
          onPress={onClose}
        />
      </View>
    </ModalShell>
  );
}
