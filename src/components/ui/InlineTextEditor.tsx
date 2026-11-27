import { useState } from "react";
import { TextInput, View } from "react-native";

import { cn } from "../../lib/cn";
import { useThemeColors } from "../../theme/theme-context";
import { Button } from "./Button";
import { FieldError } from "./FieldError";
import { FieldLabel } from "./FieldLabel";

interface InlineTextEditorProps {
  initialValue: string;
  maxLength: number;
  label: string;
  hideLabel?: boolean;
  placeholder?: string;
  multiline?: boolean;
  /** Devuelve el mensaje de error, o `null` si guardó y el editor se puede cerrar. */
  onSave: (draft: string) => Promise<string | null>;
  onClose: () => void;
}

export function InlineTextEditor({
  initialValue,
  maxLength,
  label,
  hideLabel = false,
  placeholder,
  multiline = false,
  onSave,
  onClose,
}: InlineTextEditorProps) {
  const colors = useThemeColors();
  const [draft, setDraft] = useState(initialValue);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function changeDraft(value: string) {
    setDraft(value.slice(0, maxLength));
    setError("");
  }

  async function save() {
    setIsSaving(true);
    const saveError = await onSave(draft);
    setIsSaving(false);
    if (saveError) setError(saveError);
    else onClose();
  }

  return (
    <View>
      {hideLabel ? null : (
        <View className="flex-row items-center min-h-7 mb-1.5">
          <FieldLabel>{label}</FieldLabel>
        </View>
      )}
      <TextInput
        value={draft}
        onChangeText={changeDraft}
        onSubmitEditing={multiline ? undefined : () => void save()}
        placeholder={placeholder}
        maxLength={maxLength}
        placeholderTextColor={colors.textSubtle}
        editable={!isSaving}
        multiline={multiline}
        autoFocus
        accessibilityLabel={label}
        className={cn(
          "rounded-[10px] border bg-surface-input px-3 text-content text-[13px]",
          error ? "border-danger" : "border-accent",
          multiline ? "h-22.5 py-2" : "h-9.5",
        )}
        style={multiline ? { textAlignVertical: "top" } : undefined}
      />
      <FieldError message={error} />
      <View className="flex-row items-center justify-end mt-1.5">
        <View className="flex-row items-center gap-2">
          <Button
            title="Cancelar"
            variant="secondary"
            size="sm"
            onPress={onClose}
            disabled={isSaving}
            fullWidth={false}
          />
          <Button
            title="Guardar"
            size="sm"
            onPress={() => void save()}
            isLoading={isSaving}
            fullWidth={false}
          />
        </View>
      </View>
    </View>
  );
}
