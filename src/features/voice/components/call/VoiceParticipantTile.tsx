import {
  VOICE_CAMERA_ON_LABEL,
  VOICE_MUTE_FOR_ME,
  VOICE_MUTED_FOR_ME_LABEL,
  VOICE_MUTED_LABEL,
  VOICE_SCREEN_SHARING,
  VOICE_SPEAKING_LABEL,
  VOICE_UNMUTE_FOR_ME,
  type VoiceParticipant,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { Avatar } from "../../../../components/ui/Avatar";
import { cn } from "../../../../lib/cn";
import { withAlpha } from "../../../../lib/color";
import { useThemeColors } from "../../../../theme/theme-context";
import { SpeakingBars, SpeakingGlow } from "./SpeakingIndicators";

const TILE_RADIUS = 16;

const MIN_ASPECT = 0.72;
const MAX_ASPECT = 1.5;
const MIN_AVATAR = 40;
const MAX_AVATAR = 140;

export function clampToAspect(
  width: number,
  height: number,
): { width: number; height: number } {
  if (width <= 0 || height <= 0) return { width: 0, height: 0 };
  const aspect = width / height;
  if (aspect < MIN_ASPECT) return { width, height: width / MIN_ASPECT };
  if (aspect > MAX_ASPECT) return { width: height * MAX_ASPECT, height };
  return { width, height };
}

interface VoiceParticipantTileProps {
  participant: VoiceParticipant;
  avatarUri?: string | null;
  width: number;
  height: number;
  onToggleMutedForMe?: () => void;
}

export function VoiceParticipantTile({
  participant,
  avatarUri,
  width,
  height,
  onToggleMutedForMe,
}: VoiceParticipantTileProps) {
  const colors = useThemeColors();
  const { name, speaking, muted, cameraOn, screenSharing, mutedForMe } =
    participant;
  const isSpeaking = speaking && !mutedForMe;
  const muteForMeLabel = mutedForMe ? VOICE_UNMUTE_FOR_ME : VOICE_MUTE_FOR_ME;
  const tile = clampToAspect(width, height);
  const avatarSize = Math.round(
    Math.min(
      MAX_AVATAR,
      Math.max(MIN_AVATAR, Math.min(tile.width, tile.height) * 0.42),
    ),
  );

  return (
    <View
      style={{ width, height, alignItems: "center", justifyContent: "center" }}
    >
      <View style={{ width: tile.width, height: tile.height }}>
        {isSpeaking ? <SpeakingGlow borderRadius={TILE_RADIUS} /> : null}
        <View
          className={cn(
            "flex-1 items-center justify-center overflow-hidden border-2 bg-surface-raised",
            isSpeaking ? "border-success" : "border-line",
          )}
          style={{ borderRadius: TILE_RADIUS }}
        >
          <View
            className={cn("rounded-full", mutedForMe && "opacity-50")}
            style={{ boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)" }}
          >
            <Avatar name={name} uri={avatarUri} size={avatarSize} />
          </View>

          {screenSharing ? (
            <View className="absolute top-2 left-2 flex-row items-center gap-1 rounded-full bg-accent px-2 py-0.5">
              <Feather name="monitor" size={10} color={colors.onAccent} />
              <Text className="text-[10px] font-semibold text-on-accent">
                {VOICE_SCREEN_SHARING}
              </Text>
            </View>
          ) : null}

          {onToggleMutedForMe ? (
            <TouchableOpacity
              onPress={onToggleMutedForMe}
              className="absolute top-1.5 right-1.5 w-8 h-8 rounded-lg items-center justify-center"
              style={{
                backgroundColor: mutedForMe
                  ? withAlpha(colors.danger, 0.2)
                  : "rgba(0, 0, 0, 0.35)",
              }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityState={{ selected: mutedForMe }}
              accessibilityLabel={`${muteForMeLabel}: ${name}`}
            >
              <Feather
                name={mutedForMe ? "volume-x" : "volume-2"}
                size={15}
                color={mutedForMe ? colors.danger : colors.onAccent}
              />
            </TouchableOpacity>
          ) : null}

          <View className="absolute inset-x-0 bottom-0 h-11">
            <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
              <Defs>
                <LinearGradient id="tileShade" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#000000" stopOpacity={0} />
                  <Stop offset="1" stopColor="#000000" stopOpacity={0.5} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#tileShade)" />
            </Svg>
            <View className="flex-1 flex-row items-end justify-between gap-2 px-2.5 pb-2">
              <View className="flex-1 flex-row items-center gap-1.5 min-w-0">
                {isSpeaking ? (
                  <View
                    className="w-2 h-2 rounded-full bg-success"
                    accessibilityLabel={VOICE_SPEAKING_LABEL}
                  />
                ) : null}
                <Text
                  className="flex-1 text-[13px] font-semibold text-white"
                  numberOfLines={1}
                >
                  {name}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                {mutedForMe ? (
                  <TileBadge
                    icon="volume-x"
                    label={VOICE_MUTED_FOR_ME_LABEL}
                    tone="danger"
                  />
                ) : null}
                {muted ? (
                  <TileBadge
                    icon="mic-off"
                    label={VOICE_MUTED_LABEL}
                    tone="danger"
                  />
                ) : null}
                {cameraOn ? (
                  <TileBadge
                    icon="video"
                    label={VOICE_CAMERA_ON_LABEL}
                    tone="accent"
                  />
                ) : null}
              </View>
            </View>
          </View>

          {isSpeaking ? (
            <View className="absolute bottom-11 self-center">
              <SpeakingBars />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function TileBadge({
  icon,
  label,
  tone,
}: {
  icon: ComponentProps<typeof Feather>["name"];
  label: string;
  tone: "danger" | "accent";
}) {
  const colors = useThemeColors();
  return (
    <View
      accessible
      accessibilityLabel={label}
      className={cn("rounded p-[3px]", tone === "accent" && "bg-accent")}
      style={
        tone === "danger"
          ? { backgroundColor: withAlpha(colors.danger, 0.25) }
          : undefined
      }
    >
      <Feather
        name={icon}
        size={11}
        color={tone === "danger" ? colors.danger : colors.onAccent}
      />
    </View>
  );
}
