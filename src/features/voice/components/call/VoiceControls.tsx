import {
  VOICE_CAMERA,
  VOICE_CAMERA_OFF,
  VOICE_CAMERA_OFF_ACTION,
  VOICE_CAMERA_ON_ACTION,
  VOICE_CONTROLS_LABEL,
  VOICE_LEAVE,
  VOICE_LEAVE_LABEL,
  VOICE_MODERATOR_MUTED,
  VOICE_MUTE,
  VOICE_MUTE_LABEL,
  VOICE_PARTICIPANTS_BUTTON,
  VOICE_PARTICIPANTS_OPEN,
  VOICE_UNMUTE,
  VOICE_UNMUTE_LABEL,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../../lib/cn";
import { withAlpha } from "../../../../lib/color";
import { useThemeColors } from "../../../../theme/theme-context";

type ControlTone = "neutral" | "danger";

interface VoiceControlsProps {
  muted: boolean;
  canSpeak: boolean;
  cameraOn: boolean;
  bottomInset: number;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onShowParticipants: () => void;
  onLeave: () => void;
}

export function VoiceControls({
  muted,
  canSpeak,
  cameraOn,
  bottomInset,
  onToggleMute,
  onToggleCamera,
  onShowParticipants,
  onLeave,
}: VoiceControlsProps) {
  return (
    <View
      className="items-center px-4 pt-2"
      style={{ paddingBottom: bottomInset + 16 }}
    >
      <View
        accessibilityRole="toolbar"
        accessibilityLabel={VOICE_CONTROLS_LABEL}
        className="flex-row items-center gap-1.5 rounded-2xl border border-line-strong bg-surface-raised px-2 py-2.5"
        style={{ boxShadow: "0 16px 48px rgba(0, 0, 0, 0.3)" }}
      >
        <ControlButton
          icon={muted ? "mic-off" : "mic"}
          label={muted ? VOICE_UNMUTE : VOICE_MUTE}
          accessibilityLabel={
            !canSpeak
              ? VOICE_MODERATOR_MUTED
              : muted
                ? VOICE_UNMUTE_LABEL
                : VOICE_MUTE_LABEL
          }
          tone={muted ? "danger" : "neutral"}
          isSelected={muted}
          disabled={!canSpeak}
          onPress={onToggleMute}
        />
        <ControlButton
          icon={cameraOn ? "video" : "video-off"}
          label={cameraOn ? VOICE_CAMERA : VOICE_CAMERA_OFF}
          accessibilityLabel={
            cameraOn ? VOICE_CAMERA_OFF_ACTION : VOICE_CAMERA_ON_ACTION
          }
          tone={cameraOn ? "neutral" : "danger"}
          isSelected={cameraOn}
          onPress={onToggleCamera}
        />

        <ControlButton
          icon="users"
          label={VOICE_PARTICIPANTS_BUTTON}
          accessibilityLabel={VOICE_PARTICIPANTS_OPEN}
          tone="neutral"
          onPress={onShowParticipants}
        />

        <View className="mx-1 h-10 w-px bg-line" />

        <ControlButton
          icon="phone-off"
          label={VOICE_LEAVE}
          accessibilityLabel={VOICE_LEAVE_LABEL}
          tone="danger"
          isLeave
          onPress={onLeave}
        />
      </View>
    </View>
  );
}

function toneBackground(
  tone: ControlTone,
  isLeave: boolean,
  colors: ReturnType<typeof useThemeColors>,
): { backgroundColor?: string; borderColor?: string } {
  if (isLeave) {
    return {
      backgroundColor: withAlpha(colors.danger, 0.15),
      borderColor: withAlpha(colors.danger, 0.3),
    };
  }
  if (tone === "danger")
    return { backgroundColor: withAlpha(colors.danger, 0.12) };
  return {};
}

function ControlButton({
  icon,
  label,
  accessibilityLabel,
  tone,
  isSelected,
  isLeave = false,
  disabled = false,
  onPress,
}: {
  icon: ComponentProps<typeof Feather>["name"];
  label: string;
  accessibilityLabel: string;
  tone: ControlTone;
  isSelected?: boolean;
  isLeave?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const iconColor = tone === "danger" ? colors.danger : colors.textMuted;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isSelected, disabled }}
      className={cn(
        "min-w-[62px] items-center gap-1 rounded-xl px-2.5 py-2",
        disabled && "opacity-50",
        tone === "neutral" && "bg-surface-input",
        isLeave && "border px-4",
      )}
      style={toneBackground(tone, isLeave, colors)}
    >
      <Feather name={icon} size={20} color={iconColor} />
      <Text
        className={cn(
          "text-[11px]",
          isLeave ? "font-semibold" : "font-medium",
          tone === "neutral" ? "text-content-subtle" : "text-danger",
        )}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
