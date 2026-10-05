import { validateMessageContent } from "@discordia/client-shared";

import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";

interface MessageEditFormProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  /** Mientras se guarda no se puede volver a guardar. */
  isSaving?: boolean;
  /** Por que fallo el guardado; el formulario sigue abierto con el borrador. */
  error?: string | null;
}

/** Edición inline de un mensaje: sin teclado de "Enter para guardar" en mobile, dos botones. */
export function MessageEditForm({
  initialContent,
  onSave,
  onCancel,
  isSaving = false,
  error = null,
}: MessageEditFormProps) {
  const colors = useThemeColors();
  const [draft, setDraft] = useState(initialContent);
  const canSave = !isSaving && validateMessageContent(draft) === undefined;

  return (
    <View>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        multiline
        autoFocus
        className="min-h-14 rounded-md border border-accent bg-surface-input p-2 text-[15px] text-content"
      />
      {error ? (
        <Text
          accessibilityRole="alert"
          className="mt-1 text-[12px] text-danger"
        >
          {error}
        </Text>
      ) : null}
      <View className="mt-1.5 flex-row justify-end gap-2">
        <TouchableOpacity onPress={onCancel} className="rounded-md px-3 py-1.5">
          <Text className="text-[13px] font-semibold text-content-muted">
            Cancelar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => canSave && onSave(draft.trim())}
          disabled={!canSave}
          className="rounded-md bg-accent px-3 py-1.5"
          style={!canSave ? { opacity: 0.5 } : undefined}
        >
          <Text
            className="text-[13px] font-semibold"
            style={{ color: colors.onAccent }}
          >
            Guardar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
