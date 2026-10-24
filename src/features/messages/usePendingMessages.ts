import {
  createSendQueue,
  type Message,
  type SendQueue,
  validateMessageContent,
  withPendingMessages,
} from "@discordia/client-shared";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  loadPendingMessages,
  savePendingMessages,
} from "../../lib/pending-messages";

import type { SendMessageResult } from "./use-channel-messages";

/** Id solo para este mensaje: React Native no trae `crypto.randomUUID`. */
function newClientId(): string {
  const part = () => Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}-${part()}${part()}`;
}

interface UsePendingMessagesOptions {
  /** El chat abierto (canal o conversacion): cada chat tiene su propia cola. */
  chatKey: string;
  /** Id que llevan los mensajes de este chat (el del canal o el de la conversacion). */
  channelId: string;
  currentUserId: string | null;
  /** El chat puede mandar ahora; si no, los mensajes esperan en cola. */
  isReady: boolean;
  /** El envio real (`sendMessage` del canal, o `send_dm` en un DM). */
  send: (
    content: string,
    attachmentIds?: readonly string[],
    clientId?: string,
  ) => Promise<SendMessageResult>;
}

const NO_ENTRIES: readonly never[] = [];
const NOT_CONFIGURED_SEND = () =>
  Promise.resolve<SendMessageResult>({ ok: false, message: "" });
const noSubscribe = () => () => {};

/**
 * Envio de solo texto sin esperar: el texto sale del cuadro al instante y el
 * mensaje se ve en el chat enseguida, igual que uno enviado; si se demora se atenua con "Enviando…".
 * Si falla se reintenta solo (3 intentos); sin conexion espera en cola y sale al
 * volver; si no hay caso, queda marcado con Reintentar / Eliminar. Lo que no se
 * envio se recuerda en el dispositivo 24 h (ver `lib/pending-messages`).
 *
 * Con adjuntos se envia como siempre: el cuadro espera la respuesta.
 */
export function usePendingMessages({
  chatKey,
  channelId,
  currentUserId,
  isReady,
  send,
}: UsePendingMessagesOptions) {
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  });

  const scope = currentUserId ? `${currentUserId}:${chatKey}` : null;
  const build = useCallback((): SendQueue | null => {
    if (!currentUserId) return null;
    return createSendQueue({
      send: NOT_CONFIGURED_SEND,
      isReady: () => false,
      newId: newClientId,
      onPersist: (entries) =>
        void savePendingMessages(currentUserId, chatKey, entries),
    });
  }, [currentUserId, chatKey]);

  const [held, setHeld] = useState(() => ({ scope, queue: build() }));
  if (held.scope !== scope) setHeld({ scope, queue: build() });
  const queue = held.scope === scope ? held.queue : null;

  useEffect(() => {
    if (!queue || !currentUserId) return;
    let cancelled = false;
    void loadPendingMessages(currentUserId, chatKey).then((restored) => {
      if (!cancelled) queue.restore(restored);
    });
    return () => {
      cancelled = true;
    };
  }, [queue, currentUserId, chatKey]);

  useEffect(() => {
    queue?.configure({
      send: (content, clientId) => send(content, [], clientId),
      isReady: () => isReady,
    });
  }, [queue, send, isReady]);

  useEffect(() => {
    if (!queue) return;
    queue.start();
    return () => queue.stop();
  }, [queue]);

  useEffect(() => {
    if (isReady) queue?.notifyReady();
  }, [isReady, queue]);

  const subscribe = useCallback(
    (listener: () => void) => queue?.subscribe(listener) ?? noSubscribe(),
    [queue],
  );
  const entries = useSyncExternalStore(
    subscribe,
    () => queue?.getEntries() ?? NO_ENTRIES,
    () => NO_ENTRIES,
  );

  const onSend = useCallback(
    (content: string, attachmentIds: readonly string[] = []) => {
      if (attachmentIds.length > 0 || !queue) {
        return sendRef.current(content, attachmentIds);
      }
      const invalid = validateMessageContent(content);
      if (invalid) {
        return Promise.resolve<SendMessageResult>({
          ok: false,
          message: invalid,
        });
      }
      queue.enqueue(content);
      return undefined;
    },
    [queue],
  );

  const withPending = useMemo(
    () =>
      (messages: Message[]): Message[] =>
        currentUserId
          ? withPendingMessages(messages, entries, currentUserId, channelId)
          : messages,
    [entries, channelId, currentUserId],
  );

  const reconcile = useCallback(
    (messages: readonly Message[]) =>
      queue?.prune(
        new Set(messages.flatMap((m) => (m.client_id ? [m.client_id] : []))),
      ),
    [queue],
  );
  const retry = useCallback(
    (clientId: string) => queue?.retry(clientId),
    [queue],
  );
  const discard = useCallback(
    (clientId: string) => queue?.discard(clientId),
    [queue],
  );

  return { onSend, withPending, reconcile, retry, discard };
}
