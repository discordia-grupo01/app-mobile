import {
  PRIVATE_CALL_CONNECTED,
  PRIVATE_CALL_HANG_UP,
  PRIVATE_CALL_INCOMING,
  PRIVATE_CALL_MINIMIZE,
  PRIVATE_CALL_OUTGOING,
  type PrivateCallPartner,
  type PrivateCallPhase,
  privateCallDialogLabel,
  privateCallTitle,
  VOICE_CONNECTING,
  voiceParticipantsOf,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "../../../lib/cn";
import { useThemeColors } from "../../../theme/theme-context";
import { CallStage } from "../../voice/components/call/CallStage";
import { VoiceControls } from "../../voice/components/call/VoiceControls";
import { VoiceNotice } from "../../voice/components/VoiceNotice";
import { useVoiceSession } from "../../voice/voice-session-context";
import { useOptionalPrivateCall } from "../private-call-context";
import { PrivateCallRingingActions } from "./PrivateCallRingingActions";
import { PrivateCallStage } from "./PrivateCallStage";

const SUBTITLE: Record<Exclude<PrivateCallPhase, "idle">, string> = {
  outgoing: PRIVATE_CALL_OUTGOING,
  incoming: PRIVATE_CALL_INCOMING,
  connecting: VOICE_CONNECTING,
  in_call: PRIVATE_CALL_CONNECTED,
};

export function PrivateCallPanel({
  phase,
  partner,
  me,
}: {
  phase: Exclude<PrivateCallPhase, "idle">;
  partner: PrivateCallPartner;
  me: { name: string; avatarUrl: string | null };
}) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const privateCall = useOptionalPrivateCall();
  const voice = useVoiceSession();
  if (!privateCall) return null;

  const isInRoom = phase === "connecting" || phase === "in_call";
  const { state } = voice;
  const hasVideo = voiceParticipantsOf(state).some(
    (participant) => participant.cameraOn || participant.screenSharing,
  );

  return (
    <View
      className="flex-1 bg-surface"
      style={{ paddingTop: insets.top }}
      accessibilityViewIsModal
      accessibilityLabel={privateCallDialogLabel(partner.name)}
    >
      <View className="h-14 flex-row items-center justify-between gap-3 border-b border-b-line px-4">
        <View className="min-w-0 flex-1">
          <Text
            className="text-[15px] font-semibold text-content"
            numberOfLines={1}
          >
            {privateCallTitle(partner.name)}
          </Text>
          <Text
            className={cn(
              "text-[12px]",
              phase === "in_call" ? "text-success" : "text-content-subtle",
            )}
          >
            {SUBTITLE[phase]}
          </Text>
        </View>
        {isInRoom ? (
          <TouchableOpacity
            onPress={privateCall.minimize}
            className="h-9 w-9 items-center justify-center rounded-lg bg-surface-input"
            accessibilityRole="button"
            accessibilityLabel={PRIVATE_CALL_MINIMIZE}
          >
            <Feather name="chevron-down" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {isInRoom && hasVideo ? (
        <CallStage isCovered={false} />
      ) : (
        <PrivateCallStage
          me={me}
          partner={partner}
          isRinging={!isInRoom}
          connectedAt={privateCall.connectedAt}
        />
      )}

      {isInRoom && voice.mediaError ? (
        <View className="px-4 pb-2">
          <VoiceNotice message={voice.mediaError} />
        </View>
      ) : null}

      <View className="border-t border-t-line bg-surface-sunken pt-4">
        {isInRoom ? (
          <VoiceControls
            muted={state.muted}
            canSpeak={state.canSpeak}
            cameraOn={state.cameraOn}
            screenSharing={state.screenSharing}
            canScreenShare={voice.canScreenShare}
            bottomInset={insets.bottom}
            onToggleMute={voice.toggleMute}
            onToggleCamera={voice.toggleCamera}
            onToggleScreenShare={voice.toggleScreenShare}
            onLeave={privateCall.hangUp}
            leaveLabel={PRIVATE_CALL_HANG_UP}
            leaveAccessibilityLabel={PRIVATE_CALL_HANG_UP}
          />
        ) : (
          <PrivateCallRingingActions
            phase={phase}
            bottomInset={insets.bottom}
            onAccept={privateCall.accept}
            onDecline={privateCall.decline}
            onCancel={privateCall.cancel}
          />
        )}
      </View>
    </View>
  );
}
