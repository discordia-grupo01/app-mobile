import {
  MAX_NAME,
  SERVER_NAME_LABEL,
  SERVER_NAME_PLACEHOLDER,
} from "@discordia/client-shared";
import { Text, TextInput, View } from "react-native";

import { FieldError } from "../../../../components/ui/FieldError";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";

interface ServerNameFieldProps {
  value: string;
  error: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

export function ServerNameField({
  value,
  error,
  onChange,
  autoFocus,
}: ServerNameFieldProps) {
  const colors = useThemeColors();

  return (
    <View>
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle uppercase">
          {SERVER_NAME_LABEL} <Text className="text-danger">*</Text>
        </Text>
        <Text
          className={cn(
            "text-[11px]",
            value.length > MAX_NAME ? "text-danger" : "text-content-subtle",
          )}
        >
          {value.length}/{MAX_NAME}
        </Text>
      </View>
      <View
        className={cn(
          "rounded-xl border bg-surface-input px-3.5 min-h-12 justify-center",
          error ? "border-danger" : "border-line",
        )}
      >
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={SERVER_NAME_PLACEHOLDER}
          placeholderTextColor={colors.textSubtle}
          maxLength={MAX_NAME + 10}
          autoFocus={autoFocus}
          className="text-content text-[14px]"
        />
      </View>
      <FieldError message={error} />
    </View>
  );
}
