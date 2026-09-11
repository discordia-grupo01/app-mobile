import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { ServerRail } from "../components/servers/ServerRail";
import { UserProfileBar } from "../components/servers/UserProfileBar";
import type { ServerListItem } from "../features/servers/types";
import { colors } from "../theme/colors";

interface ServerPickerScreenProps {
  servers: ServerListItem[];
  authToken: string | null;
  userName?: string | null;
  onSelectServer: (serverId: string) => void;
  onAddServer: () => void;
  onLogout: () => void;
}

/**
 * Estado "home" cuando el usuario ya tiene servidores pero no eligio
 * ninguno todavia (por ejemplo, tras tocar el boton de Inicio del rail).
 * Muestra el rail completo a la izquierda -- para que pueda elegir -- y a
 * la derecha un panel placeholder, igual al que usa `web-client` cuando no
 * hay servidor seleccionado.
 */
export function ServerPickerScreen({
  servers,
  authToken,
  userName,
  onSelectServer,
  onAddServer,
  onLogout,
}: ServerPickerScreenProps) {
  return (
    <View style={styles.container}>
      <ServerRail
        servers={servers}
        activeServerId={null}
        authToken={authToken}
        onSelectHome={() => {}}
        onSelectServer={onSelectServer}
        onAddServer={onAddServer}
      />

      <View style={styles.main}>
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Feather name="compass" size={28} color={colors.textSubtle} />
          </View>
          <Text style={styles.eyebrow}>TUS SERVIDORES</Text>
          <Text style={styles.title}>
            Elegí un servidor de la barra lateral
          </Text>
          <Text style={styles.subtitle}>
            O sumá uno nuevo con el botón de abajo.
          </Text>
        </View>

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
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgInput,
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: colors.textSubtle,
    marginBottom: 10,
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
  },
});
