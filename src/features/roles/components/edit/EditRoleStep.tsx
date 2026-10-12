import {
  MAX_NAME,
  ROLE_PERMISSIONS,
  type Role,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "../../../../components/ui/Button";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";

import { ColorGrid } from "../shared/ColorGrid";
import { FieldError } from "../shared/FieldError";
import { PermissionToggle } from "../shared/PermissionToggle";
import { RolePreviewBadge } from "../shared/RolePreviewBadge";

import { useRoleEditForm } from "./useRoleEditForm";

interface EditRoleStepProps {
  role: Role;
  roles: Role[] | null;
  serverId: string;
  canManage: boolean;
  isEveryoneSelected: boolean;
  isDefaultRole: boolean;
  memberCount: number;
  onSaved: (role: Role) => void;
  onDeleted: () => void;
  onDefaultChanged: (roleId: string) => void;
  onToast: (message: string) => void;
}

export function EditRoleStep({
  role,
  roles,
  serverId,
  canManage,
  isEveryoneSelected,
  isDefaultRole,
  memberCount,
  onSaved,
  onDeleted,
  onDefaultChanged,
  onToast,
}: EditRoleStepProps) {
  const colors = useThemeColors();

  const form = useRoleEditForm(role, {
    serverId,
    roles,
    canManage,
    isEveryoneSelected,
    onSaved,
    onDeleted,
    onDefaultChanged,
    onToast,
  });

  return (
    <View className="shrink">
      <ScrollView
        className="shrink"
        contentContainerClassName="p-5 gap-5.5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-3 -mt-1.5">
          <View
            className="w-8.5 h-8.5 rounded-[17px]"
            style={{ backgroundColor: role.color }}
          />
          <View className="flex-1">
            {isDefaultRole ? (
              <View className="flex-row items-center gap-1 mb-0.5">
                <Feather name="star" size={10} color={colors.highlight} />
                <Text className="text-[10px] font-bold tracking-[0.6px] uppercase text-highlight">
                  Rol por defecto
                </Text>
              </View>
            ) : null}
            <Text className="text-[12px] text-content-subtle">
              {isEveryoneSelected ? (
                "Todos los miembros"
              ) : (
                <>
                  {memberCount} {memberCount === 1 ? "miembro" : "miembros"}
                </>
              )}
            </Text>
          </View>
        </View>

        <View className="gap-0">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[11px] font-bold tracking-[1px] uppercase text-content-subtle">
              Nombre <Text className="text-danger">*</Text>
            </Text>
            <Text className="text-[11px] text-content-subtle">
              {form.editName.length}/{MAX_NAME}
            </Text>
          </View>
          <View
            className={cn(
              "flex-row items-center rounded-xl border bg-surface-input px-3.5 min-h-12",
              form.nameError ? "border-danger" : "border-line",
              isEveryoneSelected ? "opacity-70" : null,
            )}
          >
            <TextInput
              value={form.editName}
              onChangeText={form.handleEditName}
              maxLength={MAX_NAME + 10}
              editable={!isEveryoneSelected}
              className="flex-1 text-content text-[14px]"
            />
            <RolePreviewBadge name={form.editName} color={form.editColor} />
          </View>
          <FieldError message={form.nameError} />
          {isEveryoneSelected ? (
            <Text className="text-[12px] text-content-subtle mt-1.5">
              @everyone es automático: lo tiene todo el mundo y no se puede
              renombrar.
            </Text>
          ) : null}
        </View>

        <View className="gap-0">
          <Text
            className={cn(
              "text-[11px] font-bold tracking-[1px] uppercase text-content-subtle",
              "mb-2.5",
            )}
          >
            Color <Text className="text-danger">*</Text>
          </Text>
          {isEveryoneSelected ? (
            <View className="flex-row items-center gap-3 rounded-xl border border-line bg-surface-input px-3.5 py-3">
              <View
                className="w-8 h-8 rounded-lg border border-line"
                style={{ backgroundColor: role.color }}
              />
              <View className="flex-1">
                <Text className="text-[13px] font-medium text-content">
                  Color por defecto
                </Text>
                <Text className="text-[12px] text-content-subtle">
                  No se puede personalizar.
                </Text>
              </View>
            </View>
          ) : (
            <>
              <ColorGrid
                value={form.editColor}
                onChange={form.handleEditColor}
              />
              <FieldError message={form.colorError} />
            </>
          )}
        </View>

        <View className="gap-0">
          <Text
            className={cn(
              "text-[11px] font-bold tracking-[1px] uppercase text-content-subtle",
              "mb-2.5",
            )}
          >
            Permisos
          </Text>
          <View className="gap-2">
            {ROLE_PERMISSIONS.map((perm) => (
              <PermissionToggle
                key={perm}
                perm={perm}
                enabled={form.editPerms.includes(perm)}
                disabled={!canManage}
                onChange={(on) => form.handleTogglePerm(perm, on)}
              />
            ))}
          </View>
          {!canManage ? (
            <Text className="text-[12px] text-content-subtle mt-2">
              No tenés jerarquía suficiente para gestionar los permisos de este
              rol.
            </Text>
          ) : null}
        </View>

        {!isEveryoneSelected ? (
          <View className="rounded-[14px] border border-[rgba(224,82,82,0.2)] bg-[rgba(224,82,82,0.06)] p-3.5 gap-3">
            <Text className="text-[10px] font-bold tracking-[1px] uppercase text-danger">
              Zona peligrosa
            </Text>
            {!canManage ? (
              <Text className="text-[12px] text-content-subtle">
                No tenés jerarquía suficiente para gestionar este rol.
              </Text>
            ) : null}

            {!isDefaultRole ? (
              <View className="flex-row items-center gap-2.5">
                <View className="flex-1">
                  <Text className="text-[13px] font-semibold text-content">
                    Definir como rol por defecto
                  </Text>
                  <Text className="text-[12px] text-content-subtle mt-[1px]">
                    Se asigna automáticamente a los nuevos miembros.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={form.handleSetDefault}
                  disabled={form.settingDefault || !canManage}
                  className={cn(
                    "flex-row items-center gap-1.5 rounded-[10px] border border-[rgba(252,227,164,0.3)] bg-[rgba(252,227,164,0.12)] px-3 py-[9px]",
                    !canManage && "opacity-50",
                  )}
                >
                  <Feather name="star" size={11} color={colors.highlight} />
                  <Text className="text-[12px] font-bold text-highlight">
                    {form.settingDefault ? "Definiendo..." : "Definir"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row items-start gap-2">
                <Feather name="star" size={11} color={colors.textSubtle} />
                <Text className="flex-1 text-[12px] leading-[17px] text-content-subtle">
                  Este es el rol por defecto. Para eliminarlo, primero definí
                  otro rol como predeterminado.
                </Text>
              </View>
            )}

            {!form.deleteConfirm ? (
              <TouchableOpacity
                onPress={form.requestDelete}
                disabled={!canManage}
                className={cn(
                  "flex-row items-center justify-center gap-1.5 self-start rounded-[10px] border border-[rgba(224,82,82,0.25)] bg-[rgba(224,82,82,0.1)] px-3 py-[9px]",
                  !canManage && "opacity-50",
                )}
              >
                <Feather name="trash-2" size={12} color={colors.danger} />
                <Text className="text-[12px] font-bold text-danger">
                  Eliminar rol
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="gap-2">
                <Text className="text-[13px] font-semibold text-danger">
                  ¿Confirmar eliminación de &quot;{role.name}
                  &quot;?
                </Text>
                {form.deleteError ? (
                  <View className="flex-row items-start gap-2 rounded-[10px] border border-[rgba(224,82,82,0.2)] bg-[rgba(224,82,82,0.1)] px-2.5 py-2">
                    <Feather
                      name="alert-circle"
                      size={13}
                      color={colors.danger}
                    />
                    <Text className="flex-1 text-[12px] text-danger">
                      {form.deleteError}
                    </Text>
                  </View>
                ) : null}
                <View className="flex-row gap-2.5">
                  <Button
                    title="Cancelar"
                    variant="secondary"
                    onPress={form.cancelDelete}
                    style={{ flex: 1, width: undefined }}
                  />
                  <Button
                    title="Eliminar"
                    variant="danger"
                    onPress={form.handleDelete}
                    isLoading={form.deleting}
                    disabled={!canManage}
                    style={{ flex: 1, width: undefined }}
                  />
                </View>
              </View>
            )}
          </View>
        ) : null}

        {form.savedOk ? (
          <View className="flex-row items-center gap-2 rounded-xl border border-[rgba(56,161,105,0.3)] bg-[rgba(56,161,105,0.12)] px-3.5 py-[11px]">
            <Feather name="check" size={14} color={colors.success} />
            <Text className="text-[13px] text-success">Cambios guardados.</Text>
          </View>
        ) : null}
      </ScrollView>

      <View className="flex-row gap-3 p-4 border-t border-t-line">
        <Button
          title="Descartar"
          variant="secondary"
          onPress={form.handleDiscard}
          disabled={!form.isDirty}
          style={{ flex: 1, width: undefined }}
        />
        <Button
          title="Guardar cambios"
          onPress={form.requestSave}
          disabled={!form.isDirty}
          isLoading={form.saving}
          style={{ flex: 1, width: undefined }}
        />
      </View>
    </View>
  );
}
