import {
  VOICE_CAMERA_ON_LABEL,
  VOICE_MUTED_LABEL,
  VOICE_SCREEN_SHARING,
  VOICE_SHOW_LESS,
  VOICE_SIDEBAR_PREVIEW_SIZE,
  voiceHiddenCount,
  voiceSidebarPreview,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "../../../../components/ui/Avatar";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
import type { SidebarVoiceParticipant } from "../../useServerVoice";

const PARTICIPANT_ROW_HEIGHT = 32;
const LIST_BOTTOM_MARGIN = 4;

export function voiceParticipantsHeight(
  count: number,
  isExpanded: boolean,
): number {
  if (count === 0) return 0;
  const hasToggle = count > VOICE_SIDEBAR_PREVIEW_SIZE;
  const rows = isExpanded ? count : Math.min(count, VOICE_SIDEBAR_PREVIEW_SIZE);
  return (
    (rows + (hasToggle ? 1 : 0)) * PARTICIPANT_ROW_HEIGHT + LIST_BOTTOM_MARGIN
  );
}

export function VoiceChannelParticipants({
  participants,
  isExpanded = false,
  onToggleExpanded,
}: {
  participants: readonly SidebarVoiceParticipant[];
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}) {
  const colors = useThemeColors();
  if (participants.length === 0) return null;

  const { shown, hidden } = voiceSidebarPreview(
    participants,
    VOICE_SIDEBAR_PREVIEW_SIZE,
  );
  const listed = isExpanded ? participants : shown;

  return (
    <View className="ml-7" style={{ marginBottom: LIST_BOTTOM_MARGIN }}>
      {listed.map((participant) => (
        <View
          key={participant.identity}
          className="flex-row items-center gap-2 px-2"
          style={{ height: PARTICIPANT_ROW_HEIGHT }}
        >
          <View
            className={cn(
              "rounded-full border-[1.5px] p-[1px]",
              participant.speaking ? "border-success" : "border-transparent",
            )}
          >
            <Avatar
              name={participant.name}
              uri={participant.avatarUri}
              size={22}
            />
          </View>
          <Text
            className={cn(
              "flex-1 text-[14px]",
              participant.speaking ? "text-content" : "text-content-muted",
            )}
            numberOfLines={1}
          >
            {participant.name}
          </Text>
          {participant.screenSharing ? (
            <Feather
              name="monitor"
              size={13}
              color={colors.textMuted}
              accessibilityLabel={VOICE_SCREEN_SHARING}
            />
          ) : null}
          {participant.cameraOn ? (
            <Feather
              name="video"
              size={13}
              color={colors.textMuted}
              accessibilityLabel={VOICE_CAMERA_ON_LABEL}
            />
          ) : null}
          {participant.muted ? (
            <Feather
              name="mic-off"
              size={13}
              color={colors.danger}
              accessibilityLabel={VOICE_MUTED_LABEL}
            />
          ) : null}
        </View>
      ))}
      {hidden.length > 0 ? (
        <TouchableOpacity
          onPress={onToggleExpanded}
          disabled={!onToggleExpanded}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
          className="justify-center px-2"
          style={{ height: PARTICIPANT_ROW_HEIGHT }}
        >
          <Text className="text-[13px] text-content-subtle">
            {isExpanded ? VOICE_SHOW_LESS : voiceHiddenCount(hidden.length)}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
