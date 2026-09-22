import {
  type Category,
  type Channel,
  channelsOfCategory,
  type LeaveServerResult,
  type OwnershipTransfer,
  type ServerSummary,
  sortByPosition,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { ChannelOptionsSheet } from "../features/servers/components/channel/ChannelOptionsSheet";
import { CreateCategoryModal } from "../features/servers/components/category/CreateCategoryModal";
import { CreateChannelModal } from "../features/servers/components/channel/CreateChannelModal";
import { DeleteChannelModal } from "../features/servers/components/channel/DeleteChannelModal";
import { DraggableChannelList } from "../features/servers/components/channel/DraggableChannelList";
import { EditChannelModal } from "../features/servers/components/channel/EditChannelModal";
import { InviteLinkModal } from "../features/servers/components/server/InviteLinkModal";
import { LeaveServerModal } from "../features/servers/components/server/LeaveServerModal";
import { ServerSettingsModal } from "../features/servers/components/server/ServerSettingsModal";
import { TransferOwnershipModal } from "../features/servers/components/server/TransferOwnershipModal";
import { RolesModal } from "../features/roles/RolesModal";
import { ServerBanner } from "../features/servers/components/ServerBanner";
import { ServerRail } from "../features/servers/components/rail/ServerRail";
import { UserProfileBar } from "../features/servers/components/account/UserProfileBar";
import { useAuth } from "../features/auth/auth-context";
import {
  getPendingOwnershipTransfer,
  reorderChannels,
  resolveServerBannerUrl,
} from "../features/servers/api";
import { useThemeColors } from "../theme/theme-context";

const HEADER_HEIGHT = 52;
const BANNER_HEIGHT = 88;
const UNCATEGORIZED_KEY = "none";

interface ServerChannelsScreenProps {
  server: ServerSummary;
  servers: ServerSummary[];
  authToken: string | null;
  userName?: string | null;
  isOwner?: boolean;
  onSelectChannel: (channelId: string) => void;
  onSelectHome: () => void;
  onSwitchServer: (serverId: string) => void;
  onAddServer: () => void;
  onLogout: () => void;
  onLeaveServer: (serverId: string) => Promise<LeaveServerResult>;
  onServerUpdated: (server: ServerSummary) => void;
}

function ChannelRow({
  channel,
  isOwner,
  onPress,
  onOptions,
}: {
  channel: Channel;
  isOwner: boolean;
  onPress: () => void;
  onOptions: () => void;
}) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className="flex-1 flex-row items-center gap-2.5 rounded-lg px-2.5 py-[11px]"
      >
        <Feather
          name={channel.kind === "text" ? "hash" : "volume-2"}
          size={20}
          color={colors.textMuted}
        />
        <Text
          className="flex-1 text-[16px] font-medium text-content-muted"
          numberOfLines={1}
        >
          {channel.name}
        </Text>
      </TouchableOpacity>
      {isOwner ? (
        <TouchableOpacity
          onPress={onOptions}
          className="px-2 py-2"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Opciones del canal"
          accessibilityRole="button"
        >
          <Feather name="more-vertical" size={16} color={colors.textSubtle} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function ServerChannelsScreen({
  server,
  servers,
  authToken,
  userName,
  isOwner = false,
  onSelectChannel,
  onSelectHome,
  onSwitchServer,
  onAddServer,
  onLogout,
  onLeaveServer,
  onServerUpdated,
}: ServerChannelsScreenProps) {
  const colors = useThemeColors();
  const { user } = useAuth();
  const currentUserId = user ? String(user.id) : null;
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);
  const [isServerSettingsVisible, setIsServerSettingsVisible] = useState(false);
  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [isCreateChannelVisible, setIsCreateChannelVisible] = useState(false);
  const [createChannelDefaultCategoryId, setCreateChannelDefaultCategoryId] =
    useState<string | null>(null);
  const [isCreateCategoryVisible, setIsCreateCategoryVisible] = useState(false);
  const [isRolesModalVisible, setIsRolesModalVisible] = useState(false);
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
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [deletingChannel, setDeletingChannel] = useState<Channel | null>(null);
  const [dragError, setDragError] = useState("");
  const [isChannelDragActive, setIsChannelDragActive] = useState(false);
  const insets = useSafeAreaInsets();

  const bannerUrl = resolveServerBannerUrl(server.id, server.banner_url);
  const bannerVisible = Boolean(bannerUrl);
  const headerHeight =
    insets.top + (bannerVisible ? BANNER_HEIGHT : HEADER_HEIGHT);
  const menuTop = headerHeight + 6;

  const uncategorized = channelsOfCategory(server.channels, null);
  const sortedCategories = sortByPosition(server.categories);

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

  function handleChannelUpdated(channel: Channel) {
    setEditingChannel(null);
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

  function renderChannelList(channels: Channel[]) {
    return channels.map((channel) => (
      <ChannelRow
        key={channel.id}
        channel={channel}
        isOwner={isOwner}
        onPress={() => onSelectChannel(channel.id)}
        onOptions={() => setChannelOptionsFor(channel)}
      />
    ));
  }

  return (
    <View className="flex-1 flex-row bg-surface-sunken">
      <ServerRail
        servers={servers}
        activeServerId={server.id}
        authToken={authToken}
        onSelectHome={onSelectHome}
        onSelectServer={onSwitchServer}
        onAddServer={onAddServer}
      />

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
                authToken={authToken}
                height={headerHeight}
                style={StyleSheet.absoluteFill}
              />
              {/* Degradado oscuro de abajo hacia arriba para que el nombre
                  se lea encima de cualquier imagen -- mismo criterio que el
                  `linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.55))` del
                  prototipo de Figma. */}
              <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
                <Defs>
                  <LinearGradient id="bannerScrim" x1="0" y1="0" x2="0" y2="1">
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
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center gap-2.5 rounded-lg mx-1 px-2.5 py-3"
                onPress={() => {
                  setIsServerMenuOpen(false);
                  setIsInviteModalVisible(true);
                }}
              >
                <Feather name="user-plus" size={16} color={colors.info} />
                <Text className="text-[14px] font-semibold text-content">
                  Invitar miembros
                </Text>
              </TouchableOpacity>

              {isOwner ? (
                <>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="flex-row items-center gap-2.5 rounded-lg mx-1 px-2.5 py-3"
                    onPress={() => {
                      setIsServerMenuOpen(false);
                      setIsServerSettingsVisible(true);
                    }}
                  >
                    <Feather name="settings" size={16} color={colors.info} />
                    <Text className="text-[14px] font-semibold text-content">
                      Configuración del servidor
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="flex-row items-center gap-2.5 rounded-lg mx-1 px-2.5 py-3"
                    onPress={() => {
                      setIsServerMenuOpen(false);
                      setCreateChannelDefaultCategoryId(null);
                      setIsCreateChannelVisible(true);
                    }}
                  >
                    <Feather name="plus" size={16} color={colors.info} />
                    <Text className="text-[14px] font-semibold text-content">
                      Crear canal
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="flex-row items-center gap-2.5 rounded-lg mx-1 px-2.5 py-3"
                    onPress={() => {
                      setIsServerMenuOpen(false);
                      setIsCreateCategoryVisible(true);
                    }}
                  >
                    <Feather name="folder-plus" size={16} color={colors.info} />
                    <Text className="text-[14px] font-semibold text-content">
                      Crear categoría
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="flex-row items-center gap-2.5 rounded-lg mx-1 px-2.5 py-3"
                    onPress={() => {
                      setIsServerMenuOpen(false);
                      setIsRolesModalVisible(true);
                    }}
                  >
                    <Feather name="shield" size={16} color={colors.info} />
                    <Text className="text-[14px] font-semibold text-content">
                      Gestionar roles
                    </Text>
                  </TouchableOpacity>
                </>
              ) : null}

              {showTransferMenuItem ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="flex-row items-center gap-2.5 rounded-lg mx-1 px-2.5 py-3"
                  onPress={() => {
                    setIsServerMenuOpen(false);
                    setIsTransferModalVisible(true);
                  }}
                >
                  <Feather name="repeat" size={16} color={colors.info} />
                  <Text className="text-[14px] font-semibold text-content">
                    {incomingTransfer
                      ? "Responder transferencia de propiedad"
                      : "Transferir propiedad"}
                  </Text>
                </TouchableOpacity>
              ) : null}

              <View className="h-px bg-line my-1 mx-2" />

              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center gap-2.5 rounded-lg mx-1 px-2.5 py-3"
                onPress={() => {
                  setIsServerMenuOpen(false);
                  setIsLeaveModalVisible(true);
                }}
              >
                <Feather name="log-out" size={16} color={colors.danger} />
                <Text className="text-[14px] font-semibold text-danger">
                  Abandonar servidor
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        {dragError ? (
          <View className="flex-row items-center gap-2 mx-3 mt-2.5 rounded-lg border border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)] px-3 py-[9px]">
            <Feather name="alert-circle" size={14} color={colors.danger} />
            <Text className="flex-1 text-[12px] text-danger" numberOfLines={2}>
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
          contentContainerClassName="px-2.5 pt-3.5 pb-3 gap-4.5"
          scrollEnabled={!isChannelDragActive}
        >
          {uncategorized.length > 0 ? (
            <View className="gap-0.5">
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center gap-1 px-2 mb-1"
                onPress={() => toggleCollapsed(UNCATEGORIZED_KEY)}
                accessibilityRole="button"
              >
                <Feather
                  name={
                    collapsedSectionIds.has(UNCATEGORIZED_KEY)
                      ? "chevron-right"
                      : "chevron-down"
                  }
                  size={12}
                  color={colors.textSubtle}
                />
                <Text className="flex-1 text-[13px] font-bold tracking-[0.6px] text-content-subtle">
                  Sin categoría
                </Text>
              </TouchableOpacity>
              {!collapsedSectionIds.has(UNCATEGORIZED_KEY) ? (
                isOwner && uncategorized.length > 1 ? (
                  <DraggableChannelList
                    channels={uncategorized}
                    onReorder={(orderedIds) =>
                      handleChannelsReordered(null, orderedIds)
                    }
                    onDragActiveChange={setIsChannelDragActive}
                    renderChannel={(channel) => (
                      <ChannelRow
                        channel={channel}
                        isOwner={isOwner}
                        onPress={() => onSelectChannel(channel.id)}
                        onOptions={() => setChannelOptionsFor(channel)}
                      />
                    )}
                  />
                ) : (
                  <View className="gap-[1px]">
                    {renderChannelList(uncategorized)}
                  </View>
                )
              ) : null}
            </View>
          ) : null}

          {sortedCategories.map((category) => {
            const channels = channelsOfCategory(server.channels, category.id);
            const collapsed = collapsedSectionIds.has(category.id);

            return (
              <View key={category.id} className="gap-0.5">
                <View className="flex-row items-center gap-1 px-2 mb-1">
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
                  {isOwner ? (
                    <TouchableOpacity
                      onPress={() => {
                        setCreateChannelDefaultCategoryId(category.id);
                        setIsCreateChannelVisible(true);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Añadir canal"
                      accessibilityRole="button"
                    >
                      <Feather
                        name="plus"
                        size={13}
                        color={colors.textSubtle}
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>
                {!collapsed ? (
                  isOwner && channels.length > 1 ? (
                    <DraggableChannelList
                      channels={channels}
                      onReorder={(orderedIds) =>
                        handleChannelsReordered(category.id, orderedIds)
                      }
                      onDragActiveChange={setIsChannelDragActive}
                      renderChannel={(channel) => (
                        <ChannelRow
                          channel={channel}
                          isOwner={isOwner}
                          onPress={() => onSelectChannel(channel.id)}
                          onOptions={() => setChannelOptionsFor(channel)}
                        />
                      )}
                    />
                  ) : (
                    <View className="gap-[1px]">
                      {renderChannelList(channels)}
                    </View>
                  )
                ) : null}
              </View>
            );
          })}

          {uncategorized.length === 0 && sortedCategories.length === 0 ? (
            <Text className="px-2 pt-2 text-[13px] text-content-subtle">
              {isOwner
                ? "Todavía no hay canales. Creá el primero."
                : "Todavía no hay canales en este servidor."}
            </Text>
          ) : null}
        </ScrollView>

        <UserProfileBar
          userName={userName}
          serverId={server.id}
          onLogout={onLogout}
        />
      </View>

      {isOwner ? (
        <ServerSettingsModal
          visible={isServerSettingsVisible}
          server={server}
          authToken={authToken}
          onClose={() => setIsServerSettingsVisible(false)}
          onUpdated={(updated) => {
            setIsServerSettingsVisible(false);
            onServerUpdated(updated);
          }}
        />
      ) : null}
      <LeaveServerModal
        visible={isLeaveModalVisible}
        serverName={server.name}
        onClose={() => setIsLeaveModalVisible(false)}
        onConfirm={() => onLeaveServer(server.id)}
      />
      <InviteLinkModal
        visible={isInviteModalVisible}
        serverId={server.id}
        serverName={server.name}
        onClose={() => setIsInviteModalVisible(false)}
      />
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
      {isOwner ? (
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
      {isOwner ? (
        <CreateCategoryModal
          visible={isCreateCategoryVisible}
          serverId={server.id}
          onClose={() => setIsCreateCategoryVisible(false)}
          onCreated={handleCategoryCreated}
        />
      ) : null}
      {isOwner ? (
        <RolesModal
          visible={isRolesModalVisible}
          serverId={server.id}
          serverName={server.name}
          onClose={() => setIsRolesModalVisible(false)}
        />
      ) : null}
      {isOwner ? (
        <ChannelOptionsSheet
          visible={channelOptionsFor !== null}
          channel={channelOptionsFor}
          onClose={() => setChannelOptionsFor(null)}
          onEdit={() => {
            const channel = channelOptionsFor;
            setChannelOptionsFor(null);
            setEditingChannel(channel);
          }}
          onDelete={() => {
            const channel = channelOptionsFor;
            setChannelOptionsFor(null);
            setDeletingChannel(channel);
          }}
        />
      ) : null}
      {editingChannel ? (
        <EditChannelModal
          channel={editingChannel}
          onClose={() => setEditingChannel(null)}
          onUpdated={handleChannelUpdated}
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
