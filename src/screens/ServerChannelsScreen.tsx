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

import { InviteLinkModal } from "../components/servers/InviteLinkModal";
import { LeaveServerModal } from "../components/servers/LeaveServerModal";
import { ServerRail } from "../components/servers/ServerRail";
import { TransferOwnershipModal } from "../components/servers/TransferOwnershipModal";
import { UserProfileBar } from "../components/servers/UserProfileBar";
import type {
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
  /** Si el usuario actual es el dueño del servidor (solo el dueño puede transferirlo). */
  isOwner?: boolean;
  onSelectChannel: (channelId: string) => void;
  onSelectHome: () => void;
  onSwitchServer: (serverId: string) => void;
  onAddServer: () => void;
  onLogout: () => void;
  onLeaveServer: (serverId: string) => Promise<LeaveServerActionResult>;
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
}: ServerChannelsScreenProps) {
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);
  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const textChannels = server.channels.filter(
    (channel) => channel.kind === "text",
  );
  const voiceChannels = server.channels.filter(
    (channel) => channel.kind === "voice",
  );

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

        <View style={styles.searchBar}>
          <Feather name="search" size={15} color={colors.textSubtle} />
          <Text style={styles.searchBarText}>Buscar</Text>
        </View>

        <ScrollView
          style={styles.channelsScroll}
          contentContainerStyle={styles.channelsContent}
        >
          {textChannels.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Canales de texto</Text>
                <Feather
                  name="chevron-down"
                  size={13}
                  color={colors.textSubtle}
                />
              </View>
              <View style={styles.sectionList}>
                {textChannels.map((channel) => (
                  <ChannelRow
                    key={channel.id}
                    channel={channel}
                    onPress={() => onSelectChannel(channel.id)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {voiceChannels.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Canales de voz</Text>
                <Feather
                  name="chevron-down"
                  size={13}
                  color={colors.textSubtle}
                />
              </View>
              <View style={styles.sectionList}>
                {voiceChannels.map((channel) => (
                  <ChannelRow
                    key={channel.id}
                    channel={channel}
                    onPress={() => onSelectChannel(channel.id)}
                  />
                ))}
              </View>
            </View>
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
});
