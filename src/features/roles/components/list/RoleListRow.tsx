import { type Role, roleMembersCount } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import {
  type GestureResponderHandlers,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";

const GRIP_DOT_POSITIONS = [
  { x: 8 / 24, y: 6 / 24 },
  { x: 16 / 24, y: 6 / 24 },
  { x: 8 / 24, y: 12 / 24 },
  { x: 16 / 24, y: 12 / 24 },
  { x: 8 / 24, y: 18 / 24 },
  { x: 16 / 24, y: 18 / 24 },
];

function GripIcon({ color, opacity }: { color: string; opacity: number }) {
  const size = 14;
  const dotSize = size * (3 / 24);
  return (
    <View style={{ width: size, height: size, opacity }}>
      {GRIP_DOT_POSITIONS.map((position, index) => (
        <View
          key={index}
          style={{
            position: "absolute",
            left: position.x * size - dotSize / 2,
            top: position.y * size - dotSize / 2,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}

interface RoleListRowProps {
  role: Role;
  memberCount: number | undefined;
  isDefault: boolean;
  /** Las filas sin agarre igual dejan su columna, para que los nombres queden alineados. */
  showGripColumn: boolean;
  canDrag: boolean;
  panHandlers: GestureResponderHandlers;
  isLast: boolean;
  onSelect: () => void;
}

export function RoleListRow({
  role,
  memberCount,
  isDefault,
  showGripColumn,
  canDrag,
  panHandlers,
  isLast,
  onSelect,
}: RoleListRowProps) {
  const colors = useThemeColors();

  return (
    <View
      className={cn(
        "flex-row items-center gap-1",
        !isLast && "border-b border-line",
      )}
      {...(canDrag ? panHandlers : {})}
    >
      {showGripColumn ? (
        <View
          className="items-center justify-center py-3"
          style={{ width: 24 }}
          onStartShouldSetResponder={() => true}
          accessibilityLabel={canDrag ? `Mover ${role.name}` : undefined}
        >
          {canDrag ? <GripIcon color={colors.textSubtle} opacity={1} /> : null}
        </View>
      ) : null}
      <TouchableOpacity
        activeOpacity={0.75}
        className="flex-1 flex-row items-center gap-3 rounded-xl px-3 py-3"
        onPress={onSelect}
      >
        <View
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: role.color }}
        />
        <Text
          className="flex-1 text-[14px] font-semibold text-content"
          numberOfLines={1}
        >
          {role.name}
        </Text>
        {isDefault ? (
          <Feather
            name="star"
            size={13}
            color={colors.highlight}
            accessibilityLabel="Rol por defecto"
          />
        ) : null}
        {role.is_everyone ? (
          <Text className="text-[12px] text-content-subtle">
            Todos los miembros
          </Text>
        ) : (
          <>
            <View
              className="flex-row items-center gap-1"
              accessibilityLabel={
                memberCount !== undefined
                  ? roleMembersCount(memberCount)
                  : undefined
              }
            >
              <Feather name="users" size={13} color={colors.textSubtle} />
              <Text className="text-[12px] text-content-subtle">
                {memberCount ?? "–"}
              </Text>
            </View>
            <Text
              className="w-7 text-right font-mono text-[12px] text-content-subtle"
              accessibilityLabel="Posición en la jerarquía"
            >
              #{role.position}
            </Text>
          </>
        )}
        <Feather name="chevron-right" size={16} color={colors.textSubtle} />
      </TouchableOpacity>
    </View>
  );
}
