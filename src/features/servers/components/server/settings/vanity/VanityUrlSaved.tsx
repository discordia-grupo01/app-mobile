import { VANITY_URL_COPY } from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "../../../../../../components/ui/Button";
import { useCopyLink } from "../../../../../../hooks/useCopyLink";
import { useThemeColors } from "../../../../../../theme/theme-context";
import { vanityLinkText } from "../../../../api";
import { VanityLinkText } from "../../VanityLinkText";

interface VanityUrlSavedProps {
  code: string;
  onChange: () => void;
}

export function VanityUrlSaved({ code, onChange }: VanityUrlSavedProps) {
  const colors = useThemeColors();
  const { copied, error, copy } = useCopyLink();

  return (
    <View className="gap-2.5">
      <View className="min-h-12 flex-row items-center gap-2.5 rounded-xl border border-accent bg-surface-input px-3.5">
        <Feather name="link-2" size={16} color={colors.textMuted} />
        <VanityLinkText code={code} />
      </View>
      <View className="flex-row gap-3">
        <Button
          title={VANITY_URL_COPY.change}
          variant="secondary"
          onPress={onChange}
          style={{ flex: 1, width: undefined }}
        />
        <Button
          title={copied ? VANITY_URL_COPY.copied : VANITY_URL_COPY.copy}
          onPress={() => void copy(vanityLinkText(code))}
          iconLeft={
            <Feather
              name={copied ? "check" : "copy"}
              size={15}
              color={colors.onAccent}
            />
          }
          style={{ flex: 1, width: undefined }}
        />
      </View>
      <Text
        className={error ? "text-xs text-danger" : "text-xs text-content-muted"}
      >
        {error || VANITY_URL_COPY.savedNote}
      </Text>
    </View>
  );
}
