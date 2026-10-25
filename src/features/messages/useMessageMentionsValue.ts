import {
  authorFromMember,
  buildMentionResolver,
  type MentionSources,
  type Member,
  type MessageAuthor,
  resolveImageUrl,
  type Role,
} from "@discordia/client-shared";
import { useMemo } from "react";

import { env } from "../../lib/env";
import type { MessageMentionsValue } from "./components/MentionsContext";

interface MentionsInput {
  members: Member[] | null;
  authors: Record<string, MessageAuthor>;
  serverRoles: Role[];
  canMentionEveryone: boolean;
  currentUserId: string | null;
  myRoleIds: readonly string[];
}

/** Lo que `MessageMentionsProvider` necesita para un chat de servidor. */
export function useMessageMentionsValue({
  members,
  authors,
  serverRoles,
  canMentionEveryone,
  currentUserId,
  myRoleIds,
}: MentionsInput): MessageMentionsValue {
  return useMemo<MessageMentionsValue>(() => {
    const sources: MentionSources = {
      members: (members ?? []).map((member) =>
        authorFromMember(
          member,
          resolveImageUrl(member.profile?.avatar_url, env.apiUrl),
          serverRoles,
        ),
      ),
      roles: serverRoles,
      canMentionEveryone,
    };
    return {
      resolveMention: buildMentionResolver(authors, serverRoles),
      sources,
      me: { userId: currentUserId, roleIds: myRoleIds },
    };
  }, [
    authors,
    members,
    serverRoles,
    canMentionEveryone,
    currentUserId,
    myRoleIds,
  ]);
}
