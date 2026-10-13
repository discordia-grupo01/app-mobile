import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";

const EDITING_LABEL = "Editando mensaje";
const CANCEL_EDIT_LABEL = "Cancelar edición";

/** Lo que un composer necesita para editar un mensaje en lugar de enviar uno nuevo. */
export interface ComposerEditing {
  id: string;
  /** Contenido actual del mensaje: es el borrador con el que arranca la edicion. */
  content: string;
  /** El mensaje tiene adjuntos: puede quedar sin texto (los adjuntos no se editan). */
  hasAttachments: boolean;
  /** Si devuelve una promesa, el borrador se conserva hasta que guarda bien. */
  onSave: (
    content: string,
  ) => void | Promise<{ ok: true } | { ok: false; message: string }>;
  onCancel: () => void;
}

/** Barra sobre el composer mientras se edita: avisa que no se esta enviando uno nuevo. */
export function EditingBanner({ onCancel }: { onCancel: () => void }) {
  const colors = useThemeColors();

  return (
    <View className="mb-1.5 flex-row items-center justify-between rounded-lg bg-surface-input px-3 py-1.5">
      <Text className="text-[12px] font-semibold text-content-muted">
        {EDITING_LABEL}
      </Text>
      <TouchableOpacity
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel={CANCEL_EDIT_LABEL}
        hitSlop={8}
      >
        <Feather name="x" size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}
