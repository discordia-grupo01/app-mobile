import {
  type Channel,
  MAX_NAME,
  validateChannelName,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { updateChannel } from "../../api";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
import { Button } from "../../../../components/ui/Button";

interface EditChannelModalProps {
  channel: Channel;
  onClose: () => void;
  onUpdated: (channel: Channel) => void;
}

export function EditChannelModal({
  channel,
  onClose,
  onUpdated,
}: EditChannelModalProps) {
  const colors = useThemeColors();
  const [name, setName] = useState(channel.name);
  const [nameError, setNameError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmed = name.trim();

  async function handleSubmit() {
    setNameError("");
    setGlobalError("");

    const nameError = validateChannelName(trimmed);
    if (nameError) {
      setNameError(nameError);
      return;
    }

    setIsSubmitting(true);
    const result = await updateChannel(channel.id, { name: trimmed });
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.fieldErrors?.name) setNameError(result.fieldErrors.name);
      if (!result.fieldErrors) setGlobalError(result.message);
      return;
    }

    onUpdated(result.channel);
  }

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1 bg-[rgba(0,0,0,0.65)] items-center justify-center p-4"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View className="w-full max-w-110 max-h-[90%] rounded-[20px] border border-line-strong bg-surface-modal overflow-hidden">
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-2xl items-center justify-center bg-surface-input border border-line"
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Feather name="x" size={13} color={colors.textSubtle} />
          </TouchableOpacity>

          <ScrollView
            contentContainerClassName="p-7 pt-8"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row items-center gap-2.5 mb-5 pr-6">
              <Feather
                name={channel.kind === "text" ? "hash" : "volume-2"}
                size={18}
                color={colors.textSubtle}
              />
              <View className="flex-1">
                <Text className="text-[17px] font-bold text-content">
                  Editar Canal
                </Text>
                <Text
                  className="text-[12px] text-content-subtle mt-0.5"
                  numberOfLines={1}
                >
                  #{channel.name}
                </Text>
              </View>
            </View>

            {globalError ? (
              <View className="flex-row items-start gap-2.5 rounded-xl border border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)] px-3.5 py-3 mb-4">
                <Feather name="alert-circle" size={16} color={colors.danger} />
                <Text className="flex-1 text-danger text-[13px]">
                  {globalError}
                </Text>
              </View>
            ) : null}

            <View className="mb-3">
              <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle mb-2">
                NOMBRE DEL CANAL
              </Text>
              <View
                className={cn(
                  "flex-row items-center gap-2 rounded-xl border bg-surface-input px-3.5 min-h-12",
                  nameError ? "border-danger" : "border-line",
                )}
              >
                <Text className="text-content-subtle text-[14px]">#</Text>
                <TextInput
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setNameError("");
                    setGlobalError("");
                  }}
                  maxLength={MAX_NAME + 10}
                  autoFocus
                  autoCapitalize="none"
                  className="flex-1 text-content text-[14px]"
                />
              </View>
              {nameError ? (
                <View className="flex-row items-center gap-1.5 mt-1.5">
                  <Feather
                    name="alert-circle"
                    size={13}
                    color={colors.danger}
                  />
                  <Text className="text-danger text-[12px]">{nameError}</Text>
                </View>
              ) : null}
            </View>

            <View className="flex-row gap-3 mt-2 pt-5 border-t border-t-line">
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={onClose}
                style={{ flex: 1, width: undefined }}
              />
              <Button
                title="Guardar cambios"
                onPress={handleSubmit}
                disabled={!trimmed}
                isLoading={isSubmitting}
                style={{ flex: 1, width: undefined }}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
