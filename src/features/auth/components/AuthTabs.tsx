import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../lib/cn";

export type AuthMode = "login" | "register";

interface AuthTabsProps {
  active: AuthMode;
  onChange: (mode: AuthMode) => void;
}

/** Selector "Iniciar Sesion / Crear Cuenta" que se muestra en ambas pantallas de auth. */
export function AuthTabs({ active, onChange }: AuthTabsProps) {
  return (
    <View className="mb-7 flex-row rounded-xl bg-surface-input-on-accent p-1">
      <TouchableOpacity
        className={cn(
          "flex-1 items-center rounded-[9px] py-2.5",
          active === "login" && "bg-accent",
        )}
        onPress={() => onChange("login")}
        activeOpacity={0.8}
      >
        <Text
          className={cn(
            "text-[13px] font-semibold",
            active === "login" ? "text-on-accent" : "text-on-accent-subtle",
          )}
        >
          Iniciar Sesión
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={cn(
          "flex-1 items-center rounded-[9px] py-2.5",
          active === "register" && "bg-accent",
        )}
        onPress={() => onChange("register")}
        activeOpacity={0.8}
      >
        <Text
          className={cn(
            "text-[13px] font-semibold",
            active === "register" ? "text-on-accent" : "text-on-accent-subtle",
          )}
        >
          Crear Cuenta
        </Text>
      </TouchableOpacity>
    </View>
  );
}
