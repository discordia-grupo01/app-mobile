import {
  isMemberMuted,
  mutedUntilLabel,
  type PublicUser,
  unmuteSuccessNotice,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { avatarUriOf } from "../../../lib/userProfile";
import { BanMemberModal } from "../../bans/components/BanMemberModal";
import { unmuteMember } from "../../moderation/api";
import { KickMemberModal } from "../../moderation/components/KickMemberModal";
import { MuteMemberModal } from "../../moderation/components/MuteMemberModal";
import { useThemeColors } from "../../../theme/theme-context";
import { Avatar } from "../../../components/ui/Avatar";
import { MemberRoleBadges } from "../../roles/components/MemberRoleBadges";
import { getPublicProfile } from "../service";
import { MutualServersList } from "./MutualServersList";
import { ProfileBanner } from "./ProfileBanner";
import { useBlockedUsersContext } from "../../blocks/blocked-users-context";
import { BlockUserModal } from "./BlockUserModal";
import { MemberActionsSheet } from "./MemberActionsSheet";
import { ModalShell } from "../../../components/ui/ModalShell";

interface PublicProfileModalProps {
  visible: boolean;
  userId: string | null;
  authToken?: string | null;
  /** Sin servidor (perfil abierto desde un mensaje directo) no hay roles que mostrar. */
  serverId?: string;
  canManageRoles?: boolean;
  canBan?: boolean;
  /** Puede expulsar (permiso) y el perfil no es el propio ni el del owner. */
  canKick?: boolean;
  /** Puede silenciar (`MANAGE_MESSAGES`) y el perfil no es el propio ni el del owner. */
  canMute?: boolean;
  /** Hasta cuando esta silenciado (de la lista de miembros); `null` si no lo esta. */
  mutedUntil?: string | null;
  /** Se dispara al silenciar o quitar el silencio, para refrescar la lista. */
  onMuteChanged?: () => void;
  canBlock?: boolean;
  /** Se dispara al banear o expulsar: el miembro ya no esta en el servidor. */
  onBanned?: () => void;
  onClose: () => void;
}

export function PublicProfileModal({
  visible,
  userId,
  authToken,
  serverId,
  canManageRoles = false,
  canBan = false,
  canKick = false,
  canMute = false,
  mutedUntil = null,
  onMuteChanged,
  canBlock = false,
  onBanned,
  onClose,
}: PublicProfileModalProps) {
  const colors = useThemeColors();
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBanOpen, setIsBanOpen] = useState(false);
  const [isKickOpen, setIsKickOpen] = useState(false);
  const [isMuteOpen, setIsMuteOpen] = useState(false);
  const [isUnmuting, setIsUnmuting] = useState(false);
  /** Arranca con lo que dice la lista y se actualiza al silenciar o quitar. */
  const [currentMutedUntil, setCurrentMutedUntil] = useState(mutedUntil);
  const [wasBanned, setWasBanned] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const { blockedIds, blockUser, unblockUser } = useBlockedUsersContext();

  const key = `${visible}::${userId}`;
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    setCurrentMutedUntil(mutedUntil);
    if (visible && userId) {
      setProfile(null);
      setErrorMessage("");
      setIsLoading(true);
      setIsBanOpen(false);
      setIsBlockOpen(false);
      setIsActionsOpen(false);
      setWasBanned(false);
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

  const avatarSrc = avatarUriOf(profile);

  function handleBanClosed() {
    setIsBanOpen(false);
    setIsKickOpen(false);
    if (wasBanned) onClose();
  }

  async function handleUnmute() {
    if (!profile || !serverId) return;
    setIsUnmuting(true);
    const result = await unmuteMember(serverId, profile.id);
    setIsUnmuting(false);
    if (!result.ok) {
      Alert.alert(result.message);
      return;
    }
    setCurrentMutedUntil(null);
    onMuteChanged?.();
    Alert.alert(unmuteSuccessNotice(profile.name));
  }

  function handleMuted(untilAt: string) {
    setCurrentMutedUntil(untilAt);
    onMuteChanged?.();
  }

  function handleBanned() {
    setWasBanned(true);
    onBanned?.();
  }

  const isMuted = isMemberMuted({ muted_until: currentMutedUntil });
  const hasModeratorActions =
    Boolean(serverId) && (canBan || canKick || canMute);
  const hasMemberActions =
    Boolean(profile) &&
    !profile?.is_suspended &&
    (hasModeratorActions || canBlock);

  return (
    <ModalShell visible={visible} onClose={onClose} className="max-w-100">
      <ProfileBanner
        onClose={onClose}
        dimmed={profile?.is_suspended}
        action={
          hasMemberActions ? (
            <TouchableOpacity
              onPress={() => setIsActionsOpen(true)}
              disabled={isUnmuting}
              className="h-7.5 w-7.5 items-center justify-center rounded-full bg-[rgba(0,0,0,0.3)]"
              accessibilityRole="button"
              accessibilityLabel="Más acciones"
              accessibilityState={{ busy: isUnmuting }}
            >
              {isUnmuting ? (
                <ActivityIndicator
                  size="small"
                  color="rgba(255,255,255,0.85)"
                />
              ) : (
                <Feather
                  name="more-vertical"
                  size={14}
                  color="rgba(255,255,255,0.85)"
                />
              )}
            </TouchableOpacity>
          ) : undefined
        }
      />

      {profile?.is_suspended ? (
        <View className="items-center gap-2.5 px-6 py-8">
          <View className="w-14 h-14 rounded-[28px] items-center justify-center bg-[rgba(224,82,82,0.1)] border border-[rgba(224,82,82,0.3)] mb-1">
            <Feather name="alert-circle" size={26} color={colors.danger} />
          </View>
          <Text className="text-[16px] font-bold text-content">
            Perfil no disponible
          </Text>
          <Text className="text-[13px] leading-[19px] text-content-subtle text-center max-w-60">
            Este usuario fue suspendido por el equipo de moderación y su perfil
            no es accesible.
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
              {isMuted && currentMutedUntil ? (
                <View className="mt-1 flex-row items-center gap-1.5">
                  <Feather name="mic-off" size={12} color={colors.danger} />
                  <Text className="text-[12px] font-semibold text-danger">
                    {mutedUntilLabel(currentMutedUntil)}
                  </Text>
                </View>
              ) : null}
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
              <MutualServersList serverIds={profile.mutual_server_ids} />
            </View>

            {serverId ? (
              <MemberRoleBadges
                serverId={serverId}
                userId={profile.id}
                canManage={canManageRoles}
              />
            ) : null}
          </ScrollView>

          <View className="absolute top-18 left-5.5 z-10">
            <View className="w-20 h-20">
              <View className="absolute top-0 left-0 w-20 h-20 rounded-[40px] bg-surface-modal" />
              <View className="absolute top-1 left-1 w-18 h-18">
                <Avatar
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

      {profile ? (
        <MemberActionsSheet
          visible={isActionsOpen}
          memberName={profile.name}
          onUnmute={
            hasModeratorActions && canMute && isMuted
              ? () => void handleUnmute()
              : undefined
          }
          onMute={
            hasModeratorActions && canMute && !isMuted
              ? () => setIsMuteOpen(true)
              : undefined
          }
          onKick={
            hasModeratorActions && canKick
              ? () => setIsKickOpen(true)
              : undefined
          }
          onBan={
            hasModeratorActions && canBan ? () => setIsBanOpen(true) : undefined
          }
          onToggleBlock={canBlock ? () => setIsBlockOpen(true) : undefined}
          isBlocked={blockedIds.has(profile.id)}
          onClose={() => setIsActionsOpen(false)}
        />
      ) : null}

      {isBlockOpen && profile ? (
        <BlockUserModal
          visible
          userName={profile.name}
          isBlocked={blockedIds.has(profile.id)}
          onConfirm={() =>
            blockedIds.has(profile.id)
              ? unblockUser(profile.id)
              : blockUser(profile.id)
          }
          onClose={() => setIsBlockOpen(false)}
        />
      ) : null}

      {isMuteOpen && profile && serverId ? (
        <MuteMemberModal
          serverId={serverId}
          target={{
            userId: profile.id,
            name: profile.name,
            avatarUri: avatarUriOf(profile),
          }}
          onClose={() => setIsMuteOpen(false)}
          onMuted={handleMuted}
        />
      ) : null}

      {isKickOpen && profile && serverId ? (
        <KickMemberModal
          serverId={serverId}
          target={{
            userId: profile.id,
            name: profile.name,
            avatarUri: avatarUriOf(profile),
          }}
          onClose={handleBanClosed}
          onKicked={handleBanned}
        />
      ) : null}

      {isBanOpen && profile && serverId ? (
        <BanMemberModal
          serverId={serverId}
          target={{
            userId: profile.id,
            name: profile.name,
            avatarUri: avatarUriOf(profile),
          }}
          onClose={handleBanClosed}
          onBanned={handleBanned}
        />
      ) : null}
    </ModalShell>
  );
}
