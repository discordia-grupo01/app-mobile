import {
  ATTACH_FILE_LABEL,
  type AttachmentTarget,
  decodeMentions,
  EMOJI_PICKER_LABEL,
  MAX_MESSAGE_LENGTH,
  SEND_MESSAGE_LABEL,
  validateMessageContent,
} from "@discordia/client-shared";

import { useEffect, useRef, useState, type ComponentRef } from "react";
import { Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "../../../lib/cn";
import { useAttachmentPicker } from "../../attachments/useAttachmentPicker";
import { useAttachmentUploads } from "../../attachments/useAttachmentUploads";
import { useOwnPremium } from "../../billing/useOwnPremium";
import { useThemeColors } from "../../../theme/theme-context";
import type { SendMessageResult } from "../use-channel-messages";
import { useMentionDraft } from "../useMentionDraft";
import { AttachmentChips } from "./AttachmentChips";
import { ComposerIconButton } from "./ComposerIconButton";
import { EditingBanner, type ComposerEditing } from "./EditingBanner";
import { EmojiPickerSheet } from "./EmojiPickerSheet";
import { useMentionDraftChildren } from "./useMentionDraftChildren";
import { MentionSuggestions } from "./MentionSuggestions";
import { useMessageMentions } from "./MentionsContext";

const COUNTER_THRESHOLD = MAX_MESSAGE_LENGTH - 200;

interface MessageComposerProps {
  placeholder: string;
  onSend: (
    content: string,
    attachmentIds?: string[],
  ) => void | Promise<SendMessageResult>;
  /** A donde van los archivos: el canal o el usuario del DM. */
  uploadTarget: AttachmentTarget;
  disabled?: boolean;
  /** Mientras hay un mensaje en edicion, el composer lo carga y guarda en lugar de enviar uno nuevo. */
  editing?: ComposerEditing | null;
}

export function MessageComposer({
  placeholder,
  onSend,
  uploadTarget,
  disabled = false,
  editing = null,
}: MessageComposerProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { sources, resolveMention } = useMessageMentions();
  const draft = useMentionDraft({ sources });
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [sendError, setSendError] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);
  const premium = useOwnPremium();
  const {
    attachments,
    pick: pickFiles,
    remove: removeAttachment,
    clear: clearAttachments,
  } = useAttachmentPicker({ premium, onError: setSendError });
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const { uploadAll, forget } = useAttachmentUploads();

  // Al empezar o terminar una edicion el borrador pasa a ser el del mensaje (o
  // vuelve a vacio). Se ajusta durante el render, no en un efecto, para no
  // mostrar un cuadro con el borrador viejo. El mensaje trae `<@id>`: se edita
  // como `@Nombre` y se vuelve a codificar al guardar.
  const editingId = editing?.id ?? null;
  const [syncedEditingId, setSyncedEditingId] = useState<string | null>(null);
  if (editingId !== syncedEditingId) {
    setSyncedEditingId(editingId);
    const decoded = decodeMentions(
      editing?.content ?? "",
      (kind, id) => resolveMention?.(kind, id)?.name ?? null,
    );
    draft.load(decoded.text, decoded.picked);
    setSendError(undefined);
  }

  // El input ya estaba montado, asi que el foco (y el teclado) es inmediato.
  useEffect(() => {
    if (editingId) inputRef.current?.focus();
  }, [editingId]);
  // El limite del back cuenta el texto con los tokens `<@id>`, no lo visible.
  const canSend =
    !disabled &&
    !isSending &&
    validateMessageContent(
      draft.encoded,
      editing ? editing.hasAttachments : attachments.length > 0,
    ) === undefined;
  const length = [...draft.encoded].length;
  const draftChildren = useMentionDraftChildren(draft.segments ?? []);

  async function submit() {
    if (!canSend) return;
    setSendError(undefined);

    if (editing && draft.encoded.trim() === editing.content) {
      editing.onCancel();
      return;
    }

    if (editing) {
      const outcome = editing.onSave(draft.encoded);
      if (outcome === undefined) return draft.reset();
      setIsSending(true);
      const result = await outcome;
      setIsSending(false);
      if (result.ok) draft.reset();
      else setSendError(result.message);
      return;
    }

    // Solo texto: si el que envia devuelve `void` (los fallos se muestran en el
    // chat) el cuadro se libera al instante, sin pasar por `isSending` para no
    // perder el foco ni el teclado.
    if (attachments.length === 0) {
      const outcome = onSend(draft.encoded, []);
      if (outcome === undefined) return clearDraft();
      setIsSending(true);
      const result = await outcome;
      setIsSending(false);
      if (result.ok) clearDraft();
      else setSendError(result.message);
      return;
    }

    setIsSending(true);
    const uploads = await uploadAll(attachments, uploadTarget);
    if (!uploads.ok) {
      setIsSending(false);
      setSendError(uploads.message);
      return;
    }

    const result = await onSend(draft.encoded, uploads.ids);
    setIsSending(false);
    if (result === undefined || result.ok) clearDraft();
    else setSendError(result.message);
  }

  function clearDraft() {
    draft.reset();
    clearAttachments();
    forget();
  }

  return (
    <View className="px-3 pt-1" style={{ paddingBottom: insets.bottom + 12 }}>
      {draft.isOpen ? (
        <MentionSuggestions
          query={draft.query}
          candidates={draft.candidates}
          onPick={draft.pick}
        />
      ) : null}
      {editing ? <EditingBanner onCancel={editing.onCancel} /> : null}
      <AttachmentChips
        attachments={editing ? [] : attachments}
        disabled={isSending}
        onRemove={removeAttachment}
      />
      <View className="flex-row items-end rounded-[10px] border border-line bg-surface-input px-1.5 py-1">
        <ComposerIconButton
          name="paperclip"
          label={ATTACH_FILE_LABEL}
          color={colors.textSubtle}
          onPress={pickFiles}
          disabled={disabled || isSending || editing !== null}
        />
        <View className="relative flex-1 justify-center">
          {/* El placeholder nativo de un input multilinea no se corta con "…": este si. */}
          {draft.text.length === 0 ? (
            <Text
              pointerEvents="none"
              numberOfLines={1}
              className="absolute left-[3px] right-0 text-[15px] text-content-subtle"
            >
              {placeholder}
            </Text>
          ) : null}
          <TextInput
            ref={inputRef}
            // Con menciones el texto va como hijos (cada tramo con su estilo); sin ellas, como `value`.
            value={draft.segments ? undefined : draft.text}
            onChangeText={(text) => {
              draft.handleChangeText(text);
              setSendError(undefined);
            }}
            onSelectionChange={draft.handleSelectionChange}
            selection={draft.selection}
            editable={!disabled && !isSending}
            multiline
            accessibilityLabel={placeholder}
            className="max-h-32 min-h-10 px-0 py-2.5 text-[15px] text-content"
          >
            {draft.segments ? draftChildren : null}
          </TextInput>
        </View>
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

      {sendError ? (
        <Text className="mt-1.5 text-[12px] text-danger">{sendError}</Text>
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
        onPick={draft.append}
        onClose={() => setIsEmojiPickerOpen(false)}
      />
    </View>
  );
}
