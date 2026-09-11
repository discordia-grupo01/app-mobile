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

import { AddServerSheet } from "../components/servers/AddServerSheet";
import { CreateServerModal } from "../components/servers/CreateServerModal";
import { EmptyState } from "../components/servers/EmptyState";
import { JoinServerModal } from "../components/servers/JoinServerModal";
import { useAuth } from "../features/auth/auth-context";
import { listMyServers } from "../features/servers/service";
import type { ServerListItem, ServerSummary } from "../features/servers/types";
import { colors } from "../theme/colors";
import { ChannelScreen } from "./ChannelScreen";
import { ServerChannelsScreen } from "./ServerChannelsScreen";
import { ServerPickerScreen } from "./ServerPickerScreen";

/**
 * Home de la app. Arranca pidiendo los servidores del usuario; si no tiene
 * ninguno muestra el estado vacio (crear / unirse), y si ya tiene alguno
 * entra directo al primero. Todo el flujo (crear, unirse, ver canales,
 * abrir un canal) vive aca como estado local -- no hay libreria de
 * navegacion todavia, sigue el mismo patron que `App.tsx` usa para login/
 * registro.
 */
export function HomeScreen() {
  const { user, token, logout } = useAuth();
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

      // Los servers que ya existian al cargar la pantalla no tienen forma de
      // saber si su icono es uno que el usuario eligio o el default que
      // genera el back -- arrancan en `hasCustomIcon: false`.
      if (result.ok) {
        const loaded = result.servers.map((server) => ({
          ...server,
          hasCustomIcon: false,
        }));
        setServers(loaded);
        // Al arrancar la app, si el usuario ya tiene servidores entramos
        // directo al primero -- el estado "Inicio" (nada seleccionado)
        // despues solo se llega tocando el boton de Inicio del rail.
        if (loaded.length > 0) {
          setSelectedServerId((prev) => prev ?? loaded[0].id);
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

  const addAndSelect = useCallback(
    (server: ServerSummary, hasCustomIcon: boolean) => {
      setServers((prev) => {
        const withoutDuplicate = prev.filter(
          (existing) => existing.id !== server.id,
        );
        return [...withoutDuplicate, { ...server, hasCustomIcon }];
      });
      setSelectedServerId(server.id);
      setSelectedChannelId(null);
      setIsCreateModalVisible(false);
      setIsJoinModalVisible(false);
    },
    [],
  );

  function handleAddServer() {
    setIsAddServerSheetVisible(true);
  }

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
          onSelectChannel={setSelectedChannelId}
          onSelectHome={handleSelectHome}
          onSwitchServer={(id) => {
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
          onJoined={(server) => addAndSelect(server, false)}
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
          onJoined={(server) => addAndSelect(server, false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      <StatusBar style="light" />
      <View style={styles.emptyTopBar}>
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
        onJoined={(server) => addAndSelect(server, false)}
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
