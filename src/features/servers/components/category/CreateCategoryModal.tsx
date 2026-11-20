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
import { FormErrorBanner } from "../../../../components/ui/FormErrorBanner";
import { FullScreenModal } from "../../../../components/ui/FullScreenModal";

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
    <FullScreenModal
      visible={visible}
      title="Crear categoría"
      onClose={onClose}
      footer={
        <Button
          title="Crear categoría"
          onPress={handleSubmit}
          disabled={!trimmed}
          isLoading={isSubmitting}
        />
      }
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4.5 pt-5 pb-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-5 text-[14px] leading-5 text-content-muted">
          Agrupa canales relacionados bajo un mismo título.
        </Text>

        <FormErrorBanner message={globalError} />

        <View className="mb-3">
          <Text className="text-[14px] font-semibold text-content mb-2">
            Nombre de la categoría
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
              placeholder="Nueva categoría"
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
      </ScrollView>
    </FullScreenModal>
  );
}
