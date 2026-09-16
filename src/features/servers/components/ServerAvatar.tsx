import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { colors } from "../../../theme/colors";

interface ServerAvatarProps {
  name: string;
  uri?: string | null;
  authToken?: string | null;
  size?: number;
  borderRadius?: number;
}

const ICON_CACHE_DIR = `${FileSystem.cacheDirectory}server-icons/`;

function safeFileName(uri: string): string {
  return uri.replace(/[^a-zA-Z0-9]/g, "_");
}

function useResolvedIconUri(
  uri: string | null | undefined,
  authToken: string | null | undefined,
) {
  const [resolvedUri, setResolvedUri] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [lastKey, setLastKey] = useState<string>(`${uri}::${authToken}`);

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
