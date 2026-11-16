import {
  serverSuspendedLabel,
  UNREAD_MESSAGES_LABEL,
  type UnreadFlags,
} from "@discordia/client-shared";

export function railIconLabel(
  name: string,
  unread: UnreadFlags,
  isSuspended: boolean,
): string {
  if (isSuspended) return serverSuspendedLabel(name);
  if (unread.unread && unread.mentionCount === 0) {
    return `${name}, ${UNREAD_MESSAGES_LABEL.toLowerCase()}`;
  }
  return name;
}
