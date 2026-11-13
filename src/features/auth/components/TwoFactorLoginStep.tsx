import {
  ACCOUNT_RECOVERY_CHALLENGE_EXPIRED,
  ACCOUNT_RECOVERY_LINK,
  formatTwoFactorChallengeCountdown,
  TWO_FACTOR_CHALLENGE_EXPIRED,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";
import { useChallengeCountdown } from "../useChallengeCountdown";
import { RecoveryRequestForm } from "./RecoveryRequestForm";
import { RecoveryRequestOutcome } from "./RecoveryRequestOutcome";
import { TwoFactorVerifyForm } from "./TwoFactorVerifyForm";

type StepView = "verify" | "recovery" | "sent" | "pending";

interface TwoFactorLoginStepProps {
  challengeToken: string;
  expiresIn: number;
  onBack: () => void;
  onChallengeLost: (message: string) => void;
  onRecoveryCodeUsed: (remaining: number) => void;
}

export function TwoFactorLoginStep({
  challengeToken,
  expiresIn,
  onBack,
  onChallengeLost,
  onRecoveryCodeUsed,
}: TwoFactorLoginStepProps) {
  const colors = useThemeColors();
  const [view, setView] = useState<StepView>("verify");
  const [emailHint, setEmailHint] = useState("");
  const challengeInUse = view === "verify" || view === "recovery";

  const secondsLeft = useChallengeCountdown(
    expiresIn,
    () =>
      onChallengeLost(
        view === "recovery"
          ? ACCOUNT_RECOVERY_CHALLENGE_EXPIRED
          : TWO_FACTOR_CHALLENGE_EXPIRED,
      ),
    challengeInUse,
  );

  if (view === "sent") {
    return (
      <RecoveryRequestOutcome
        status="sent"
        emailHint={emailHint}
        onBack={onBack}
      />
    );
  }
  if (view === "pending") {
    return <RecoveryRequestOutcome status="pending" onBack={onBack} />;
  }

  return (
    <View className="w-full">
      {view === "recovery" ? (
        <RecoveryRequestForm
          challengeToken={challengeToken}
          onCancel={() => setView("verify")}
          onSent={(hint) => {
            setEmailHint(hint);
            setView("sent");
          }}
          onAlreadyPending={() => setView("pending")}
          onChallengeLost={onChallengeLost}
        />
      ) : (
        <>
          <TouchableOpacity
            className="mb-6 flex-row items-center"
            activeOpacity={0.7}
            onPress={onBack}
          >
            <Feather name="arrow-left" size={14} color={colors.textSubtle} />
            <Text className="ml-1.5 text-[13px] text-content-subtle">
              Volver al inicio de sesión
            </Text>
          </TouchableOpacity>

          <Text className="mb-1.5 text-[24px] font-bold text-content">
            Verificación en dos pasos
          </Text>
          <Text className="mb-[26px] text-[14px] text-content-muted">
            Confirmá tu identidad para terminar de iniciar sesión.
          </Text>

          <TwoFactorVerifyForm
            challengeToken={challengeToken}
            onChallengeLost={onChallengeLost}
            onRecoveryCodeUsed={onRecoveryCodeUsed}
          />

          <TouchableOpacity
            className="mb-4 mt-3 items-center py-1"
            activeOpacity={0.7}
            onPress={() => setView("recovery")}
          >
            <Text className="text-[12px] font-medium text-info">
              {ACCOUNT_RECOVERY_LINK}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <View className="flex-row items-center justify-between px-1">
        <Text className="text-[12px] text-content-subtle">
          Sesión aún no iniciada
        </Text>
        <Text className="text-[12px] font-medium tabular-nums text-content-subtle">
          {formatTwoFactorChallengeCountdown(secondsLeft)}
        </Text>
      </View>
    </View>
  );
}
