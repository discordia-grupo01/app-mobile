import {
  ROLE_PERMISSIONS,
  type RolePermission,
} from "@discordia/client-shared";

import { ScrollView, Text, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { cn } from "../../../../lib/cn";

import { PermissionToggle } from "../shared/PermissionToggle";
import { RolePreviewBadge } from "../shared/RolePreviewBadge";

interface CreateRolePermissionsStepProps {
  newName: string;
  newColor: string;
  newPerms: RolePermission[];
  creating: boolean;
  onTogglePerm: (perm: RolePermission, on: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
}

/** Sub-paso 2 del wizard de creacion: permisos. */
export function CreateRolePermissionsStep({
  newName,
  newColor,
  newPerms,
  creating,
  onTogglePerm,
  onBack,
  onSubmit,
}: CreateRolePermissionsStepProps) {
  return (
    <View className="shrink">
      <ScrollView
        className="shrink"
        contentContainerClassName="p-5 gap-5.5"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-2.5 -mt-1.5">
          <RolePreviewBadge name={newName} color={newColor} />
        </View>
        <Text className="text-[12px] text-content-subtle leading-[17px] -mt-3">
          Arranca con los mismos permisos que @everyone. Podés ajustarlos acá o
          después desde &quot;Editar rol&quot;.
        </Text>

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
                enabled={newPerms.includes(perm)}
                onChange={(on) => onTogglePerm(perm, on)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="flex-row gap-3 p-4 border-t border-t-line">
        <Button
          title="Atrás"
          variant="secondary"
          onPress={onBack}
          style={{ flex: 1, width: undefined }}
        />
        <Button
          title="Crear rol"
          onPress={onSubmit}
          isLoading={creating}
          style={{ flex: 1, width: undefined }}
        />
      </View>
    </View>
  );
}
