import { displayNameOf, type UserListItem } from "@discordia/client-shared";

import { Text, View } from "react-native";

import { avatarUriOf } from "../../../lib/userProfile";
import { ServerAvatar } from "../../servers/components/ServerAvatar";
import { RowActionButton, type UserRowAction } from "./RowActionButton";

interface UserRowProps {
  item: UserListItem;
  actions: UserRowAction[];
  /** Bloquea los botones mientras otra accion de la lista esta en curso. */
  isDisabled?: boolean;
}

/** Un usuario de la lista: avatar, nombre, detalle y sus acciones (debajo si no entran al lado). */
export function UserRow({ item, actions, isDisabled = false }: UserRowProps) {
  const name = displayNameOf(item.profile);

  return (
    <View className="min-w-0 flex-row flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-raised p-3">
      <ServerAvatar name={name} uri={avatarUriOf(item.profile)} size={40} />
      <View className="min-w-[120px] flex-1">
        <Text
          numberOfLines={1}
          className="text-[15px] font-semibold text-content"
        >
          {name}
        </Text>
        {item.subtitle ? (
          <Text
            numberOfLines={2}
            className="text-xs leading-[17px] text-content-muted"
          >
            {item.subtitle}
          </Text>
        ) : null}
      </View>
      <View className="ml-auto flex-row gap-2">
        {actions.map((action) => (
          <RowActionButton
            key={action.label}
            action={action}
            isDisabled={isDisabled}
          />
        ))}
      </View>
    </View>
  );
}
