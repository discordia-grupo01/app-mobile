import { Feather } from "@expo/vector-icons";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { serverIconUrl } from "../../features/servers/service";
import type { ServerListItem } from "../../features/servers/types";
import { colors } from "../../theme/colors";
import { ServerAvatar } from "./ServerAvatar";

export const RAIL_WIDTH = 72;

interface ServerRailProps {
  servers: ServerListItem[];
  /** `null` cuando estamos en el "home" (nada seleccionado todavia). */
  activeServerId: string | null;
  authToken: string | null;
  onSelectHome: () => void;
  onSelectServer: (serverId: string) => void;
  onAddServer: () => void;
}

function ServerRailIcon({
  item,
  active,
  authToken,
  onPress,
}: {
  item: ServerListItem;
  active: boolean;
  authToken: string | null;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={styles.iconWrap}
    >
      {active ? <View style={styles.indicator} /> : null}
      <ServerAvatar
        name={item.name}
        uri={serverIconUrl(item.id)}
        authToken={authToken}
        size={48}
        borderRadius={active ? 16 : 24}
      />
    </TouchableOpacity>
  );
}

/**
 * Rail vertical de servidores, igual al de la app real de Discord: arriba
 * el boton "Home" (te lleva al estado sin servidor seleccionado), despues
 * el icono de cada servidor al que perteneces, y al final el "+" para
 * sumar uno nuevo. Se comparte entre `ServerPickerScreen` (nada
 * seleccionado) y `ServerChannelsScreen` (un servidor abierto).
 */
export function ServerRail({
  servers,
  activeServerId,
  authToken,
  onSelectHome,
  onSelectServer,
  onAddServer,
}: ServerRailProps) {
  const isHomeActive = activeServerId === null;

  return (
    <ScrollView
      style={styles.rail}
      contentContainerStyle={styles.railContent}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        onPress={onSelectHome}
        style={[
          styles.homeButton,
          isHomeActive ? styles.homeButtonActive : null,
        ]}
        accessibilityLabel="Inicio"
      >
        <Feather
          name="home"
          size={20}
          color={isHomeActive ? "#ffffff" : colors.textMuted}
        />
      </TouchableOpacity>

      <View style={styles.divider} />

      {servers.map((item) => (
        <ServerRailIcon
          key={item.id}
          item={item}
          active={item.id === activeServerId}
          authToken={authToken}
          onPress={() => onSelectServer(item.id)}
        />
      ))}

      <TouchableOpacity
        onPress={onAddServer}
        style={styles.addButton}
        accessibilityLabel="Agregar servidor"
      >
        <Feather name="plus" size={20} color={colors.success} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: RAIL_WIDTH,
    flexGrow: 0,
    backgroundColor: colors.bgServers,
  },
  railContent: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  homeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgInput,
  },
  homeButtonActive: {
    backgroundColor: colors.accent,
    borderRadius: 16,
  },
  divider: {
    width: 32,
    height: 1,
    backgroundColor: colors.borderStrong,
    marginVertical: 2,
  },
  iconWrap: {
    width: RAIL_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  indicator: {
    position: "absolute",
    left: 0,
    top: "50%",
    marginTop: -12,
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: "#ffffff",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgInput,
  },
});
