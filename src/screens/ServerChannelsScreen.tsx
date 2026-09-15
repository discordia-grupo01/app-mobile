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

import { CreateCategoryModal } from "../components/servers/CreateCategoryModal";
import { CreateChannelModal } from "../components/servers/CreateChannelModal";
import { InviteLinkModal } from "../components/servers/InviteLinkModal";
import { LeaveServerModal } from "../components/servers/LeaveServerModal";
import { ServerRail } from "../components/servers/ServerRail";
import { TransferOwnershipModal } from "../components/servers/TransferOwnershipModal";
import { UserProfileBar } from "../components/servers/UserProfileBar";
import type {
  Category,
  Channel,
  LeaveServerActionResult,
  ServerListItem,
} from "../features/servers/types";
import { colors } from "../theme/colors";

const HEADER_HEIGHT = 52;
const MENU_TOP = 58;

interface ServerChannelsScreenProps {
  server: ServerListItem;
  servers: ServerListItem[];
  authToken: string | null;
  userName?: string | null;
  currentUserId?: string | null;
  isOwner?: boolean;
  onSelectChannel: (channelId: string) => void;
  onSelectHome: () => void;
  onSwitchServer: (serverId: string) => void;
  onAddServer: () => void;
  onLogout: () => void;
  onLeaveServer: (serverId: string) => Promise<LeaveServerActionResult>;
  onServerUpdated: (server: ServerListItem) => void;
}

function ChannelRow({
  channel,
  onPress,
}: {
  channel: Channel;
  onPress: () => void;
}) {
  return (
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
  );
}

export function ServerChannelsScreen({
  server,
  servers,
  authToken,
  userName,
  currentUserId,
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
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [isCreateChannelVisible, setIsCreateChannelVisible] = useState(false);
  const [createChannelDefaultCategoryId, setCreateChannelDefaultCategoryId] =
    useState<string | null>(null);
  const [isCreateCategoryVisible, setIsCreateCategoryVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const uncategorized = server.channels
    .filter((channel) => channel.category_id === null)
    .sort((a, b) => a.position - b.position);
  const sortedCategories = [...server.categories].sort(
    (a, b) => a.position - b.position,
  );

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
                  Invitar gente
                </Text>
              </TouchableOpacity>

              {isOwner ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.serverMenuItem}
                  onPress={() => {
                    setIsServerMenuOpen(false);
                    setIsTransferModalVisible(true);
                  }}
                >
                  <Feather name="shield" size={16} color={colors.info} />
                  <Text style={styles.serverMenuItemTextNeutral}>
                    Transferir propiedad
                  </Text>
                </TouchableOpacity>
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

        {isOwner ? (
          <View style={styles.toolbarRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.toolbarButton}
              onPress={() => {
                setCreateChannelDefaultCategoryId(null);
                setIsCreateChannelVisible(true);
              }}
            >
              <Feather name="plus" size={14} color={colors.textSubtle} />
              <Text style={styles.toolbarButtonText}>Crear canal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.toolbarIconButton}
              onPress={() => setIsCreateCategoryVisible(true)}
              accessibilityLabel="Crear categoría"
              accessibilityRole="button"
            >
              <Feather name="folder-plus" size={15} color={colors.textSubtle} />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.searchBar}>
          <Feather name="search" size={15} color={colors.textSubtle} />
          <Text style={styles.searchBarText}>Buscar</Text>
        </View>

        <ScrollView
          style={styles.channelsScroll}
          contentContainerStyle={styles.channelsContent}
        >
          {uncategorized.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Sin categoría</Text>
              </View>
              <View style={styles.sectionList}>
                {uncategorized.map((channel) => (
                  <ChannelRow
                    key={channel.id}
                    channel={channel}
                    onPress={() => onSelectChannel(channel.id)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {sortedCategories.map((category) => {
            const channels = server.channels
              .filter((channel) => channel.category_id === category.id)
              .sort((a, b) => a.position - b.position);

            return (
              <View key={category.id} style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle} numberOfLines={1}>
                    {category.name}
                  </Text>
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
                <View style={styles.sectionList}>
                  {channels.map((channel) => (
                    <ChannelRow
                      key={channel.id}
                      channel={channel}
                      onPress={() => onSelectChannel(channel.id)}
                    />
                  ))}
                </View>
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

        <UserProfileBar userName={userName} onLogout={onLogout} />
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
        <TransferOwnershipModal
          visible={isTransferModalVisible}
          serverId={server.id}
          serverName={server.name}
          currentUserId={currentUserId}
          onClose={() => setIsTransferModalVisible(false)}
        />
      ) : null}
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
  toolbarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  toolbarButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  toolbarButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSubtle,
  },
  toolbarIconButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchBarText: {
    fontSize: 13,
    color: colors.textSubtle,
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
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 11,
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
