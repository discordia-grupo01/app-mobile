import {
  type AccessRevokedReason,
  type Channel,
  isMemberMuted,
  type PublicUser,
  type Role,
  type ServerSummary,
  VOICE_CONNECTING,
  VOICE_RECONNECTING,
  voiceConnectedCount,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../features/auth/auth-context";
import { authorFromProfile } from "../features/messages/author";
import { ChannelChat } from "../features/messages/components/ChannelChat";
import { OwnProfileModal } from "../features/profile/components/OwnProfileModal";
import { PublicProfileModal } from "../features/profile/components/PublicProfileModal";
import { MembersSidebar } from "../features/servers/components/members/MembersSidebar";
import { VoiceChannelView } from "../features/voice/VoiceChannelView";
import { useServerVoice } from "../features/voice/useServerVoice";
import { cn } from "../lib/cn";
import { withAlpha } from "../lib/color";
import { useTheme, useThemeColors } from "../theme/theme-context";

interface ChannelScreenProps {
  channel: Channel;
  serverId: string;
  /** Nombre y canales del servidor, para la llamada de voz. */
  server: ServerSummary;
  authToken?: string | null;
  currentUserId?: string | null;
  /** Owner, o miembro con el permiso MANAGE_ROLES via algún rol. */
  canManageRoles?: boolean;
  /** Owner, o miembro con el permiso BAN_MEMBERS via algún rol. */
  canBanMembers?: boolean;
  /** Owner, o miembro con el permiso KICK_MEMBERS via algún rol. */
  canKickMembers?: boolean;
  /** MANAGE_MESSAGES a nivel servidor (silenciar no mira overrides de canal). */
  canMuteMembers?: boolean;
  canManageMessages?: boolean;
  canSendMessages?: boolean;
  canMentionEveryone?: boolean;
  canAddReactions?: boolean;
  canConnect?: boolean;
  isCheckingChannelPermissions?: boolean;
  serverRoles?: Role[];
  myRoleIds?: string[];
  onAccessRevoked?: (reason: AccessRevokedReason) => void;
  /** Abre un mensaje directo con alguien (desde su perfil). */
  onMessageUser?: (profile: PublicUser) => void;
  onBack: () => void;
}

export function ChannelScreen({
  channel,
  serverId,
  server,
  authToken,
  currentUserId,
  canManageRoles = false,
  canBanMembers = false,
  canKickMembers = false,
  canMuteMembers = false,
  canManageMessages = false,
  canSendMessages = false,
  canMentionEveryone = false,
  canAddReactions = false,
  canConnect = false,
  isCheckingChannelPermissions = false,
  serverRoles = [],
  myRoleIds = [],
  onAccessRevoked,
  onMessageUser,
  onBack,
}: ChannelScreenProps) {
  const colors = useThemeColors();
  const { theme, setTheme } = useTheme();
  const isText = channel.kind === "text";
  const insets = useSafeAreaInsets();
  const [isMembersVisible, setIsMembersVisible] = useState(false);
  const [isOwnProfileVisible, setIsOwnProfileVisible] = useState(false);
  const [viewing, setViewing] = useState<{
    userId: string;
    mutedUntil: string | null;
  } | null>(null);
  const { user } = useAuth();
  const currentAuthor = useMemo(
    () => (user ? authorFromProfile(user) : null),
    [user],
  );
  const voice = useServerVoice(server);
  const isInThisCall = voice.voiceChannelId === channel.id;
  const voicePillLabel =
    voice.status === "connected"
      ? voiceConnectedCount(voice.liveParticipants.length)
      : voice.status === "reconnecting"
        ? VOICE_RECONNECTING
        : VOICE_CONNECTING;
  const isModeratable =
    viewing !== null &&
    viewing.userId !== currentUserId &&
    viewing.userId !== server.owner_id;
  const pillColor =
    voice.status === "connected" ? colors.success : colors.highlight;

  return (
    <View className="flex-1 bg-surface">
      <View
        className="flex-row items-center gap-3 px-3 border-b border-b-line"
        style={{ paddingTop: insets.top, minHeight: insets.top + 60 }}
      >
        <TouchableOpacity
          onPress={onBack}
          className="w-8.5 h-8.5 items-center justify-center"
          accessibilityLabel="Volver"
        >
          <Feather name="arrow-left" size={22} color={colors.textMuted} />
        </TouchableOpacity>
        <Feather
          name={isText ? "hash" : "volume-2"}
          size={19}
          color={isInThisCall ? colors.success : colors.textSubtle}
        />
        <View className="flex-1 flex-row items-center gap-2 min-w-0">
          <Text
            className="shrink text-[17px] font-bold text-content"
            numberOfLines={1}
          >
            {channel.name}
          </Text>
          {isInThisCall ? (
            <View
              className="flex-row items-center gap-1.5 rounded-full border px-2 py-0.5"
              style={{
                backgroundColor: withAlpha(pillColor, 0.12),
                borderColor: withAlpha(pillColor, 0.25),
              }}
            >
              <View
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  voice.status === "connected" ? "bg-success" : "bg-highlight",
                )}
              />
              <Text
                className={cn(
                  "text-[12px] font-medium",
                  voice.status === "connected"
                    ? "text-success"
                    : "text-highlight",
                )}
                numberOfLines={1}
              >
                {voicePillLabel}
              </Text>
            </View>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-8.5 h-8.5 items-center justify-center"
          accessibilityLabel={
            theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
          }
          accessibilityRole="button"
        >
          <Feather
            name={theme === "dark" ? "sun" : "moon"}
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsMembersVisible(true)}
          className="w-8.5 h-8.5 items-center justify-center"
          accessibilityLabel="Ver miembros"
          accessibilityRole="button"
        >
          <Feather name="users" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <MembersSidebar
        visible={isMembersVisible}
        serverId={serverId}
        serverRoles={serverRoles}
        currentUserId={currentUserId}
        authToken={authToken}
        canManageRoles={canManageRoles}
        canBanMembers={canBanMembers}
        canKickMembers={canKickMembers}
        canMuteMembers={canMuteMembers}
        onMessageUser={onMessageUser}
        onClose={() => setIsMembersVisible(false)}
      />

      <OwnProfileModal
        visible={isOwnProfileVisible}
        serverId={serverId}
        onClose={() => setIsOwnProfileVisible(false)}
      />

      <PublicProfileModal
        visible={viewing !== null}
        userId={viewing?.userId ?? null}
        authToken={authToken ?? null}
        serverId={serverId}
        canManageRoles={canManageRoles}
        canBan={canBanMembers && isModeratable}
        canKick={canKickMembers && isModeratable}
        canMute={canMuteMembers && isModeratable}
        mutedUntil={viewing?.mutedUntil ?? null}
        canBlock={viewing !== null && viewing.userId !== currentUserId}
        onSendMessage={
          onMessageUser && viewing !== null && viewing.userId !== currentUserId
            ? (profile) => {
                setViewing(null);
                onMessageUser(profile);
              }
            : undefined
        }
        onClose={() => setViewing(null)}
      />

      {isText ? (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ChannelChat
            key={channel.id}
            serverId={serverId}
            channel={channel}
            currentAuthor={currentAuthor}
            serverRoles={serverRoles}
            myRoleIds={myRoleIds}
            canManageMessages={canManageMessages}
            canSendMessages={canSendMessages}
            canMentionEveryone={canMentionEveryone}
            canAddReactions={canAddReactions}
            isCheckingPermissions={isCheckingChannelPermissions}
            onAccessRevoked={onAccessRevoked}
            onOpenProfile={(userId, member) => {
              if (userId === currentUserId) {
                setIsOwnProfileVisible(true);
                return;
              }
              setViewing({
                userId,
                mutedUntil:
                  member && isMemberMuted(member)
                    ? (member.muted_until ?? null)
                    : null,
              });
            }}
          />
        </KeyboardAvoidingView>
      ) : (
        <VoiceChannelView
          channel={channel}
          serverId={serverId}
          serverName={server.name}
          canConnect={canConnect}
          isCheckingAccess={isCheckingChannelPermissions}
          presence={voice.presence[channel.id] ?? []}
          bottomInset={insets.bottom}
          isCovered={isMembersVisible}
        />
      )}
    </View>
  );
}
