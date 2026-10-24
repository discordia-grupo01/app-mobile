import {
  parsePending,
  type PendingMessage,
  serializePending,
  withChatPending,
} from "@discordia/client-shared";

import AsyncStorage from "@react-native-async-storage/async-storage";

const keyFor = (userId: string) => `discordia_pending_messages:${userId}`;

// AsyncStorage es asincrono: leer-modificar-escribir en paralelo pisaria datos,
// asi que todo pasa por una sola fila.
let queue: Promise<unknown> = Promise.resolve();
function inOrder<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task);
  queue = result.catch(() => undefined);
  return result;
}

async function readAll(userId: string) {
  try {
    return parsePending(await AsyncStorage.getItem(keyFor(userId)), Date.now());
  } catch {
    return {};
  }
}

/** Los mensajes sin enviar de un chat, ya sin los de mas de 24 h. */
export function loadPendingMessages(
  userId: string,
  chatKey: string,
): Promise<PendingMessage[]> {
  return inOrder(async () => (await readAll(userId))[chatKey] ?? []);
}

export function savePendingMessages(
  userId: string,
  chatKey: string,
  entries: readonly PendingMessage[],
): Promise<void> {
  return inOrder(async () => {
    try {
      await AsyncStorage.setItem(
        keyFor(userId),
        serializePending(
          withChatPending(await readAll(userId), chatKey, entries),
        ),
      );
    } catch {
      // Sin storage solo se pierde la recuperacion tras cerrar la app.
    }
  });
}

export function clearPendingMessages(userId: string): Promise<void> {
  return inOrder(async () => {
    try {
      await AsyncStorage.removeItem(keyFor(userId));
    } catch {
      // Nada que limpiar.
    }
  });
}
