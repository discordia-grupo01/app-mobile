import { type UserListItem } from "@discordia/client-shared";

import { type ReactElement } from "react";
import { FlatList, View } from "react-native";

import {
  EMPTY_STATE_ICON_SIZE,
  EmptyState,
} from "../../../components/ui/EmptyState";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { cn } from "../../../lib/cn";
import { useThemeColors } from "../../../theme/theme-context";
import { BanIcon } from "./BanIcon";
import { type UserRowAction } from "./RowActionButton";
import { UserRow } from "./UserRow";

interface BansListProps {
  items: UserListItem[] | null;
  emptyMessage: string;
  actionsFor: (item: UserListItem) => UserRowAction[];
  onSelect?: (item: UserListItem) => void;
  disableActions: boolean;
  header: ReactElement;
  footer: ReactElement;
}

export function BansList({
  items,
  emptyMessage,
  actionsFor,
  onSelect,
  disableActions,
  header,
  footer,
}: BansListProps) {
  const colors = useThemeColors();
  const count = items?.length ?? 0;

  return (
    <FlatList
      className="min-h-0 flex-1"
      contentContainerClassName="px-5 py-4"
      keyboardShouldPersistTaps="handled"
      data={items ?? []}
      keyExtractor={(item) => item.userId}
      ListHeaderComponent={<View className="mb-3">{header}</View>}
      ListEmptyComponent={
        items === null ? (
          <LoadingSpinner />
        ) : (
          <EmptyState
            media={
              <BanIcon size={EMPTY_STATE_ICON_SIZE} color={colors.textSubtle} />
            }
            text={emptyMessage}
          />
        )
      }
      renderItem={({ item, index }) => (
        <View
          className={cn(
            "overflow-hidden border-x border-t border-line bg-surface-raised",
            index === 0 && "rounded-t-2xl",
            index === count - 1 && "rounded-b-2xl border-b",
          )}
        >
          <UserRow
            item={item}
            actions={actionsFor(item)}
            onSelect={onSelect}
            isDisabled={disableActions}
          />
        </View>
      )}
      ListFooterComponent={<View className="mt-3 gap-4">{footer}</View>}
    />
  );
}
