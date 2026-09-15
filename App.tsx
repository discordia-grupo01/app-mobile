import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import type { AuthMode } from "./src/components/auth/AuthTabs";
import { AuthProvider, useAuth } from "./src/features/auth/auth-context";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { colors } from "./src/theme/colors";

type AuthScreen = AuthMode | "forgot-password";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>("login");

  if (isLoading) {
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
    return <ForgotPasswordScreen onBack={() => setAuthScreen("login")} />;
  }

  return authScreen === "login" ? (
    <LoginScreen
      onSwitchMode={setAuthScreen}
      onForgotPassword={() => setAuthScreen("forgot-password")}
    />
  ) : (
    <RegisterScreen onSwitchMode={setAuthScreen} />
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
