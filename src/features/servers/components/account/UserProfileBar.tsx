import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { resolveImageUri } from "../../../../lib/image-url";
import { useThemeColors, useTheme } from "../../../../theme/theme-context";
import { Button } from "../../../../components/ui/Button";
import { useAuth } from "../../../auth/auth-context";
import { OwnProfileModal } from "../../../profile/components/OwnProfileModal";
import { ServerAvatar } from "../ServerAvatar";
import { AppearanceSheet } from "./AppearanceSheet";

interface UserProfileBarProps {
  userName?: string | null;
  /** Servidor activo, para mostrar mis roles ahí en el perfil propio. */
  serverId?: string | null;
  onLogout: () => void;
}

export function UserProfileBar({
  userName,
  serverId,
  onLogout,
}: UserProfileBarProps) {
  const colors = useThemeColors();
  const { user } = useAuth();
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isAppearanceVisible, setIsAppearanceVisible] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const { theme, setTheme } = useTheme();
  const displayName = (user?.name ?? userName)?.trim() || "Mi cuenta";
  const avatarSrc = resolveImageUri(user?.avatar_url);
  const statusText = user?.status_text?.trim();

  function handleConfirmLogout() {
    setIsConfirmVisible(false);
    onLogout();
  }

  return (
    <>
      <View className="flex-row items-center gap-2 px-3.5 py-3.5 border-t border-t-line bg-surface-panel">
        <TouchableOpacity
          className="flex-1 flex-row items-center gap-2 min-w-0"
          onPress={() => setIsProfileVisible(true)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Ver mi perfil"
        >
          <View className="relative">
            <ServerAvatar name={displayName} uri={avatarSrc} size={44} />
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
          onPress={() => setIsMicMuted((prev) => !prev)}
          accessibilityRole="button"
          accessibilityLabel={
            isMicMuted ? "Activar micrófono" : "Silenciar micrófono"
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
          onPress={() => setIsAppearanceVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Apariencia"
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

      <AppearanceSheet
        visible={isAppearanceVisible}
        selected={theme}
        onSelect={setTheme}
        onClose={() => setIsAppearanceVisible(false)}
      />

      <Modal
        transparent
        visible={isConfirmVisible}
        animationType="fade"
        onRequestClose={() => setIsConfirmVisible(false)}
      >
        <View className="flex-1 bg-[rgba(0,0,0,0.65)] items-center justify-center p-4">
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsConfirmVisible(false)}
          />

          <View className="w-full max-w-80 rounded-[20px] border border-line-strong bg-surface-modal p-7 pt-6 items-center">
            <TouchableOpacity
              className="absolute top-3 right-3 w-8 h-8 rounded-2xl items-center justify-center bg-[rgba(255,255,255,0.06)]"
              onPress={() => setIsConfirmVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
            >
              <Feather name="x" size={16} color={colors.textMuted} />
            </TouchableOpacity>

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
          </View>
        </View>
      </Modal>
    </>
  );
}
