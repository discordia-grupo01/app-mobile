import { type UserListItem } from "@discordia/client-shared";

import { Text, View } from "react-native";

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
      <View className="items-center gap-2 rounded-xl bg-surface-raised px-4 py-8">
        <BanIcon size={28} color={colors.textMuted} />
        <Text className="text-center text-sm text-content-muted">
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-2">
      {items.map((item) => (
        <UserRow
          key={item.userId}
          item={item}
          actions={actionsFor(item)}
          onSelect={onSelect}
          isDisabled={disableActions}
        />
      ))}
    </View>
  );
}
