import { BANS_SUBTITLE, BANS_TITLE } from "@discordia/client-shared";

import { ModalCloseButton } from "../../../components/ui/ModalCloseButton";
import { ModalShell } from "../../../components/ui/ModalShell";
import { BanModalHeader } from "./BanModalHeader";
import { BansPanel, type BansPanelProps } from "./BansPanel";

interface BansModalProps extends BansPanelProps {
  onClose: () => void;
}

/** Baneos fuera de la configuración del servidor (desde la lista de canales). */
export function BansModal({ onClose, ...panelProps }: BansModalProps) {
  return (
    <ModalShell visible onClose={onClose} className="h-[90%] max-w-[680px]">
      <ModalCloseButton variant="subtle" onPress={onClose} />
      <BanModalHeader title={BANS_TITLE} subtitle={BANS_SUBTITLE} />
      <BansPanel {...panelProps} />
    </ModalShell>
  );
}
