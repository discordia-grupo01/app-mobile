import {
  type PrivateCallPartner,
  VOICE_MUTE,
  type VoiceParticipant,
  voiceParticipantsOf,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, Pattern, Rect } from "react-native-svg";

import { Avatar } from "../../../components/ui/Avatar";
import { withAlpha } from "../../../lib/color";
import { useThemeColors } from "../../../theme/theme-context";
import { CallDuration } from "../../voice/components/sidebar/CallDuration";
import { useVoiceSession } from "../../voice/voice-session-context";

interface CallPerson {
  name: string;
  avatarUrl: string | null;
}

interface PrivateCallStageProps {
  me: CallPerson;
  partner: PrivateCallPartner;
  isRinging: boolean;
  connectedAt: number | null;
}

export function PrivateCallStage({
  me,
  partner,
  isRinging,
  connectedAt,
}: PrivateCallStageProps) {
  const voice = useVoiceSession();
  const participants = voiceParticipantsOf(voice.state);
  const local = participants.find((participant) => participant.isLocal);
  const remote = participants.find((participant) => !participant.isLocal);
  const isInRoom = !isRinging && local !== undefined && remote !== undefined;

  return (
    <View className="flex-1 items-center justify-center p-6">
      <DottedBackground />
      <PartnerPortrait
        partner={partner}
        isRinging={!isInRoom}
        speaker={isInRoom ? remote : undefined}
        connectedAt={isInRoom ? connectedAt : null}
      />
      {isInRoom ? <SelfTile me={me} participant={local} /> : null}
    </View>
  );
}

function DottedBackground() {
  const colors = useThemeColors();

  return (
    <Svg style={StyleSheet.absoluteFill} opacity={0.08} pointerEvents="none">
      <Defs>
        <Pattern
          id="callDots"
          width={20}
          height={20}
          patternUnits="userSpaceOnUse"
        >
          <Circle cx={10} cy={10} r={1} fill={colors.accent} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#callDots)" />
    </Svg>
  );
}

function PartnerPortrait({
  partner,
  isRinging,
  speaker,
  connectedAt,
}: {
  partner: PrivateCallPartner;
  isRinging: boolean;
  speaker: VoiceParticipant | undefined;
  connectedAt: number | null;
}) {
  const colors = useThemeColors();
  const pulse = usePulse(isRinging);
  const isSpeaking = speaker?.speaking ?? false;

  return (
    <View className="items-center">
      <Animated.View
        className="rounded-full border-8"
        style={{
          opacity: pulse,
          borderColor: isSpeaking
            ? colors.success
            : withAlpha(colors.success, 0.2),
        }}
      >
        <Avatar name={partner.name} uri={partner.avatarUrl} size={128} />
      </Animated.View>
      <View className="mt-5 flex-row items-center gap-2">
        <Text className="text-[20px] font-bold text-content" numberOfLines={1}>
          {partner.name}
        </Text>
        {speaker?.muted ? (
          <Feather name="mic-off" size={16} color={colors.danger} />
        ) : null}
      </View>
      {connectedAt !== null ? (
        <CallDuration
          startedAt={connectedAt}
          className="mt-1 text-[14px] text-success"
        />
      ) : null}
    </View>
  );
}

function SelfTile({
  me,
  participant,
}: {
  me: CallPerson;
  participant: VoiceParticipant | undefined;
}) {
  const colors = useThemeColors();
  const isSpeaking = participant?.speaking ?? false;

  return (
    <View
      className="absolute right-4 top-4 w-24 items-center gap-2 rounded-xl border-2 bg-surface-raised px-2 py-3"
      style={{
        borderColor: isSpeaking ? colors.success : colors.borderStrong,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
      }}
    >
      <Avatar name={me.name} uri={me.avatarUrl} size={48} />
      <View className="max-w-full flex-row items-center gap-1">
        <Text
          className="shrink text-[12px] font-semibold text-content"
          numberOfLines={1}
        >
          {me.name}
        </Text>
        {participant?.muted ? (
          <Feather
            name="mic-off"
            size={12}
            color={colors.danger}
            accessibilityLabel={VOICE_MUTE}
          />
        ) : null}
      </View>
    </View>
  );
}

function usePulse(isActive: boolean): Animated.Value {
  const [value] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!isActive) {
      value.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 0.55,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isActive, value]);

  return value;
}
