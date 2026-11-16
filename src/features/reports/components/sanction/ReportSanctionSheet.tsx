import {
  BAN_ACTION_LABEL,
  DELETE_MESSAGE_LABEL,
  KICK_ACTION_LABEL,
  MUTE_ACTION_LABEL,
  REPORT_SANCTION_MENU_LABEL,
  type ReportSanction,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { type ReactNode, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { withAlpha } from "../../../../lib/color";
import { useThemeColors } from "../../../../theme/theme-context";
import { BanIcon } from "../../../bans/components/BanIcon";

const LABELS: Record<ReportSanction, string> = {
  delete: DELETE_MESSAGE_LABEL,
  mute: MUTE_ACTION_LABEL,
  kick: KICK_ACTION_LABEL,
  ban: BAN_ACTION_LABEL,
};

const ORDER: readonly ReportSanction[] = ["delete", "mute", "kick", "ban"];

interface ReportSanctionSheetProps {
  /** `null` cierra el menu. */
  available: readonly ReportSanction[] | null;
  onChoose: (sanction: ReportSanction) => void;
  onClose: () => void;
}

export function ReportSanctionSheet({
  available,
  onChoose,
  onClose,
}: ReportSanctionSheetProps) {
  const colors = useThemeColors();
  const [pending, setPending] = useState<ReportSanction | null>(null);

  function choose(sanction: ReportSanction) {
    if (Platform.OS === "ios") setPending(sanction);
    onClose();
    if (Platform.OS !== "ios") onChoose(sanction);
  }

  function runPending() {
    const sanction = pending;
    setPending(null);
    if (sanction) onChoose(sanction);
  }

  function iconOf(sanction: ReportSanction): ReactNode {
    if (sanction === "ban") return <BanIcon size={16} color={colors.danger} />;
    const name =
      sanction === "delete"
        ? "trash-2"
        : sanction === "mute"
          ? "mic-off"
          : "user-x";
    return <Feather name={name} size={16} color={colors.danger} />;
  }

  return (
    <Modal
      transparent
      visible={available !== null}
      animationType="fade"
      onRequestClose={onClose}
      onDismiss={runPending}
    >
      <View className="flex-1 justify-end bg-[rgba(0,0,0,0.6)]">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View className="rounded-tl-[22px] rounded-tr-[22px] border-t border-line-strong bg-surface-modal px-4.5 pt-2.5 pb-7">
          <View className="mb-4 h-1 w-9 self-center rounded-xs bg-line-strong" />
          <Text className="mb-1 px-2 text-[11px] font-bold uppercase tracking-[1.2px] text-content-subtle">
            {REPORT_SANCTION_MENU_LABEL}
          </Text>

          {ORDER.filter((sanction) => available?.includes(sanction)).map(
            (sanction) => (
              <TouchableOpacity
                key={sanction}
                activeOpacity={0.75}
                className="flex-row items-center gap-3.5 rounded-[14px] px-2 py-3"
                onPress={() => choose(sanction)}
                accessibilityRole="button"
              >
                <View
                  className="h-9.5 w-9.5 items-center justify-center rounded-[11px]"
                  style={{ backgroundColor: withAlpha(colors.danger, 0.15) }}
                >
                  {iconOf(sanction)}
                </View>
                <Text className="text-[15px] font-bold text-danger">
                  {LABELS[sanction]}
                </Text>
              </TouchableOpacity>
            ),
          )}

          <TouchableOpacity
            activeOpacity={0.75}
            className="mt-2 items-center rounded-xl bg-surface-input py-3.5"
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text className="text-[14px] font-bold text-content-muted">
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
