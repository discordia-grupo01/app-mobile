import {
  BAN_MEMBER_TITLE,
  BANS_REVOKE_HINT,
  BANS_SECTION_SUBTITLE,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { LoadMoreFooter } from "../../../components/ui/LoadMoreFooter";
import { SettingsGroup } from "../../../components/ui/SettingsGroup";
import { useThemeColors } from "../../../theme/theme-context";

interface BansListHeaderProps {
  isBans: boolean;
  count?: number;
  errorMessage: string;
  onBanMember: () => void;
}

export function BansListHeader({
  isBans,
  count,
  errorMessage,
  onBanMember,
}: BansListHeaderProps) {
  const colors = useThemeColors();

  return (
    <View className="gap-4">
      {isBans ? (
        <Button
          title={BAN_MEMBER_TITLE}
          iconLeft={<Feather name="plus" size={18} color={colors.onAccent} />}
          onPress={onBanMember}
          fullWidth
        />
      ) : null}
      <SettingsGroup
        label={isBans ? BANS_SECTION_SUBTITLE : "Miembros"}
        count={count}
      >
        <FormErrorBanner message={errorMessage} />
      </SettingsGroup>
    </View>
  );
}

interface BansListFooterProps {
  isBans: boolean;
  hasItems: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  noun: string;
}

export function BansListFooter({
  isBans,
  hasItems,
  hasMore,
  isLoadingMore,
  onLoadMore,
  noun,
}: BansListFooterProps) {
  const colors = useThemeColors();

  return (
    <>
      {hasItems ? (
        <LoadMoreFooter
          hasMore={hasMore}
          isLoading={isLoadingMore}
          onLoadMore={onLoadMore}
          noun={noun}
        />
      ) : null}
      {isBans ? (
        <View className="flex-row gap-2">
          <Feather name="info" size={14} color={colors.textMuted} />
          <Text className="flex-1 text-xs leading-[17px] text-content-muted">
            {BANS_REVOKE_HINT}
          </Text>
        </View>
      ) : null}
    </>
  );
}
