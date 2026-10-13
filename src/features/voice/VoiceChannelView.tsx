import {
  type Channel,
  VOICE_CHANNEL_EMPTY,
  VOICE_CONNECT_FORBIDDEN,
  VOICE_IN_CHANNEL_LABEL,
  VOICE_JOIN,
  VOICE_MODERATOR_MUTED,
  VOICE_SWITCH,
  VOICE_UNAVAILABLE,
  voiceParticipantsOf,
  type VoicePresenceParticipant,
  voicePresenceCount,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "../../components/ui/Avatar";
import { cn } from "../../lib/cn";
import { avatarUriOf } from "../../lib/userProfile";
import { useThemeColors } from "../../theme/theme-context";
import { useAuth } from "../auth/auth-context";
import { useVoiceSession } from "./voice-session-context";
import { VoiceNotice } from "./components/VoiceNotice";
import { VoiceControls } from "./components/call/VoiceControls";
import {
  clampToAspect,
  VoiceParticipantTile,
} from "./components/call/VoiceParticipantTile";

const GRID_PADDING = 12;
const GRID_GAP = 8;
const MIN_TILE_HEIGHT = 150;
const LOBBY_MAX_AVATARS = 5;

interface GridLayout {
  columns: number;
  cellWidth: number;
  cellHeight: number;
}

function gridLayoutFor(
  count: number,
  width: number,
  height: number,
): GridLayout {
  const innerWidth = width - GRID_PADDING * 2;
  const innerHeight = height - GRID_PADDING * 2;
  let best: GridLayout = { columns: 1, cellWidth: innerWidth, cellHeight: 0 };
  let bestScore = -1;

  for (let columns = 1; columns <= Math.min(count, 3); columns++) {
    const rows = Math.ceil(count / columns);
    const cellWidth = (innerWidth - GRID_GAP * (columns - 1)) / columns;
    const cellHeight = Math.max(
      (innerHeight - GRID_GAP * (rows - 1)) / rows,
      MIN_TILE_HEIGHT,
    );
    const tile = clampToAspect(cellWidth, cellHeight);
    const score = Math.min(tile.width, tile.height);
    if (score > bestScore) {
      bestScore = score;
      best = { columns, cellWidth: tile.width, cellHeight: tile.height };
    }
  }
  return best;
}

interface VoiceChannelViewProps {
  channel: Channel;
  serverId: string;
  serverName: string;
  canConnect: boolean;
  isCheckingAccess?: boolean;
  /** Quien esta en este canal, para la pantalla previa a entrar. */
  presence: readonly VoicePresenceParticipant[];
  bottomInset: number;
}

export function VoiceChannelView({
  channel,
  serverId,
  serverName,
  canConnect,
  isCheckingAccess = false,
  presence,
  bottomInset,
}: VoiceChannelViewProps) {
  const voice = useVoiceSession();
  const { state } = voice;
  const { user } = useAuth();
  const [gridArea, setGridArea] = useState({ width: 0, height: 0 });

  if (state.target?.channelId !== channel.id || !user) {
    return (
      <VoiceLobby
        channelName={channel.name}
        canConnect={canConnect && user !== null}
        isCheckingAccess={isCheckingAccess}
        isAvailable={voice.isAvailable}
        isInAnotherChannel={state.target !== null}
        presence={presence}
        notice={state.target === null ? state.notice : null}
        onDismissNotice={voice.dismissNotice}
        onJoin={() =>
          voice.join({
            serverId,
            serverName,
            channelId: channel.id,
            channelName: channel.name,
          })
        }
      />
    );
  }

  const participants = voiceParticipantsOf(state);
  const banner = !state.canSpeak ? VOICE_MODERATOR_MUTED : voice.mediaError;
  const ownAvatarUri = avatarUriOf(user);
  const layout = gridLayoutFor(
    participants.length,
    gridArea.width,
    gridArea.height,
  );
  return (
    <View className="flex-1">
      {banner ? (
        <View className="px-3 pt-3">
          <VoiceNotice message={banner} />
        </View>
      ) : null}
      <ScrollView
        className={cn("flex-1", state.status !== "connected" && "opacity-60")}
        contentContainerClassName="grow justify-center"
        contentContainerStyle={{ padding: GRID_PADDING }}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setGridArea((area) =>
            area.width === width && area.height === height
              ? area
              : { width, height },
          );
        }}
      >
        <View
          className="flex-row flex-wrap justify-center"
          style={{ gap: GRID_GAP }}
        >
          {gridArea.height === 0
            ? null
            : participants.map((participant) => (
                <View
                  key={participant.identity}
                  style={{ width: layout.cellWidth }}
                >
                  <VoiceParticipantTile
                    participant={participant}
                    avatarUri={participant.isLocal ? ownAvatarUri : null}
                    width={layout.cellWidth}
                    height={layout.cellHeight}
                    onToggleMutedForMe={
                      participant.isLocal
                        ? undefined
                        : () => voice.toggleMutedForMe(participant.identity)
                    }
                  />
                </View>
              ))}
        </View>
      </ScrollView>

      <VoiceControls
        muted={state.muted}
        canSpeak={state.canSpeak}
        bottomInset={bottomInset}
        onToggleMute={voice.toggleMute}
        onLeave={voice.leave}
      />
    </View>
  );
}

function VoiceLobby({
  channelName,
  canConnect,
  isCheckingAccess,
  isAvailable,
  isInAnotherChannel,
  presence,
  notice,
  onDismissNotice,
  onJoin,
}: {
  channelName: string;
  canConnect: boolean;
  isCheckingAccess: boolean;
  isAvailable: boolean;
  isInAnotherChannel: boolean;
  presence: readonly VoicePresenceParticipant[];
  notice: string | null;
  onDismissNotice: () => void;
  onJoin: () => void;
}) {
  const colors = useThemeColors();
  const isForbidden = !canConnect && !isCheckingAccess;
  const shown = presence.slice(0, LOBBY_MAX_AVATARS);
  const hidden = presence.length - shown.length;

  return (
    <View className="flex-1 items-center justify-center gap-5 px-7">
      <View
        className={cn(
          "w-16 h-16 rounded-2xl items-center justify-center",
          isForbidden ? "bg-surface-raised" : "bg-accent",
        )}
      >
        <Feather
          name={isForbidden ? "volume-x" : "volume-2"}
          size={28}
          color={isForbidden ? colors.danger : colors.onAccent}
        />
      </View>

      <View className="items-center gap-1.5">
        <Text className="text-[20px] font-bold text-content text-center">
          {channelName}
        </Text>
        <Text className="text-[15px] leading-[21px] text-content-muted text-center max-w-80">
          {isForbidden
            ? VOICE_CONNECT_FORBIDDEN
            : !isAvailable
              ? VOICE_UNAVAILABLE
              : presence.length === 0
                ? VOICE_CHANNEL_EMPTY
                : voicePresenceCount(presence.length)}
        </Text>
      </View>

      {presence.length > 0 ? (
        <View
          className="flex-row items-center"
          accessible
          accessibilityLabel={`${VOICE_IN_CHANNEL_LABEL}: ${presence
            .map((participant) => participant.name)
            .join(", ")}`}
        >
          {shown.map((participant, index) => (
            <View
              key={participant.participant_id}
              className={cn(
                "rounded-full border-2 border-surface",
                index > 0 && "-ml-2.5",
              )}
            >
              <Avatar name={participant.name} size={38} />
            </View>
          ))}
          {hidden > 0 ? (
            <View className="-ml-2.5 w-[42px] h-[42px] rounded-full border-2 border-surface bg-surface-raised items-center justify-center">
              <Text className="text-[12px] font-semibold text-content-muted">
                {`+${hidden}`}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {notice ? (
        <VoiceNotice message={notice} onDismiss={onDismissNotice} />
      ) : null}

      {canConnect && isAvailable ? (
        <TouchableOpacity
          onPress={onJoin}
          activeOpacity={0.8}
          className="flex-row items-center gap-2 rounded-xl bg-success px-6 py-3"
          accessibilityRole="button"
        >
          <Feather name="volume-2" size={17} color={colors.onAccent} />
          <Text className="text-[15px] font-semibold text-white">
            {isInAnotherChannel ? VOICE_SWITCH : VOICE_JOIN}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
