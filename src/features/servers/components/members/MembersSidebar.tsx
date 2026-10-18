import {
  displayNameOf,
  isMemberMuted,
  type Member,
  type MemberPageQuery,
  MEMBERS_EMPTY_SEARCH,
  MEMBERS_LOADING_MORE,
  MEMBERS_SEARCH_LABEL,
  MEMBERS_SEARCH_PLACEHOLDER,
  resolveImageUrl,
} from "@discordia/client-shared";

import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchInput } from "../../../../components/ui/SearchInput";
import { useMemberScroll } from "../../../../hooks/useMemberScroll";
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
  /** Owner, o miembro con MANAGE_MESSAGES a nivel servidor: puede silenciar. */
  canMuteMembers?: boolean;
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
  canMuteMembers = false,
  onClose,
}: MembersSidebarProps) {
  const colors = useThemeColors();
  const [search, setSearch] = useState("");
  const [isOwnProfileVisible, setIsOwnProfileVisible] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [wasVisible, setWasVisible] = useState(visible);
  const insets = useSafeAreaInsets();

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setSearch("");
  }

  const fetchPage = useCallback(
    (query: MemberPageQuery) => listMembers(serverId, query),
    [serverId],
  );
  const {
    members: resolvedMembers,
    total,
    isSearching,
    isLoadingMore,
    errorMessage,
    loadMore,
    reload,
    // El panel se monta siempre: pide al abrirse, y de nuevo cada vez que se
    // reabre, asi muestra a quien haya entrado o salido mientras estaba cerrado.
  } = useMemberScroll({ fetchPage, search, enabled: visible });

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
  // Filas de la lista: miembros con su encabezado de seccion intercalado.
  type Row =
    | { kind: "header"; key: string; label: string }
    | { kind: "member"; key: string; member: Member };
  const rows: Row[] = isSearching
    ? [
        { kind: "header", key: "h-results", label: `RESULTADOS — ${total}` },
        ...(resolvedMembers ?? []).map((member): Row => ({
          kind: "member",
          key: member.user_id,
          member,
        })),
      ]
    : [
        ...(owners.length > 0
          ? [
              {
                kind: "header",
                key: "h-owner",
                label: `PROPIETARIO — ${owners.length}`,
              } as Row,
            ]
          : []),
        ...owners.map((member): Row => ({
          kind: "member",
          key: member.user_id,
          member,
        })),
        ...(others.length > 0
          ? [
              {
                kind: "header",
                key: "h-members",
                label: `MIEMBRO — ${Math.max(total - 1, others.length)}`,
              } as Row,
            ]
          : []),
        ...others.map((member): Row => ({
          kind: "member",
          key: member.user_id,
          member,
        })),
      ];
  const isModeratable =
    viewingUserId !== currentUserId &&
    !owners.some((owner) => owner.user_id === viewingUserId);
  const canBanViewed = canBanMembers && isModeratable;
  const canKickViewed = canKickMembers && isModeratable;
  const canMuteViewed = canMuteMembers && isModeratable;
  const viewedMember = (resolvedMembers ?? []).find(
    (m) => m.user_id === viewingUserId,
  );

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
        {isMemberMuted(member) ? (
          <Feather
            name="mic-off"
            size={15}
            color={colors.danger}
            accessibilityLabel="Silenciado"
          />
        ) : null}
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

              <View className="px-4 pb-3">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  label={MEMBERS_SEARCH_LABEL}
                  placeholder={MEMBERS_SEARCH_PLACEHOLDER}
                />
              </View>

              {resolvedMembers === null ? (
                errorMessage ? (
                  <Text className="text-danger text-[13px] mt-6 text-center px-4">
                    {errorMessage}
                  </Text>
                ) : (
                  <ActivityIndicator
                    size="small"
                    color={colors.accentBright}
                    className="mt-6"
                  />
                )
              ) : (
                <FlatList
                  data={rows}
                  keyExtractor={(row) => row.key}
                  renderItem={({ item: row }) =>
                    row.kind === "header" ? (
                      <Text className="text-[11px] font-bold tracking-[1px] text-content-subtle mt-2.5">
                        {row.label}
                      </Text>
                    ) : (
                      renderMemberRow(row.member)
                    )
                  }
                  contentContainerClassName="px-4 pb-6 gap-2.5"
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.5}
                  ListEmptyComponent={
                    <Text className="text-content-subtle text-[13px] mt-6 text-center">
                      {isSearching
                        ? MEMBERS_EMPTY_SEARCH
                        : "Todavía no hay miembros para mostrar."}
                    </Text>
                  }
                  ListFooterComponent={
                    isLoadingMore ? (
                      <Text className="text-content-subtle text-[12px] mt-1">
                        {MEMBERS_LOADING_MORE}
                      </Text>
                    ) : errorMessage ? (
                      <Text className="text-danger text-[12px] mt-1">
                        {errorMessage}
                      </Text>
                    ) : null
                  }
                />
              )}
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
        canMute={canMuteViewed}
        mutedUntil={viewedMember?.muted_until ?? null}
        onMuteChanged={reload}
        canBlock={viewingUserId !== currentUserId}
        onBanned={reload}
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
