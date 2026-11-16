import type { Message, MessageAuthor } from "@discordia/client-shared";

export type ReportTarget =
  | { kind: "message"; message: Message; author: MessageAuthor }
  | { kind: "user"; userId: string; name: string; avatarUri: string | null };
