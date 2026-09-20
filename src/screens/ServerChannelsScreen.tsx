import {
  type Category,
  type Channel,
  channelsOfCategory,
  type LeaveServerResult,
  type ServerSummary,
  sortByPosition,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChannelOptionsSheet } from "../features/servers/components/channel/ChannelOptionsSheet";
import { CreateCategoryModal } from "../features/servers/components/category/CreateCategoryModal";
import { CreateChannelModal } from "../features/servers/components/channel/CreateChannelModal";
import { DeleteChannelModal } from "../features/servers/components/channel/DeleteChannelModal";
import { DraggableChannelList } from "../features/servers/components/channel/DraggableChannelList";
import { EditChannelModal } from "../features/servers/components/channel/EditChannelModal";
import { InviteLinkModal } from "../features/servers/components/server/InviteLinkModal";
import { LeaveServerModal } from "../features/servers/components/server/LeaveServerModal";
import { RolesModal } from "../features/roles/RolesModal";
import { ServerRail } from "../features/servers/components/rail/ServerRail";
import { UserProfileBar } from "../features/servers/components/account/UserProfileBar";
import { reorderChannels } from "../features/servers/api";
import { colors } from "../theme/colors";

const HEADER_HEIGHT = 52;
const MENU_TOP = 58;
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
  return (
    <View style={styles.channelRowWrap}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={styles.channelRow}
      >
        <Feather
          name={channel.kind === "text" ? "hash" : "volume-2"}
          size={20}
          color={colors.textMuted}
        />
        <Text style={styles.channelName} numberOfLines={1}>
          {channel.name}
        </Text>
      </TouchableOpacity>
      {isOwner ? (
        <TouchableOpacity
          onPress={onOptions}
          style={styles.channelOptionsButton}
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
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);
  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [isCreateChannelVisible, setIsCreateChannelVisible] = useState(false);
  const [createChannelDefaultCategoryId, setCreateChannelDefaultCategoryId] =
    useState<string | null>(null);
  const [isCreateCategoryVisible, setIsCreateCategoryVisible] = useState(false);
  const [isRolesModalVisible, setIsRolesModalVisible] = useState(false);
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

  const uncategorized = channelsOfCategory(server.channels, null);
  const sortedCategories = sortByPosition(server.categories);

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
    <View style={styles.container}>
      <ServerRail
        servers={servers}
        activeServerId={server.id}
        authToken={authToken}
        onSelectHome={onSelectHome}
        onSelectServer={onSwitchServer}
        onAddServer={onAddServer}
      />

      <View style={styles.main}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.header,
            { height: HEADER_HEIGHT + insets.top, paddingTop: insets.top },
          ]}
          onPress={() => setIsServerMenuOpen((prev) => !prev)}
          accessibilityRole="button"
          accessibilityLabel="Opciones del servidor"
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            {server.name}
          </Text>
          <Feather
            name={isServerMenuOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.textSubtle}
          />
        </TouchableOpacity>

        {isServerMenuOpen ? (
          <>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setIsServerMenuOpen(false)}
            />
            <View style={[styles.serverMenu, { top: MENU_TOP + insets.top }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.serverMenuItem}
                onPress={() => {
                  setIsServerMenuOpen(false);
                  setIsInviteModalVisible(true);
                }}
              >
                <Feather name="user-plus" size={16} color={colors.info} />
                <Text style={styles.serverMenuItemTextNeutral}>
                  Invitar miembros
                </Text>
              </TouchableOpacity>

              {isOwner ? (
                <>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.serverMenuItem}
                    onPress={() => {
                      setIsServerMenuOpen(false);
                      setCreateChannelDefaultCategoryId(null);
                      setIsCreateChannelVisible(true);
                    }}
                  >
                    <Feather name="plus" size={16} color={colors.info} />
                    <Text style={styles.serverMenuItemTextNeutral}>
                      Crear canal
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.serverMenuItem}
                    onPress={() => {
                      setIsServerMenuOpen(false);
                      setIsCreateCategoryVisible(true);
                    }}
                  >
                    <Feather name="folder-plus" size={16} color={colors.info} />
                    <Text style={styles.serverMenuItemTextNeutral}>
                      Crear categoría
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.serverMenuItem}
                    onPress={() => {
                      setIsServerMenuOpen(false);
                      setIsRolesModalVisible(true);
                    }}
                  >
                    <Feather name="shield" size={16} color={colors.info} />
                    <Text style={styles.serverMenuItemTextNeutral}>
                      Gestionar roles
                    </Text>
                  </TouchableOpacity>
                </>
              ) : null}

              <View style={styles.serverMenuDivider} />

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.serverMenuItem}
                onPress={() => {
                  setIsServerMenuOpen(false);
                  setIsLeaveModalVisible(true);
                }}
              >
                <Feather name="log-out" size={16} color={colors.danger} />
                <Text style={styles.serverMenuItemText}>
                  Abandonar servidor
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        {dragError ? (
          <View style={styles.dragErrorBanner}>
            <Feather name="alert-circle" size={14} color={colors.danger} />
            <Text style={styles.dragErrorText} numberOfLines={2}>
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
          style={styles.channelsScroll}
          contentContainerStyle={styles.channelsContent}
          scrollEnabled={!isChannelDragActive}
        >
          {uncategorized.length > 0 ? (
            <View style={styles.section}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.sectionTitleRow}
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
                <Text style={styles.sectionTitle}>Sin categoría</Text>
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
                  <View style={styles.sectionList}>
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
              <View key={category.id} style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.sectionTitleToggle}
                    onPress={() => toggleCollapsed(category.id)}
                    accessibilityRole="button"
                  >
                    <Feather
                      name={collapsed ? "chevron-right" : "chevron-down"}
                      size={12}
                      color={colors.textSubtle}
                    />
                    <Text style={styles.sectionTitle} numberOfLines={1}>
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
                    <View style={styles.sectionList}>
                      {renderChannelList(channels)}
                    </View>
                  )
                ) : null}
              </View>
            );
          })}

          {uncategorized.length === 0 && sortedCategories.length === 0 ? (
            <Text style={styles.emptyChannelsText}>
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
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.bgChannels,
  },
  main: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 52,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flexShrink: 1,
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  serverMenu: {
    position: "absolute",
    top: 58,
    left: 10,
    right: 10,
    zIndex: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgModal,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  serverMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  serverMenuItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.danger,
  },
  serverMenuItemTextNeutral: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  serverMenuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  dragErrorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(224,82,82,0.3)",
    backgroundColor: "rgba(224,82,82,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  dragErrorText: {
    flex: 1,
    fontSize: 12,
    color: colors.danger,
  },
  channelsScroll: {
    flex: 1,
  },
  channelsContent: {
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 18,
  },
  section: {
    gap: 2,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  sectionTitleToggle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 2,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: colors.textSubtle,
  },
  sectionList: {
    gap: 1,
  },
  channelRowWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  channelRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 11,
  },
  channelOptionsButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  channelName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: colors.textMuted,
  },
  emptyChannelsText: {
    paddingHorizontal: 8,
    paddingTop: 8,
    fontSize: 13,
    color: colors.textSubtle,
  },
});
