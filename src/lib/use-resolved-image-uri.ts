import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";

function safeFileName(uri: string): string {
  return uri.replace(/[^a-zA-Z0-9]/g, "_");
}

export function useResolvedImageUri(
  uri: string | null | undefined,
  authToken: string | null | undefined,
  cacheDirName: string,
) {
  const cacheDir = `${FileSystem.cacheDirectory}${cacheDirName}/`;
  const [resolvedUri, setResolvedUri] = useState<string | null>(() =>
    uri && !authToken ? uri : null,
  );
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
        await FileSystem.makeDirectoryAsync(cacheDir, {
          intermediates: true,
        }).catch(() => {});

        const target = `${cacheDir}${safeFileName(uri as string)}`;

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
              `useResolvedImageUri(${cacheDirName}): fallo descargar`,
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
            console.warn(
              `useResolvedImageUri(${cacheDirName}): fallo descargar`,
              uri,
              err,
            );
          }
          setFailed(true);
        }
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [uri, authToken, cacheDir, cacheDirName]);

  return { resolvedUri, failed, markFailed: () => setFailed(true) };
}
