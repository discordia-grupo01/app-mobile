import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Switch } from "../../../../components/ui/Switch";
import { cn } from "../../../../lib/cn";
import { withAlpha } from "../../../../lib/color";
import { useThemeColors } from "../../../../theme/theme-context";

interface DefaultRoleCardProps {
  isDefault: boolean;
  disabled: boolean;
  onSetDefault: () => void;
}

/** Con la misma estrella que marca al rol por defecto en la lista y el encabezado. */
export function DefaultRoleCard({
  isDefault,
  disabled,
  onSetDefault,
}: DefaultRoleCardProps) {
  const colors = useThemeColors();

  return (
    <View
      className={cn(
        "flex-row items-center gap-4 rounded-2xl border px-4 py-3.5",
        !isDefault && "border-line bg-surface-raised",
      )}
      style={
        isDefault
          ? {
              borderColor: withAlpha(colors.highlight, 0.3),
              backgroundColor: withAlpha(colors.highlight, 0.07),
            }
          : undefined
      }
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: withAlpha(colors.highlight, 0.15) }}
      >
        <MaterialCommunityIcons
          name={isDefault ? "star" : "star-outline"}
          size={18}
          color={colors.highlight}
        />
      </View>
      <View className="flex-1">
        <Text className="text-[14px] font-medium text-content">
          Rol por defecto
        </Text>
        <Text className="mt-0.5 text-[12px] leading-[18px] text-content-subtle">
          {isDefault
            ? "Se asigna automáticamente a los nuevos miembros. Para cambiarlo, definí otro rol como predeterminado."
            : "Se asigna automáticamente a los nuevos miembros."}
        </Text>
      </View>
      <Switch
        checked={isDefault}
        label="Rol por defecto"
        disabled={isDefault || disabled}
        onChange={(on) => {
          if (on) onSetDefault();
        }}
      />
    </View>
  );
}
