import { type UserListItem } from "@discordia/client-shared";

import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { LoadMoreFooter } from "../../../components/ui/LoadMoreFooter";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { SettingsGroup } from "../../../components/ui/SettingsGroup";
import { type UserRowAction } from "./RowActionButton";
import { UserList } from "./UserList";

interface BansListSectionProps {
  label: string;
  count?: number;
  errorMessage: string;
  /** `null` hasta que llega la primera pagina. */
  items: UserListItem[] | null;
  emptyMessage: string;
  actionsFor: (item: UserListItem) => UserRowAction[];
  onSelect?: (item: UserListItem) => void;
  disableActions: boolean;
  noun: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export function BansListSection({
  label,
  count,
  errorMessage,
  items,
  emptyMessage,
  actionsFor,
  onSelect,
  disableActions,
  noun,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: BansListSectionProps) {
  return (
    <SettingsGroup label={label} count={count}>
      <FormErrorBanner message={errorMessage} />

      {items === null ? (
        <LoadingSpinner />
      ) : (
        <UserList
          items={items}
          emptyMessage={emptyMessage}
          actionsFor={actionsFor}
          onSelect={onSelect}
          disableActions={disableActions}
        />
      )}

      {items?.length ? (
        <LoadMoreFooter
          hasMore={hasMore}
          isLoading={isLoadingMore}
          onLoadMore={onLoadMore}
          noun={noun}
        />
      ) : null}
    </SettingsGroup>
  );
}
