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

import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ComposerIconButton } from "../../messages/components/ComposerIconButton";
import { EmojiPickerSheet } from "../../messages/components/EmojiPickerSheet";
import { useThemeColors } from "../../../theme/theme-context";
import type { SendDmResult } from "../useDirectMessages";

const COUNTER_THRESHOLD = MAX_MESSAGE_LENGTH - 200;

interface DmComposerProps {
  partnerName: string;
  blockedByMe: boolean;
  onSend: (content: string) => SendDmResult;
}

/** Composer de una conversacion directa: sin @everyone, con estados de bloqueo. */
export function DmComposer({
  partnerName,
  blockedByMe,
  onSend,
}: DmComposerProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [showBlockedToast, setShowBlockedToast] = useState(false);
  const canSend = !blockedByMe && validateMessageContent(draft) === undefined;
  const length = [...draft].length;

  function submit() {
    if (!canSend) return;
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
