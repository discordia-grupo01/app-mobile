import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import type { AuthMode } from "./src/features/auth/components/AuthTabs";
import { AuthProvider, useAuth } from "./src/features/auth/auth-context";

import { sharedSmokeTest } from "./src/lib/shared-smoke-test";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { colors } from "./src/theme/colors";

type AuthScreen = AuthMode | "forgot-password";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>("login");
  const [justRegistered, setJustRegistered] = useState(false);

  function handleSwitchMode(mode: AuthScreen) {
    setAuthScreen(mode);
    setJustRegistered(false);
  }

  function handleRegistered() {
    setJustRegistered(true);
    setAuthScreen("login");
  }

  if (isLoading) {
    console.log("client-shared:", sharedSmokeTest);
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accentBright} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <HomeScreen />;
  }

  if (authScreen === "forgot-password") {
    return <ForgotPasswordScreen onBack={() => handleSwitchMode("login")} />;
  }

  return authScreen === "login" ? (
    <LoginScreen
      onSwitchMode={handleSwitchMode}
      onForgotPassword={() => setAuthScreen("forgot-password")}
      justRegistered={justRegistered}
    />
  ) : (
    <RegisterScreen
      onSwitchMode={handleSwitchMode}
      onRegistered={handleRegistered}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bgServers,
    justifyContent: "center",
    alignItems: "center",
  },
});
