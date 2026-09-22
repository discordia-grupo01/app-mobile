import { type PublicUser, resolveImageUrl } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { env } from "../../../lib/env";
import { useThemeColors } from "../../../theme/theme-context";
import { ServerAvatar } from "../../servers/components/ServerAvatar";
import { MemberRoleBadges } from "../../roles/components/MemberRoleBadges";
import { getPublicProfile } from "../service";
import { MutualServersList } from "./MutualServersList";
import { ProfileBanner } from "./ProfileBanner";

interface PublicProfileModalProps {
  visible: boolean;
  userId: string | null;
  authToken: string | null;
  serverId: string;
  canManageRoles: boolean;
  onClose: () => void;
}

export function PublicProfileModal({
  visible,
  userId,
  authToken,
  serverId,
  canManageRoles,
  onClose,
}: PublicProfileModalProps) {
  const colors = useThemeColors();
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const key = `${visible}::${userId}`;
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    if (visible && userId) {
      setProfile(null);
      setErrorMessage("");
      setIsLoading(true);
    }
  }

  useEffect(() => {
    if (!visible || !userId) return;
    let cancelled = false;

    getPublicProfile(userId).then((result) => {
      if (cancelled) return;
      setIsLoading(false);
      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }
      setProfile(result.user);
    });

    return () => {
      cancelled = true;
    };
  }, [visible, userId]);

  const avatarSrc = resolveImageUrl(profile?.avatar_url, env.apiUrl);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-[rgba(0,0,0,0.65)] items-center justify-center p-4">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View className="w-full max-w-100 max-h-[90%] rounded-[20px] border border-line-strong bg-surface-modal overflow-hidden">
          <ProfileBanner onClose={onClose} dimmed={profile?.is_suspended} />

          {profile?.is_suspended ? (
            <View className="items-center gap-2.5 px-6 py-8">
              <View className="w-14 h-14 rounded-[28px] items-center justify-center bg-[rgba(224,82,82,0.1)] border border-[rgba(224,82,82,0.3)] mb-1">
                <Feather name="alert-circle" size={26} color={colors.danger} />
              </View>
              <Text className="text-[16px] font-bold text-content">
                Perfil no disponible
              </Text>
              <Text className="text-[13px] leading-[19px] text-content-subtle text-center max-w-60">
                Este usuario fue suspendido por el equipo de moderación y su
                perfil no es accesible.
              </Text>
            </View>
          ) : isLoading || !profile ? (
            <View className="py-10 items-center justify-center">
              {errorMessage ? (
                <Text className="text-danger text-[13px] text-center px-6">
                  {errorMessage}
                </Text>
              ) : (
                <ActivityIndicator size="small" color={colors.accentBright} />
              )}
            </View>
          ) : (
            <>
              <ScrollView
                contentContainerClassName="px-5.5 pt-17 pb-6.5"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View className="mb-4">
                  <Text
                    className="text-[18px] font-bold text-content"
                    numberOfLines={1}
                  >
                    {profile.name}
                  </Text>
                  {profile.status_text || profile.status_emoji ? (
                    <View className="self-start rounded-full bg-surface-input px-3 py-[5px] mt-2">
                      <Text
                        className="text-[12px] text-content-muted"
                        numberOfLines={1}
                      >
                        {profile.status_emoji ? `${profile.status_emoji} ` : ""}
                        {profile.status_text}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View className="h-px bg-line mb-4" />

                <View className="mb-4">
                  <Text className="text-[11px] font-bold tracking-[1.2px] text-content-subtle mb-1.5">
                    SOBRE MÍ
                  </Text>
                  <Text className="text-[13px] leading-[19px] text-content-muted">
                    {profile.description || "Sin descripción."}
                  </Text>
                </View>

                <View className="mb-4">
                  <MutualServersList
                    serverIds={profile.mutual_server_ids}
                    authToken={authToken}
                  />
                </View>

                <View className="mb-4">
                  <MemberRoleBadges
                    serverId={serverId}
                    userId={profile.id}
                    canManage={canManageRoles}
                  />
                </View>
              </ScrollView>

              <View className="absolute top-18 left-5.5 z-10">
                <View className="w-20 h-20">
                  <View className="absolute top-0 left-0 w-20 h-20 rounded-[40px] bg-surface-modal" />
                  <View className="absolute top-1 left-1 w-18 h-18">
                    <ServerAvatar
                      name={profile.name}
                      uri={avatarSrc}
                      size={72}
                      borderRadius={36}
                    />
                  </View>
                  <View className="absolute right-0 bottom-0 w-4.5 h-4.5 rounded-[9px] bg-success border-[3px] border-surface-modal" />
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
