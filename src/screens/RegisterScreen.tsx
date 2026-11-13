import { Text } from "react-native";

import { AuthScreen } from "../components/auth/AuthScreen";
import { AuthTabs, type AuthMode } from "../features/auth/components/AuthTabs";
import { RegisterForm } from "../features/auth/components/RegisterForm";

interface RegisterScreenProps {
  onSwitchMode: (mode: AuthMode) => void;
  onRegistered: (email: string) => void;
}

export function RegisterScreen({
  onSwitchMode,
  onRegistered,
}: RegisterScreenProps) {
  return (
    <AuthScreen>
      <AuthTabs active="register" onChange={onSwitchMode} />

      <Text className="mb-1.5 text-[24px] font-bold text-content">
        Crea tu cuenta
      </Text>
      <Text className="mb-[26px] text-[14px] text-content-muted">
        Es gratis y siempre lo será.
      </Text>

      {/* Register Form */}
      <RegisterForm
        onSwitchToLogin={() => onSwitchMode("login")}
        onRegistered={onRegistered}
      />
    </AuthScreen>
  );
}
