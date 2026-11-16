import {
  VOICE_CAMERA_ON_LABEL,
  VOICE_MUTE_FOR_ME,
  VOICE_MUTED_FOR_ME_LABEL,
  VOICE_MUTED_LABEL,
  VOICE_PARTICIPANTS_CLOSE,
  VOICE_PARTICIPANTS_TITLE,
  VOICE_PIN,
  VOICE_SCREEN_SHARING,
  VOICE_UNMUTE_FOR_ME,
  VOICE_UNPIN,
  isScreenShareIdentity,
  voiceConnectedCount,
  voiceParticipantName,
  voiceParticipantRows,
  voiceSidebarPreview,
  voiceTileName,
  voiceTilePinLabel,
  type VoiceParticipant,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Avatar } from "../../../../components/ui/Avatar";
import { cn } from "../../../../lib/cn";
import { withAlpha } from "../../../../lib/color";
import { useThemeColors } from "../../../../theme/theme-context";

interface VoiceParticipantsSheetProps {
  visible: boolean;
  participants: readonly VoiceParticipant[];
  ownAvatarUri: string | null;
  participantAvatarOf: (identity: string) => string | null;
  pinnedIdentity: string | null;
  onToggleMutedForMe: (identity: string) => void;
  onPinChange: (identity: string | null) => void;
  onClose: () => void;
}

/** Todos los de la llamada: la grilla nunca scrollea, esta lista si. */
export function VoiceParticipantsSheet({
  visible,
  participants,
  ownAvatarUri,
  participantAvatarOf,
  pinnedIdentity,
  onToggleMutedForMe,
  onPinChange,
  onClose,
}: VoiceParticipantsSheetProps) {
  const colors = useThemeColors();
  const { shown } = voiceSidebarPreview(participants, participants.length);
  const rows = voiceParticipantRows(shown);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-[rgba(0,0,0,0.6)]">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View className="max-h-[78%] rounded-tl-[22px] rounded-tr-[22px] border-t border-line-strong bg-surface-modal pt-2.5 pb-7">
          <View className="mb-3 h-1 w-9 self-center rounded-xs bg-line-strong" />
          <View className="mb-2 flex-row items-center justify-between px-4.5">
            <View>
              <Text className="text-[17px] font-bold text-content">
                {VOICE_PARTICIPANTS_TITLE}
              </Text>
              <Text className="text-[13px] text-content-muted">
                {voiceConnectedCount(participants.length)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={VOICE_PARTICIPANTS_CLOSE}
              className="h-8 w-8 items-center justify-center rounded-full bg-surface-input"
            >
              <Feather name="x" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 10 }}>
            {rows.map((participant) => (
              <ParticipantRow
                key={participant.identity}
                participant={participant}
                avatarUri={
                  participant.isLocal
                    ? ownAvatarUri
                    : participantAvatarOf(participant.identity)
                }
                isPinned={participant.identity === pinnedIdentity}
                onToggleMutedForMe={() =>
                  onToggleMutedForMe(participant.identity)
                }
                onTogglePin={() =>
                  onPinChange(
                    participant.identity === pinnedIdentity
                      ? null
                      : participant.identity,
                  )
                }
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ParticipantRow({
  participant,
  avatarUri,
  isPinned,
  onToggleMutedForMe,
  onTogglePin,
}: {
  participant: VoiceParticipant;
  avatarUri: string | null;
  isPinned: boolean;
  onToggleMutedForMe: () => void;
  onTogglePin: () => void;
}) {
  const colors = useThemeColors();
  const {
    name,
    isLocal,
    speaking,
    muted,
    cameraOn,
    screenSharing,
    mutedForMe,
  } = participant;
  const muteForMeLabel = mutedForMe ? VOICE_UNMUTE_FOR_ME : VOICE_MUTE_FOR_ME;
  const pinButton = (
    <PinButton
      label={voiceTilePinLabel(participant, isPinned)}
      isPinned={isPinned}
      onPress={onTogglePin}
    />
  );

  if (isScreenShareIdentity(participant.identity)) {
    return (
      <View className="flex-row items-center gap-3 rounded-xl px-2 py-2">
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: withAlpha(colors.accent, 0.18) }}
        >
          <Feather name="monitor" size={17} color={colors.accent} />
        </View>
        <Text
          className="min-w-0 flex-1 text-[15px] font-semibold text-content"
          numberOfLines={1}
        >
          {voiceTileName(participant)}
        </Text>
        {pinButton}
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-3 rounded-xl px-2 py-2">
      <View
        className={cn(
          "rounded-full border-2 p-[1px]",
          speaking && !mutedForMe ? "border-success" : "border-transparent",
          mutedForMe && "opacity-50",
        )}
      >
        <Avatar name={name} uri={avatarUri} size={36} />
      </View>
      <View className="min-w-0 flex-1">
        <Text
          className="text-[15px] font-semibold text-content"
          numberOfLines={1}
        >
          {voiceParticipantName(name, isLocal)}
        </Text>
        <View className="mt-0.5 flex-row items-center gap-1.5">
          {mutedForMe ? (
            <StatusIcon
              icon="volume-x"
              label={VOICE_MUTED_FOR_ME_LABEL}
              color={colors.danger}
            />
          ) : null}
          {muted ? (
            <StatusIcon
              icon="mic-off"
              label={VOICE_MUTED_LABEL}
              color={colors.danger}
            />
          ) : null}
          {cameraOn ? (
            <StatusIcon
              icon="video"
              label={VOICE_CAMERA_ON_LABEL}
              color={colors.textMuted}
            />
          ) : null}
          {screenSharing ? (
            <StatusIcon
              icon="monitor"
              label={VOICE_SCREEN_SHARING}
              color={colors.textMuted}
            />
          ) : null}
        </View>
      </View>
      {isLocal ? null : (
        <TouchableOpacity
          onPress={onToggleMutedForMe}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityState={{ selected: mutedForMe }}
          accessibilityLabel={`${muteForMeLabel}: ${name}`}
          className={cn(
            "h-9 w-9 items-center justify-center rounded-lg",
            !mutedForMe && "bg-surface-input",
          )}
          style={
            mutedForMe
              ? { backgroundColor: withAlpha(colors.danger, 0.2) }
              : undefined
          }
        >
          <Feather
            name="volume-x"
            size={15}
            color={mutedForMe ? colors.danger : colors.textMuted}
          />
        </TouchableOpacity>
      )}
      {pinButton}
    </View>
  );
}

function PinButton({
  label,
  isPinned,
  onPress,
}: {
  label: string;
  isPinned: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: isPinned }}
      accessibilityLabel={label}
      className={cn(
        "rounded-lg px-3 py-2",
        isPinned ? "bg-accent" : "bg-surface-input",
      )}
    >
      <Text
        className={cn(
          "text-[12px] font-semibold",
          isPinned ? "text-on-accent" : "text-content-muted",
        )}
      >
        {isPinned ? VOICE_UNPIN : VOICE_PIN}
      </Text>
    </TouchableOpacity>
  );
}

function StatusIcon({
  icon,
  label,
  color,
}: {
  icon: ComponentProps<typeof Feather>["name"];
  label: string;
  color: string;
}) {
  return (
    <Feather name={icon} size={12} color={color} accessibilityLabel={label} />
  );
}
