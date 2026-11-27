import { AuthScreen } from "../components/auth/AuthScreen";
import { ResetPasswordForm } from "../features/auth/components/ResetPasswordForm";

interface ResetPasswordScreenProps {
  token: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function ResetPasswordScreen({
  token,
  onBack,
  onSuccess,
}: ResetPasswordScreenProps) {
  return (
    <AuthScreen>
      <ResetPasswordForm token={token} onBack={onBack} onSuccess={onSuccess} />
    </AuthScreen>
  );
}
