import {
  MAX_NAME,
  SERVER_NAME_LABEL,
  SERVER_NAME_PLACEHOLDER,
} from "@discordia/client-shared";
import { TextInput, View } from "react-native";

import { FieldError } from "../../../../components/ui/FieldError";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
import { FieldLabel } from "../../../../components/ui/FieldLabel";
import { CharacterCounter } from "../../../../components/ui/CharacterCounter";

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
        <FieldLabel required>{SERVER_NAME_LABEL}</FieldLabel>
        <CharacterCounter length={value.length} max={MAX_NAME} />
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
