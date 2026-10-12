import {
  type AccessRevokedReason,
  type Channel,
  type ChannelOverridePermission,
  type DeleteServerResult,
  hasPermission,
  type LeaveServerResult,
  type Role,
  type ServerSummary,
  SESSION_EXPIRED_MESSAGE,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LoadingScreen } from "../components/ui/LoadingScreen";
import { useLoadingGate } from "../hooks/useLoadingGate";
import { useDirectMessages } from "../features/direct-messages/useDirectMessages";
import { useMentions } from "../features/mentions/useMentions";
import { AddServerSheet } from "../features/servers/components/rail/AddServerSheet";
import { CreateServerModal } from "../features/servers/components/server/CreateServerModal";
import { EmptyState } from "../features/servers/components/home/EmptyState";
import { JoinServerModal } from "../features/servers/components/server/JoinServerModal";
import { useAuth } from "../features/auth/auth-context";
import { authorFromProfile } from "../features/messages/author";
import { getOwnProfile } from "../features/profile/service";
import { listMemberRoles, listRoles } from "../features/roles/api";
import {
  deleteServer,
  leaveServer,
  listMyServers,
} from "../features/servers/api";
import { useMyChannelPermissions } from "../features/channels/useMyChannelPermissions";
import { getLastLocation, setLastLocation } from "../lib/storage";
import { useStatusBarStyle, useThemeColors } from "../theme/theme-context";
import { ChannelScreen } from "./ChannelScreen";
import { DirectMessagesScreen } from "./DirectMessagesScreen";
import { ServerChannelsScreen } from "./ServerChannelsScreen";
import { ServerPickerScreen } from "./ServerPickerScreen";

type MainView = "servers" | "dm";

interface HomeScreenProps {
  /** La pantalla de carga ya estaba a la vista antes de montar el home. */
  resumesLoader?: boolean;
}

export function HomeScreen({ resumesLoader = false }: HomeScreenProps) {
  const colors = useThemeColors();
  const statusBarStyle = useStatusBarStyle();
  const { user, token, logout, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [servers, setServers] = useState<ServerSummary[]>([]);
  const [isLoadingServers, setIsLoadingServers] = useState(true);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null,
  );
  // Se abre en Mensajes Directos: asi lo primero que se ve tras loguearse es la
  // lista de conversaciones y no un servidor.
  const [view, setView] = useState<MainView>("dm");
  const [isRestored, setIsRestored] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [isAddServerSheetVisible, setIsAddServerSheetVisible] = useState(false);
  const [myRoles, setMyRoles] = useState<Role[]>([]);
  const [serverRoles, setServerRoles] = useState<Role[]>([]);
  const [permissionsVersion, setPermissionsVersion] = useState(0);
  const [lostChannel, setLostChannel] = useState<Channel | null>(null);

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
      if (cancelled) return;
      if (result.ok) updateUser(result.user);
      setIsProfileLoaded(true);
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
    ) ??
    (lostChannel && lostChannel.id === selectedChannelId ? lostChannel : null);

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
  const mentions = useMentions(currentAuthor?.id ?? null);
  const directMessages = useDirectMessages(currentAuthor, view === "dm", {
    onMention: mentions.receive,
    onRejoined: mentions.reload,
  });
  const unreadDmCount = directMessages.conversations.filter(
    (c) => c.isUnread,
  ).length;

  // Al reabrir la app se vuelve a donde se estaba (servidor + canal, o un DM).
  const userId = user ? String(user.id) : null;
  const { openConversation } = directMessages;
  useEffect(() => {
    if (isRestored || isLoadingServers || !userId) return;
    let cancelled = false;
    getLastLocation(userId).then((stored) => {
      if (cancelled) return;
      const server = servers.find((item) => item.id === stored?.serverId);
      if (stored?.view === "servers" && server) {
        setView("servers");
        setSelectedServerId(server.id);
        setSelectedChannelId(
          server.channels.find((channel) => channel.id === stored.channelId)
            ?.id ?? null,
        );
      } else if (stored?.partnerId) {
        openConversation(stored.partnerId);
      }
      setIsRestored(true);
    });
    return () => {
      cancelled = true;
    };
  }, [isRestored, isLoadingServers, userId, servers, openConversation]);

  const activePartnerId = directMessages.activeSummary?.partner.id ?? null;
  useEffect(() => {
    if (!isRestored || !userId) return;
    void setLastLocation({
      userId,
      view,
      serverId: selectedServerId,
      channelId: selectedChannelId,
      partnerId: activePartnerId,
    });
  }, [
    isRestored,
    userId,
    view,
    selectedServerId,
    selectedChannelId,
    activePartnerId,
  ]);

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
  const fetchServerRoles = useCallback(() => {
    if (!selectedServer) return undefined;
    let cancelled = false;
    listRoles(selectedServer.id).then((result) => {
      if (!cancelled && result.ok) setServerRoles(result.roles);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedServer]);

  useEffect(() => fetchServerRoles(), [fetchServerRoles]);

  const reloadServers = useCallback(async () => {
    const result = await listMyServers();
    if (result.ok) setServers(result.servers);
  }, []);

  const handlePermissionsChanged = useCallback(() => {
    fetchMyRoles();
    fetchServerRoles();
    setPermissionsVersion((version) => version + 1);
    void reloadServers();
  }, [fetchMyRoles, fetchServerRoles, reloadServers]);

  function handleAccessRevoked(reason: AccessRevokedReason) {
    if (reason !== "permissions_changed" || !selectedChannel) return;
    setLostChannel(selectedChannel);
    void reloadServers();
  }

  function closeChannel() {
    setLostChannel(null);
    setSelectedChannelId(null);
  }

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
  const canKickMembers = hasPermission(
    { isOwner, roles: myRoles },
    "KICK_MEMBERS",
  );
  const canInvite = hasPermission({ isOwner, roles: myRoles }, "CREATE_INVITE");
  const canManageMessages = hasPermission(
    { isOwner, roles: myRoles },
    "MANAGE_MESSAGES",
  );
  const canSendMessages = hasPermission(
    { isOwner, roles: myRoles },
    "SEND_MESSAGES",
  );
  const canMentionEveryone = hasPermission(
    { isOwner, roles: myRoles },
    "MENTION_EVERYONE",
  );
  const canAddReactions = hasPermission(
    { isOwner, roles: myRoles },
    "ADD_REACTIONS",
  );
  const canConnect = hasPermission({ isOwner, roles: myRoles }, "CONNECT");

  const channelPermissions = useMyChannelPermissions(
    selectedChannel && selectedChannel !== lostChannel
      ? selectedChannel.id
      : null,
    userId,
    permissionsVersion,
  );

  /** Lo del servidor hasta que lleguen los permisos del canal, que traen las excepciones. */
  function canInChannel(
    permission: ChannelOverridePermission,
    serverLevel: boolean,
  ): boolean {
    if (isOwner || channelPermissions === null) return serverLevel;
    return channelPermissions.includes(permission);
  }

  const myRoleIds = useMemo(() => myRoles.map((role) => role.id), [myRoles]);

  const openChannelId = selectedChannel?.id ?? null;
  const openChannelUnread = openChannelId
    ? (mentions.byChannel[openChannelId] ?? 0)
    : 0;
  const { markChannelRead } = mentions;
  useEffect(() => {
    if (openChannelId && openChannelUnread > 0) markChannelRead(openChannelId);
  }, [openChannelId, openChannelUnread, markChannelRead]);

  function handleOpenDirectMessages() {
    setView("dm");
  }

  function selectServer(serverId: string) {
    setView("servers");
    setSelectedServerId(serverId);
    setSelectedChannelId(null);
    setLostChannel(null);
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

  const handleDeleteServer = useCallback(
    async (
      serverId: string,
      confirmName: string,
    ): Promise<DeleteServerResult> => {
      const result = await deleteServer(serverId, confirmName);
      if (result.ok) {
        setServers((prev) => prev.filter((server) => server.id !== serverId));
        setSelectedServerId((prev) => (prev === serverId ? null : prev));
        setSelectedChannelId(null);
      }
      return result;
    },
    [],
  );

  /** El servidor cambió localmente (se creó un canal o una categoría). */
  const handleServerUpdated = useCallback((updated: ServerSummary) => {
    setServers((prev) =>
      prev.map((existing) => (existing.id === updated.id ? updated : existing)),
    );
  }, []);

  const isReady =
    !isLoadingServers &&
    isRestored &&
    isProfileLoaded &&
    (!currentAuthor || (mentions.isLoaded && !directMessages.isLoading));
  const gate = useLoadingGate(isReady, { showImmediately: resumesLoader });
  if (gate === "waiting" || gate === "loading" || gate === "leaving") {
    return (
      <View className="flex-1 bg-surface">
        <StatusBar style={statusBarStyle} />
        {gate === "waiting" ? null : (
          <LoadingScreen
            isLeaving={gate === "leaving"}
            skipIntro={resumesLoader}
          />
        )}
      </View>
    );
  }

  if (view === "dm") {
    return (
      <View className="flex-1">
        <StatusBar style={statusBarStyle} />
        <DirectMessagesScreen
          unreadMentionsByServer={mentions.byServer}
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
          canKickMembers={canKickMembers}
          canManageMessages={canInChannel("MANAGE_MESSAGES", canManageMessages)}
          canSendMessages={canInChannel("SEND_MESSAGES", canSendMessages)}
          canMentionEveryone={canMentionEveryone}
          canAddReactions={canInChannel("ADD_REACTIONS", canAddReactions)}
          canConnect={canInChannel("CONNECT", canConnect)}
          serverRoles={serverRoles}
          myRoleIds={myRoleIds}
          onAccessRevoked={handleAccessRevoked}
          onBack={closeChannel}
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
          myRoles={myRoles}
          serverRoles={serverRoles}
          canManageChannels={canManageChannels}
          canManageRoles={canManageRoles}
          canManageServer={canManageServer}
          canManageMessages={canManageMessages}
          canBanMembers={canBanMembers}
          canInvite={canInvite}
          onPermissionsChanged={handlePermissionsChanged}
          onChannelPermissionsSaved={handlePermissionsChanged}
          onSelectChannel={setSelectedChannelId}
          onOpenDirectMessages={handleOpenDirectMessages}
          unreadDmCount={unreadDmCount}
          unreadMentionsByChannel={mentions.byChannel}
          unreadMentionsByServer={mentions.byServer}
          onSwitchServer={selectServer}
          onAddServer={handleAddServer}
          onLogout={logout}
          onLeaveServer={handleLeaveServer}
          onDeleteServer={handleDeleteServer}
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
          unreadMentionsByServer={mentions.byServer}
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
