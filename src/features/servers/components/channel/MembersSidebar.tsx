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

import { getPublicUser } from "../../../auth/service";
import { env } from "../../../../lib/env";
import { colors } from "../../../../theme/colors";
import { OwnProfileModal } from "../../../profile/components/OwnProfileModal";
import { PublicProfileModal } from "../../../profile/components/PublicProfileModal";
import { listMembers } from "../../api";
import { ServerAvatar } from "../ServerAvatar";

interface ResolvedMember {
  userId: string;
  isOwner: boolean;
  name: string | null;
  avatarUrl: string | null;
  statusText: string | null;
  statusEmoji: string | null;
}

interface MembersSidebarProps {
  visible: boolean;
  serverId: string;
  currentUserId?: string | null;
  authToken?: string | null;
  onClose: () => void;
}

export function MembersSidebar({
  visible,
  serverId,
  currentUserId,
  authToken,
  onClose,
}: MembersSidebarProps) {
  const [members, setMembers] = useState<ResolvedMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOwnProfileVisible, setIsOwnProfileVisible] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [wasVisible, setWasVisible] = useState(visible);
  const insets = useSafeAreaInsets();

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setMembers([]);
      setIsLoading(true);
      setErrorMessage("");
    }
  }

  const fetchMembers = useCallback(() => {
    let cancelled = false;

    listMembers(serverId, { limit: 100 }).then((result) => {
      if (cancelled) return;
      setIsLoading(false);
      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }

      setMembers(
        result.members.map((m) => ({
          userId: m.user_id,
          isOwner: m.is_owner,
          name: null,
          avatarUrl: null,
          statusText: null,
          statusEmoji: null,
        })),
      );

      result.members.forEach((m) => {
        getPublicUser(m.user_id).then((profile) => {
          if (cancelled || !profile) return;
          setMembers((prev) =>
            prev.map((item) =>
              item.userId === m.user_id
                ? {
                    ...item,
                    name: profile.name,
                    avatarUrl: profile.avatar_url,
                    statusText: profile.status_text,
                    statusEmoji: profile.status_emoji,
                  }
                : item,
            ),
          );
        });
      });
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

  const owners = members.filter((m) => m.isOwner);
  const others = members.filter((m) => !m.isOwner);

  function handleSelectMember(member: ResolvedMember) {
    if (member.userId === currentUserId) {
      setIsOwnProfileVisible(true);
      return;
    }
    setViewingUserId(member.userId);
  }

  function renderMemberRow(member: ResolvedMember) {
    const avatarSrc = member.avatarUrl
      ? `${env.apiUrl}${member.avatarUrl}`
      : null;
    const isSelf = member.userId === currentUserId;

    return (
      <TouchableOpacity
        key={member.userId}
        style={styles.memberRow}
        activeOpacity={0.7}
        onPress={() => handleSelectMember(member)}
        accessibilityRole="button"
        accessibilityLabel={`Ver perfil de ${member.name ?? "usuario"}`}
      >
        <View style={styles.memberAvatarWrap}>
          <ServerAvatar
            name={member.name ?? "?"}
            uri={avatarSrc}
            size={36}
            borderRadius={18}
          />
          {isSelf ? <View style={styles.presenceDot} /> : null}
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName} numberOfLines={1}>
            {member.name ?? "Cargando..."}
            {isSelf ? <Text style={styles.selfTag}> (vos)</Text> : null}
          </Text>
          {member.statusText ? (
            <Text style={styles.memberStatus} numberOfLines={1}>
              {member.statusEmoji ? `${member.statusEmoji} ` : ""}
              {member.statusText}
            </Text>
          ) : null}
        </View>
        {member.isOwner ? (
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
        <View style={styles.overlayContainer} pointerEvents="box-none">
          <View style={styles.backdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

            <View style={[styles.panel, { paddingTop: insets.top + 14 }]}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Miembros</Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar lista de miembros"
                >
                  <Feather name="x" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {isLoading && members.length === 0 ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.accentBright}
                    style={styles.loadingIndicator}
                  />
                ) : errorMessage ? (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                ) : (
                  <>
                    {owners.length > 0 ? (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                          PROPIETARIO — {owners.length}
                        </Text>
                        {owners.map(renderMemberRow)}
                      </View>
                    ) : null}

                    {others.length > 0 ? (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                          MIEMBRO — {others.length}
                        </Text>
                        {others.map(renderMemberRow)}
                      </View>
                    ) : null}

                    {owners.length === 0 && others.length === 0 ? (
                      <Text style={styles.emptyText}>
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
        onClose={() => setIsOwnProfileVisible(false)}
      />

      <PublicProfileModal
        visible={viewingUserId !== null}
        userId={viewingUserId}
        authToken={authToken ?? null}
        onClose={() => setViewingUserId(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 50,
    elevation: 50,
  },
  backdrop: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  panel: {
    marginLeft: "auto",
    width: "72%",
    maxWidth: 280,
    backgroundColor: colors.bgChannels,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  closeButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 20,
  },
  loadingIndicator: {
    marginTop: 24,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 24,
    textAlign: "center",
  },
  emptyText: {
    color: colors.textSubtle,
    fontSize: 13,
    marginTop: 24,
    textAlign: "center",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.textSubtle,
    marginBottom: 2,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  memberAvatarWrap: {
    position: "relative",
  },
  presenceDot: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.bgChannels,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  selfTag: {
    fontSize: 13,
    fontWeight: "400",
    color: colors.textSubtle,
  },
  memberStatus: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: 1,
  },
});
