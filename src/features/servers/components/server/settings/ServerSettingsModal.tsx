import {
  type BoostSectionTab,
  type DeleteServerResult,
  serverBoostCount,
  serverBoostLevel,
  type ServerSummary,
} from "@discordia/client-shared";
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform } from "react-native";

import { ServerBoostsStep } from "../../../../boosts/components/ServerBoostsStep";
import { ModerationAuditStep } from "../../../../moderation/components/ModerationAuditStep";
import { ReportsStep } from "../../../../reports/components/list/ReportsStep";
import { useDeleteServerConfirm } from "../../../useDeleteServerConfirm";
import { useServerSettingsForm } from "../../../useServerSettingsForm";
import { WordFilterStep } from "../WordFilterStep";
import { DeleteServerStep } from "./DeleteServerStep";
import { ServerProfileStep } from "./ServerProfileStep";
import { VanityUrlField } from "./vanity/VanityUrlField";
import { SettingsHeader, type SettingsStep } from "./SettingsHeader";
import { SettingsMenuStep } from "./SettingsMenuStep";
import {
  hasSettingsMenu,
  initialSettingsStep,
  type SettingsEntry,
} from "./settingsSteps";
import { useModalInsets } from "../../../../platform-status/hooks/useModalInsets";

interface ServerSettingsModalProps {
  visible: boolean;
  server: ServerSummary;
  isOwner: boolean;
  /** "Perfil del servidor" (nombre, icono, banner). */
  canManageServer: boolean;
  /** "Palabras prohibidas". */
  canManageMessages: boolean;
  /** "Reportes" y "Registro de auditoría": solo moderadores. */
  canReviewReports: boolean;
  pendingReports: number;
  currentUserId: string | null;
  /** "boosts" si se entra desde "Boosts del servidor". */
  entry?: SettingsEntry;
  /** Con qué pestaña abre Boosts del servidor. */
  boostsTab?: BoostSectionTab;
  onClose: () => void;
  /** "Ir a comprar puntos" desde Boosts: quien lo usa cierra la configuracion. */
  onBuyPoints: () => void;
  /** "Ir al mensaje" desde un reporte: quien lo usa cierra la configuracion. */
  onGoToMessage: (channelId: string, messageId: string) => void;
  /** Se cerro un reporte pendiente: hay que actualizar la bandera. */
  onPendingReportsChanged: () => void;
  onUpdated: (server: ServerSummary) => void;
  onConfirmDelete: (confirmName: string) => Promise<DeleteServerResult>;
}

type SettingsBodyProps = Omit<ServerSettingsModalProps, "visible">;

function SettingsBody({
  server,
  isOwner,
  canManageServer,
  canManageMessages,
  canReviewReports,
  pendingReports,
  currentUserId,
  entry = "menu",
  boostsTab: initialBoostsTab = "boost",
  onClose,
  onBuyPoints,
  onGoToMessage,
  onPendingReportsChanged,
  onUpdated,
  onConfirmDelete,
}: SettingsBodyProps) {
  const hasMenu = hasSettingsMenu({
    isOwner,
    canManageServer,
    canManageMessages,
    canReviewReports,
  });
  const [step, setStep] = useState<SettingsStep>(() =>
    initialSettingsStep(entry, hasMenu),
  );
  // Los hooks viven acá y no en cada paso para que lo editado sobreviva a
  // volver al menú y entrar de nuevo.
  const form = useServerSettingsForm({ server, onUpdated });
  const deletion = useDeleteServerConfirm({
    serverName: server.name,
    onConfirm: onConfirmDelete,
    onDeleted: onClose,
  });
  const [boostsTab, setBoostsTab] = useState<BoostSectionTab>(initialBoostsTab);
  const backToMenu = () => setStep("menu");

  function selectStep(target: SettingsStep) {
    setBoostsTab("boost");
    setStep(target);
  }

  function openBoostsAt(tab: BoostSectionTab) {
    setBoostsTab(tab);
    setStep("boosts");
  }

  return (
    <>
      <SettingsHeader
        step={step}
        serverName={server.name}
        pendingReports={pendingReports}
        canGoBack={hasMenu}
        onBack={backToMenu}
        onClose={onClose}
      />

      {step === "menu" ? (
        <SettingsMenuStep
          server={server}
          isOwner={isOwner}
          canManageServer={canManageServer}
          canManageMessages={canManageMessages}
          canReviewReports={canReviewReports}
          pendingReports={pendingReports}
          onSelect={selectStep}
        />
      ) : null}

      {step === "profile" ? (
        <ServerProfileStep
          form={form}
          serverName={server.name}
          onCancel={onClose}
          onBoost={() => openBoostsAt("boost")}
          onShowBenefits={() => openBoostsAt("benefits")}
          vanityField={
            <VanityUrlField
              serverId={server.id}
              serverName={server.name}
              level={serverBoostLevel(server)}
              boostCount={serverBoostCount(server)}
              vanityCode={server.vanity_code ?? null}
            />
          }
        />
      ) : null}

      {step === "boosts" ? (
        <ServerBoostsStep
          server={server}
          initialTab={boostsTab}
          onBuyPoints={onBuyPoints}
        />
      ) : null}

      {step === "words" ? <WordFilterStep serverId={server.id} /> : null}

      {step === "reports" && canReviewReports ? (
        <ReportsStep
          serverId={server.id}
          ownerId={server.owner_id}
          currentUserId={currentUserId}
          channels={server.channels}
          onGoToMessage={onGoToMessage}
          onPendingChanged={onPendingReportsChanged}
        />
      ) : null}

      {step === "audit" && canReviewReports ? (
        <ModerationAuditStep serverId={server.id} />
      ) : null}

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
  const insets = useModalInsets();
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
