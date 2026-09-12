import { Feather } from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ServerRail } from "../components/servers/ServerRail";
import { UserProfileBar } from "../components/servers/UserProfileBar";
import type { Channel, ServerListItem } from "../features/servers/types";
import { colors } from "../theme/colors";

interface ServerChannelsScreenProps {
  server: ServerListItem;
  servers: ServerListItem[];
  authToken: string | null;
  userName?: string | null;
  onSelectChannel: (channelId: string) => void;
  onSelectHome: () => void;
  onSwitchServer: (serverId: string) => void;
  onAddServer: () => void;
  onLogout: () => void;
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

/**
 * Pantalla "home" del celular, con el look de la app real de Discord: a la
 * izquierda el rail vertical con los iconos de todos los servidores del
 * usuario (tocar uno lo selecciona, tocar el de Inicio vuelve al estado
 * sin servidor elegido), a la derecha el panel del servidor actual
 * (buscador decorativo, canales de texto y de voz) y abajo la barra de
 * perfil del usuario. El chat en si sigue siendo un segundo paso, en
 * `ChannelScreen`, para que no quede todo apretado en una pantalla de
 * celular.
 */
export function ServerChannelsScreen({
  server,
  servers,
  authToken,
  userName,
  onSelectChannel,
  onSelectHome,
  onSwitchServer,
  onAddServer,
  onLogout,
}: ServerChannelsScreenProps) {
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
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {server.name}
          </Text>
          <Feather name="chevron-down" size={18} color={colors.textSubtle} />
        </View>

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
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
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
