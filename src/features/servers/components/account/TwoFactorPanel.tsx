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
import {
  useCallback,
  useEffect,
  useState,
  type MutableRefObject,
  type RefObject,
  type ComponentRef,
} from "react";
import { ScrollView, View } from "react-native";

import { useSetPasswordForm } from "../../../auth/useSetPasswordForm";
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
import {
  TWO_FACTOR_SET_PASSWORD_COPY,
  TwoFactorSetPasswordStep,
} from "./two-factor/TwoFactorSetPasswordStep";
import { TwoFactorSetupStep } from "./two-factor/TwoFactorSetupStep";
import { TwoFactorStatusStep } from "./two-factor/TwoFactorStatusStep";
import { LoadingSpinner } from "../../../../components/ui/LoadingSpinner";

interface TwoFactorPanelProps {
  /** Vuelve a Seguridad. */
  onClose: () => void;
  scrollRef: RefObject<ComponentRef<typeof ScrollView> | null>;
  /** El titulo del paso va en el encabezado de la hoja, como en web. */
  onTitleChange: (title: string) => void;
  /** La flecha de la hoja vuelve un paso adentro del panel. */
  backRef: MutableRefObject<(() => void) | null>;
}

type Step =
  | "status"
  | "set-password"
  | "setup"
  | "codes"
  | "disable"
  | "regenerate"
  | "disabled-confirmation";

const STEP_TITLES: Record<Step, string> = {
  status: "Verificación en dos pasos",
  "set-password": TWO_FACTOR_SET_PASSWORD_COPY.title,
  setup: "Conectá tu app autenticadora",
  codes: "Guardá tus códigos de recuperación",
  disable: "Desactivar verificación en dos pasos",
  regenerate: "Generar códigos nuevos",
  "disabled-confirmation": "Verificación en dos pasos desactivada",
};

/** Desde estos pasos la flecha sale a Seguridad; desde el resto, vuelve al estado. */
const EXITS_TO_SECURITY: Step[] = ["status", "setup", "disabled-confirmation"];

export function TwoFactorPanel({
  onClose,
  scrollRef,
  onTitleChange,
  backRef,
}: TwoFactorPanelProps) {
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

  const setPasswordForm = useSetPasswordForm(() => void handleStartSetup());

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
    let active = true;
    void getTwoFactorStatusService().then((result) => {
      if (!active) return;
      if (!result.ok) {
        setIsLoading(false);
        setFormError(result.message);
        return;
      }
      setStatus(result.status);
      if (result.status.enabled) {
        setIsLoading(false);
      } else {
        void handleStartSetup();
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pasar de un paso alto (QR + clave + input) a uno bajo (códigos, status)
  // deja el ScrollView con el scroll viejo por un frame; sin esto se ve un
  // salto/parpadeo apenas se pinta el paso nuevo.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step, scrollRef]);

  useEffect(() => {
    onTitleChange(STEP_TITLES[step]);
  }, [step, onTitleChange]);

  useEffect(() => {
    backRef.current = EXITS_TO_SECURITY.includes(step) ? onClose : backToStatus;
  });

  function resetForms() {
    setCode("");
    setCodeErrors({});
    setPassword("");
    setPasswordErrors({});
    setFormError(null);
    setCopied(false);
    setPasswordForm.reset();
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
    setIsLoading(false);

    if (!result.ok) {
      if (result.passwordRequired) {
        setStep("set-password");
        return;
      }
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
    content = <LoadingSpinner />;
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
      />
    );
  } else if (step === "set-password") {
    content = (
      <TwoFactorSetPasswordStep
        password={setPasswordForm.password}
        confirmPassword={setPasswordForm.confirmPassword}
        errors={setPasswordForm.errors}
        formError={setPasswordForm.formError ?? formError}
        alreadySet={setPasswordForm.alreadySet}
        isSubmitting={setPasswordForm.isSubmitting || isSubmitting}
        onPasswordChange={setPasswordForm.setPassword}
        onConfirmPasswordChange={setPasswordForm.setConfirmPassword}
        onSubmit={() => void setPasswordForm.submit()}
        onContinueAnyway={handleStartSetup}
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
      />
    );
  }

  return <View className="px-4.5 pt-6">{content}</View>;
}
