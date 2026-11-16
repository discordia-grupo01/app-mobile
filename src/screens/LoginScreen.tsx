import { useState } from "react";
import { Text } from "react-native";

import { AuthScreen } from "../components/auth/AuthScreen";
import { AuthTabs, type AuthMode } from "../features/auth/components/AuthTabs";
import { LoginForm } from "../features/auth/components/LoginForm";

interface LoginScreenProps {
  onSwitchMode: (mode: AuthMode) => void;
  onForgotPassword: () => void;
  onEmailNotVerified: (email: string) => void;
  justRegistered?: boolean;
}

export function LoginScreen({
  onSwitchMode,
  onForgotPassword,
  onEmailNotVerified,
  justRegistered = false,
}: LoginScreenProps) {
  const [twoFactorActive, setTwoFactorActive] = useState(false);

  return (
    <AuthScreen>
      {!twoFactorActive ? (
        <>
          <AuthTabs active="login" onChange={onSwitchMode} />

          <Text className="mb-1.5 text-[24px] font-bold text-content">
            ¡Bienvenido de nuevo!
          </Text>
          <Text className="mb-[26px] text-[14px] text-content-muted">
            Ingresa tus credenciales para acceder.
          </Text>
        </>
      ) : null}

      {/* Login Form */}
      <LoginForm
        onSwitchToRegister={() => onSwitchMode("register")}
        onForgotPassword={onForgotPassword}
        onEmailNotVerified={onEmailNotVerified}
        onTwoFactorChallengeChange={setTwoFactorActive}
        justRegistered={justRegistered}
      />
    </AuthScreen>
  );
}
