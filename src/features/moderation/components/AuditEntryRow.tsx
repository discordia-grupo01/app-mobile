import {
  displayNameOf,
  formatMessageTimestamp,
  MODERATION_AUDIT_ACTIONS,
  type ModerationAuditAction,
  type ModerationAuditEntry,
  type ThemeColors,
} from "@discordia/client-shared";
import { Text, View } from "react-native";

import { Avatar } from "../../../components/ui/Avatar";
import { withAlpha } from "../../../lib/color";
import { avatarUriOf } from "../../../lib/userProfile";
import { useThemeColors } from "../../../theme/theme-context";

const CHIP_TONES: Record<ModerationAuditAction, keyof ThemeColors> = {
  ban: "danger",
  kick: "warning",
  mute: "info",
  unban: "success",
  unmute: "success",
};

export function AuditEntryRow({ entry }: { entry: ModerationAuditEntry }) {
  const colors = useThemeColors();
  const actorName = displayNameOf(entry.actor_profile);
  const { verb, label } = MODERATION_AUDIT_ACTIONS[entry.action];
  const tone = colors[CHIP_TONES[entry.action]];

  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-line bg-surface p-4">
      <Avatar
        name={actorName}
        uri={avatarUriOf(entry.actor_profile)}
        size={36}
      />
      <View className="flex-1 gap-1.5">
        <Text className="text-[14px] leading-5 text-content-muted">
          <Text className="font-bold text-content">{actorName}</Text> {verb}{" "}
          <Text className="font-bold text-content">
            {displayNameOf(entry.target_profile)}
          </Text>
        </Text>
        <View className="flex-row flex-wrap items-center gap-2">
          <View
            className="rounded-full px-2.5 py-1"
            style={{ backgroundColor: withAlpha(tone, 0.15) }}
          >
            <Text className="text-[12px] font-bold" style={{ color: tone }}>
              {label}
            </Text>
          </View>
          <Text className="text-[12px] text-content-subtle">
            {formatMessageTimestamp(entry.occurred_at)}
          </Text>
        </View>
      </View>
    </View>
  );
}
