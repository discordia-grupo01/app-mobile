import {
  DELETE_SERVER_CONFIRM_ACTION,
  DELETE_SERVER_NAME_LABEL,
  type DeleteServerResult,
  deleteServerConfirmBody,
  deleteServerTitle,
  matchesServerNameForDeletion,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
import { Button } from "../../../../components/ui/Button";
import { ModalShell } from "../../../../components/ui/ModalShell";
import { ModalCloseButton } from "../../../../components/ui/ModalCloseButton";

interface DeleteServerFieldsProps {
  serverName: string;
  typedName: string;
  onTypedNameChange: (value: string) => void;
  error: string;
  canSubmit: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  buttonsLayout?: "column" | "row";
}

export function DeleteServerFields({
  serverName,
  typedName,
  onTypedNameChange,
  error,
  canSubmit,
  isSubmitting,
  onCancel,
  onConfirm,
  buttonsLayout = "column",
}: DeleteServerFieldsProps) {
  const colors = useThemeColors();

  return (
    <>
      <View className="w-16 h-16 rounded-[18px] items-center justify-center bg-[rgba(224,82,82,0.14)] mt-2 mb-5">
        <Feather name="trash-2" size={26} color={colors.danger} />
      </View>
      <Text className="text-[19px] font-bold text-content text-center">
        {deleteServerTitle(serverName)}
      </Text>
      <Text className="text-[14px] leading-5 text-content-muted text-center mt-2.5 mb-2">
        {deleteServerConfirmBody(serverName)}
      </Text>

      {error ? (
        <View className="flex-row items-start gap-2 w-full rounded-xl border border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)] px-3 py-2.5 mt-2.5">
          <Feather name="alert-circle" size={15} color={colors.danger} />
          <Text className="flex-1 text-danger text-[12px] leading-[17px]">
            {error}
          </Text>
        </View>
      ) : null}

      <View className="w-full mt-4">
        <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle mb-1.5 uppercase">
          {DELETE_SERVER_NAME_LABEL}
        </Text>
        <View className="rounded-xl border border-line bg-surface-input px-3.5 min-h-12 justify-center">
          <TextInput
            value={typedName}
            onChangeText={onTypedNameChange}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={colors.textSubtle}
            className="text-content text-[14px]"
          />
        </View>
      </View>

      <View
        className={cn(
          "w-full mt-5 gap-2.5",
          buttonsLayout === "row" ? "flex-row" : "flex-col",
        )}
      >
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={onCancel}
          style={
            buttonsLayout === "row" ? { flex: 1, width: undefined } : undefined
          }
        />
        <Button
          title={DELETE_SERVER_CONFIRM_ACTION}
          variant="danger"
          onPress={onConfirm}
          disabled={!canSubmit}
          isLoading={isSubmitting}
          style={
            buttonsLayout === "row" ? { flex: 1, width: undefined } : undefined
          }
        />
      </View>
    </>
  );
}

interface DeleteServerModalProps {
  visible: boolean;
  serverName: string;
  onClose: () => void;
  onConfirm: (confirmName: string) => Promise<DeleteServerResult>;
}

export function DeleteServerModal({
  visible,
  serverName,
  onClose,
  onConfirm,
}: DeleteServerModalProps) {
  const [typedName, setTypedName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setTypedName("");
      setError("");
      setIsSubmitting(false);
    }
  }

  const canSubmit =
    matchesServerNameForDeletion(serverName, typedName) && !isSubmitting;

  async function handleConfirm() {
    if (!canSubmit) return;

    setError("");
    setIsSubmitting(true);
    const result = await onConfirm(typedName.trim());
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.fieldErrors?.confirm_name ?? result.message);
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

      <DeleteServerFields
        serverName={serverName}
        typedName={typedName}
        onTypedNameChange={setTypedName}
        error={error}
        canSubmit={canSubmit}
        isSubmitting={isSubmitting}
        onCancel={onClose}
        onConfirm={handleConfirm}
      />
    </ModalShell>
  );
}
