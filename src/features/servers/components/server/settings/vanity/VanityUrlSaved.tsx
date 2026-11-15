import { VANITY_URL_COPY } from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { useCopyLink } from "../../../../../../hooks/useCopyLink";
import { useThemeColors } from "../../../../../../theme/theme-context";
import { vanityLinkText } from "../../../../api";
import { VanityLinkText } from "../../VanityLinkText";

interface VanityUrlSavedProps {
  code: string;
  onChange: () => void;
  onRemove: () => void;
}

export function VanityUrlSaved({
  code,
  onChange,
  onRemove,
}: VanityUrlSavedProps) {
  const colors = useThemeColors();
  const { copied, error, copy } = useCopyLink();

  return (
    <View className="gap-2">
      <Text className="text-[11px] font-bold uppercase tracking-[1.1px] text-content-muted">
        {VANITY_URL_COPY.title}
      </Text>
      <View className="gap-2.5 rounded-xl border border-accent bg-surface-input p-3">
        <View className="flex-row items-center gap-2.5">
          <Feather name="link-2" size={16} color={colors.textMuted} />
          <VanityLinkText code={code} />
        </View>
        <View className="flex-row gap-1.5">
          <TouchableOpacity
            onPress={() => void copy(vanityLinkText(code))}
            accessibilityRole="button"
            className="flex-row items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2"
          >
            {copied ? <Feather name="check" size={13} color="#ffffff" /> : null}
            <Text className="text-xs font-semibold text-on-accent">
              {copied ? VANITY_URL_COPY.copied : VANITY_URL_COPY.copy}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onChange}
            accessibilityRole="button"
            className="rounded-lg px-3.5 py-2"
          >
            <Text className="text-xs font-semibold text-content-muted">
              {VANITY_URL_COPY.change}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onRemove}
            accessibilityRole="button"
            className="rounded-lg bg-danger-soft px-3.5 py-2"
          >
            <Text className="text-xs font-semibold text-danger">
              {VANITY_URL_COPY.remove}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text
        className={error ? "text-xs text-danger" : "text-xs text-content-muted"}
      >
        {error || VANITY_URL_COPY.savedNote}
      </Text>
    </View>
  );
}
