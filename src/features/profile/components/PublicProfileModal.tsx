import { type PublicUser } from "@discordia/client-shared";

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

import { colors } from "../../../theme/colors";
import { resolveImageUri } from "../../../lib/image-url";
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

  const avatarSrc = resolveImageUri(profile?.avatar_url);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.card}>
          <ProfileBanner onClose={onClose} dimmed={profile?.is_suspended} />

          {profile?.is_suspended ? (
            <View style={styles.suspendedWrap}>
              <View style={styles.suspendedIcon}>
                <Feather name="alert-circle" size={26} color={colors.danger} />
              </View>
              <Text style={styles.suspendedTitle}>Perfil no disponible</Text>
              <Text style={styles.suspendedSubtitle}>
                Este usuario fue suspendido por el equipo de moderación y su
                perfil no es accesible.
              </Text>
            </View>
          ) : isLoading || !profile ? (
            <View style={styles.centerWrap}>
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : (
                <ActivityIndicator size="small" color={colors.accentBright} />
              )}
            </View>
          ) : (
            <>
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.section}>
                  <Text style={styles.name} numberOfLines={1}>
                    {profile.name}
                  </Text>
                  {profile.status_text || profile.status_emoji ? (
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText} numberOfLines={1}>
                        {profile.status_emoji ? `${profile.status_emoji} ` : ""}
                        {profile.status_text}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                  <Text style={styles.label}>SOBRE MÍ</Text>
                  <Text style={styles.description}>
                    {profile.description || "Sin descripción."}
                  </Text>
                </View>

                <View style={styles.section}>
                  <MutualServersList
                    serverIds={profile.mutual_server_ids}
                    authToken={authToken}
                  />
                </View>

                <View style={styles.section}>
                  <MemberRoleBadges
                    serverId={serverId}
                    userId={profile.id}
                    canManage={canManageRoles}
                  />
                </View>
              </ScrollView>

              <View style={styles.avatarWrap}>
                <View style={styles.avatarBox}>
                  <View style={styles.avatarRingBg} />
                  <View style={styles.avatarInner}>
                    <ServerAvatar
                      name={profile.name}
                      uri={avatarSrc}
                      size={72}
                      borderRadius={36}
                    />
                  </View>
                  <View style={styles.statusDot} />
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "90%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgModal,
    overflow: "hidden",
  },
  centerWrap: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 68,
    paddingBottom: 26,
  },
  avatarWrap: {
    position: "absolute",
    top: 72,
    left: 22,
    zIndex: 10,
  },
  avatarBox: {
    width: 80,
    height: 80,
  },
  avatarRingBg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bgModal,
  },
  avatarInner: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 72,
    height: 72,
  },
  statusDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.bgModal,
  },
  section: {
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.textSubtle,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  suspendedWrap: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  suspendedIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(224,82,82,0.1)",
    borderWidth: 1,
    borderColor: "rgba(224,82,82,0.3)",
    marginBottom: 4,
  },
  suspendedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  suspendedSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSubtle,
    textAlign: "center",
    maxWidth: 240,
  },
});
