import { type Role } from "@discordia/client-shared";

import { useWindowDimensions } from "react-native";

import { ModalShell } from "../../components/ui/ModalShell";

import { RolesModalHeader } from "./components/RolesModalChrome";
import { RolesPanel } from "./RolesPanel";
import { useModalInsets } from "../../hooks/useModalInsets";

interface RolesModalProps {
  visible: boolean;
  serverId: string;
  serverName: string;
  isOwner: boolean;
  myRoles: Role[];
  onClose: () => void;
}

/** Roles fuera de la configuración del servidor (desde la lista de canales). */
export function RolesModal({
  visible,
  serverId,
  serverName,
  isOwner,
  myRoles,
  onClose,
}: RolesModalProps) {
  const insets = useModalInsets();
  const { height: windowHeight } = useWindowDimensions();

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      className="max-w-120"
      style={{ maxHeight: windowHeight - insets.top - insets.bottom - 48 }}
    >
      {visible ? (
        <RolesPanel
          serverId={serverId}
          serverName={serverName}
          isOwner={isOwner}
          myRoles={myRoles}
          renderHeader={({ step, title, onBack }) => (
            <RolesModalHeader
              step={step}
              roleName={title}
              onBack={onBack ?? onClose}
              onClose={onClose}
            />
          )}
        />
      ) : null}
    </ModalShell>
  );
}
