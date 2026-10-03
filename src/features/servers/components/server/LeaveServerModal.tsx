import { type LeaveServerResult } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Text, View } from "react-native";

import { useThemeColors } from "../../../../theme/theme-context";
import { Button } from "../../../../components/ui/Button";
import { ModalShell } from "../../../../components/ui/ModalShell";
import { ModalCloseButton } from "../../../../components/ui/ModalCloseButton";

interface LeaveServerModalProps {
  visible: boolean;
  serverName: string;
  onClose: () => void;
  onConfirm: () => Promise<LeaveServerResult>;
}

type ModalView = "confirm" | "blocked";

/**
 * Cartel de confirmacion para abandonar un servidor, con el mismo patron
 * visual que el de cerrar sesion en `UserProfileBar` (card + icono + botones
 * apilados para que el texto nunca se corte en dos lineas en un celular
 * angosto).
 *
 * Tiene dos vistas: la confirmacion en si (`"confirm"`), y un aviso aparte
 * (`"blocked"`) para el unico caso con copy y diseño propios -- el dueño no
 * puede abandonar su servidor (`reason: "owner_must_transfer_or_delete"`,
 * ver `features/servers/service.ts`). Cualquier otro error (red, sesion
 * expirada, etc.) se muestra como banner inline sin cambiar de vista, para
 * que se pueda reintentar sin cerrar el cartel.
 */
export function LeaveServerModal({
  visible,
  serverName,
  onClose,
  onConfirm,
}: LeaveServerModalProps) {
  const colors = useThemeColors();
  const [view, setView] = useState<ModalView>("confirm");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [wasVisible, setWasVisible] = useState(visible);

  // Reinicia el estado del cartel cada vez que pasa a visible. Esto va en
  // el cuerpo del render (patron "adjust state when a prop changes" de
  // React) en vez de en un useEffect, para cumplir con la regla de lint
  // react-hooks/set-state-in-effect.
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setView("confirm");
      setError("");
      setIsSubmitting(false);
    }
  }

  async function handleConfirm() {
    setError("");
    setIsSubmitting(true);
    const result = await onConfirm();
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.reason === "owner_must_transfer_or_delete") {
        setView("blocked");
        return;
      }
      setError(result.message);
      return;
    }

    onClose();
  }

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      className="max-w-80 p-7 pt-6 items-center"
    >
      <ModalCloseButton variant="subtle" onPress={onClose} />

      {view === "blocked" ? (
        <>
          <View className="w-16 h-16 rounded-[18px] items-center justify-center bg-[rgba(107,149,189,0.15)] mt-2 mb-5">
            <Feather name="shield" size={26} color={colors.info} />
          </View>
          <Text className="text-[19px] font-bold text-content text-center">
            No podés abandonar tu servidor
          </Text>
          <Text className="text-[14px] leading-5 text-content-muted text-center mt-2.5 mb-2">
            Sos el propietario de{" "}
            <Text className="text-content font-bold">{serverName}</Text>. Para
            salir, primero tenés que transferir la propiedad a otro miembro del
            servidor.
          </Text>

          <View className="flex-col gap-2.5 w-full mt-5">
            <Button title="Entendido" variant="secondary" onPress={onClose} />
          </View>
        </>
      ) : (
        <>
          <View className="w-16 h-16 rounded-[18px] items-center justify-center bg-[rgba(224,82,82,0.14)] mt-2 mb-5">
            <Feather name="log-out" size={26} color={colors.danger} />
          </View>
          <Text className="text-[19px] font-bold text-content text-center">
            ¿Abandonar {serverName}?
          </Text>
          <Text className="text-[14px] leading-5 text-content-muted text-center mt-2.5 mb-2">
            Vas a perder acceso a todos sus canales de texto y voz. Para volver
            a entrar vas a necesitar una nueva invitación.
          </Text>

          {error ? (
            <View className="flex-row items-start gap-2 w-full rounded-xl border border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)] px-3 py-2.5 mt-2.5">
              <Feather name="alert-circle" size={15} color={colors.danger} />
              <Text className="flex-1 text-danger text-[12px] leading-[17px]">
                {error}
              </Text>
            </View>
          ) : null}

          <View className="flex-col gap-2.5 w-full mt-5">
            <Button title="Cancelar" variant="secondary" onPress={onClose} />
            <Button
              title="Abandonar servidor"
              variant="danger"
              onPress={handleConfirm}
              isLoading={isSubmitting}
            />
          </View>
        </>
      )}
    </ModalShell>
  );
}
