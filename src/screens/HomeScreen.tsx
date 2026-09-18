import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddServerSheet } from "../features/servers/components/rail/AddServerSheet";
import { CreateServerModal } from "../features/servers/components/server/CreateServerModal";
import { EmptyState } from "../features/servers/components/home/EmptyState";
import { JoinServerModal } from "../features/servers/components/server/JoinServerModal";
import { useAuth } from "../features/auth/auth-context";
import { leaveServer, listMyServers } from "../features/servers/api";
import type {
  LeaveServerActionResult,
  ServerListItem,
  ServerSummary,
} from "../features/servers/types";
import { colors } from "../theme/colors";
import { ChannelScreen } from "./ChannelScreen";
import { ServerChannelsScreen } from "./ServerChannelsScreen";
import { ServerPickerScreen } from "./ServerPickerScreen";

export function HomeScreen() {
  const { user, token, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [servers, setServers] = useState<ServerListItem[]>([]);
  const [isLoadingServers, setIsLoadingServers] = useState(true);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null,
  );
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [isAddServerSheetVisible, setIsAddServerSheetVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadServers() {
      const result = await listMyServers();
      if (cancelled) return;

      if (result.ok) {
        setServers(result.servers);
        if (result.servers.length > 0) {
          setSelectedServerId((prev) => prev ?? result.servers[0].id);
        }
      }
      setIsLoadingServers(false);
    }

    loadServers();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedServer =
    servers.find((server) => server.id === selectedServerId) ?? null;
  const selectedChannel =
    selectedServer?.channels.find(
      (channel) => channel.id === selectedChannelId,
    ) ?? null;

  function handleSelectHome() {
    setSelectedServerId(null);
    setSelectedChannelId(null);
  }

  const addAndSelect = useCallback((server: ServerSummary) => {
    setServers((prev) => {
      const withoutDuplicate = prev.filter(
        (existing) => existing.id !== server.id,
      );
      return [...withoutDuplicate, server];
    });
    setSelectedServerId(server.id);
    setSelectedChannelId(null);
    setIsCreateModalVisible(false);
    setIsJoinModalVisible(false);
  }, []);

  function handleAddServer() {
    setIsAddServerSheetVisible(true);
  }

  const handleLeaveServer = useCallback(
    async (serverId: string): Promise<LeaveServerActionResult> => {
      if (!user) {
        return {
          ok: false,
          message: "Tu sesión expiró. Volvé a iniciar sesión.",
        };
      }

      const result = await leaveServer(serverId, user.id);
      if (result.ok) {
        setServers((prev) => prev.filter((server) => server.id !== serverId));
        setSelectedServerId((prev) => (prev === serverId ? null : prev));
        setSelectedChannelId(null);
      }
      return result;
    },
    [user],
  );

  /** El servidor cambió localmente (se creó un canal o una categoría). */
  const handleServerUpdated = useCallback((updated: ServerSummary) => {
    setServers((prev) =>
      prev.map((existing) => (existing.id === updated.id ? updated : existing)),
    );
  }, []);

  if (isLoadingServers) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.accentBright} />
      </View>
    );
  }

  if (selectedServer && selectedChannel) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ChannelScreen
          channel={selectedChannel}
          serverId={selectedServer.id}
          authToken={token}
          currentUserId={user ? String(user.id) : null}
          onBack={() => setSelectedChannelId(null)}
        />
      </View>
    );
  }

  if (selectedServer) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ServerChannelsScreen
          server={selectedServer}
          servers={servers}
          authToken={token}
          userName={user?.name}
          currentUserId={user ? String(user.id) : null}
          isOwner={user != null && String(user.id) === selectedServer.owner_id}
          onSelectChannel={setSelectedChannelId}
          onSelectHome={handleSelectHome}
          onSwitchServer={(id) => {
            setSelectedServerId(id);
            setSelectedChannelId(null);
          }}
          onAddServer={handleAddServer}
          onLogout={logout}
          onLeaveServer={handleLeaveServer}
          onServerUpdated={handleServerUpdated}
        />

        <AddServerSheet
          visible={isAddServerSheetVisible}
          onClose={() => setIsAddServerSheetVisible(false)}
          onCreatePress={() => {
            setIsAddServerSheetVisible(false);
            setIsCreateModalVisible(true);
          }}
          onJoinPress={() => {
            setIsAddServerSheetVisible(false);
            setIsJoinModalVisible(true);
          }}
        />
        <CreateServerModal
          visible={isCreateModalVisible}
          onClose={() => setIsCreateModalVisible(false)}
          onCreated={addAndSelect}
        />
        <JoinServerModal
          visible={isJoinModalVisible}
          onClose={() => setIsJoinModalVisible(false)}
          onJoined={addAndSelect}
          authToken={token}
        />
      </View>
    );
  }

  if (servers.length > 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ServerPickerScreen
          servers={servers}
          authToken={token}
          userName={user?.name}
          onSelectServer={(id) => {
            setSelectedServerId(id);
            setSelectedChannelId(null);
          }}
          onAddServer={handleAddServer}
          onLogout={logout}
        />

        <AddServerSheet
          visible={isAddServerSheetVisible}
          onClose={() => setIsAddServerSheetVisible(false)}
          onCreatePress={() => {
            setIsAddServerSheetVisible(false);
            setIsCreateModalVisible(true);
          }}
          onJoinPress={() => {
            setIsAddServerSheetVisible(false);
            setIsJoinModalVisible(true);
          }}
        />
        <CreateServerModal
          visible={isCreateModalVisible}
          onClose={() => setIsCreateModalVisible(false)}
          onCreated={addAndSelect}
        />
        <JoinServerModal
          visible={isJoinModalVisible}
          onClose={() => setIsJoinModalVisible(false)}
          onJoined={addAndSelect}
          authToken={token}
        />
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      <StatusBar style="light" />
      <View style={[styles.emptyTopBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={logout}
          style={styles.emptyLogoutButton}
          accessibilityRole="button"
        >
          <Feather name="log-out" size={13} color={colors.textSubtle} />
          <Text style={styles.emptyLogoutText}>Salir</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.emptyScrollContent}>
        <EmptyState
          userName={user?.name}
          onCreatePress={() => setIsCreateModalVisible(true)}
          onJoinPress={() => setIsJoinModalVisible(true)}
        />
      </ScrollView>

      <CreateServerModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onCreated={addAndSelect}
      />
      <JoinServerModal
        visible={isJoinModalVisible}
        onClose={() => setIsJoinModalVisible(false)}
        onJoined={addAndSelect}
        authToken={token}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bgServers,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.bgServers,
  },
  emptyTopBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  emptyLogoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  emptyLogoutText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.textSubtle,
    textTransform: "uppercase",
  },
  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
});
