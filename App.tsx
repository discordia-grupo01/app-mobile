import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import type { AuthMode } from "./src/components/auth/AuthTabs";
import { AuthProvider, useAuth } from "./src/features/auth/auth-context";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <HomeScreen />;
  }

  return authMode === "login" ? (
    <LoginScreen onSwitchMode={setAuthMode} />
  ) : (
    <RegisterScreen onSwitchMode={setAuthMode} />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
});
