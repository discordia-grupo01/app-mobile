import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";
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

const ICON_CACHE_DIR = `${FileSystem.cacheDirectory}server-icons/`;

/**
 * Nombre de archivo plano a partir de una uri, sin ningun separador de
 * carpeta posible. `encodeURIComponent` no alcanza: dentro del path de un
 * `file://`, Android vuelve a decodificar `%2F`/`%3A` como `/` y `:`, asi
 * que una uri "escapada" con `%2F` se termina interpretando igual como
 * subcarpetas anidadas que nunca existen (`downloadAsync` en Android no
 * las crea solo). Reemplazando cualquier caracter que no sea alfanumerico
 * evitamos que quede un solo separador de verdad en el nombre.
 */
function safeFileName(uri: string): string {
  return uri.replace(/[^a-zA-Z0-9]/g, "_");
}

/**
 * Resuelve `uri` a algo que `<Image>` pueda mostrar sin depender de headers
 * nativos.
 *
 * El componente `Image` de React Native NO reenvia `source.headers` de
 * forma confiable en Android (bug conocido de la plataforma, no de este
 * codigo): el pedido le llega al gateway sin el `Authorization`, Kong lo
 * rechaza con 401, y la imagen nunca carga -- pase lo que pase en el resto
 * del codigo. Por eso, cuando hace falta `authToken`, en vez de pasarle el
 * header a `Image` descargamos el archivo nosotros con
 * `expo-file-system` (que si respeta headers) a la cache local, y le
 * pasamos a `Image` ese archivo ya descargado. Sin `authToken` (uris
 * locales `file://...`/`content://...` recien elegidas del selector, o
 * cualquier uri publica) se usa tal cual, sin pasar por el filesystem.
 */
function useResolvedIconUri(
  uri: string | null | undefined,
  authToken: string | null | undefined,
) {
  const [resolvedUri, setResolvedUri] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [lastKey, setLastKey] = useState<string>(`${uri}::${authToken}`);

  // Cuando cambia `uri`/`authToken` hay que resetear `resolvedUri`/`failed`
  // antes de decidir si hace falta descargar algo. Ese reseteo va en el
  // cuerpo del render (patron "adjust state when a prop changes" de React)
  // en vez de en el useEffect, para cumplir con la regla de lint
  // react-hooks/set-state-in-effect; el useEffect de abajo se limita a la
  // descarga asincrona real.
  const key = `${uri}::${authToken}`;
  if (key !== lastKey) {
    setLastKey(key);
    setFailed(false);
    setResolvedUri(uri && !authToken ? uri : null);
  }

  useEffect(() => {
    let cancelled = false;

    if (!uri || !authToken) return;

    async function resolve() {
      try {
        await FileSystem.makeDirectoryAsync(ICON_CACHE_DIR, {
          intermediates: true,
        }).catch(() => {});

        const target = `${ICON_CACHE_DIR}${safeFileName(uri as string)}`;

        // Si ya la descargamos antes (otra pantalla, sesion anterior),
        // usamos la copia local sin volver a pedirla por red.
        const existing = await FileSystem.getInfoAsync(target);
        if (existing.exists) {
          if (!cancelled) setResolvedUri(target);
          return;
        }

        const result = await FileSystem.downloadAsync(uri as string, target, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (cancelled) return;

        if (result.status >= 200 && result.status < 300) {
          setResolvedUri(result.uri);
        } else {
          if (__DEV__) {
            console.warn(
              "ServerAvatar: fallo descargar",
              uri,
              "status",
              result.status,
            );
          }
          setFailed(true);
        }
      } catch (err) {
        if (!cancelled) {
          if (__DEV__) {
            console.warn("ServerAvatar: fallo descargar", uri, err);
          }
          setFailed(true);
        }
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [uri, authToken]);

  return { resolvedUri, failed, markFailed: () => setFailed(true) };
}

/**
 * Avatar de un servidor: siempre intenta cargar `uri` (el back sirve un
 * icono para todo servidor, propio o generado por default) y si la carga
 * falla -- 404, red, uri invalida -- cae a la inicial sobre fondo de acento
 * en vez de dejar un espacio roto.
 */
export function ServerAvatar({
  name,
  uri,
  authToken,
  size = 48,
  borderRadius,
}: ServerAvatarProps) {
  const radius = borderRadius ?? size / 2;
  const { resolvedUri, failed, markFailed } = useResolvedIconUri(
    uri,
    authToken,
  );

  if (resolvedUri && !failed) {
    return (
      <Image
        source={{ uri: resolvedUri }}
        onError={markFailed}
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
