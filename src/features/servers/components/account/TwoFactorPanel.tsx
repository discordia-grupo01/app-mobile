import {
  hasErrors,
  type TwoFactorCodeErrors,
  type TwoFactorPasswordErrors,
  type TwoFactorSetup,
  type TwoFactorStatus,
  validateTwoFactorActivationCode,
  validateTwoFactorPassword,
} from "@discordia/client-shared";

import * as Clipboard from "expo-clipboard";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { useThemeColors } from "../../../../theme/theme-context";
import {
  activateTwoFactorService,
  disableTwoFactorService,
  getTwoFactorStatusService,
  regenerateRecoveryCodesService,
  startTwoFactorSetupService,
} from "../../../two-factor/service";
import { TwoFactorCodesStep } from "./two-factor/TwoFactorCodesStep";
import { TwoFactorDisabledConfirmationStep } from "./two-factor/TwoFactorDisabledConfirmationStep";
import { TwoFactorPasswordStep } from "./two-factor/TwoFactorPasswordStep";
import { TwoFactorSetupStep } from "./two-factor/TwoFactorSetupStep";
import { TwoFactorStatusStep } from "./two-factor/TwoFactorStatusStep";

interface TwoFactorPanelProps {
  onClose: () => void;
}

type Step =
  | "status"
  | "setup"
  | "codes"
  | "disable"
  | "regenerate"
  | "disabled-confirmation";

export function TwoFactorPanel({ onClose }: TwoFactorPanelProps) {
  const colors = useThemeColors();

  const [step, setStep] = useState<Step>("status");
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [codeErrors, setCodeErrors] = useState<TwoFactorCodeErrors>({});
  const [password, setPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<TwoFactorPasswordErrors>(
    {},
  );
  const [copied, setCopied] = useState(false);

  const loadStatus = useCallback(() => {
    return getTwoFactorStatusService().then((result) => {
      setIsLoading(false);
      if (result.ok) {
        setStatus(result.status);
      } else {
        setFormError(result.message);
      }
    });
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const didAutoSkipRef = useRef(false);
  useEffect(() => {
    if (isLoading || didAutoSkipRef.current || step !== "status") return;
    didAutoSkipRef.current = true;
    if (status && !status.enabled) {
      void handleStartSetup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, status, step]);

  function resetForms() {
    setCode("");
    setCodeErrors({});
    setPassword("");
    setPasswordErrors({});
    setFormError(null);
    setCopied(false);
  }

  function backToStatus() {
    resetForms();
    setSetup(null);
    setRecoveryCodes([]);
    setStep("status");
    void loadStatus();
  }

  async function handleStartSetup() {
    resetForms();
    setIsSubmitting(true);
    const result = await startTwoFactorSetupService();
    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    setSetup(result.setup);
    setStep("setup");
  }

  async function handleActivate() {
    const nextErrors = validateTwoFactorActivationCode({ code });
    setCodeErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setFormError(null);
    setIsSubmitting(true);
    const result = await activateTwoFactorService(code);
    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    setRecoveryCodes(result.recoveryCodes);
    setStep("codes");
  }

  function startPasswordSubmit(): boolean {
    const nextErrors = validateTwoFactorPassword({ password });
    setPasswordErrors(nextErrors);
    if (hasErrors(nextErrors)) return false;

    setFormError(null);
    setIsSubmitting(true);
    return true;
  }

  function failPasswordSubmit(message: string) {
    setPassword("");
    setFormError(message);
  }

  async function handleDisable() {
    if (!startPasswordSubmit()) return;

    const result = await disableTwoFactorService(password);
    setIsSubmitting(false);

    if (!result.ok) {
      failPasswordSubmit(result.message);
      return;
    }
    resetForms();
    setStep("disabled-confirmation");
  }

  async function handleRegenerate() {
    if (!startPasswordSubmit()) return;

    const result = await regenerateRecoveryCodesService(password);
    setIsSubmitting(false);

    if (!result.ok) {
      failPasswordSubmit(result.message);
      return;
    }
    setPassword("");
    setRecoveryCodes(result.recoveryCodes);
    setStep("codes");
  }

  async function copyCodes() {
    await Clipboard.setStringAsync(recoveryCodes.join("\n"));
    setCopied(true);
  }

  let content;
  if (isLoading) {
    content = (
      <View className="items-center py-10">
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  } else if (step === "status") {
    content = (
      <TwoFactorStatusStep
        status={status}
        formError={formError}
        isSubmitting={isSubmitting}
        onActivate={handleStartSetup}
        onRegenerate={() => {
          resetForms();
          setStep("regenerate");
        }}
        onDisable={() => {
          resetForms();
          setStep("disable");
        }}
        onClose={onClose}
      />
    );
  } else if (step === "setup" && setup) {
    content = (
      <TwoFactorSetupStep
        setup={setup}
        code={code}
        codeErrors={codeErrors}
        formError={formError}
        isSubmitting={isSubmitting}
        onCodeChange={setCode}
        onActivate={handleActivate}
        onCancel={onClose}
      />
    );
  } else if (step === "codes") {
    content = (
      <TwoFactorCodesStep
        recoveryCodes={recoveryCodes}
        copied={copied}
        onCopy={copyCodes}
        onDone={backToStatus}
      />
    );
  } else if (step === "disabled-confirmation") {
    content = (
      <TwoFactorDisabledConfirmationStep
        onClose={onClose}
        onReactivate={handleStartSetup}
      />
    );
  } else {
    content = (
      <TwoFactorPasswordStep
        title={
          step === "disable"
            ? "Desactivar verificación en dos pasos"
            : "Generar códigos nuevos"
        }
        description={
          step === "disable"
            ? "Reingresá tu contraseña para confirmar. Después de esto solo te vamos a pedir tu contraseña para entrar."
            : "Reingresá tu contraseña. Los códigos que tengas anotados dejan de servir en cuanto se genere la lista nueva."
        }
        confirmLabel={step === "disable" ? "Desactivar" : "Generar"}
        danger={step === "disable"}
        password={password}
        passwordErrors={passwordErrors}
        formError={formError}
        isSubmitting={isSubmitting}
        onPasswordChange={setPassword}
        onConfirm={step === "disable" ? handleDisable : handleRegenerate}
        onCancel={backToStatus}
      />
    );
  }

  return <View className="px-4.5 pt-6">{content}</View>;
}
