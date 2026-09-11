import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "../../theme/colors";

export type AuthMode = "login" | "register";

interface AuthTabsProps {
  active: AuthMode;
  onChange: (mode: AuthMode) => void;
}

/** Selector "Iniciar Sesion / Crear Cuenta" que se muestra en ambas pantallas de auth. */
export function AuthTabs({ active, onChange }: AuthTabsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, active === "login" && styles.tabActive]}
        onPress={() => onChange("login")}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.tabText, active === "login" && styles.tabTextActive]}
        >
          Iniciar Sesión
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, active === "register" && styles.tabActive]}
        onPress={() => onChange("register")}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabText,
            active === "register" && styles.tabTextActive,
          ]}
        >
          Crear Cuenta
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.bgInput,
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: colors.accent,
  },
  tabText: {
    color: colors.textSubtle,
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#ffffff",
  },
});
