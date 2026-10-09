import type { MentionResolver, MentionSources } from "@discordia/client-shared";

import { createContext, useContext } from "react";

export interface MessageMentionsValue {
  resolveMention?: MentionResolver;
  sources: MentionSources | null;
  me: { userId: string | null; roleIds: readonly string[] };
}

const NO_MENTIONS: MessageMentionsValue = {
  sources: null,
  me: { userId: null, roleIds: [] },
};

const MessageMentionsContext = createContext<MessageMentionsValue>(NO_MENTIONS);

export const MessageMentionsProvider = MessageMentionsContext.Provider;

export function useMessageMentions(): MessageMentionsValue {
  return useContext(MessageMentionsContext);
}
