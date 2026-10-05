import { NO_ROLES_YET, type Role } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  type GestureResponderHandlers,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "../../../../components/ui/Button";
import { useThemeColors } from "../../../../theme/theme-context";

import { DraggableRoleList } from "./DraggableRoleList";

interface RoleListStepProps {
  serverName: string;
  isLoading: boolean;
  loadError: string;
  sortedRoles: Role[];
  draggableRoles: Role[];
  everyoneRole: Role | undefined;
  defaultRoleId: string | null;
  canManageRole: (position: number) => boolean;
  isRoleDragActive: boolean;
  onDragActiveChange: (active: boolean) => void;
  onReorder: (orderedIds: string[]) => void;
  onCreateRole: () => void;
  onSelectRole: (role: Role) => void;
}

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

export function RoleListStep({
  serverName,
  isLoading,
  loadError,
  sortedRoles,
  draggableRoles,
  everyoneRole,
  defaultRoleId,
  canManageRole,
  isRoleDragActive,
  onDragActiveChange,
  onReorder,
  onCreateRole,
  onSelectRole,
}: RoleListStepProps) {
  const colors = useThemeColors();

  const protectedRoles = draggableRoles.filter(
    (role) => !canManageRole(role.position),
  );
  const manageableRoles = draggableRoles.filter((role) =>
    canManageRole(role.position),
  );

  function handleManageableReorder(orderedManageableIds: string[]) {
    onReorder([
      ...protectedRoles.map((role) => role.id),
      ...orderedManageableIds,
    ]);
  }

  function renderRole(role: Role, panHandlers: GestureResponderHandlers) {
    const showGripColumn = !role.is_everyone && draggableRoles.length > 1;
    const canDrag = showGripColumn && canManageRole(role.position);
    const isDefault = role.id === defaultRoleId;

    return (
      <View
        className="mb-1 flex-row items-center gap-1 rounded-xl"
        {...(canDrag ? panHandlers : {})}
      >
        {showGripColumn ? (
          <View
            className="items-center justify-center py-3"
            style={{ width: 26 }}
            onStartShouldSetResponder={() => true}
          >
            <GripIcon color={colors.textSubtle} opacity={canDrag ? 1 : 0.35} />
          </View>
        ) : null}
        <TouchableOpacity
          activeOpacity={0.75}
          className="flex-1 flex-row items-center gap-2.5 rounded-xl px-2 py-3"
          onPress={() => onSelectRole(role)}
          accessibilityHint={
            role.is_everyone
              ? "@everyone lo tiene todo el mundo: siempre queda al final y no se puede reordenar"
              : undefined
          }
        >
          <View
            className="w-3 h-3 rounded-md"
            style={{ backgroundColor: role.color }}
          />
          <Text
            className="flex-1 text-[14px] font-semibold text-content"
            numberOfLines={1}
          >
            {role.name}
          </Text>
          {!role.is_everyone ? (
            <Text
              className="text-[10px] text-content-subtle"
              accessibilityLabel="Posición en la jerarquía"
            >
              #{role.position}
            </Text>
          ) : null}
          {isDefault ? (
            <Feather
              name="star"
              size={12}
              color={colors.highlight}
              style={{ marginRight: 2 }}
            />
          ) : null}
          <Feather name="chevron-right" size={16} color={colors.textSubtle} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="shrink">
      <View className="gap-2.5 px-4 pt-3.5 pb-1">
        <Text className="text-[12px] text-content-subtle" numberOfLines={1}>
          {serverName}
        </Text>
        <Button
          title="Crear rol"
          iconLeft={<Feather name="plus" size={13} color="#fff" />}
          onPress={onCreateRole}
        />
      </View>
      <ScrollView
        className="shrink"
        contentContainerClassName="px-3 pt-2.5 pb-5"
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isRoleDragActive}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={colors.accentBright}
            className="mt-6"
          />
        ) : loadError ? (
          <Text className="text-danger text-[13px] text-center mt-4">
            {loadError}
          </Text>
        ) : sortedRoles.length === 0 ? (
          <Text className="text-content-subtle text-[13px] mt-2">
            {NO_ROLES_YET}
          </Text>
        ) : (
          <>
            {protectedRoles.map((role) => (
              <View key={role.id}>{renderRole(role, {})}</View>
            ))}
            {manageableRoles.length > 1 ? (
              <DraggableRoleList
                roles={manageableRoles}
                onReorder={handleManageableReorder}
                onDragActiveChange={onDragActiveChange}
                renderRole={renderRole}
              />
            ) : (
              manageableRoles.map((role) => (
                <View key={role.id}>{renderRole(role, {})}</View>
              ))
            )}
            {everyoneRole ? (
              <View key={everyoneRole.id}>{renderRole(everyoneRole, {})}</View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
