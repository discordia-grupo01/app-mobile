import {
  type Category,
  MAX_NAME,
  validateCategoryName,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

import { createCategory } from "../../api";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
import { Button } from "../../../../components/ui/Button";
import { ModalShell } from "../../../../components/ui/ModalShell";
import { ModalCloseButton } from "../../../../components/ui/ModalCloseButton";

interface CreateCategoryModalProps {
  visible: boolean;
  serverId: string;
  onClose: () => void;
  onCreated: (category: Category) => void;
}

export function CreateCategoryModal({
  visible,
  serverId,
  onClose,
  onCreated,
}: CreateCategoryModalProps) {
  const colors = useThemeColors();
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setName("");
      setNameError("");
      setGlobalError("");
      setIsSubmitting(false);
    }
  }

  const trimmed = name.trim();

  async function handleSubmit() {
    setNameError("");
    setGlobalError("");

    const nameError = validateCategoryName(trimmed);
    if (nameError) {
      setNameError(nameError);
      return;
    }

    setIsSubmitting(true);
    const result = await createCategory(serverId, trimmed);
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.fieldErrors?.name) setNameError(result.fieldErrors.name);
      if (!result.fieldErrors) setGlobalError(result.message);
      return;
    }

    onCreated(result.category);
  }

  return (
    <ModalShell visible={visible} onClose={onClose} className="max-w-110">
      <ModalCloseButton onPress={onClose} />

      <ScrollView
        contentContainerClassName="p-7 pt-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5 pr-6">
          <Text className="text-[17px] font-bold text-content">
            Crear Categoría
          </Text>
          <Text className="text-[12px] text-content-subtle mt-1 leading-[17px]">
            Agrupa canales relacionados bajo un mismo título.
          </Text>
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
            NOMBRE DE LA CATEGORÍA
          </Text>
          <View
            className={cn(
              "flex-row items-center gap-2 rounded-xl border bg-surface-input px-3.5 min-h-12",
              nameError ? "border-danger" : "border-line",
            )}
          >
            <TextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                setNameError("");
                setGlobalError("");
              }}
              placeholder="NUEVA CATEGORÍA"
              placeholderTextColor={colors.textSubtle}
              maxLength={MAX_NAME + 10}
              autoFocus
              className="flex-1 text-content text-[14px]"
            />
          </View>
          {nameError ? (
            <View className="flex-row items-center gap-1.5 mt-1.5">
              <Feather name="alert-circle" size={13} color={colors.danger} />
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
            title="Crear Categoría"
            onPress={handleSubmit}
            disabled={!trimmed}
            isLoading={isSubmitting}
            style={{ flex: 1, width: undefined }}
          />
        </View>
      </ScrollView>
    </ModalShell>
  );
}
