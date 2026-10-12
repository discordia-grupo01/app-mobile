import type {
  AccessRevokedReason,
  Channel,
  Role,
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
import { MembersSidebar } from "../features/servers/components/members/MembersSidebar";
import { VoiceChannelPlaceholder } from "../features/channels/components/voice/VoiceChannelPlaceholder";
import { useTheme, useThemeColors } from "../theme/theme-context";

interface ChannelScreenProps {
  channel: Channel;
  serverId: string;
  authToken?: string | null;
  currentUserId?: string | null;
  /** Owner, o miembro con el permiso MANAGE_ROLES via algún rol. */
  canManageRoles?: boolean;
  /** Owner, o miembro con el permiso BAN_MEMBERS via algún rol. */
  canBanMembers?: boolean;
  canManageMessages?: boolean;
  canSendMessages?: boolean;
  canMentionEveryone?: boolean;
  canAddReactions?: boolean;
  canConnect?: boolean;
  serverRoles?: Role[];
  myRoleIds?: string[];
  onAccessRevoked?: (reason: AccessRevokedReason) => void;
  onBack: () => void;
}

export function ChannelScreen({
  channel,
  serverId,
  authToken,
  currentUserId,
  canManageRoles = false,
  canBanMembers = false,
  canManageMessages = false,
  canSendMessages = false,
  canMentionEveryone = false,
  canAddReactions = false,
  canConnect = false,
  serverRoles = [],
  myRoleIds = [],
  onAccessRevoked,
  onBack,
}: ChannelScreenProps) {
  const colors = useThemeColors();
  const { theme, setTheme } = useTheme();
  const isText = channel.kind === "text";
  const insets = useSafeAreaInsets();
  const [isMembersVisible, setIsMembersVisible] = useState(false);
  const { user } = useAuth();
  const currentAuthor = useMemo(
    () => (user ? authorFromProfile(user) : null),
    [user],
  );

  return (
    <View className="flex-1 bg-surface">
      <View
        className="flex-row items-center gap-3 min-h-15 px-3 border-b border-b-line"
        style={{ paddingTop: insets.top }}
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
          color={colors.textSubtle}
        />
        <Text
          className="flex-1 text-[17px] font-bold text-content"
          numberOfLines={1}
        >
          {channel.name}
        </Text>
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
        currentUserId={currentUserId}
        authToken={authToken}
        canManageRoles={canManageRoles}
        canBanMembers={canBanMembers}
        onClose={() => setIsMembersVisible(false)}
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
            onAccessRevoked={onAccessRevoked}
          />
        </KeyboardAvoidingView>
      ) : (
        <VoiceChannelPlaceholder name={channel.name} canConnect={canConnect} />
      )}
    </View>
  );
}
