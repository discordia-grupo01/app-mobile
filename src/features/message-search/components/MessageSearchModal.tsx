import {
  type Channel,
  displayNameOf,
  type Message,
  MESSAGE_SEARCH_ANY_AUTHOR,
  MESSAGE_SEARCH_AUTHOR_LABEL,
  MESSAGE_SEARCH_CLEAR_AUTHOR,
  MESSAGE_SEARCH_CLOSE,
  MESSAGE_SEARCH_LABEL,
  messageSearchPlaceholder,
  type MessageAuthor,
  messageSearchResultsCount,
  type Role,
  unknownAuthor,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { type ComponentRef, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Pagination } from "../../../components/ui/Pagination";
import { SearchInput } from "../../../components/ui/SearchInput";
import { useThemeColors } from "../../../theme/theme-context";
import { MessageMentionsProvider } from "../../messages/components/MentionsContext";
import { useMessageAuthors } from "../../messages/useMessageAuthors";
import { useMessageMentionsValue } from "../../messages/useMessageMentionsValue";
import { useServerMembers } from "../../servers/useServerMembers";
import type { MessageSearchForm } from "../useMessageSearchForm";
import { AuthorPickerSheet } from "./AuthorPickerSheet";
import { MessageSearchResult } from "./MessageSearchResult";
import {
  MessageSearchEmpty,
  MessageSearchError,
  MessageSearchHint,
  MessageSearchSkeleton,
} from "./MessageSearchStatus";
import { useModalInsets } from "../../platform-status/hooks/useModalInsets";

interface MessageSearchModalProps {
  visible: boolean;
  serverId: string;
  serverName: string;
  channels: Channel[];
  form: MessageSearchForm;
  currentAuthor: MessageAuthor | null;
  serverRoles: Role[];
  myRoleIds: string[];
  onOpenResult: (message: Message) => void;
  onClose: () => void;
}

/** Pantalla completa de busqueda: texto, autor, resultados y paginador. */
export function MessageSearchModal({
  visible,
  serverId,
  serverName,
  channels,
  form,
  currentAuthor,
  serverRoles,
  myRoleIds,
  onOpenResult,
  onClose,
}: MessageSearchModalProps) {
  const colors = useThemeColors();
  const insets = useModalInsets();
  const [isPickingAuthor, setIsPickingAuthor] = useState(false);
  const { draft, setDraft, authorId, setAuthorId, submit, validationError } =
    form;
  const { state, results, pageCount, isEmpty, goToPage, retry } = form.search;

  const members = useServerMembers(serverId);
  const authors = useMessageAuthors(
    members,
    results,
    currentAuthor,
    serverRoles,
  );
  const mentions = useMessageMentionsValue({
    members,
    authors,
    serverRoles,
    canMentionEveryone: false,
    currentUserId: currentAuthor?.id ?? null,
    myRoleIds,
  });
  const channelNames = useMemo(
    () => new Map(channels.map((channel) => [channel.id, channel.name])),
    [channels],
  );

  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const listRef = useRef<FlatList<Message>>(null);
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [state.page, state.searchId]);

  const selectedMember = members?.find((member) => member.user_id === authorId);
  const authorName = authorId
    ? selectedMember
      ? displayNameOf(selectedMember.profile)
      : (authors[authorId]?.name ?? MESSAGE_SEARCH_ANY_AUTHOR)
    : MESSAGE_SEARCH_ANY_AUTHOR;
  const term = state.query?.text ?? "";
  const showPagination =
    state.query !== null && !isEmpty && pageCount > 1 && state.pages.length > 0;

  let status = null;
  if (state.status === "idle") status = <MessageSearchHint />;
  else if (state.status === "loading") status = <MessageSearchSkeleton />;
  else if (state.status === "error") {
    status = <MessageSearchError message={state.error ?? ""} onRetry={retry} />;
  } else if (isEmpty) status = <MessageSearchEmpty />;

  // El foco espera al final de la animacion: si el teclado se abre mientras el
  // modal entra, la pantalla se reacomoda en cada cuadro y la entrada se traba.
  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onShow={() => {
        if (state.status === "idle") inputRef.current?.focus();
      }}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center gap-2 border-b border-b-line px-3 py-2">
          <TouchableOpacity
            onPress={onClose}
            className="h-9 w-9 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel={MESSAGE_SEARCH_CLOSE}
          >
            <Feather name="arrow-left" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          <View className="flex-1">
            <SearchInput
              value={draft}
              onChange={setDraft}
              onSubmit={submit}
              inputRef={inputRef}
              label={MESSAGE_SEARCH_LABEL}
              placeholder={messageSearchPlaceholder(serverName)}
            />
          </View>
        </View>

        <View className="flex-row items-center gap-2 px-4 pt-3">
          <Text className="text-[13px] font-semibold text-content-subtle">
            {MESSAGE_SEARCH_AUTHOR_LABEL}:
          </Text>
          <TouchableOpacity
            onPress={() => setIsPickingAuthor(true)}
            accessibilityRole="button"
            className="max-w-[60%] flex-row items-center gap-1 rounded-lg border border-line bg-surface-input px-2.5 py-1.5"
          >
            <Feather name="user" size={13} color={colors.accentBright} />
            <Text
              className="shrink text-[13px] font-semibold text-accent-strong"
              numberOfLines={1}
            >
              {authorName}
            </Text>
            <Feather
              name="chevron-down"
              size={13}
              color={colors.accentBright}
            />
          </TouchableOpacity>
          {authorId ? (
            <TouchableOpacity
              onPress={() => setAuthorId(null)}
              accessibilityRole="button"
              accessibilityLabel={MESSAGE_SEARCH_CLEAR_AUTHOR}
              className="h-8 w-8 items-center justify-center"
            >
              <Feather name="x" size={15} color={colors.textSubtle} />
            </TouchableOpacity>
          ) : null}
          {state.total !== null && !isEmpty ? (
            <Text className="ml-auto text-[12px] text-content-muted">
              {messageSearchResultsCount(state.total, state.totalCapped)}
            </Text>
          ) : null}
        </View>
        {validationError ? (
          <Text
            accessibilityRole="alert"
            className="px-4 pt-2 text-[12px] text-danger"
          >
            {validationError}
          </Text>
        ) : null}

        <MessageMentionsProvider value={mentions}>
          <FlatList
            ref={listRef}
            data={status ? [] : results}
            keyExtractor={(message) => message.id}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="gap-2 p-3"
            ListEmptyComponent={status ?? undefined}
            renderItem={({ item }) => (
              <MessageSearchResult
                message={item}
                author={authors[item.user_id] ?? unknownAuthor(item.user_id)}
                channelName={channelNames.get(item.channel_id) ?? "…"}
                term={term}
                onOpen={() => onOpenResult(item)}
              />
            )}
          />
        </MessageMentionsProvider>

        {showPagination ? (
          <View
            className="items-center border-t border-line px-3 pt-3"
            style={{ paddingBottom: insets.bottom + 12 }}
          >
            <Pagination
              page={state.status === "loading" ? state.targetPage : state.page}
              pageCount={pageCount}
              onPageChange={goToPage}
            />
          </View>
        ) : null}
      </View>

      <AuthorPickerSheet
        visible={isPickingAuthor}
        members={members}
        selectedId={authorId}
        onPick={setAuthorId}
        onClose={() => setIsPickingAuthor(false)}
      />
    </Modal>
  );
}
