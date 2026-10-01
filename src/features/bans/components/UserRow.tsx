import { displayNameOf, type UserListItem } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { avatarUriOf } from "../../../lib/userProfile";
import { useThemeColors } from "../../../theme/theme-context";
import { ServerAvatar } from "../../servers/components/ServerAvatar";
import { RowActionButton, type UserRowAction } from "./RowActionButton";

interface UserRowProps {
  item: UserListItem;
  actions: UserRowAction[];
  /** Si esta, tocar el avatar o el nombre abre el perfil. */
  onSelect?: (item: UserListItem) => void;
  /** Bloquea los botones mientras otra accion de la lista esta en curso. */
  isDisabled?: boolean;
}

/**
 * Un usuario de la lista. El layout es fijo: avatar y nombre ocupan lo que
 * sobra (el nombre se corta con "…") y las acciones a la derecha no se
 * achican ni pasan a otro renglon, sin importar el ancho ni el tamaño de letra.
 */
export function UserRow({
  item,
  actions,
  onSelect,
  isDisabled = false,
}: UserRowProps) {
  const colors = useThemeColors();
  const name = displayNameOf(item.profile);

  return (
    <View className="flex-row items-center gap-2 rounded-xl border border-line bg-surface-raised p-3">
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={!onSelect}
        onPress={() => onSelect?.(item)}
        accessibilityRole={onSelect ? "button" : undefined}
        accessibilityLabel={onSelect ? `Ver perfil de ${name}` : undefined}
        className="min-w-0 flex-1 flex-row items-center gap-3"
      >
        <ServerAvatar name={name} uri={avatarUriOf(item.profile)} size={40} />
        <View className="min-w-0 flex-1">
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
        {onSelect ? (
          <Feather name="chevron-right" size={16} color={colors.textSubtle} />
        ) : null}
      </TouchableOpacity>

      <View className="shrink-0 flex-row gap-2">
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
