import {
  BANS_TITLE,
  type Category,
  type Channel,
  channelHasNotifications,
  channelsOfCategory,
  type DeleteServerResult,
  isChannelMuted,
  isUnassignedCategory,
  type LeaveServerResult,
  NOTIFICATION_SETTINGS_MENU_LABEL,
  type OwnershipTransfer,
  type Role,
  type ServerSummary,
  sortByPosition,
  topLevelChannels,
  visibleCategories,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  type GestureResponderHandlers,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { ChannelOptionsSheet } from "../features/channels/components/list/ChannelOptionsSheet";
import {
  ChannelDragProvider,
  ChannelDropZone,
} from "../features/channels/components/list/ChannelDragContext";
import { CreateCategoryModal } from "../features/servers/components/category/CreateCategoryModal";
import { DraggableCategoryList } from "../features/servers/components/category/DraggableCategoryList";
import { CreateChannelModal } from "../features/channels/components/create/CreateChannelModal";
import { DeleteChannelModal } from "../features/channels/components/delete/DeleteChannelModal";
import { ChannelRow } from "../features/channels/components/list/ChannelRow";
import { NotificationSettingsSheet } from "../features/notifications/components/settings/NotificationSettingsSheet";
import { useOptionalNotificationSettings } from "../features/notifications/NotificationSettingsContext";
import type { NotificationTarget } from "../features/notifications/components/settings/useNotificationTarget";
import {
  DRAG_ROW_HEIGHT,
  DraggableChannelList,
} from "../features/channels/components/list/DraggableChannelList";
import {
  ChannelSettingsModal,
  type ChannelSettingsSection,
} from "../features/channels/ChannelSettingsModal";
import { InviteLinkModal } from "../features/servers/components/server/InviteLinkModal";
import { LeaveServerModal } from "../features/servers/components/server/LeaveServerModal";
import { ServerSettingsModal } from "../features/servers/components/server/settings/ServerSettingsModal";
import { TransferOwnershipModal } from "../features/servers/components/server/TransferOwnershipModal";
import { BanIcon } from "../features/bans/components/BanIcon";
import { BansModal } from "../features/bans/components/BansModal";
import { RolesModal } from "../features/roles/RolesModal";
import { ServerMenuItem } from "../features/servers/components/server/ServerMenuItem";
import { ServerBanner } from "../features/servers/components/ServerBanner";
import { ServerRail } from "../features/servers/components/rail/ServerRail";
import { UserProfileBar } from "../features/servers/components/account/UserProfileBar";
import { voiceParticipantsHeight } from "../features/voice/components/sidebar/VoiceChannelParticipants";
import { useServerVoice } from "../features/voice/useServerVoice";
import { useAuth } from "../features/auth/auth-context";
import {
  getPendingOwnershipTransfer,
  moveChannelToCategory,
  reorderCategories,
  reorderChannels,
  resolveServerBannerUrl,
} from "../features/servers/api";
import { useThemeColors } from "../theme/theme-context";

const HEADER_HEIGHT = 52;
const BANNER_HEIGHT = 88;
const UNCATEGORIZED_KEY = "none";
const SECTION_GAP = 12;

interface ServerChannelsScreenProps {
  server: ServerSummary;
  servers: ServerSummary[];
  userName?: string | null;
  isOwner?: boolean;
  myRoles?: Role[];
  serverRoles?: Role[];
  canManageChannels?: boolean;
  canManageRoles?: boolean;
  canManageServer?: boolean;
  canManageMessages?: boolean;
  canBanMembers?: boolean;
  canInvite?: boolean;
  onPermissionsChanged?: () => void;
  onChannelPermissionsSaved?: () => void;
  onSelectChannel: (channelId: string) => void;
  onOpenDirectMessages: () => void;
  unreadDmCount?: number;
  /** Menciones sin leer por canal y por servidor. */
  unreadMentionsByChannel?: Record<string, number>;
  unreadMentionsByServer?: Record<string, number>;
  onSwitchServer: (serverId: string) => void;
  onAddServer: () => void;
  onLogout: () => void;
  onLeaveServer: (serverId: string) => Promise<LeaveServerResult>;
  onDeleteServer: (
    serverId: string,
    confirmName: string,
  ) => Promise<DeleteServerResult>;
  onServerUpdated: (server: ServerSummary) => void;
}

export function ServerChannelsScreen({
  server,
  servers,
  userName,
  isOwner = false,
  myRoles = [],
  serverRoles = [],
  canManageChannels = false,
  canManageRoles = false,
  canManageServer = false,
  canManageMessages = false,
  canBanMembers = false,
  canInvite = false,
  onPermissionsChanged,
  onChannelPermissionsSaved,
  onSelectChannel,
  onOpenDirectMessages,
  unreadDmCount,
  unreadMentionsByChannel = {},
  unreadMentionsByServer = {},
  onSwitchServer,
  onAddServer,
  onLogout,
  onLeaveServer,
  onDeleteServer,
  onServerUpdated,
}: ServerChannelsScreenProps) {
  const colors = useThemeColors();
  const { user } = useAuth();
  const currentUserId = user ? String(user.id) : null;
  const voice = useServerVoice(server);
  const [expandedVoiceChannels, setExpandedVoiceChannels] = useState<
    ReadonlySet<string>
  >(new Set());

  function toggleVoiceExpanded(channelId: string) {
    setExpandedVoiceChannels((current) => {
      const next = new Set(current);
      if (next.has(channelId)) next.delete(channelId);
      else next.add(channelId);
      return next;
    });
  }

  function voicePropsOf(channel: Channel) {
    return {
      isVoiceConnected: channel.id === voice.voiceChannelId,
      callStartedAt:
        channel.kind === "voice"
          ? voice.callStartsByChannel[channel.id]
          : undefined,
      voiceParticipants:
        channel.kind === "voice" ? voice.participantsFor(channel.id) : [],
      isVoiceExpanded: expandedVoiceChannels.has(channel.id),
      onToggleVoiceExpanded: () => toggleVoiceExpanded(channel.id),
    };
  }

  function rowHeightOf(channel: Channel): number {
    const { voiceParticipants, isVoiceExpanded } = voicePropsOf(channel);
    return (
      DRAG_ROW_HEIGHT +
      voiceParticipantsHeight(voiceParticipants.length, isVoiceExpanded)
    );
  }
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);
  const [isServerSettingsVisible, setIsServerSettingsVisible] = useState(false);
  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [isCreateChannelVisible, setIsCreateChannelVisible] = useState(false);
  const [createChannelDefaultCategoryId, setCreateChannelDefaultCategoryId] =
    useState<string | null>(null);
  const [isCreateCategoryVisible, setIsCreateCategoryVisible] = useState(false);
  const [isRolesModalVisible, setIsRolesModalVisible] = useState(false);
  const [isBansModalVisible, setIsBansModalVisible] = useState(false);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [pendingTransfer, setPendingTransfer] =
    useState<OwnershipTransfer | null>(null);
  const [isLoadingPendingTransfer, setIsLoadingPendingTransfer] =
    useState(true);
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<string>>(
    new Set(),
  );
  const [channelOptionsFor, setChannelOptionsFor] = useState<Channel | null>(
    null,
  );
  const [settingsTarget, setSettingsTarget] = useState<{
    channelId: string;
    section: ChannelSettingsSection;
  } | null>(null);
  const [deletingChannel, setDeletingChannel] = useState<Channel | null>(null);
  const [notificationTarget, setNotificationTarget] =
    useState<NotificationTarget | null>(null);
  const notificationSettings = useOptionalNotificationSettings();
  const [dragError, setDragError] = useState("");
  const [isChannelDragActive, setIsChannelDragActive] = useState(false);
  const [isCategoryDragActive, setIsCategoryDragActive] = useState(false);
  const insets = useSafeAreaInsets();
  const canOpenChannelOptions = canManageChannels || canManageRoles;
  const settingsChannel = settingsTarget
    ? (server.channels.find(
        (channel) => channel.id === settingsTarget.channelId,
      ) ?? null)
    : null;
  const settingsCategory = settingsChannel
    ? server.categories.find(
        (category) =>
          category.id === settingsChannel.category_id &&
          !isUnassignedCategory(category),
      )
    : undefined;

  const bannerUrl = resolveServerBannerUrl(server.banner_url);
  const bannerVisible = Boolean(bannerUrl);
  const headerHeight =
    insets.top + (bannerVisible ? BANNER_HEIGHT : HEADER_HEIGHT);
  const menuTop = headerHeight + 6;

  const uncategorized = topLevelChannels(server.channels, server.categories);
  const sortedCategories = sortByPosition(visibleCategories(server.categories));
  const unassignedCategory =
    server.categories.find(isUnassignedCategory) ?? null;
  const canDropToUncategorized =
    canManageChannels && sortedCategories.length > 0;

  const [pendingTransferServerId, setPendingTransferServerId] = useState(
    server.id,
  );
  if (server.id !== pendingTransferServerId) {
    setPendingTransferServerId(server.id);
    setPendingTransfer(null);
    setIsLoadingPendingTransfer(true);
  }

  useEffect(() => {
    let cancelled = false;
    getPendingOwnershipTransfer(server.id).then((result) => {
      if (cancelled) return;
      setPendingTransfer(result.ok ? result.transfer : null);
      setIsLoadingPendingTransfer(false);
    });
    return () => {
      cancelled = true;
    };
  }, [server.id]);

  const incomingTransfer =
    currentUserId !== null &&
    pendingTransfer !== null &&
    pendingTransfer.to_user_id === currentUserId
      ? pendingTransfer
      : null;
  const showTransferMenuItem =
    isOwner || (!isLoadingPendingTransfer && incomingTransfer !== null);

  /** Cierra el menu del servidor y despues hace lo que pidio el item. */
  function runFromMenu(action: () => void) {
    return () => {
      setIsServerMenuOpen(false);
      action();
    };
  }

  function toggleCollapsed(id: string) {
    setCollapsedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleChannelCreated(channel: Channel) {
    setIsCreateChannelVisible(false);
    setCreateChannelDefaultCategoryId(null);
    onServerUpdated({
      ...server,
      channels: [...server.channels, channel],
    });
  }

  function handleCategoryCreated(category: Category) {
    setIsCreateCategoryVisible(false);
    onServerUpdated({
      ...server,
      categories: [...server.categories, category],
    });
  }

  function openChannelSettings(
    channel: Channel | null,
    section: ChannelSettingsSection,
  ) {
    setChannelOptionsFor(null);
    if (channel) setSettingsTarget({ channelId: channel.id, section });
  }

  function handleChannelUpdated(channel: Channel) {
    onServerUpdated({
      ...server,
      channels: server.channels.map((existing) =>
        existing.id === channel.id ? channel : existing,
      ),
    });
  }

  function handleChannelDeleted() {
    if (!deletingChannel) return;
    const remaining = server.channels.filter(
      (existing) => existing.id !== deletingChannel.id,
    );
    setDeletingChannel(null);
    onServerUpdated({ ...server, channels: remaining });
  }

  async function handleChannelsReordered(
    categoryId: string | null,
    orderedIds: string[],
  ) {
    const previousServer = server;
    setDragError("");

    const reorderedChannels = server.channels.map((channel) => {
      if (channel.category_id !== categoryId) return channel;
      const newPosition = orderedIds.indexOf(channel.id);
      return newPosition === -1
        ? channel
        : { ...channel, position: newPosition };
    });
    onServerUpdated({ ...server, channels: reorderedChannels });

    const result = await reorderChannels(server.id, categoryId, orderedIds);
    if (!result.ok) {
      setDragError(result.message);
      onServerUpdated(previousServer);
    }
  }

  async function handleCategoriesReordered(orderedIds: string[]) {
    const previousServer = server;
    setDragError("");

    const reorderedCategories = server.categories.map((category) => {
      const newPosition = orderedIds.indexOf(category.id);
      return newPosition === -1
        ? category
        : { ...category, position: newPosition };
    });
    onServerUpdated({ ...server, categories: reorderedCategories });

    const categoryIds = unassignedCategory
      ? [...orderedIds, unassignedCategory.id]
      : orderedIds;

    const result = await reorderCategories(server.id, categoryIds);
    if (!result.ok) {
      setDragError(result.message);
      onServerUpdated(previousServer);
    }
  }

  async function handleChannelMovedToCategory(
    channel: Channel,
    targetCategoryId: string | null,
  ) {
    const previousServer = server;
    setDragError("");

    const siblingPositions = server.channels
      .filter((existing) => existing.category_id === targetCategoryId)
      .map((existing) => existing.position);
    const nextPosition =
      siblingPositions.length > 0 ? Math.max(...siblingPositions) + 1 : 0;

    onServerUpdated({
      ...server,
      channels: server.channels.map((existing) =>
        existing.id === channel.id
          ? {
              ...existing,
              category_id: targetCategoryId,
              position: nextPosition,
            }
          : existing,
      ),
    });

    const result = await moveChannelToCategory(channel.id, targetCategoryId);
    if (!result.ok) {
      setDragError(result.message);
      onServerUpdated(previousServer);
    }
  }

  function hasOptionsFor(channel: Channel): boolean {
    return (
      canOpenChannelOptions ||
      (notificationSettings !== null && channelHasNotifications(channel))
    );
  }

  function channelRowPropsOf(channel: Channel) {
    return {
      channel,
      hasOptions: hasOptionsFor(channel),
      unreadMentions: unreadMentionsByChannel[channel.id],
      isMuted:
        notificationSettings !== null &&
        isChannelMuted(notificationSettings.settings, channel.id),
      ...voicePropsOf(channel),
      onPress: () => onSelectChannel(channel.id),
      onOptions: () => setChannelOptionsFor(channel),
    };
  }

  function openNotificationSettings(target: NotificationTarget) {
    setChannelOptionsFor(null);
    setNotificationTarget(target);
  }

  function renderChannelList(channels: Channel[]) {
    return channels.map((channel) => (
      <ChannelRow key={channel.id} {...channelRowPropsOf(channel)} />
    ));
  }

  function renderCategorySection(
    category: Category,
    panHandlers: GestureResponderHandlers = {},
  ) {
    const channels = channelsOfCategory(server.channels, category.id);
    const collapsed = collapsedSectionIds.has(category.id);

    return (
      <ChannelDropZone
        key={category.id}
        bucketKey={category.id}
        categoryId={category.id}
      >
        <View className="gap-0.5">
          <View
            className="flex-row items-center gap-1 px-2 mb-1"
            {...panHandlers}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-1 flex-row items-center gap-[5px] py-0.5"
              onPress={() => toggleCollapsed(category.id)}
              accessibilityRole="button"
            >
              <Feather
                name={collapsed ? "chevron-right" : "chevron-down"}
                size={12}
                color={colors.textSubtle}
              />
              <Text
                className="flex-1 text-[13px] font-bold tracking-[0.6px] text-content-subtle"
                numberOfLines={1}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
            {canManageChannels ? (
              <TouchableOpacity
                onPress={() => {
                  setCreateChannelDefaultCategoryId(category.id);
                  setIsCreateChannelVisible(true);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Añadir canal"
                accessibilityRole="button"
              >
                <Feather name="plus" size={13} color={colors.textSubtle} />
              </TouchableOpacity>
            ) : null}
          </View>
          {!collapsed ? (
            canManageChannels && channels.length > 0 ? (
              <DraggableChannelList
                channels={channels}
                bucketKey={category.id}
                onReorder={(orderedIds) =>
                  handleChannelsReordered(category.id, orderedIds)
                }
                onMoveToOtherBucket={handleChannelMovedToCategory}
                onDragActiveChange={setIsChannelDragActive}
                rowHeightOf={rowHeightOf}
                renderChannel={(channel) => (
                  <ChannelRow {...channelRowPropsOf(channel)} />
                )}
              />
            ) : (
              <View className="gap-[1px]">{renderChannelList(channels)}</View>
            )
          ) : null}
        </View>
      </ChannelDropZone>
    );
  }

  return (
    <View className="flex-1 flex-row bg-surface-sunken">
      <ServerRail
        servers={servers}
        activeServerId={server.id}
        isDirectMessagesActive={false}
        unreadDmCount={unreadDmCount}
        unreadMentionsByServer={unreadMentionsByServer}
        onOpenDirectMessages={onOpenDirectMessages}
        onSelectServer={onSwitchServer}
        onAddServer={onAddServer}
      />

      <ChannelDragProvider
        renderChannel={(channel) => (
          <ChannelRow
            channel={channel}
            hasOptions={false}
            onPress={() => {}}
            onOptions={() => {}}
          />
        )}
      >
        <View className="flex-1">
          <TouchableOpacity
            activeOpacity={0.85}
            className="relative overflow-hidden border-b border-b-line"
            style={{ height: headerHeight }}
            onPress={() => setIsServerMenuOpen((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel="Opciones del servidor"
          >
            {bannerVisible ? (
              <>
                <ServerBanner
                  uri={bannerUrl}
                  height={headerHeight}
                  style={StyleSheet.absoluteFill}
                />
                <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
                  <Defs>
                    <LinearGradient
                      id="bannerScrim"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <Stop offset={0} stopColor="#000000" stopOpacity={0.05} />
                      <Stop offset={1} stopColor="#000000" stopOpacity={0.55} />
                    </LinearGradient>
                  </Defs>
                  <Rect
                    x={0}
                    y={0}
                    width="100%"
                    height="100%"
                    fill="url(#bannerScrim)"
                  />
                </Svg>
              </>
            ) : null}

            <View
              className="absolute left-0 right-0 flex-row items-center gap-1.5 px-3.5"
              style={
                bannerVisible ? { bottom: 10 } : { top: insets.top, bottom: 0 }
              }
            >
              <Text
                className="shrink text-[17px] font-bold text-content"
                style={bannerVisible ? styles.bannerServerName : null}
                numberOfLines={1}
              >
                {server.name}
              </Text>
              <Feather
                name={isServerMenuOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color={
                  bannerVisible ? "rgba(255,255,255,0.85)" : colors.textSubtle
                }
              />
            </View>
          </TouchableOpacity>

          {isServerMenuOpen ? (
            <>
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => setIsServerMenuOpen(false)}
              />
              <View
                className="absolute top-[58px] left-2.5 right-2.5 z-20 rounded-xl border border-line-strong bg-surface-modal py-1.5"
                style={[styles.serverMenu, { top: menuTop }]}
              >
                {canInvite ? (
                  <ServerMenuItem
                    icon="user-plus"
                    label="Invitar miembros"
                    onPress={runFromMenu(() => setIsInviteModalVisible(true))}
                  />
                ) : null}

                {notificationSettings ? (
                  <ServerMenuItem
                    icon="bell"
                    label={NOTIFICATION_SETTINGS_MENU_LABEL}
                    onPress={runFromMenu(() =>
                      setNotificationTarget({
                        scope: "server",
                        targetId: server.id,
                        serverId: server.id,
                        name: server.name,
                      }),
                    )}
                  />
                ) : null}

                {canManageServer || canManageMessages ? (
                  <ServerMenuItem
                    icon="settings"
                    label="Configuración del servidor"
                    onPress={runFromMenu(() =>
                      setIsServerSettingsVisible(true),
                    )}
                  />
                ) : null}

                {canManageChannels ? (
                  <>
                    <ServerMenuItem
                      icon="plus"
                      label="Crear canal"
                      onPress={runFromMenu(() => {
                        setCreateChannelDefaultCategoryId(null);
                        setIsCreateChannelVisible(true);
                      })}
                    />
                    <ServerMenuItem
                      icon="folder-plus"
                      label="Crear categoría"
                      onPress={runFromMenu(() =>
                        setIsCreateCategoryVisible(true),
                      )}
                    />
                  </>
                ) : null}

                {canManageRoles ? (
                  <ServerMenuItem
                    icon="shield"
                    label="Gestionar roles"
                    onPress={runFromMenu(() => setIsRolesModalVisible(true))}
                  />
                ) : null}

                {canBanMembers ? (
                  <ServerMenuItem
                    icon={<BanIcon size={16} color={colors.info} />}
                    label={BANS_TITLE}
                    onPress={runFromMenu(() => setIsBansModalVisible(true))}
                  />
                ) : null}

                {showTransferMenuItem ? (
                  <ServerMenuItem
                    icon="repeat"
                    label={
                      incomingTransfer
                        ? "Responder transferencia de propiedad"
                        : "Transferir propiedad"
                    }
                    onPress={runFromMenu(() => setIsTransferModalVisible(true))}
                  />
                ) : null}

                <View className="h-px bg-line my-1 mx-2" />

                <ServerMenuItem
                  icon="log-out"
                  label="Abandonar servidor"
                  tone="danger"
                  onPress={runFromMenu(() => setIsLeaveModalVisible(true))}
                />
              </View>
            </>
          ) : null}

          {dragError ? (
            <View className="flex-row items-center gap-2 mx-3 mt-2.5 rounded-lg border border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)] px-3 py-[9px]">
              <Feather name="alert-circle" size={14} color={colors.danger} />
              <Text
                className="flex-1 text-[12px] text-danger"
                numberOfLines={2}
              >
                {dragError}
              </Text>
              <TouchableOpacity
                onPress={() => setDragError("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Cerrar"
                accessibilityRole="button"
              >
                <Feather name="x" size={14} color={colors.textSubtle} />
              </TouchableOpacity>
            </View>
          ) : null}

          <ScrollView
            className="flex-1"
            contentContainerClassName="px-2.5 pt-3.5 pb-3 gap-3"
            scrollEnabled={!isChannelDragActive && !isCategoryDragActive}
          >
            {uncategorized.length > 0 ? (
              <ChannelDropZone
                bucketKey={UNCATEGORIZED_KEY}
                categoryId={unassignedCategory?.id ?? null}
              >
                {canManageChannels ? (
                  <DraggableChannelList
                    channels={uncategorized}
                    bucketKey={UNCATEGORIZED_KEY}
                    onReorder={(orderedIds) =>
                      handleChannelsReordered(
                        unassignedCategory?.id ?? null,
                        orderedIds,
                      )
                    }
                    onMoveToOtherBucket={handleChannelMovedToCategory}
                    onDragActiveChange={setIsChannelDragActive}
                    rowHeightOf={rowHeightOf}
                    renderChannel={(channel) => (
                      <ChannelRow {...channelRowPropsOf(channel)} />
                    )}
                  />
                ) : (
                  <View className="gap-[1px]">
                    {renderChannelList(uncategorized)}
                  </View>
                )}
              </ChannelDropZone>
            ) : canDropToUncategorized ? (
              <ChannelDropZone
                bucketKey={UNCATEGORIZED_KEY}
                categoryId={unassignedCategory?.id ?? null}
                isTopEdge
                style={{ marginBottom: -SECTION_GAP }}
              />
            ) : null}

            {canManageChannels && sortedCategories.length > 1 ? (
              <DraggableCategoryList
                categories={sortedCategories}
                onReorder={handleCategoriesReordered}
                onDragActiveChange={setIsCategoryDragActive}
                gap={SECTION_GAP}
                renderCategory={(category, panHandlers) =>
                  renderCategorySection(category, panHandlers)
                }
              />
            ) : (
              sortedCategories.map((category) =>
                renderCategorySection(category),
              )
            )}

            {uncategorized.length === 0 && sortedCategories.length === 0 ? (
              <Text className="px-2 pt-2 text-[13px] text-content-subtle">
                {canManageChannels
                  ? "Todavía no hay canales. Creá el primero."
                  : "Todavía no hay canales en este servidor."}
              </Text>
            ) : null}
          </ScrollView>

          <UserProfileBar userName={userName} onLogout={onLogout} />
        </View>
      </ChannelDragProvider>

      {canManageServer || canManageMessages ? (
        <ServerSettingsModal
          visible={isServerSettingsVisible}
          server={server}
          isOwner={isOwner}
          canManageServer={canManageServer}
          canManageMessages={canManageMessages}
          onClose={() => setIsServerSettingsVisible(false)}
          onUpdated={(updated) => {
            setIsServerSettingsVisible(false);
            onServerUpdated(updated);
          }}
          onConfirmDelete={(confirmName) =>
            onDeleteServer(server.id, confirmName)
          }
        />
      ) : null}
      <LeaveServerModal
        visible={isLeaveModalVisible}
        serverName={server.name}
        onClose={() => setIsLeaveModalVisible(false)}
        onConfirm={() => onLeaveServer(server.id)}
      />
      {canInvite ? (
        <InviteLinkModal
          visible={isInviteModalVisible}
          serverId={server.id}
          serverName={server.name}
          onClose={() => setIsInviteModalVisible(false)}
        />
      ) : null}
      <TransferOwnershipModal
        visible={isTransferModalVisible}
        serverId={server.id}
        serverName={server.name}
        isOwner={isOwner}
        currentUserId={currentUserId}
        pendingTransfer={pendingTransfer}
        isLoadingPendingTransfer={isLoadingPendingTransfer}
        onPendingTransferChange={setPendingTransfer}
        onClose={() => setIsTransferModalVisible(false)}
        onOwnershipAccepted={() => {
          setIsTransferModalVisible(false);
          if (currentUserId) {
            onServerUpdated({ ...server, owner_id: currentUserId });
          }
        }}
      />
      {canManageChannels ? (
        <CreateChannelModal
          visible={isCreateChannelVisible}
          serverId={server.id}
          categories={server.categories}
          defaultCategoryId={createChannelDefaultCategoryId}
          onClose={() => {
            setIsCreateChannelVisible(false);
            setCreateChannelDefaultCategoryId(null);
          }}
          onCreated={handleChannelCreated}
        />
      ) : null}
      {canManageChannels ? (
        <CreateCategoryModal
          visible={isCreateCategoryVisible}
          serverId={server.id}
          onClose={() => setIsCreateCategoryVisible(false)}
          onCreated={handleCategoryCreated}
        />
      ) : null}
      {canManageRoles ? (
        <RolesModal
          visible={isRolesModalVisible}
          serverId={server.id}
          serverName={server.name}
          isOwner={isOwner}
          myRoles={myRoles}
          onClose={() => {
            setIsRolesModalVisible(false);
            onPermissionsChanged?.();
          }}
        />
      ) : null}
      {canBanMembers && isBansModalVisible ? (
        <BansModal
          serverId={server.id}
          ownerId={server.owner_id}
          currentUserId={currentUserId}
          canManageRoles={canManageRoles}
          onClose={() => setIsBansModalVisible(false)}
        />
      ) : null}
      <ChannelOptionsSheet
        visible={channelOptionsFor !== null}
        channel={channelOptionsFor}
        canManageChannel={canManageChannels}
        canManagePermissions={canManageRoles}
        onNotifications={
          notificationSettings &&
          channelOptionsFor &&
          channelHasNotifications(channelOptionsFor)
            ? () =>
                openNotificationSettings({
                  scope: "channel",
                  targetId: channelOptionsFor.id,
                  serverId: server.id,
                  name: channelOptionsFor.name,
                })
            : undefined
        }
        onClose={() => setChannelOptionsFor(null)}
        onEdit={() => openChannelSettings(channelOptionsFor, "overview")}
        onOverridePermissions={() =>
          openChannelSettings(channelOptionsFor, "permissions")
        }
        onDelete={() => {
          const channel = channelOptionsFor;
          setChannelOptionsFor(null);
          setDeletingChannel(channel);
        }}
      />
      <NotificationSettingsSheet
        target={notificationTarget}
        onClose={() => setNotificationTarget(null)}
      />
      {settingsTarget && settingsChannel ? (
        <ChannelSettingsModal
          key={settingsChannel.id}
          channel={settingsChannel}
          categoryName={settingsCategory?.name ?? null}
          initialSection={settingsTarget.section}
          canManageChannel={canManageChannels}
          canManagePermissions={canManageRoles}
          isOwner={isOwner}
          myRoles={myRoles}
          serverRoles={serverRoles}
          onClose={() => setSettingsTarget(null)}
          onChannelUpdated={handleChannelUpdated}
          onPermissionsSaved={() => onChannelPermissionsSaved?.()}
          onDelete={() => {
            setSettingsTarget(null);
            setDeletingChannel(settingsChannel);
          }}
        />
      ) : null}
      {deletingChannel ? (
        <DeleteChannelModal
          channel={deletingChannel}
          onClose={() => setDeletingChannel(null)}
          onDeleted={handleChannelDeleted}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  serverMenu: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bannerServerName: {
    color: "#ffffff",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
