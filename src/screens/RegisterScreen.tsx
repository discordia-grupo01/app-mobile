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
import { RegisterForm } from "../components/auth/RegisterForm";
import { colors } from "../theme/colors";

interface RegisterScreenProps {
  onSwitchMode: (mode: AuthMode) => void;
}

export function RegisterScreen({ onSwitchMode }: RegisterScreenProps) {
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

          <AuthTabs active="register" onChange={onSwitchMode} />

          <Text style={styles.title}>Crea tu cuenta</Text>
          <Text style={styles.subtitle}>Es gratis y siempre lo será.</Text>

          {/* Register Form */}
          <RegisterForm onSwitchToLogin={() => onSwitchMode("login")} />
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
