import {
  EMOJI_SLOTS_FULL_COPY,
  EMOJIS_EMPTY_NOTICE,
  EMOJIS_READ_ONLY_NOTICE,
  EMOJIS_SECTION_DESCRIPTION,
  EMOJI_UPLOAD_COPY,
  hasEmojiSlots,
  serverBoostCount,
  serverBoostLevel,
  type ServerEmoji,
  type ServerSummary,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { useThemeColors } from "../../../theme/theme-context";
import { useOwnPremium } from "../../billing/useOwnPremium";
import { listMembers } from "../../servers/api/members";
import { useServerEmojis } from "../useServerEmojis";
import { DeleteEmojiSheet } from "./DeleteEmojiSheet";
import { EmojiCapacityCard } from "./EmojiCapacityCard";
import { EmojiRow } from "./EmojiRow";
import { UploadEmojiSheet } from "./UploadEmojiSheet";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { EmptyState } from "../../../components/ui/EmptyState";
import { SettingsGroup } from "../../../components/ui/SettingsGroup";

interface ServerEmojisStepProps {
  server: ServerSummary;
  canManageServer: boolean;
}

export function ServerEmojisStep({
  server,
  canManageServer,
}: ServerEmojisStepProps) {
  const colors = useThemeColors();
  const isPremium = useOwnPremium();
  const { page, error, isLoading, addEmoji, removeEmoji } = useServerEmojis(
    server.id,
  );

  const [authorNames, setAuthorNames] = useState<Record<string, string> | null>(
    null,
  );
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [emojiToDelete, setEmojiToDelete] = useState<ServerEmoji | null>(null);

  useEffect(() => {
    let cancelled = false;
    listMembers(server.id, { limit: 100 }).then((result) => {
      if (cancelled || !result.ok) return;
      const map: Record<string, string> = {};
      for (const m of result.members) {
        if (m.profile?.name) {
          map[m.user_id] = m.profile.name;
        }
      }
      setAuthorNames(map);
    });
    return () => {
      cancelled = true;
    };
  }, [server.id]);

  const level = serverBoostLevel(server);
  const boostCount = serverBoostCount(server);
  const emojis = page?.emojis ?? [];
  const maxEmojis = page?.max_emojis ?? 50;
  const hasSlots = page ? hasEmojiSlots(page) : true;

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="p-4.5 gap-4"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-[14px] leading-5 text-content-muted">
        {EMOJIS_SECTION_DESCRIPTION}
      </Text>

      {error ? <FormErrorBanner message={error} /> : null}

      <EmojiCapacityCard
        serverName={server.name}
        used={emojis.length}
        max={maxEmojis}
        level={level}
        boostCount={boostCount}
      />

      {/* Banner sin cupos */}
      {!hasSlots && canManageServer ? (
        <View className="flex-row items-start gap-3 rounded-xl border border-boost-warn-line bg-boost-warn-soft p-3.5">
          <Feather
            name="alert-triangle"
            size={18}
            color={colors.warning}
            style={{ marginTop: 2 }}
          />
          <View className="flex-1">
            <Text className="text-[13px] font-bold text-content">
              {EMOJI_SLOTS_FULL_COPY.title}
            </Text>
            <Text className="mt-0.5 text-[12px] leading-4 text-content-muted">
              {EMOJI_SLOTS_FULL_COPY.detail}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Banner miembro sin permiso */}
      {!canManageServer ? (
        <View className="flex-row items-start gap-3 rounded-xl border border-line bg-surface-input p-3.5">
          <Feather
            name="info"
            size={18}
            color={colors.info}
            style={{ marginTop: 2 }}
          />
          <Text className="flex-1 text-[13px] leading-5 text-content-muted">
            {EMOJIS_READ_ONLY_NOTICE}
          </Text>
        </View>
      ) : null}

      {/* Botón de subida si tiene permiso */}
      {canManageServer ? (
        <Button
          title={EMOJI_UPLOAD_COPY.submit}
          iconLeft={<Feather name="plus" size={18} color="#fff" />}
          disabled={!hasSlots}
          onPress={() => setIsUploadOpen(true)}
          fullWidth
        />
      ) : null}

      <SettingsGroup label="Emojis del servidor" count={emojis.length}>
        {isLoading && !page ? (
          <LoadingSpinner />
        ) : emojis.length === 0 ? (
          <EmptyState icon="smile" text={EMOJIS_EMPTY_NOTICE} />
        ) : (
          <View className="overflow-hidden rounded-2xl border border-line bg-surface-raised">
            {emojis.map((emoji) => (
              <EmojiRow
                key={emoji.id}
                emoji={emoji}
                authorName={authorNames?.[emoji.created_by] ?? null}
                canManage={canManageServer}
                isPremium={isPremium}
                onDelete={setEmojiToDelete}
              />
            ))}
          </View>
        )}
      </SettingsGroup>

      <UploadEmojiSheet
        visible={isUploadOpen}
        serverId={server.id}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={addEmoji}
      />

      <DeleteEmojiSheet
        emoji={emojiToDelete}
        serverId={server.id}
        onClose={() => setEmojiToDelete(null)}
        onDeleted={removeEmoji}
      />
    </ScrollView>
  );
}
