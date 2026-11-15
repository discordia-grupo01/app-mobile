import {
  normalizeVanityCode,
  validateVanityCode,
  VANITY_URL_COPY,
} from "@discordia/client-shared";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { Button } from "../../../../../../components/ui/Button";
import { cn } from "../../../../../../lib/cn";
import { useThemeColors } from "../../../../../../theme/theme-context";
import { vanityLinkPrefix } from "../../../../api";

interface VanityUrlEditorProps {
  initialCode: string;
  pending: boolean;
  /** Error de servers al guardar (código tomado, sin permiso…). */
  saveError: string;
  onSave: (code: string) => void;
  /** Solo si ya hay una URL guardada: vuelve a mostrarla sin cambios. */
  onCancel?: () => void;
  onEdit: () => void;
}

export function VanityUrlEditor({
  initialCode,
  pending,
  saveError,
  onSave,
  onCancel,
  onEdit,
}: VanityUrlEditorProps) {
  const colors = useThemeColors();
  const [draft, setDraft] = useState(initialCode);
  const validation = validateVanityCode(draft);
  const message = validation ?? saveError;
  const isError = message !== "";

  function submit() {
    if (validation || pending) return;
    onSave(normalizeVanityCode(draft));
  }

  return (
    <View className="gap-2">
      <Text className="text-[11px] font-bold uppercase tracking-[1.1px] text-content-muted">
        {VANITY_URL_COPY.title}
      </Text>
      <View
        className={cn(
          "min-h-12 flex-row items-center rounded-xl border bg-surface-input px-3.5",
          isError ? "border-danger" : "border-line",
        )}
      >
        <Text className="text-[14px] text-content-subtle" numberOfLines={1}>
          {vanityLinkPrefix()}
        </Text>
        <TextInput
          value={draft}
          onChangeText={(text) => {
            setDraft(text.toLowerCase());
            onEdit();
          }}
          onSubmitEditing={submit}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={VANITY_URL_COPY.title}
          placeholderTextColor={colors.textSubtle}
          className="flex-1 py-3 text-[14px] font-semibold text-content"
        />
      </View>
      <Text
        className={cn(
          "text-xs",
          isError ? "text-danger" : "text-content-subtle",
        )}
      >
        {isError ? message : VANITY_URL_COPY.help}
      </Text>
      <View className="flex-row gap-3">
        {onCancel ? (
          <Button
            title="Cancelar"
            variant="secondary"
            disabled={pending}
            onPress={onCancel}
            style={{ flex: 1, width: undefined }}
          />
        ) : null}
        <Button
          title={VANITY_URL_COPY.save}
          onPress={submit}
          disabled={validation !== undefined}
          isLoading={pending}
          style={{ flex: 1, width: undefined }}
        />
      </View>
    </View>
  );
}
