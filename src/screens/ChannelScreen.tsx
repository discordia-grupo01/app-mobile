import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { Channel } from "../features/servers/types";
import { colors } from "../theme/colors";

interface ChannelScreenProps {
  channel: Channel;
  onBack: () => void;
}

/**
 * Canal abierto a pantalla completa (segundo paso del flujo "ir al
 * servidor" en el celular). Todavia no hay servicio de mensajes, asi que
 * -- igual que en web-client -- no fingimos mensajes reales, solo la
 * estructura: el header del canal, un estado de bienvenida, y un input de
 * chat deshabilitado.
 */
export function ChannelScreen({ channel, onBack }: ChannelScreenProps) {
  const isText = channel.kind === "text";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          accessibilityLabel="Volver"
        >
          <Feather name="arrow-left" size={22} color={colors.textMuted} />
        </TouchableOpacity>
        <Feather
          name={isText ? "hash" : "volume-2"}
          size={19}
          color={colors.textSubtle}
        />
        <Text style={styles.headerName} numberOfLines={1}>
          {channel.name}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Feather
            name={isText ? "hash" : "volume-2"}
            size={30}
            color="#ffffff"
          />
        </View>
        <Text style={styles.title}>
          {isText
            ? `Bienvenido a #${channel.name}`
            : `Canal de voz: ${channel.name}`}
        </Text>
        <Text style={styles.subtitle}>
          {isText
            ? "Este es el comienzo del canal. El chat todavía no está conectado en esta versión."
            : "La conexión de voz todavía no está implementada en esta versión."}
        </Text>
      </View>

      {isText ? (
        <View style={styles.inputBar}>
          <Text style={styles.inputBarText}>
            El chat todavía no está disponible
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgChat,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 60,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  headerName: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 320,
  },
  inputBar: {
    margin: 16,
    marginTop: 0,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  inputBarText: {
    fontSize: 14,
    color: colors.textSubtle,
  },
});
