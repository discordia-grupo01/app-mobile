import { Image, StyleSheet, Text, View } from "react-native";

import { colors } from "../../theme/colors";

interface ServerAvatarProps {
  name: string;
  /** URI de un icono real. Si es `null`/`undefined`, se muestra la inicial. */
  uri?: string | null;
  /**
   * Header `Authorization` para pedir `uri`, cuando apunta directo al
   * gateway (ej. `/v1/servers/:id/icon`, que exige JWT). No hace falta para
   * un `uri` local (`file://...`) recien elegido del selector de imagenes.
   */
  authToken?: string | null;
  size?: number;
  /** Radio del borde. Por defecto es un circulo perfecto (`size / 2`). */
  borderRadius?: number;
}

/** Avatar de un servidor: icono real si hay, o la inicial sobre fondo de acento. */
export function ServerAvatar({
  name,
  uri,
  authToken,
  size = 48,
  borderRadius,
}: ServerAvatarProps) {
  const radius = borderRadius ?? size / 2;

  if (uri) {
    return (
      <Image
        source={{
          uri,
          headers: authToken
            ? { Authorization: `Bearer ${authToken}` }
            : undefined,
        }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: radius },
        ]}
      />
    );
  }

  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: radius },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.bgCard,
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  initial: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
