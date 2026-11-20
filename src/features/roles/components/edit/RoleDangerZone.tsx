import { type Role } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { ConfirmDialog } from "../../../../components/ui/ConfirmDialog";
import { Switch } from "../../../../components/ui/Switch";
import { useThemeColors } from "../../../../theme/theme-context";

import { type RoleEditForm } from "./useRoleEditForm";

interface RoleDangerZoneProps {
  role: Role;
  form: RoleEditForm;
  canManage: boolean;
  isDefaultRole: boolean;
}

/** "Rol por defecto" y "Eliminar rol", igual que en web. No se muestra para @everyone. */
export function RoleDangerZone({
  role,
  form,
  canManage,
  isDefaultRole,
}: RoleDangerZoneProps) {
  const colors = useThemeColors();

  return (
    <>
      <View className="flex-row items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4">
        <View className="flex-1">
          <Text className="text-[14px] font-medium text-content">
            Rol por defecto
          </Text>
          <Text className="mt-0.5 text-[12px] leading-[17px] text-content-subtle">
            {isDefaultRole
              ? "Se asigna automáticamente a los nuevos miembros. Para cambiarlo, definí otro rol como predeterminado."
              : "Se asigna automáticamente a los nuevos miembros."}
          </Text>
        </View>
        <Switch
          checked={isDefaultRole}
          label="Rol por defecto"
          disabled={isDefaultRole || form.settingDefault || !canManage}
          onChange={(on) => {
            if (on) void form.handleSetDefault();
          }}
        />
      </View>

      <View className="gap-3 rounded-2xl border border-danger/20 bg-danger/5 p-4">
        <Text className="text-[14px] font-semibold text-danger">
          Zona peligrosa
        </Text>
        <View>
          <Text className="text-[14px] font-medium text-content">
            Eliminar rol
          </Text>
          <Text className="mt-0.5 text-[12px] leading-[17px] text-content-subtle">
            {!canManage
              ? "No tenés jerarquía suficiente para gestionar este rol."
              : isDefaultRole
                ? "Para eliminar este rol, primero definí otro rol como predeterminado."
                : "Se les quita a todos los miembros que lo tienen. No se puede deshacer."}
          </Text>
        </View>
        <Button
          title="Eliminar rol"
          variant="danger"
          iconLeft={
            <Feather name="trash-2" size={14} color={colors.onAccent} />
          }
          disabled={!canManage || isDefaultRole}
          onPress={form.requestDelete}
        />
      </View>

      <ConfirmDialog
        visible={form.deleteConfirm}
        icon="trash-2"
        title={`¿Eliminar el rol "${role.name}"?`}
        body="Esta acción no se puede deshacer."
        confirmLabel="Eliminar rol"
        isLoading={form.deleting}
        error={form.deleteError}
        onConfirm={() => void form.handleDelete()}
        onCancel={form.cancelDelete}
      />
    </>
  );
}
