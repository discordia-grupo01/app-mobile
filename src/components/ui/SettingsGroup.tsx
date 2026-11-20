import { type ReactNode } from "react";
import { Text, View } from "react-native";

import { cn } from "../../lib/cn";

interface SettingsGroupProps {
  label: ReactNode;
  hint?: ReactNode;
  count?: number | string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Bloque de una seccion de configuracion: titulo, contador opcional y contenido. */
export function SettingsGroup({
  label,
  hint,
  count,
  aside,
  className,
  children,
}: SettingsGroupProps) {
  return (
    <View className={cn("gap-3", className)}>
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 shrink flex-row items-center gap-2">
          <SettingsGroupLabel>{label}</SettingsGroupLabel>
          {count !== undefined ? (
            <View className="rounded-full bg-surface-input px-2 py-0.5">
              <Text className="text-[11px] font-semibold text-content-muted">
                {count}
              </Text>
            </View>
          ) : null}
        </View>
        {aside}
      </View>
      {hint ? (
        <Text className="-mt-1 text-[12px] leading-[17px] text-content-subtle">
          {hint}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

/** El titulo de un grupo o campo, para filas que arman su propio encabezado. */
export function SettingsGroupLabel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Text
      className={cn("shrink text-[14px] font-semibold text-content", className)}
    >
      {children}
    </Text>
  );
}
