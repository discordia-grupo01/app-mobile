import {
  ACTIVITY_STATUS_LABEL,
  resolveImageUrl,
  VOICE_MODERATOR_MUTED,
  VOICE_MUTE_LABEL,
  VOICE_UNMUTE_LABEL,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { env } from "../../../../lib/env";
import { useThemeColors, useTheme } from "../../../../theme/theme-context";
import { useAuth } from "../../../auth/auth-context";
import { OwnProfileModal } from "../../../profile/components/OwnProfileModal";
import { ActivityStatusDot } from "../../../profile/components/ActivityStatusDot";
import { usePresenceOf } from "../../../presence/PresenceContext";
import { Avatar } from "../../../../components/ui/Avatar";
import { NotificationsButton } from "../../../notifications/components/center/NotificationsButton";
import { AccountSettingsSheet } from "./AccountSettingsSheet";
import { PrivateCallStrip } from "../../../private-call/components/PrivateCallStrip";
import { VoiceConnectedStrip } from "../../../voice/components/sidebar/VoiceConnectedStrip";
import { useOptionalVoiceSession } from "../../../voice/voice-session-context";

interface UserProfileBarProps {
  userName?: string | null;
  onLogout: () => void;
}

export function UserProfileBar({ userName, onLogout }: UserProfileBarProps) {
  const colors = useThemeColors();
  const { user, isPinEnabled } = useAuth();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const voice = useOptionalVoiceSession();
  const isMicMuted = voice?.state.muted ?? false;
  const canSpeak = voice?.state.canSpeak ?? true;
  const [isDeafened, setIsDeafened] = useState(false);
  const { theme, setTheme } = useTheme();

  const displayName = (user?.name ?? userName)?.trim() || "Mi cuenta";
  const avatarSrc = resolveImageUrl(user?.avatar_url, env.apiUrl);
  const statusText = user?.status_text?.trim();
  const activityStatus = usePresenceOf(user?.id);

  return (
    <>
      <VoiceConnectedStrip />
      <PrivateCallStrip />
      <View className="flex-row items-center gap-2 px-3.5 py-3.5 border-t border-t-line bg-surface-panel">
        <TouchableOpacity
          className="flex-1 flex-row items-center gap-2 min-w-0"
          onPress={() => setIsProfileVisible(true)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Ver mi perfil"
        >
          <View className="relative">
            <Avatar name={displayName} uri={avatarSrc} size={44} />
            <ActivityStatusDot
              status={activityStatus}
              size={13}
              className="absolute -right-[1px] -bottom-[1px] border-surface-panel"
            />
          </View>
          <View className="flex-1 mr-1">
            <Text
              className="text-[16px] font-bold text-content"
              numberOfLines={1}
            >
              {displayName}
            </Text>
            <Text className="text-[13px] text-content-subtle" numberOfLines={1}>
              {statusText || ACTIVITY_STATUS_LABEL[activityStatus]}
            </Text>
          </View>
        </TouchableOpacity>

        <View className="shrink-0 flex-row items-center gap-0.5">
          <NotificationsButton />

          <TouchableOpacity
            className="w-9 h-9 rounded-[10px] items-center justify-center"
            onPress={voice?.toggleMute}
            disabled={!canSpeak}
            style={{ opacity: canSpeak ? 1 : 0.5 }}
            accessibilityRole="button"
            accessibilityState={{ selected: isMicMuted, disabled: !canSpeak }}
            accessibilityLabel={
              !canSpeak
                ? VOICE_MODERATOR_MUTED
                : isMicMuted
                  ? VOICE_UNMUTE_LABEL
                  : VOICE_MUTE_LABEL
            }
          >
            <Feather
              name={isMicMuted ? "mic-off" : "mic"}
              size={19}
              color={isMicMuted ? colors.danger : colors.textSubtle}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-9 h-9 rounded-[10px] items-center justify-center"
            onPress={() => setIsDeafened((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={
              isDeafened ? "Activar audio" : "Silenciar audio (ensordecer)"
            }
          >
            <Feather
              name="headphones"
              size={19}
              color={isDeafened ? colors.danger : colors.textSubtle}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-9 h-9 rounded-[10px] items-center justify-center"
            onPress={() => setIsSettingsVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Configuración"
          >
            <Feather name="settings" size={21} color={colors.textSubtle} />
          </TouchableOpacity>
        </View>
      </View>

      <OwnProfileModal
        visible={isProfileVisible}
        onClose={() => setIsProfileVisible(false)}
      />

      <AccountSettingsSheet
        visible={isSettingsVisible}
        isPinEnabled={isPinEnabled}
        onClose={() => setIsSettingsVisible(false)}
        onLogout={onLogout}
        theme={theme}
        onSelectTheme={setTheme}
      />
    </>
  );
}
