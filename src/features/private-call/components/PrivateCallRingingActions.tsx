import {
  PRIVATE_CALL_ACCEPT,
  PRIVATE_CALL_CANCEL,
  PRIVATE_CALL_DECLINE,
  type PrivateCallPhase,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { withAlpha } from "../../../lib/color";
import { useThemeColors } from "../../../theme/theme-context";

interface PrivateCallRingingActionsProps {
  phase: PrivateCallPhase;
  bottomInset: number;
  onAccept: () => void;
  onDecline: () => void;
  onCancel: () => void;
}

export function PrivateCallRingingActions({
  phase,
  bottomInset,
  onAccept,
  onDecline,
  onCancel,
}: PrivateCallRingingActionsProps) {
  return (
    <View
      className="flex-row justify-center gap-12 px-4"
      style={{ paddingBottom: bottomInset + 20 }}
    >
      {phase === "incoming" ? (
        <>
          <RingingButton
            icon="phone-off"
            label={PRIVATE_CALL_DECLINE}
            tone="danger"
            onPress={onDecline}
          />
          <RingingButton
            icon="phone"
            label={PRIVATE_CALL_ACCEPT}
            tone="success"
            onPress={onAccept}
          />
        </>
      ) : (
        <RingingButton
          icon="phone-off"
          label={PRIVATE_CALL_CANCEL}
          tone="danger"
          onPress={onCancel}
        />
      )}
    </View>
  );
}

function RingingButton({
  icon,
  label,
  tone,
  onPress,
}: {
  icon: ComponentProps<typeof Feather>["name"];
  label: string;
  tone: "danger" | "success";
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const color = tone === "danger" ? colors.danger : colors.success;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="items-center gap-2"
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        className="h-16 w-16 items-center justify-center rounded-full border"
        style={{
          backgroundColor: withAlpha(color, 0.15),
          borderColor: withAlpha(color, 0.3),
        }}
      >
        <Feather name={icon} size={26} color={color} />
      </View>
      <Text className="text-[12px] font-semibold" style={{ color }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
