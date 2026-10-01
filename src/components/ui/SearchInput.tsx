import { Feather } from "@expo/vector-icons";
import { TextInput, TouchableOpacity, View } from "react-native";

import { cn } from "../../lib/cn";
import { useThemeColors } from "../../theme/theme-context";
import { useState } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Etiqueta para lectores de pantalla: el input no lleva label visible. */
  label: string;
  placeholder: string;
}

/** Campo de busqueda con lupa y boton para limpiar. */
export function SearchInput({
  value,
  onChange,
  label,
  placeholder,
}: SearchInputProps) {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      className={cn(
        "min-h-11 flex-row items-center gap-3 rounded-xl border bg-surface-input px-4",
        isFocused ? "border-accent" : "border-line",
      )}
    >
      <Feather name="search" size={15} color={colors.textSubtle} />
      {/* text-[14px] y no text-sm: text-sm agrega line-height, que en un
          TextInput desalinea el texto en iOS. */}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        accessibilityLabel={label}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="flex-1 py-2.5 text-[14px] text-content"
      />
      {value ? (
        <TouchableOpacity
          onPress={() => onChange("")}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Limpiar búsqueda"
        >
          <Feather name="x" size={14} color={colors.textSubtle} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
