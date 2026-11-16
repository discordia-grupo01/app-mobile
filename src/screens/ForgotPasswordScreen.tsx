import { AuthScreen } from "../components/auth/AuthScreen";
import { ForgotPasswordForm } from "../features/auth/components/ForgotPasswordForm";

interface ForgotPasswordScreenProps {
  onBack: () => void;
}

export function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
  return (
    <AuthScreen>
      <ForgotPasswordForm onBack={onBack} />
    </AuthScreen>
  );
}
