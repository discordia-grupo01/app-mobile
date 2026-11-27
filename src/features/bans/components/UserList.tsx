import { type UserListItem } from "@discordia/client-shared";

import { View } from "react-native";

import {
  EMPTY_STATE_ICON_SIZE,
  EmptyState,
} from "../../../components/ui/EmptyState";
import { useThemeColors } from "../../../theme/theme-context";
import { BanIcon } from "./BanIcon";
import { type UserRowAction } from "./RowActionButton";
import { UserRow } from "./UserRow";

interface UserListProps {
  items: UserListItem[];
  emptyMessage: string;
  actionsFor: (item: UserListItem) => UserRowAction[];
  /** Tocar la fila (por ejemplo, para ver el perfil). */
  onSelect?: (item: UserListItem) => void;
  disableActions?: boolean;
}

/** Los usuarios de la pagina actual, o el estado vacio. */
export function UserList({
  items,
  emptyMessage,
  actionsFor,
  onSelect,
  disableActions = false,
}: UserListProps) {
  const colors = useThemeColors();

  if (items.length === 0) {
    return (
      <EmptyState
        media={
          <BanIcon size={EMPTY_STATE_ICON_SIZE} color={colors.textSubtle} />
        }
        text={emptyMessage}
      />
    );
  }

  return (
    <View className="overflow-hidden rounded-2xl border border-line bg-surface-raised">
      {items.map((item, index) => (
        <View
          key={item.userId}
          className={index > 0 ? "border-t border-line" : undefined}
        >
          <UserRow
            item={item}
            actions={actionsFor(item)}
            onSelect={onSelect}
            isDisabled={disableActions}
          />
        </View>
      ))}
    </View>
  );
}
