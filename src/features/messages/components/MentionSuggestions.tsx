import {
  MENTION_EVERYONE_HINT,
  MENTION_ROLE_HINT,
  MENTION_SECTION_EVERYONE,
  MENTION_SECTION_MEMBERS,
  MENTION_SECTION_ROLES,
  type MentionCandidate,
  mentionMembersMatchTitle,
} from "@discordia/client-shared";

import { Fragment } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "../../../components/ui/Avatar";

interface MentionSuggestionsProps {
  query: string;
  candidates: readonly MentionCandidate[];
  onPick: (candidate: MentionCandidate) => void;
}

function sectionTitle(kind: MentionCandidate["kind"], query: string): string {
  if (kind === "role") return MENTION_SECTION_ROLES;
  if (kind === "everyone") return MENTION_SECTION_EVERYONE;
  return query ? mentionMembersMatchTitle(query) : MENTION_SECTION_MEMBERS;
}

export function MentionSuggestions({
  query,
  candidates,
  onPick,
}: MentionSuggestionsProps) {
  return (
    <ScrollView
      className="mb-2 max-h-60 rounded-xl border border-line bg-surface-raised"
      contentContainerClassName="p-1.5"
      keyboardShouldPersistTaps="always"
      accessibilityRole="menu"
    >
      {candidates.map((candidate, index) => (
        <Fragment
          key={`${candidate.kind}:${"id" in candidate ? candidate.id : "everyone"}`}
        >
          {index === 0 || candidates[index - 1].kind !== candidate.kind ? (
            <Text className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-content-subtle">
              {sectionTitle(candidate.kind, query)}
            </Text>
          ) : null}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onPick(candidate)}
            accessibilityRole="menuitem"
            className="flex-row items-center gap-3 rounded-lg px-2 py-2.5"
          >
            <CandidateRow candidate={candidate} />
          </TouchableOpacity>
        </Fragment>
      ))}
    </ScrollView>
  );
}

function CandidateRow({ candidate }: { candidate: MentionCandidate }) {
  if (candidate.kind === "user") {
    return (
      <>
        <Avatar name={candidate.name} uri={candidate.avatarUrl} size={30} />
        <Text className="flex-1 text-[15px] text-content" numberOfLines={1}>
          {candidate.name}
        </Text>
      </>
    );
  }

  const label = candidate.kind === "role" ? candidate.name : "everyone";
  const hint =
    candidate.kind === "role" ? MENTION_ROLE_HINT : MENTION_EVERYONE_HINT;
  return (
    <View className="flex-1">
      <Text
        className={
          candidate.kind === "everyone"
            ? "text-[15px] font-bold text-highlight"
            : "text-[15px] font-medium"
        }
        style={
          candidate.kind === "role" ? { color: candidate.color } : undefined
        }
        numberOfLines={1}
      >
        @{label}
      </Text>
      <Text className="text-[12px] text-content-subtle" numberOfLines={1}>
        {hint}
      </Text>
    </View>
  );
}
