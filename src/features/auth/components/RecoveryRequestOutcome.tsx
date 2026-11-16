import {
  ACCOUNT_RECOVERY_PENDING_DESCRIPTION,
  ACCOUNT_RECOVERY_SENT_DESCRIPTION,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { withAlpha } from "../../../lib/color";
import { useThemeColors } from "../../../theme/theme-context";

type RecoveryRequestOutcomeProps =
  | { status: "sent"; emailHint: string; onBack: () => void }
  | { status: "pending"; onBack: () => void };

export function RecoveryRequestOutcome(props: RecoveryRequestOutcomeProps) {
  const colors = useThemeColors();
  const sent = props.status === "sent";
  const tone = sent ? colors.success : colors.info;

  return (
    <View className="w-full items-center">
      <View
        className="mb-5 h-16 w-16 items-center justify-center rounded-[20px]"
        style={{ backgroundColor: withAlpha(tone, 0.15) }}
      >
        <Feather name={sent ? "mail" : "clock"} size={32} color={tone} />
      </View>

      <Text className="mb-2.5 text-center text-[24px] font-bold text-content">
        {sent ? "Recibimos tu solicitud" : "Tu solicitud está en revisión"}
      </Text>
      <Text className="mb-8 text-center text-[14px] leading-5 text-content-muted">
        {props.status === "sent" ? (
          <>
            {ACCOUNT_RECOVERY_SENT_DESCRIPTION}{" "}
            <Text className="font-bold text-content">{props.emailHint}</Text>.
          </>
        ) : (
          ACCOUNT_RECOVERY_PENDING_DESCRIPTION
        )}
      </Text>

      <Button
        title="Volver al inicio de sesión"
        onPress={props.onBack}
        iconRight="arrow-right"
      />
    </View>
  );
}
