import "./global.css";

import { useCallback, useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LoadingScreen } from "./src/components/ui/LoadingScreen";
import type { AuthMode } from "./src/features/auth/components/AuthTabs";
import { AuthProvider, useAuth } from "./src/features/auth/auth-context";
import { BlockedUsersProvider } from "./src/features/blocks/blocked-users-context";
import { useEmailConfirmation } from "./src/features/auth/use-email-confirmation";

import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { PinEntryScreen } from "./src/screens/PinEntryScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { ConfirmEmailScreen } from "./src/screens/ConfirmEmailScreen";
import { ThemeProvider } from "./src/theme/theme-context";

type AuthScreen = AuthMode | "forgot-password" | "confirm-email";

function AppContent() {
  const { isAuthenticated, isLoading, isRestoringSession, isPinEnabled } =
    useAuth();
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

  const [skipPinEntry, setSkipPinEntry] = useState(false);
  // Al reabrir la app con sesion guardada se ve la pantalla de carga mientras
  // se valida; el home sigue con ella en vez de esperar de nuevo desde cero.
  const [hasShownLoader, setHasShownLoader] = useState(false);
  if (isRestoringSession && !hasShownLoader) setHasShownLoader(true);
  if (!isLoading && !isAuthenticated && hasShownLoader) {
    setHasShownLoader(false);
  }

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

  if (isLoading) {
    return isRestoringSession ? (
      <LoadingScreen />
    ) : (
      <View className="flex-1 bg-surface" />
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
    return (
      <BlockedUsersProvider>
        <HomeScreen resumesLoader={hasShownLoader} />
      </BlockedUsersProvider>
    );
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
