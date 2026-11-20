import { NO_ROLES_YET, type Role } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import {
  type GestureResponderHandlers,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Button } from "../../../../components/ui/Button";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { FormErrorBanner } from "../../../../components/ui/FormErrorBanner";
import { LoadingSpinner } from "../../../../components/ui/LoadingSpinner";
import { SettingsGroup } from "../../../../components/ui/SettingsGroup";
import { useThemeColors } from "../../../../theme/theme-context";

import { DraggableRoleList } from "./DraggableRoleList";
import { RoleListRow } from "./RoleListRow";

interface RoleListStepProps {
  isLoading: boolean;
  loadError: string;
  sortedRoles: Role[];
  draggableRoles: Role[];
  everyoneRole: Role | undefined;
  defaultRoleId: string | null;
  memberCounts: Record<string, number>;
  canManageRole: (position: number) => boolean;
  isRoleDragActive: boolean;
  onDragActiveChange: (active: boolean) => void;
  onReorder: (orderedIds: string[]) => void;
  onCreateRole: () => void;
  onSelectRole: (role: Role) => void;
}

export function RoleListStep({
  isLoading,
  loadError,
  sortedRoles,
  draggableRoles,
  everyoneRole,
  defaultRoleId,
  memberCounts,
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
  const showGripColumn = manageableRoles.length > 1;
  const lastDraggableId = draggableRoles.at(-1)?.id;

  function handleManageableReorder(orderedManageableIds: string[]) {
    onReorder([
      ...protectedRoles.map((role) => role.id),
      ...orderedManageableIds,
    ]);
  }

  function renderRole(role: Role, panHandlers: GestureResponderHandlers) {
    return (
      <RoleListRow
        role={role}
        memberCount={memberCounts[role.id]}
        isDefault={role.id === defaultRoleId}
        showGripColumn={showGripColumn}
        canDrag={showGripColumn && canManageRole(role.position)}
        panHandlers={panHandlers}
        isLast={role.is_everyone || role.id === lastDraggableId}
        onSelect={() => onSelectRole(role)}
      />
    );
  }

  function renderList() {
    if (isLoading) return <LoadingSpinner />;
    if (loadError) return <FormErrorBanner message={loadError} />;
    if (sortedRoles.length === 0) {
      return <EmptyState icon="shield" text={NO_ROLES_YET} />;
    }
    return (
      <View>
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
          <View className="mt-2 border-t border-line-strong pt-2">
            {renderRole(everyoneRole, {})}
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <ScrollView
      className="shrink"
      contentContainerClassName="gap-5 px-4.5 pt-5 pb-8"
      showsVerticalScrollIndicator={false}
      scrollEnabled={!isRoleDragActive}
    >
      <Text className="text-[14px] leading-5 text-content-muted">
        {showGripColumn
          ? "Arrastrá un rol para cambiar su lugar en la jerarquía."
          : "Definí qué puede hacer cada miembro del servidor."}
      </Text>

      <SettingsGroup
        label="Roles del servidor"
        count={isLoading ? undefined : sortedRoles.length}
        aside={
          <Button
            title="Crear rol"
            size="sm"
            fullWidth={false}
            disabled={isLoading}
            iconLeft={<Feather name="plus" size={14} color={colors.onAccent} />}
            onPress={onCreateRole}
          />
        }
      >
        {renderList()}
      </SettingsGroup>
    </ScrollView>
  );
}
