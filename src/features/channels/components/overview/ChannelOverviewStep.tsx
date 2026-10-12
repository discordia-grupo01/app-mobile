import {
  type Channel,
  CHANNEL_NAME_LABEL,
  CHANNEL_TOPIC_HINT,
  CHANNEL_TOPIC_LABEL,
  CHANNEL_TOPIC_PLACEHOLDER,
  MAX_CHANNEL_TOPIC,
  MAX_NAME,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";

import { FieldError } from "../../../../components/ui/FieldError";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
import type { ChannelOverviewForm } from "./useChannelOverviewForm";

function Counter({ length, max }: { length: number; max: number }) {
  return (
    <Text
      className={cn(
        "text-[11px]",
        length > max ? "text-danger" : "text-content-subtle",
      )}
    >
      {length}/{max}
    </Text>
  );
}

interface ChannelOverviewStepProps {
  kind: Channel["kind"];
  form: ChannelOverviewForm;
}

export function ChannelOverviewStep({ kind, form }: ChannelOverviewStepProps) {
  const colors = useThemeColors();

  return (
    <View className="gap-6">
      <View>
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle uppercase">
            {CHANNEL_NAME_LABEL} <Text className="text-danger">*</Text>
          </Text>
          <Counter length={form.name.trim().length} max={MAX_NAME} />
        </View>
        <View
          className={cn(
            "flex-row items-center gap-2 rounded-xl border bg-surface-input px-3.5 min-h-12",
            form.nameError ? "border-danger" : "border-line",
          )}
        >
          <Feather
            name={kind === "text" ? "hash" : "volume-2"}
            size={15}
            color={colors.textSubtle}
          />
          <TextInput
            value={form.name}
            onChangeText={form.setName}
            maxLength={MAX_NAME + 10}
            autoCapitalize="none"
            accessibilityLabel={CHANNEL_NAME_LABEL}
            className="flex-1 py-3 text-content text-[14px]"
          />
        </View>
        <FieldError message={form.nameError} />
      </View>

      {kind === "text" ? (
        <View>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle uppercase">
              {CHANNEL_TOPIC_LABEL}
            </Text>
            <Counter
              length={form.topic.trim().length}
              max={MAX_CHANNEL_TOPIC}
            />
          </View>
          <TextInput
            value={form.topic}
            onChangeText={form.setTopic}
            multiline
            textAlignVertical="top"
            placeholder={CHANNEL_TOPIC_PLACEHOLDER}
            placeholderTextColor={colors.textSubtle}
            accessibilityLabel={CHANNEL_TOPIC_LABEL}
            className={cn(
              "min-h-24 rounded-xl border bg-surface-input px-3.5 py-3 text-content text-[14px]",
              form.topicError ? "border-danger" : "border-line",
            )}
          />
          <FieldError message={form.topicError} />
          <Text className="text-[12px] text-content-subtle mt-1.5">
            {CHANNEL_TOPIC_HINT}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
