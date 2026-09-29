import {
  ATTACH_FILE_LABEL,
  EMOJI_PICKER_LABEL,
  MAX_MESSAGE_LENGTH,
  messageInputPlaceholder,
  SEND_MESSAGE_LABEL,
  validateMessageContent,
} from "@discordia/client-shared";

import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "../../../lib/cn";
import { useThemeColors } from "../../../theme/theme-context";
import { ComposerIconButton } from "./ComposerIconButton";
import { EmojiPickerSheet } from "./EmojiPickerSheet";

const COUNTER_THRESHOLD = MAX_MESSAGE_LENGTH - 200;

interface MessageComposerProps {
  channelName: string;
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function MessageComposer({
  channelName,
  onSend,
  disabled = false,
}: MessageComposerProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const canSend = !disabled && validateMessageContent(draft) === undefined;
  const length = [...draft].length;

  function submit() {
    if (!canSend) return;
    onSend(draft);
    setDraft("");
  }

  return (
    <View className="px-3 pt-1" style={{ paddingBottom: insets.bottom + 12 }}>
      <View className="flex-row items-end rounded-[10px] border border-line bg-surface-input px-1">
        <ComposerIconButton
          name="paperclip"
          label={ATTACH_FILE_LABEL}
          color={colors.textSubtle}
          disabled
        />
        <TextInput
          value={draft}
          onChangeText={setDraft}
          editable={!disabled}
          multiline
          placeholder={messageInputPlaceholder(channelName)}
          placeholderTextColor={colors.textSubtle}
          accessibilityLabel={messageInputPlaceholder(channelName)}
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
          color={canSend ? colors.accentBright : colors.textSubtle}
          onPress={submit}
          disabled={!canSend}
        />
      </View>

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
