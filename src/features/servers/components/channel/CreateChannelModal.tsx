import {
  type Category,
  type Channel,
  isUnassignedCategory,
  MAX_NAME,
  validateChannelName,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { createChannel } from "../../api";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
import { Button } from "../../../../components/ui/Button";
import { ModalShell } from "../../../../components/ui/ModalShell";
import { ModalCloseButton } from "../../../../components/ui/ModalCloseButton";

interface CreateChannelModalProps {
  visible: boolean;
  serverId: string;
  categories: Category[];
  defaultCategoryId?: string | null;
  onClose: () => void;
  onCreated: (channel: Channel) => void;
}

export function CreateChannelModal({
  visible,
  serverId,
  categories,
  defaultCategoryId = null,
  onClose,
  onCreated,
}: CreateChannelModalProps) {
  const colors = useThemeColors();
  const [kind, setKind] = useState<"text" | "voice">("text");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(
    defaultCategoryId ?? categories.find(isUnassignedCategory)?.id ?? "",
  );
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [nameError, setNameError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setKind("text");
      setName("");
      setCategoryId(
        defaultCategoryId ?? categories.find(isUnassignedCategory)?.id ?? "",
      );
      setIsCategoryDropdownOpen(false);
      setNameError("");
      setGlobalError("");
      setIsSubmitting(false);
    }
  }

  const trimmed = name.trim();
  const selectedCategoryName =
    categories.find((category) => category.id === categoryId)?.name ??
    "Sin categoría";

  function handleSelectCategory(id: string) {
    setCategoryId(id);
    setIsCategoryDropdownOpen(false);
  }

  async function handleSubmit() {
    setNameError("");
    setGlobalError("");

    const nameError = validateChannelName(trimmed);
    if (nameError) {
      setNameError(nameError);
      return;
    }

    setIsSubmitting(true);
    const result = await createChannel(serverId, {
      name: trimmed,
      kind,
      categoryId: categoryId || undefined,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.fieldErrors?.name) setNameError(result.fieldErrors.name);
      if (!result.fieldErrors) setGlobalError(result.message);
      return;
    }

    onCreated(result.channel);
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
            Crear Canal
          </Text>
          <Text className="text-[12px] text-content-subtle mt-1 leading-[17px]">
            Agrega un canal de texto o voz al servidor.
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

        <View className="mb-4.5">
          <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle mb-2">
            TIPO DE CANAL
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setKind("text")}
              className={cn(
                "flex-1 rounded-xl border px-3 py-3",
                kind === "text"
                  ? "border-accent-strong bg-[rgba(45,122,140,0.12)]"
                  : "border-line",
              )}
              accessibilityRole="button"
            >
              <View className="flex-row items-center gap-2">
                <Feather name="hash" size={16} color={colors.textMuted} />
                <Text className="text-[14px] font-semibold text-content">
                  Texto
                </Text>
              </View>
              <Text className="mt-[3px] text-[11px] text-content-subtle">
                Para mensajes y links
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setKind("voice")}
              className={cn(
                "flex-1 rounded-xl border px-3 py-3",
                kind === "voice"
                  ? "border-accent-strong bg-[rgba(45,122,140,0.12)]"
                  : "border-line",
              )}
              accessibilityRole="button"
            >
              <View className="flex-row items-center gap-2">
                <Feather name="volume-2" size={16} color={colors.textMuted} />
                <Text className="text-[14px] font-semibold text-content">
                  Voz
                </Text>
              </View>
              <Text className="mt-[3px] text-[11px] text-content-subtle">
                Para charlar en tiempo real
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-4.5">
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
              placeholder="mi-nuevo-canal"
              placeholderTextColor={colors.textSubtle}
              maxLength={MAX_NAME + 10}
              autoFocus
              autoCapitalize="none"
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

        <View className="mb-4.5">
          <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle mb-2">
            CATEGORÍA
          </Text>
          <TouchableOpacity
            onPress={() => setIsCategoryDropdownOpen((prev) => !prev)}
            className={cn(
              "flex-row items-center justify-between rounded-xl border bg-surface-input px-3.5 min-h-12",
              isCategoryDropdownOpen ? "border-accent-strong" : "border-line",
            )}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Elegir categoría"
          >
            <Text className="flex-1 text-[14px] text-content" numberOfLines={1}>
              {selectedCategoryName}
            </Text>
            <Feather
              name={isCategoryDropdownOpen ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.textSubtle}
            />
          </TouchableOpacity>

          {isCategoryDropdownOpen ? (
            <View
              className="mt-1.5 rounded-xl border border-line-strong bg-surface-modal py-1"
              style={styles.categoryDropdown}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => handleSelectCategory(category.id)}
                  className="flex-row items-center justify-between gap-2.5 px-3.5 py-3"
                  accessibilityRole="button"
                >
                  <Text
                    className={cn(
                      "flex-1 text-[14px]",
                      categoryId === category.id
                        ? "text-accent-strong font-semibold"
                        : "text-content",
                    )}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                  {categoryId === category.id ? (
                    <Feather
                      name="check"
                      size={16}
                      color={colors.accentBright}
                    />
                  ) : null}
                </TouchableOpacity>
              ))}
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
            title="Crear Canal"
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

const styles = StyleSheet.create({
  categoryDropdown: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
