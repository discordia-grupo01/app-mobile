import {
  ATTACH_FILE_LABEL,
  DM_BLOCKED_CANNOT_SEND,
  DM_MESSAGE_BLOCKED_NOTICE,
  dmInputPlaceholder,
  EMOJI_PICKER_LABEL,
  MAX_MESSAGE_LENGTH,
  SEND_MESSAGE_LABEL,
  validateMessageContent,
} from "@discordia/client-shared";

import { useEffect, useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ComposerIconButton } from "../../messages/components/ComposerIconButton";
import {
  EditingBanner,
  type ComposerEditing,
} from "../../messages/components/EditingBanner";
import { EmojiPickerSheet } from "../../messages/components/EmojiPickerSheet";
import { useThemeColors } from "../../../theme/theme-context";
import type { SendDmResult } from "../useDirectMessages";

const COUNTER_THRESHOLD = MAX_MESSAGE_LENGTH - 200;

interface DmComposerProps {
  partnerName: string;
  blockedByMe: boolean;
  onSend: (content: string) => SendDmResult;
  /** Mientras hay un mensaje en edicion, el composer lo carga y guarda en lugar de enviar uno nuevo. */
  editing?: ComposerEditing | null;
}

/** Composer de una conversacion directa: sin @everyone, con estados de bloqueo. */
export function DmComposer({
  partnerName,
  blockedByMe,
  onSend,
  editing = null,
}: DmComposerProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [showBlockedToast, setShowBlockedToast] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Al empezar o terminar una edicion el borrador pasa a ser el del mensaje (o
  // vuelve a vacio). Se ajusta durante el render, no en un efecto, para no
  // mostrar un cuadro con el borrador viejo.
  const editingId = editing?.id ?? null;
  const [syncedEditingId, setSyncedEditingId] = useState<string | null>(null);
  if (editingId !== syncedEditingId) {
    setSyncedEditingId(editingId);
    setDraft(editing?.content ?? "");
  }

  // El input ya estaba montado, asi que el foco (y el teclado) es inmediato.
  useEffect(() => {
    if (editingId) inputRef.current?.focus();
  }, [editingId]);

  const canSend = !blockedByMe && validateMessageContent(draft) === undefined;
  const length = [...draft].length;

  function submit() {
    if (!canSend) return;
    if (editing) {
      if (draft.trim() !== editing.content) editing.onSave(draft);
      else editing.onCancel();
      return;
    }
    const result = onSend(draft);
    if (result === "sent") {
      setDraft("");
    } else if (result === "blocked") {
      setDraft("");
      setShowBlockedToast(true);
      setTimeout(() => setShowBlockedToast(false), 3500);
    }
  }

  return (
    <View className="px-3 pt-1" style={{ paddingBottom: insets.bottom + 12 }}>
      {blockedByMe ? (
        <Text className="mb-2 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-[13px] text-danger">
          {DM_BLOCKED_CANNOT_SEND}
        </Text>
      ) : null}
      {showBlockedToast ? (
        <Text className="mb-2 rounded-lg border border-danger/30 bg-danger/12 px-3 py-2 text-[13px] text-danger">
          {DM_MESSAGE_BLOCKED_NOTICE}
        </Text>
      ) : null}

      {editing ? <EditingBanner onCancel={editing.onCancel} /> : null}
      <View
        className="flex-row items-end rounded-[10px] border border-line bg-surface-input px-1"
        style={blockedByMe ? { opacity: 0.6 } : undefined}
      >
        <ComposerIconButton
          name="paperclip"
          label={ATTACH_FILE_LABEL}
          color={colors.textSubtle}
          disabled
        />
        <TextInput
          ref={inputRef}
          value={draft}
          onChangeText={setDraft}
          editable={!blockedByMe}
          multiline
          placeholder={dmInputPlaceholder(partnerName)}
          placeholderTextColor={colors.textSubtle}
          accessibilityLabel={dmInputPlaceholder(partnerName)}
          className="max-h-32 min-h-10 flex-1 py-2.5 text-[15px] text-content"
        />
        <ComposerIconButton
          name="smile"
          label={EMOJI_PICKER_LABEL}
          color={colors.textSubtle}
          onPress={() => setIsEmojiPickerOpen(true)}
          disabled={blockedByMe}
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

      {length >= COUNTER_THRESHOLD ? (
        <Text
          className="mt-1 self-end text-[12px]"
          style={{
            color:
              length > MAX_MESSAGE_LENGTH ? colors.danger : colors.highlight,
          }}
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
