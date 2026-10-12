import {
  resolveImageUrl,
  VOICE_MUTE_LABEL,
  VOICE_UNMUTE_LABEL,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { env } from "../../../../lib/env";
import { useThemeColors, useTheme } from "../../../../theme/theme-context";
import { Button } from "../../../../components/ui/Button";
import { useAuth } from "../../../auth/auth-context";
import { OwnProfileModal } from "../../../profile/components/OwnProfileModal";
import { Avatar } from "../../../../components/ui/Avatar";
import { AccountSettingsSheet } from "./AccountSettingsSheet";
import { ModalShell } from "../../../../components/ui/ModalShell";
import { ModalCloseButton } from "../../../../components/ui/ModalCloseButton";
import { VoiceConnectedStrip } from "../../../voice/components/sidebar/VoiceConnectedStrip";
import { useOptionalVoiceSession } from "../../../voice/voice-session-context";

interface UserProfileBarProps {
  userName?: string | null;
  serverId?: string | null;
  onLogout: () => void;
}

export function UserProfileBar({
  userName,
  serverId,
  onLogout,
}: UserProfileBarProps) {
  const colors = useThemeColors();
  const { user, isPinEnabled } = useAuth();
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const voice = useOptionalVoiceSession();
  const isMicMuted = voice?.state.muted ?? false;
  const [isDeafened, setIsDeafened] = useState(false);
  const { theme, setTheme } = useTheme();

  const displayName = (user?.name ?? userName)?.trim() || "Mi cuenta";
  const avatarSrc = resolveImageUrl(user?.avatar_url, env.apiUrl);
  const statusText = user?.status_text?.trim();

  function handleConfirmLogout() {
    setIsConfirmVisible(false);
    onLogout();
  }

  return (
    <>
      <VoiceConnectedStrip />
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
            <View className="absolute -right-[1px] -bottom-[1px] w-[13px] h-[13px] rounded-[7px] bg-success border-2 border-surface-panel" />
          </View>
          <View className="flex-1 mr-1">
            <Text
              className="text-[16px] font-bold text-content"
              numberOfLines={1}
            >
              {displayName}
            </Text>
            <Text className="text-[13px] text-content-subtle" numberOfLines={1}>
              {statusText || "En línea"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-10 h-10 rounded-[10px] items-center justify-center"
          onPress={voice?.toggleMute}
          accessibilityRole="button"
          accessibilityState={{ selected: isMicMuted }}
          accessibilityLabel={
            isMicMuted ? VOICE_UNMUTE_LABEL : VOICE_MUTE_LABEL
          }
        >
          <Feather
            name={isMicMuted ? "mic-off" : "mic"}
            size={19}
            color={isMicMuted ? colors.danger : colors.textSubtle}
          />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-10 h-10 rounded-[10px] items-center justify-center"
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
          className="w-10 h-10 rounded-[10px] items-center justify-center"
          onPress={() => setIsSettingsVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Configuración"
        >
          <Feather name="settings" size={21} color={colors.textSubtle} />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-10 h-10 rounded-[10px] items-center justify-center"
          onPress={() => setIsConfirmVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
        >
          <Feather name="log-out" size={21} color={colors.textSubtle} />
        </TouchableOpacity>
      </View>

      <OwnProfileModal
        visible={isProfileVisible}
        serverId={serverId}
        onClose={() => setIsProfileVisible(false)}
      />

      <AccountSettingsSheet
        visible={isSettingsVisible}
        isPinEnabled={isPinEnabled}
        onClose={() => setIsSettingsVisible(false)}
        theme={theme}
        onSelectTheme={setTheme}
      />

      <ModalShell
        visible={isConfirmVisible}
        onClose={() => setIsConfirmVisible(false)}
        className="max-w-80 p-7 pt-6 items-center"
      >
        <ModalCloseButton
          variant="subtle"
          onPress={() => setIsConfirmVisible(false)}
        />

        <View className="w-16 h-16 rounded-[18px] items-center justify-center bg-[rgba(224,82,82,0.14)] mt-2 mb-5">
          <Feather name="log-out" size={26} color={colors.danger} />
        </View>
        <Text className="text-[19px] font-bold text-content">
          ¿Cerrar sesión?
        </Text>
        <Text className="text-[14px] leading-5 text-content-muted text-center mt-2.5 mb-6.5">
          Vas a salir de tu cuenta. Podés volver a iniciar sesión cuando
          quieras.
        </Text>

        <View className="flex-col gap-2.5 w-full">
          <Button
            title="Cerrar sesión"
            variant="danger"
            onPress={handleConfirmLogout}
          />
          <Button
            title="Cancelar"
            variant="secondary"
            onPress={() => setIsConfirmVisible(false)}
          />
        </View>
      </ModalShell>
    </>
  );
}
