import {
  type DeleteServerResult,
  type ServerSummary,
} from "@discordia/client-shared";
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDeleteServerConfirm } from "../../../useDeleteServerConfirm";
import { useServerSettingsForm } from "../../../useServerSettingsForm";
import { WordFilterStep } from "../WordFilterStep";
import { DeleteServerStep } from "./DeleteServerStep";
import { ServerProfileStep } from "./ServerProfileStep";
import { SettingsHeader, type SettingsStep } from "./SettingsHeader";
import { SettingsMenuStep } from "./SettingsMenuStep";

interface ServerSettingsModalProps {
  visible: boolean;
  server: ServerSummary;
  isOwner: boolean;
  /** "Perfil del servidor" (nombre, icono, banner). */
  canManageServer: boolean;
  /** "Palabras prohibidas". */
  canManageMessages: boolean;
  onClose: () => void;
  onUpdated: (server: ServerSummary) => void;
  onConfirmDelete: (confirmName: string) => Promise<DeleteServerResult>;
}

type SettingsBodyProps = Omit<ServerSettingsModalProps, "visible">;

function SettingsBody({
  server,
  isOwner,
  canManageServer,
  canManageMessages,
  onClose,
  onUpdated,
  onConfirmDelete,
}: SettingsBodyProps) {
  const [step, setStep] = useState<SettingsStep>("menu");
  // Los hooks viven acá y no en cada paso para que lo editado sobreviva a
  // volver al menú y entrar de nuevo.
  const form = useServerSettingsForm({ server, onUpdated });
  const deletion = useDeleteServerConfirm({
    serverName: server.name,
    onConfirm: onConfirmDelete,
    onDeleted: onClose,
  });
  const backToMenu = () => setStep("menu");

  return (
    <>
      <SettingsHeader step={step} onBack={backToMenu} onClose={onClose} />

      {step === "menu" ? (
        <SettingsMenuStep
          server={server}
          isOwner={isOwner}
          canManageServer={canManageServer}
          canManageMessages={canManageMessages}
          onSelect={setStep}
        />
      ) : null}

      {step === "profile" ? (
        <ServerProfileStep
          form={form}
          serverName={server.name}
          onCancel={onClose}
        />
      ) : null}

      {step === "words" ? <WordFilterStep serverId={server.id} /> : null}

      {step === "delete" ? (
        <DeleteServerStep
          deletion={deletion}
          serverName={server.name}
          onCancel={backToMenu}
        />
      ) : null}
    </>
  );
}

export function ServerSettingsModal({
  visible,
  ...bodyProps
}: ServerSettingsModalProps) {
  const insets = useSafeAreaInsets();
  const [openCount, setOpenCount] = useState(0);
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setOpenCount((count) => count + 1);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={bodyProps.onClose}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-surface-modal"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SettingsBody
          key={`${bodyProps.server.id}-${openCount}`}
          {...bodyProps}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}
