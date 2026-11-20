import {
  MODERATION_AUDIT_DESCRIPTION,
  MODERATION_AUDIT_EMPTY,
} from "@discordia/client-shared";
import { ScrollView, Text, View } from "react-native";

import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { PaginationFooter } from "../../../components/ui/PaginationFooter";
import { AuditEntryRow } from "./AuditEntryRow";
import { useModerationAudit } from "./useModerationAudit";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { EmptyState } from "../../../components/ui/EmptyState";

export function ModerationAuditStep({ serverId }: { serverId: string }) {
  const audit = useModerationAudit(serverId);

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4.5 pt-5 pb-8"
      >
        <Text className="text-[14px] leading-5 text-content-muted">
          {MODERATION_AUDIT_DESCRIPTION}
        </Text>

        <FormErrorBanner message={audit.loadError} />

        {audit.entries === null ? (
          <LoadingSpinner />
        ) : audit.entries.length === 0 && !audit.loadError ? (
          <EmptyState icon="file-text" text={MODERATION_AUDIT_EMPTY} />
        ) : (
          <View className="gap-3">
            {audit.entries.map((entry) => (
              <AuditEntryRow key={entry.id} entry={entry} />
            ))}
          </View>
        )}
      </ScrollView>

      {audit.pageCount > 1 ? (
        <PaginationFooter
          page={audit.page}
          pageCount={audit.pageCount}
          range={audit.range}
          total={audit.total}
          noun="acciones"
          onPageChange={audit.setPage}
        />
      ) : null}
    </>
  );
}
