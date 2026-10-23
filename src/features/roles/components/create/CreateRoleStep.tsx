import { MAX_NAME } from "@discordia/client-shared";

import { ScrollView, Text, TextInput, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";

import { ColorGrid } from "../shared/ColorGrid";
import { FieldError } from "../../../../components/ui/FieldError";
import { RolePreviewBadge } from "../shared/RolePreviewBadge";

interface CreateRoleStepProps {
  newName: string;
  newColor: string;
  newNameError: string;
  newColorError: string;
  onNameChange: (text: string) => void;
  onColorChange: (color: string) => void;
  onContinue: () => void;
  onCancel: () => void;
}

export function CreateRoleStep({
  newName,
  newColor,
  newNameError,
  newColorError,
  onNameChange,
  onColorChange,
  onContinue,
  onCancel,
}: CreateRoleStepProps) {
  const colors = useThemeColors();

  return (
    <View className="shrink">
      <ScrollView
        className="shrink"
        contentContainerClassName="p-5 gap-5.5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[12px] text-content-subtle leading-[17px] -mt-1.5">
          Elegí un nombre y un color para el rol. Los permisos se eligen en el
          siguiente paso.
        </Text>

        <View className="gap-0">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[11px] font-bold tracking-[1px] uppercase text-content-subtle">
              Nombre <Text className="text-danger">*</Text>
            </Text>
            <Text className="text-[11px] text-content-subtle">
              {newName.length}/{MAX_NAME}
            </Text>
          </View>
          <View
            className={cn(
              "flex-row items-center rounded-xl border bg-surface-input px-3.5 min-h-12",
              newNameError ? "border-danger" : "border-line",
            )}
          >
            <TextInput
              value={newName}
              onChangeText={onNameChange}
              placeholder="Nombre del rol"
              placeholderTextColor={colors.textSubtle}
              autoFocus
              maxLength={MAX_NAME + 10}
              className="flex-1 text-content text-[14px]"
            />
            <RolePreviewBadge name={newName} color={newColor} />
          </View>
          <FieldError message={newNameError} />
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
          <ColorGrid value={newColor} onChange={onColorChange} />
          <FieldError message={newColorError} />
        </View>
      </ScrollView>

      <View className="flex-row gap-3 p-4 border-t border-t-line">
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={onCancel}
          style={{ flex: 1, width: undefined }}
        />
        <Button
          title="Continuar"
          onPress={onContinue}
          style={{ flex: 1, width: undefined }}
        />
      </View>
    </View>
  );
}
