import { useEffect, useState } from "react";
import { Animated, Easing, Pressable, View } from "react-native";

interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** El interruptor no tiene texto propio: esto es lo que lee un lector de pantalla. */
  label: string;
  disabled?: boolean;
}

/** Lo que recorre el circulo: el ancho del interruptor (44) menos el circulo (20) y los bordes (2 + 2). */
const KNOB_TRAVEL = 20;
const DURATION_MS = 150;

/** El mismo interruptor que web; el `Switch` nativo cambia de forma y color entre iOS y Android. */
export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  const [progress] = useState(() => new Animated.Value(checked ? 1 : 0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: checked ? 1 : 0,
      duration: DURATION_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [checked, progress]);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      hitSlop={8}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <View className="h-6 w-11 justify-center overflow-hidden rounded-full bg-line-strong p-0.5">
        {/* El acento aparece encima en vez de interpolar colores: asi anima en
            el hilo nativo y los colores siguen saliendo de los tokens. */}
        <Animated.View
          className="absolute inset-0 rounded-full bg-accent"
          style={{ opacity: progress }}
        />
        <Animated.View
          className="h-5 w-5 rounded-full bg-white"
          style={{
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, KNOB_TRAVEL],
                }),
              },
            ],
          }}
        />
      </View>
    </Pressable>
  );
}
