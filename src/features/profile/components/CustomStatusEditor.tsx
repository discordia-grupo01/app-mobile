import {
  CLEAR_CUSTOM_STATUS_LABEL,
  CUSTOM_STATUS_PLACEHOLDER,
  MAX_CUSTOM_STATUS,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "../../../components/ui/Button";
import { colors } from "../../../theme/colors";

interface CustomStatusEditorProps {
  statusText: string;
  onSave: (text: string) => Promise<boolean>;
  onClear: () => Promise<boolean>;
}

export function CustomStatusEditor({
  statusText,
  onSave,
  onClear,
}: CustomStatusEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(statusText);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  function startEditing() {
    setDraft(statusText);
    setIsEditing(true);
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
      <View style={styles.headerRow}>
        <Text style={styles.label}>ESTADO PERSONALIZADO</Text>
        {!isEditing && statusText ? (
          <TouchableOpacity
            onPress={handleClear}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel={CLEAR_CUSTOM_STATUS_LABEL}
            style={styles.clearButton}
          >
            <Feather name="x" size={10} color={colors.textSubtle} />
            <Text style={styles.clearText}>Quitar</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {isEditing ? (
        <View style={styles.editWrap}>
          <View style={styles.counterRow}>
            <Text style={styles.counter}>
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
            style={styles.input}
          />
          <View style={styles.editActions}>
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={() => setIsEditing(false)}
              disabled={isSubmitting}
              fullWidth={false}
              style={styles.actionButton}
            />
            <Button
              title="Guardar"
              onPress={handleSave}
              isLoading={isSubmitting}
              fullWidth={false}
              style={styles.actionButton}
            />
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={startEditing}
          style={styles.trigger}
          activeOpacity={0.8}
        >
          <Text
            style={statusText ? styles.triggerText : styles.triggerPlaceholder}
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

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.textSubtle,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clearText: {
    fontSize: 10,
    color: colors.textSubtle,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  triggerText: {
    flex: 1,
    fontSize: 13,
    color: colors.textMuted,
  },
  triggerPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: colors.textSubtle,
  },
  editWrap: {
    gap: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 14,
    minHeight: 44,
    color: colors.text,
    fontSize: 13,
  },
  counterRow: {
    alignItems: "flex-end",
  },
  counter: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
});
