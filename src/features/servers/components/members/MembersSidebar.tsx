import {
  displayNameOf,
  type Member,
  MEMBER_PAGE_LIMIT,
  resolveImageUrl,
} from "@discordia/client-shared";

import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useProfileFallback } from "../../../../hooks/useProfileFallback";
import { env } from "../../../../lib/env";
import { useThemeColors } from "../../../../theme/theme-context";
import { OwnProfileModal } from "../../../profile/components/OwnProfileModal";
import { PublicProfileModal } from "../../../profile/components/PublicProfileModal";
import { listMembers } from "../../api";
import { Avatar } from "../../../../components/ui/Avatar";

interface MembersSidebarProps {
  visible: boolean;
  serverId: string;
  currentUserId?: string | null;
  authToken?: string | null;
  /** Owner, o miembro con el permiso MANAGE_ROLES via algún rol. */
  canManageRoles?: boolean;
  /** Owner, o miembro con el permiso BAN_MEMBERS via algún rol. */
  canBanMembers?: boolean;
  /** Owner, o miembro con el permiso KICK_MEMBERS via algún rol. */
  canKickMembers?: boolean;
  onClose: () => void;
}

export function MembersSidebar({
  visible,
  serverId,
  currentUserId,
  authToken,
  canManageRoles = false,
  canBanMembers = false,
  canKickMembers = false,
  onClose,
}: MembersSidebarProps) {
  const colors = useThemeColors();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOwnProfileVisible, setIsOwnProfileVisible] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [wasVisible, setWasVisible] = useState(visible);
  const insets = useSafeAreaInsets();
  const resolvedMembers = useProfileFallback(members);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setMembers(null);
      setIsLoading(true);
      setErrorMessage("");
    }
  }

  const fetchMembers = useCallback(() => {
    let cancelled = false;

    listMembers(serverId, { limit: MEMBER_PAGE_LIMIT }).then((result) => {
      if (cancelled) return;
      setIsLoading(false);
      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }

      setMembers(result.members);
    });

    return () => {
      cancelled = true;
    };
  }, [serverId]);

  useEffect(() => {
    if (!visible) return;
    return fetchMembers();
  }, [visible, fetchMembers]);

  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onClose();
        return true;
      },
    );
    return () => subscription.remove();
  }, [visible, onClose]);

  const owners = (resolvedMembers ?? []).filter((m) => m.is_owner);
  const others = (resolvedMembers ?? []).filter((m) => !m.is_owner);
  const isModeratable =
    viewingUserId !== currentUserId &&
    !owners.some((owner) => owner.user_id === viewingUserId);
  const canBanViewed = canBanMembers && isModeratable;
  const canKickViewed = canKickMembers && isModeratable;

  function handleSelectMember(member: Member) {
    if (member.user_id === currentUserId) {
      setIsOwnProfileVisible(true);
      return;
    }
    setViewingUserId(member.user_id);
  }

  function renderMemberRow(member: Member) {
    const name = displayNameOf(member.profile);
    const avatarSrc = resolveImageUrl(member.profile?.avatar_url, env.apiUrl);
    const isSelf = member.user_id === currentUserId;

    return (
      <TouchableOpacity
        key={member.user_id}
        className="flex-row items-center gap-2.5"
        activeOpacity={0.7}
        onPress={() => handleSelectMember(member)}
        accessibilityRole="button"
        accessibilityLabel={`Ver perfil de ${name}`}
      >
        <View className="relative">
          <Avatar name={name} uri={avatarSrc} size={36} borderRadius={18} />
          {/* Estado de actividad mock ("en línea"): todavía no hay presencia
              real en identify-service */}
          <View className="absolute -right-[1px] -bottom-[1px] w-3 h-3 rounded-md bg-success border-2 border-surface-sunken" />
        </View>
        <View className="flex-1">
          <Text
            className="text-[14px] font-semibold text-content"
            numberOfLines={1}
          >
            {name}
            {isSelf ? (
              <Text className="text-[13px] font-normal text-content-subtle">
                {" "}
                (vos)
              </Text>
            ) : null}
          </Text>
          {member.profile?.status_text ? (
            <Text
              className="text-[12px] text-content-subtle mt-[1px]"
              numberOfLines={1}
            >
              {member.profile.status_emoji
                ? `${member.profile.status_emoji} `
                : ""}
              {member.profile.status_text}
            </Text>
          ) : null}
        </View>
        {member.is_owner ? (
          <MaterialCommunityIcons
            name="crown"
            size={18}
            color={colors.highlight}
          />
        ) : null}
      </TouchableOpacity>
    );
  }

  return (
    <>
      {visible ? (
        <View
          className="absolute top-0 right-0 bottom-0 left-0 z-50"
          style={styles.overlayContainer}
          pointerEvents="box-none"
        >
          <View className="flex-1 flex-row bg-[rgba(0,0,0,0.5)]">
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

            <View
              className="ml-auto w-[72%] max-w-70 bg-surface-sunken border-l border-l-line"
              style={{ paddingTop: insets.top + 14 }}
            >
              <View className="flex-row items-center justify-between px-4 pb-3">
                <Text className="text-[15px] font-bold text-content">
                  Miembros
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  className="w-7 h-7 items-center justify-center"
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar lista de miembros"
                >
                  <Feather name="x" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerClassName="px-4 pb-6 gap-5"
                showsVerticalScrollIndicator={false}
              >
                {isLoading && members === null ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.accentBright}
                    className="mt-6"
                  />
                ) : errorMessage ? (
                  <Text className="text-danger text-[13px] mt-6 text-center">
                    {errorMessage}
                  </Text>
                ) : (
                  <>
                    {owners.length > 0 ? (
                      <View className="gap-2.5">
                        <Text className="text-[11px] font-bold tracking-[1px] text-content-subtle mb-0.5">
                          PROPIETARIO — {owners.length}
                        </Text>
                        {owners.map(renderMemberRow)}
                      </View>
                    ) : null}

                    {others.length > 0 ? (
                      <View className="gap-2.5">
                        <Text className="text-[11px] font-bold tracking-[1px] text-content-subtle mb-0.5">
                          MIEMBRO — {others.length}
                        </Text>
                        {others.map(renderMemberRow)}
                      </View>
                    ) : null}

                    {owners.length === 0 && others.length === 0 ? (
                      <Text className="text-content-subtle text-[13px] mt-6 text-center">
                        Todavía no hay miembros para mostrar.
                      </Text>
                    ) : null}
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      ) : null}

      <OwnProfileModal
        visible={isOwnProfileVisible}
        serverId={serverId}
        onClose={() => setIsOwnProfileVisible(false)}
      />

      <PublicProfileModal
        visible={viewingUserId !== null}
        userId={viewingUserId}
        authToken={authToken ?? null}
        serverId={serverId}
        canManageRoles={canManageRoles}
        canBan={canBanViewed}
        canKick={canKickViewed}
        canBlock={viewingUserId !== currentUserId}
        onBanned={fetchMembers}
        onClose={() => setViewingUserId(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    elevation: 50,
  },
});
