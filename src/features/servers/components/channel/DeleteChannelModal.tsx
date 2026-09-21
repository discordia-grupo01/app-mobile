import { type Channel } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { deleteChannel } from "../../api";
import { useThemeColors } from "../../../../theme/theme-context";
import { Button } from "../../../../components/ui/Button";

interface DeleteChannelModalProps {
  channel: Channel;
  onClose: () => void;
  onDeleted: () => void;
}

/** Requiere una acción explícita antes de borrar (no hay deshacer). */
export function DeleteChannelModal({
  channel,
  onClose,
  onDeleted,
}: DeleteChannelModalProps) {
  const colors = useThemeColors();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    setIsLoading(true);
    setErrorMessage("");
    const result = await deleteChannel(channel.id);
    setIsLoading(false);

    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    onDeleted();
  }

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-[rgba(0,0,0,0.65)] items-center justify-center p-4">
        {!isLoading ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        ) : null}

        <View className="w-full max-w-105 rounded-[20px] border border-line-strong bg-surface-modal overflow-hidden">
          {!isLoading ? (
            <TouchableOpacity
              onPress={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-2xl items-center justify-center bg-surface-input border border-line"
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
            >
              <Feather name="x" size={13} color={colors.textSubtle} />
            </TouchableOpacity>
          ) : null}

          <View className="items-center gap-4 px-7 py-8">
            {errorMessage ? (
              <View className="flex-row items-start gap-2.5 w-full rounded-xl border border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)] px-3.5 py-3">
                <Feather name="alert-circle" size={15} color={colors.danger} />
                <Text className="flex-1 text-danger text-[13px]">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            <View className="w-16 h-16 rounded-[20px] items-center justify-center bg-[rgba(224,82,82,0.15)]">
              <Feather name="trash-2" size={28} color={colors.danger} />
            </View>

            <Text className="text-[18px] font-bold text-content text-center">
              ¿Eliminar #{channel.name}?
            </Text>
            <Text className="text-[13px] leading-[19px] text-content-muted text-center -mt-2">
              Esta acción no se puede deshacer. Se va a eliminar el canal y su
              historial de mensajes de forma permanente.
            </Text>

            <View className="flex-row gap-3 w-full mt-1">
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={onClose}
                disabled={isLoading}
                style={{ flex: 1, width: undefined }}
              />
              <Button
                title="Eliminar canal"
                variant="danger"
                onPress={handleDelete}
                isLoading={isLoading}
                style={{ flex: 1, width: undefined }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
