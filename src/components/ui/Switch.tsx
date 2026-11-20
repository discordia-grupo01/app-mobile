import { Pressable, View } from "react-native";

import { cn } from "../../lib/cn";

interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** El interruptor no tiene texto propio: esto es lo que lee un lector de pantalla. */
  label: string;
  disabled?: boolean;
}

/** El mismo interruptor que web; el `Switch` nativo cambia de forma y color entre iOS y Android. */
export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      hitSlop={8}
      className={cn(
        "h-6 w-11 shrink-0 justify-center rounded-full p-0.5",
        checked ? "items-end bg-accent" : "items-start bg-content-subtle/40",
        disabled && "opacity-50",
      )}
    >
      <View className="h-5 w-5 rounded-full bg-white" />
    </Pressable>
  );
}
