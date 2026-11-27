import {
  BAN_MEMBER_TITLE,
  BANS_SUBTITLE,
  BANS_TITLE,
} from "@discordia/client-shared";

import { BAN_PICKER_SUBTITLE } from "../constants";

import { ModalCloseButton } from "../../../components/ui/ModalCloseButton";
import { ModalShell } from "../../../components/ui/ModalShell";
import { BanModalHeader } from "./BanModalHeader";
import { BansPanel, type BansPanelProps } from "./BansPanel";

interface BansModalProps extends Omit<BansPanelProps, "renderHeader"> {
  onClose: () => void;
}

/** Baneos fuera de la configuración del servidor (desde la lista de canales). */
export function BansModal({ onClose, ...panelProps }: BansModalProps) {
  return (
    <ModalShell visible onClose={onClose} className="h-[90%] max-w-[680px]">
      <ModalCloseButton variant="subtle" onPress={onClose} />
      <BansPanel
        {...panelProps}
        renderHeader={({ isPicking, onBack }) => (
          <BanModalHeader
            title={isPicking ? BAN_MEMBER_TITLE : BANS_TITLE}
            subtitle={isPicking ? BAN_PICKER_SUBTITLE : BANS_SUBTITLE}
            onBack={onBack}
          />
        )}
      />
    </ModalShell>
  );
}
