import {
  hasPermission,
  type LeaveServerResult,
  type Role,
  type ServerSummary,
  SESSION_EXPIRED_MESSAGE,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDirectMessages } from "../features/direct-messages/useDirectMessages";
import { AddServerSheet } from "../features/servers/components/rail/AddServerSheet";
import { CreateServerModal } from "../features/servers/components/server/CreateServerModal";
import { EmptyState } from "../features/servers/components/home/EmptyState";
import { JoinServerModal } from "../features/servers/components/server/JoinServerModal";
import { useAuth } from "../features/auth/auth-context";
import { authorFromProfile } from "../features/messages/author";
import { getOwnProfile } from "../features/profile/service";
import { listMemberRoles, listRoles } from "../features/roles/api";
import { leaveServer, listMyServers } from "../features/servers/api";
import { useStatusBarStyle, useThemeColors } from "../theme/theme-context";
import { ChannelScreen } from "./ChannelScreen";
import { DirectMessagesScreen } from "./DirectMessagesScreen";
import { ServerChannelsScreen } from "./ServerChannelsScreen";
import { ServerPickerScreen } from "./ServerPickerScreen";

type MainView = "servers" | "dm";

export function HomeScreen() {
  const colors = useThemeColors();
  const statusBarStyle = useStatusBarStyle();
  const { user, token, logout, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [servers, setServers] = useState<ServerSummary[]>([]);
  const [isLoadingServers, setIsLoadingServers] = useState(true);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null,
  );
  const [view, setView] = useState<MainView>("servers");
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [isAddServerSheetVisible, setIsAddServerSheetVisible] = useState(false);
  const [myRoles, setMyRoles] = useState<Role[]>([]);
  const [serverRoles, setServerRoles] = useState<Role[]>([]);

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

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getOwnProfile().then((result) => {
      if (cancelled || !result.ok) return;
      updateUser(result.user);
    });
    return () => {
      cancelled = true;
    };
  }, [token, updateUser]);

  const selectedServer =
    servers.find((server) => server.id === selectedServerId) ?? null;
  const selectedChannel =
    selectedServer?.channels.find(
      (channel) => channel.id === selectedChannelId,
    ) ?? null;

  const isOwner =
    user != null &&
    selectedServer != null &&
    String(user.id) === selectedServer.owner_id;

  // Se pide una sola vez y sobrevive a cambiar de vista, asi el contador de
  // no leidos del riel no se resetea al entrar y salir de Mensajes Directos.
  const currentAuthor = useMemo(
    () => (user ? authorFromProfile(user) : null),
    [user],
  );
  const directMessages = useDirectMessages(currentAuthor);
  const unreadDmCount = directMessages.conversations.filter(
    (c) => c.isUnread,
  ).length;

  /**
   * Roles asignados al usuario actual en `selectedServer`
   */
  const fetchMyRoles = useCallback(() => {
    if (!user || !selectedServer) return undefined;
    let cancelled = false;
    listMemberRoles(selectedServer.id, String(user.id)).then((result) => {
      if (cancelled) return;
      setMyRoles(result.ok ? result.roles : []);
    });
    return () => {
      cancelled = true;
    };
  }, [user, selectedServer]);

  useEffect(() => fetchMyRoles(), [fetchMyRoles]);

  /**
   * Catalogo completo de roles del server, para colorear menciones a `@Rol`.
   * Sin servidor seleccionado no hay nada que buscar (y sin `setState` en ese
   * caso: `serverRoles` queda con el valor anterior, que no se usa hasta que
   * haya un canal de texto abierto).
   */
  useEffect(() => {
    if (!selectedServer) return;
    let cancelled = false;
    listRoles(selectedServer.id).then((result) => {
      if (!cancelled && result.ok) setServerRoles(result.roles);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedServer]);

  const canManageChannels = hasPermission(
    { isOwner, roles: myRoles },
    "MANAGE_CHANNELS",
  );
  const canManageRoles = hasPermission(
    { isOwner, roles: myRoles },
    "MANAGE_ROLES",
  );
  const canManageServer = hasPermission(
    { isOwner, roles: myRoles },
    "MANAGE_SERVER",
  );
  const canBanMembers = hasPermission(
    { isOwner, roles: myRoles },
    "BAN_MEMBERS",
  );
  const canInvite = hasPermission({ isOwner, roles: myRoles }, "CREATE_INVITE");
  const canManageMessages = hasPermission(
    { isOwner, roles: myRoles },
    "MANAGE_MESSAGES",
  );
  const canMentionEveryone = hasPermission(
    { isOwner, roles: myRoles },
    "MENTION_EVERYONE",
  );

  function handleOpenDirectMessages() {
    setView("dm");
  }

  function selectServer(serverId: string) {
    setView("servers");
    setSelectedServerId(serverId);
    setSelectedChannelId(null);
  }

  const addAndSelect = useCallback((server: ServerSummary) => {
    setServers((prev) => {
      const withoutDuplicate = prev.filter(
        (existing) => existing.id !== server.id,
      );
      return [...withoutDuplicate, server];
    });
    setView("servers");
    setSelectedServerId(server.id);
    setSelectedChannelId(null);
    setIsCreateModalVisible(false);
    setIsJoinModalVisible(false);
  }, []);

  function handleAddServer() {
    setIsAddServerSheetVisible(true);
  }

  const handleLeaveServer = useCallback(
    async (serverId: string): Promise<LeaveServerResult> => {
      if (!user) {
        return {
          ok: false,
          message: SESSION_EXPIRED_MESSAGE,
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
      <View className="flex-1 bg-surface-servers items-center justify-center">
        <StatusBar style={statusBarStyle} />
        <ActivityIndicator size="large" color={colors.accentBright} />
      </View>
    );
  }

  if (view === "dm") {
    return (
      <View className="flex-1">
        <StatusBar style={statusBarStyle} />
        <DirectMessagesScreen
          servers={servers}
          userName={user?.name}
          currentAuthor={currentAuthor}
          directMessages={directMessages}
          onSwitchServer={selectServer}
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
        />
      </View>
    );
  }

  if (selectedServer && selectedChannel) {
    return (
      <View className="flex-1">
        <StatusBar style={statusBarStyle} />
        <ChannelScreen
          channel={selectedChannel}
          serverId={selectedServer.id}
          authToken={token}
          currentUserId={user ? String(user.id) : null}
          canManageRoles={canManageRoles}
          canBanMembers={canBanMembers}
          canManageMessages={canManageMessages}
          canMentionEveryone={canMentionEveryone}
          serverRoles={serverRoles}
          onBack={() => setSelectedChannelId(null)}
        />
      </View>
    );
  }

  if (selectedServer) {
    return (
      <View className="flex-1">
        <StatusBar style={statusBarStyle} />
        <ServerChannelsScreen
          server={selectedServer}
          servers={servers}
          userName={user?.name}
          isOwner={isOwner}
          canManageChannels={canManageChannels}
          canManageRoles={canManageRoles}
          canManageServer={canManageServer}
          canBanMembers={canBanMembers}
          canInvite={canInvite}
          onPermissionsChanged={fetchMyRoles}
          onSelectChannel={setSelectedChannelId}
          onOpenDirectMessages={handleOpenDirectMessages}
          unreadDmCount={unreadDmCount}
          onSwitchServer={selectServer}
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
        />
      </View>
    );
  }

  if (servers.length > 0) {
    return (
      <View className="flex-1">
        <StatusBar style={statusBarStyle} />
        <ServerPickerScreen
          servers={servers}
          userName={user?.name}
          unreadDmCount={unreadDmCount}
          onSelectServer={selectServer}
          onOpenDirectMessages={handleOpenDirectMessages}
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
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-servers">
      <StatusBar style={statusBarStyle} />
      <View
        className="flex-row justify-end px-5 pt-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <TouchableOpacity
          onPress={logout}
          className="flex-row items-center gap-1.5 px-2.5 py-1.5"
          accessibilityRole="button"
        >
          <Feather name="log-out" size={13} color={colors.textSubtle} />
          <Text className="text-[11px] font-bold tracking-[1px] text-content-subtle uppercase">
            Salir
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerClassName="grow justify-center p-6 pt-3 pb-10">
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
      />
    </View>
  );
}
