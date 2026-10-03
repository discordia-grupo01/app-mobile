import { RETRY_LABEL } from "@discordia/client-shared";

import { Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";

interface ChatStatusNoticeProps {
  message: string;
  /** Si viene, se muestra el boton "Reintentar" (errores que se pueden reintentar). */
  onRetry?: () => void;
}

/** Ocupa el lugar de la lista de mensajes cuando el canal no se puede mostrar. */
export function ChatStatusNotice({ message, onRetry }: ChatStatusNoticeProps) {
  return (
    <View
      accessibilityRole="alert"
      className="flex-1 items-center justify-center gap-3 px-6"
    >
      <Text className="text-center text-[14px] text-content-muted">
        {message}
      </Text>
      {onRetry ? <Button title={RETRY_LABEL} onPress={onRetry} /> : null}
    </View>
  );
}
