import "./global.css";

import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import type { AuthMode } from "./src/features/auth/components/AuthTabs";
import { AuthProvider, useAuth } from "./src/features/auth/auth-context";
import { useEmailConfirmation } from "./src/features/auth/use-email-confirmation";

import { getPinEnabled } from "./src/lib/storage";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { PinEntryScreen } from "./src/screens/PinEntryScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { ConfirmEmailScreen } from "./src/screens/ConfirmEmailScreen";
import { ThemeProvider, useThemeColors } from "./src/theme/theme-context";

type AuthScreen = AuthMode | "forgot-password" | "confirm-email";

function AppContent() {
  const colors = useThemeColors();
  const { isAuthenticated, isLoading } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>("login");
  const [justRegistered, setJustRegistered] = useState(false);
  const {
    email: confirmationEmail,
    token: confirmationToken,
    canResend: canResendConfirmation,
    handleRegistered: handleEmailRegistered,
    handleEmailNotVerified: handleUnverifiedEmail,
    clear: clearEmailConfirmation,
  } = useEmailConfirmation(
    useCallback(() => setAuthScreen("confirm-email"), []),
  );

  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [isPinCheckLoading, setIsPinCheckLoading] = useState(true);
  const [skipPinEntry, setSkipPinEntry] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPinEnabled()
      .then((enabled) => {
        if (!cancelled) setIsPinEnabled(enabled);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsPinCheckLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSwitchMode(mode: AuthScreen) {
    setAuthScreen(mode);
    setJustRegistered(false);
    if (mode !== "confirm-email") {
      clearEmailConfirmation();
    }
  }

  function handleRegistered(email: string) {
    setJustRegistered(true);
    handleEmailRegistered(email);
    setAuthScreen("confirm-email");
  }

  function handleEmailNotVerified(email: string) {
    handleUnverifiedEmail(email);
    setAuthScreen("confirm-email");
  }

  if (isLoading || isPinCheckLoading) {
    return (
      <View className="flex-1 bg-surface-servers justify-center items-center">
        <ActivityIndicator size="large" color={colors.accentBright} />
      </View>
    );
  }

  if (authScreen === "confirm-email") {
    return (
      <ConfirmEmailScreen
        email={confirmationEmail}
        token={confirmationToken}
        canResend={canResendConfirmation}
        onBackToLogin={() => handleSwitchMode("login")}
      />
    );
  }

  if (isAuthenticated) {
    return <HomeScreen />;
  }

  if (isPinEnabled && !skipPinEntry) {
    return (
      <PinEntryScreen
        onUseAnotherAccount={() => setSkipPinEntry(true)}
        onEmailNotVerified={handleEmailNotVerified}
      />
    );
  }

  if (authScreen === "forgot-password") {
    return <ForgotPasswordScreen onBack={() => handleSwitchMode("login")} />;
  }

  return authScreen === "login" ? (
    <LoginScreen
      onSwitchMode={handleSwitchMode}
      onForgotPassword={() => setAuthScreen("forgot-password")}
      onEmailNotVerified={handleEmailNotVerified}
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
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
