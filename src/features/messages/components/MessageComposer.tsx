import {
  ATTACH_FILE_LABEL,
  EMOJI_PICKER_LABEL,
  MAX_MESSAGE_LENGTH,
  SEND_MESSAGE_LABEL,
  validateMentionEveryone,
  validateMessageContent,
} from "@discordia/client-shared";

import { useEffect, useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "../../../lib/cn";
import { useThemeColors } from "../../../theme/theme-context";
import type { SendMessageResult } from "../use-channel-messages";
import { ComposerIconButton } from "./ComposerIconButton";
import { EditingBanner, type ComposerEditing } from "./EditingBanner";
import { EmojiPickerSheet } from "./EmojiPickerSheet";

const COUNTER_THRESHOLD = MAX_MESSAGE_LENGTH - 200;

interface MessageComposerProps {
  /** Texto del campo vacio (ej. `messageInputPlaceholder(canal)` o `dmInputPlaceholder(nombre)`). */
  placeholder: string;
  /**
   * Si devuelve una promesa, el borrador se conserva hasta que el envio sale
   * bien (un fallo lo deja para reintentar). Si devuelve `void`, se limpia al
   * instante.
   */
  onSend: (content: string) => void | Promise<SendMessageResult>;
  disabled?: boolean;
  /** Puede usar `@everyone`/`@here`. Por defecto `false`. */
  canMentionEveryone?: boolean;
  /** Mientras hay un mensaje en edicion, el composer lo carga y guarda en lugar de enviar uno nuevo. */
  editing?: ComposerEditing | null;
}

export function MessageComposer({
  placeholder,
  onSend,
  disabled = false,
  canMentionEveryone = false,
  editing = null,
}: MessageComposerProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [mentionError, setMentionError] = useState<string | undefined>();
  const [sendError, setSendError] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Al empezar o terminar una edicion el borrador pasa a ser el del mensaje (o
  // vuelve a vacio). Se ajusta durante el render, no en un efecto, para no
  // mostrar un cuadro con el borrador viejo.
  const editingId = editing?.id ?? null;
  const [syncedEditingId, setSyncedEditingId] = useState<string | null>(null);
  if (editingId !== syncedEditingId) {
    setSyncedEditingId(editingId);
    setDraft(editing?.content ?? "");
    setMentionError(undefined);
    setSendError(undefined);
  }

  // El input ya estaba montado, asi que el foco (y el teclado) es inmediato.
  useEffect(() => {
    if (editingId) inputRef.current?.focus();
  }, [editingId]);
  const canSend =
    !disabled && !isSending && validateMessageContent(draft) === undefined;
  const length = [...draft].length;

  async function submit() {
    if (!canSend) return;
    const mentionIssue = validateMentionEveryone(draft, canMentionEveryone);
    if (mentionIssue) {
      setMentionError(mentionIssue);
      return;
    }
    setMentionError(undefined);
    setSendError(undefined);

    if (editing && draft.trim() === editing.content) {
      editing.onCancel();
      return;
    }

    const outcome = editing ? editing.onSave(draft) : onSend(draft);
    if (outcome === undefined) {
      setDraft("");
      return;
    }

    setIsSending(true);
    const result = await outcome;
    setIsSending(false);
    if (result.ok) setDraft("");
    else setSendError(result.message);
  }

  return (
    <View className="px-3 pt-1" style={{ paddingBottom: insets.bottom + 12 }}>
      {editing ? <EditingBanner onCancel={editing.onCancel} /> : null}
      <View className="flex-row items-end rounded-[10px] border border-line bg-surface-input px-1">
        <ComposerIconButton
          name="paperclip"
          label={ATTACH_FILE_LABEL}
          color={colors.textSubtle}
          disabled
        />
        <TextInput
          ref={inputRef}
          value={draft}
          onChangeText={(text) => {
            setDraft(text);
            setMentionError(undefined);
            setSendError(undefined);
          }}
          editable={!disabled && !isSending}
          multiline
          placeholder={placeholder}
          placeholderTextColor={colors.textSubtle}
          accessibilityLabel={placeholder}
          className="max-h-32 min-h-10 flex-1 py-2.5 text-[15px] text-content"
        />
        <ComposerIconButton
          name="smile"
          label={EMOJI_PICKER_LABEL}
          color={colors.textSubtle}
          onPress={() => setIsEmojiPickerOpen(true)}
          disabled={disabled}
        />
        <ComposerIconButton
          name="send"
          label={SEND_MESSAGE_LABEL}
          color={canSend ? colors.onAccent : colors.textSubtle}
          onPress={submit}
          disabled={!canSend}
          filled={canSend}
        />
      </View>

      {mentionError || sendError ? (
        <Text className="mt-1.5 text-[12px] text-danger">
          {mentionError ?? sendError}
        </Text>
      ) : null}

      {length >= COUNTER_THRESHOLD ? (
        <Text
          className={cn(
            "mt-1 self-end text-[12px]",
            length > MAX_MESSAGE_LENGTH ? "text-danger" : "text-highlight",
          )}
        >
          {length}/{MAX_MESSAGE_LENGTH}
        </Text>
      ) : null}

      <EmojiPickerSheet
        visible={isEmojiPickerOpen}
        title={EMOJI_PICKER_LABEL}
        onPick={(emoji) => setDraft((prev) => prev + emoji)}
        onClose={() => setIsEmojiPickerOpen(false)}
      />
    </View>
  );
}
