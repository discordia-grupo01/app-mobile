import { StatusBar } from "expo-status-bar";
import { Image, StyleSheet, Text, View } from "react-native";

import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/auth-context";
import { colors } from "../theme/colors";

export function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.card}>
        <Image
          source={require("../../assets/logo-light.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <Text style={styles.welcomeText}>¡Sesión Activa!</Text>

        <View style={styles.userInfoBox}>
          <Text style={styles.label}>USUARIO</Text>
          <Text style={styles.value}>{user?.name || "Sin nombre"}</Text>

          <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
          <Text style={styles.value}>{user?.email || "Sin email"}</Text>
        </View>

        <Button
          title="Cerrar Sesión"
          variant="danger"
          onPress={logout}
          style={styles.logoutButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgServers,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.bgModal,
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
  },
  logoImage: {
    width: 180,
    height: 48,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
  },
  userInfoBox: {
    width: "100%",
    backgroundColor: colors.bgInput,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: colors.textSubtle,
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  logoutButton: {
    marginTop: 8,
  },
});
