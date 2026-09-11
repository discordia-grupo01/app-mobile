import { StatusBar } from "expo-status-bar";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AuthTabs, type AuthMode } from "../components/auth/AuthTabs";
import { LoginForm } from "../components/auth/LoginForm";
import { colors } from "../theme/colors";

interface LoginScreenProps {
  onSwitchMode: (mode: AuthMode) => void;
}

export function LoginScreen({ onSwitchMode }: LoginScreenProps) {
  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Logo Discordia (Light Version for Dark Background) */}
          <View style={styles.logoWrapper}>
            <Image
              source={require("../../assets/logo-light.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <AuthTabs active="login" onChange={onSwitchMode} />

          <Text style={styles.title}>¡Bienvenido de nuevo!</Text>
          <Text style={styles.subtitle}>
            Ingresa tus credenciales para acceder.
          </Text>

          {/* Login Form */}
          <LoginForm onSwitchToRegister={() => onSwitchMode("register")} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.bgServers,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 420,
    paddingHorizontal: 28,
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoImage: {
    width: 200,
    height: 52,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 26,
  },
});
