import { Feather } from "@expo/vector-icons";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "../../theme/colors";

interface UserProfileBarProps {
  userName?: string | null;
  onLogout: () => void;
}

/**
 * Barra de perfil fija abajo del panel principal, como en la app real de
 * Discord. Tocarla ofrece cerrar sesion -- es el unico lugar de la app
 * donde se puede salir ahora que ya no esta el boton "Salir" aparte.
 */
export function UserProfileBar({ userName, onLogout }: UserProfileBarProps) {
  const displayName = userName?.trim() || "Mi cuenta";
  const initial = displayName.charAt(0).toUpperCase() || "?";

  function handlePress() {
    Alert.alert(displayName, undefined, [
      { text: "Cerrar sesión", style: "destructive", onPress: onLogout },
      { text: "Cancelar", style: "cancel" },
    ]);
  }

  return (
    <TouchableOpacity
      style={styles.profileBar}
      onPress={handlePress}
      accessibilityRole="button"
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
        <View style={styles.statusDot} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.status}>En línea</Text>
      </View>
      <Feather name="bell" size={17} color={colors.textSubtle} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  profileBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgUserPanel,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  statusDot: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.bgUserPanel,
  },
  textWrap: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  status: {
    fontSize: 12,
    color: colors.textSubtle,
  },
});
