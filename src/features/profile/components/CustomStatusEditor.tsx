import {
  CLEAR_CUSTOM_STATUS_LABEL,
  CUSTOM_STATUS_PLACEHOLDER,
  MAX_CUSTOM_STATUS,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState, type ComponentRef } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { cn } from "../../../lib/cn";
import { useThemeColors } from "../../../theme/theme-context";

interface CustomStatusEditorProps {
  statusText: string;
  onSave: (text: string) => Promise<boolean>;
  onClear: () => Promise<boolean>;
  onStartEditing?: () => void;
}

export function CustomStatusEditor({
  statusText,
  onSave,
  onClear,
  onStartEditing,
}: CustomStatusEditorProps) {
  const colors = useThemeColors();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(statusText);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  function startEditing() {
    setDraft(statusText);
    setIsEditing(true);
    onStartEditing?.();
  }

  async function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setIsEditing(false);
      return;
    }
    setIsSubmitting(true);
    const ok = await onSave(trimmed);
    setIsSubmitting(false);
    if (ok) setIsEditing(false);
  }

  async function handleClear() {
    setIsSubmitting(true);
    const ok = await onClear();
    setIsSubmitting(false);
    if (ok) setIsEditing(false);
  }

  return (
    <View>
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-[11px] font-bold tracking-[1.2px] text-content-subtle">
          ESTADO PERSONALIZADO
        </Text>
        {!isEditing && statusText ? (
          <TouchableOpacity
            onPress={handleClear}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel={CLEAR_CUSTOM_STATUS_LABEL}
            className="flex-row items-center gap-1"
          >
            <Feather name="x" size={10} color={colors.textSubtle} />
            <Text className="text-[10px] text-content-subtle">Quitar</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {isEditing ? (
        <View className="gap-2">
          <View className="items-end">
            <Text className="text-[11px] text-content-subtle">
              {draft.length}/{MAX_CUSTOM_STATUS}
            </Text>
          </View>
          <TextInput
            ref={inputRef}
            value={draft}
            onChangeText={(text) => setDraft(text.slice(0, MAX_CUSTOM_STATUS))}
            onSubmitEditing={handleSave}
            placeholder={CUSTOM_STATUS_PLACEHOLDER}
            placeholderTextColor={colors.textSubtle}
            editable={!isSubmitting}
            className="rounded-xl border border-accent bg-surface-input px-3.5 min-h-11 text-content text-[13px]"
          />
          <View className="flex-row gap-3">
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={() => setIsEditing(false)}
              disabled={isSubmitting}
              fullWidth={false}
              className="flex-1 min-h-9 py-2 px-3.5"
            />
            <Button
              title="Guardar"
              onPress={handleSave}
              isLoading={isSubmitting}
              fullWidth={false}
              className="flex-1 min-h-9 py-2 px-3.5"
            />
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={startEditing}
          className="flex-row items-center gap-2 rounded-xl border border-line bg-surface-input px-3.5 min-h-11"
          activeOpacity={0.8}
        >
          <Text
            className={cn(
              "flex-1 text-[13px]",
              statusText ? "text-content-muted" : "text-content-subtle",
            )}
            numberOfLines={1}
          >
            {statusText || "Añadir un estado personalizado..."}
          </Text>
          <Feather name="edit-2" size={11} color={colors.textSubtle} />
        </TouchableOpacity>
      )}
    </View>
  );
}
