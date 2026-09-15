import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  generateInvite,
  inviteLinkText,
  listInvitations,
  revokeInvite,
} from "../../features/servers/service";
import type { Invitation } from "../../features/servers/types";
import { colors } from "../../theme/colors";

interface InviteLinkModalProps {
  visible: boolean;
  serverId: string;
  serverName: string;
  onClose: () => void;
}

type InviteStatus = "active" | "revoked" | "expired" | "exhausted";

const STATUS_COPY: Record<
  InviteStatus,
  { label: string; textColor: string; bgColor: string }
> = {
  active: {
    label: "Activa",
    textColor: colors.success,
    bgColor: "rgba(56,161,105,0.15)",
  },
  revoked: {
    label: "Revocada",
    textColor: colors.danger,
    bgColor: "rgba(224,82,82,0.15)",
  },
  expired: {
    label: "Vencida",
    textColor: colors.textSubtle,
    bgColor: colors.bgInput,
  },
  exhausted: {
    label: "Agotada",
    textColor: colors.textSubtle,
    bgColor: colors.bgInput,
  },
};

function inviteStatus(inv: Invitation): InviteStatus {
  if (inv.revoked_at) return "revoked";
  if (inv.expires_at && new Date(inv.expires_at).getTime() <= Date.now())
    return "expired";
  if (inv.max_uses !== null && inv.uses >= inv.max_uses) return "exhausted";
  return "active";
}

function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.round(ms / (24 * 60 * 60 * 1000)));
}

function InvitationRow({
  invitation,
  onRevoked,
}: {
  invitation: Invitation;
  onRevoked: (code: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const status = inviteStatus(invitation);
  const statusCopy = STATUS_COPY[status];

  async function handleCopy() {
    await Clipboard.setStringAsync(inviteLinkText(invitation.code));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRevoke() {
    setIsRevoking(true);
    setErrorMessage("");
    const result = await revokeInvite(invitation.code);
    setIsRevoking(false);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }
    onRevoked(invitation.code);
  }

  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <Text style={styles.rowCode} numberOfLines={1}>
          {inviteLinkText(invitation.code)}
        </Text>
        <View
          style={[styles.statusPill, { backgroundColor: statusCopy.bgColor }]}
        >
          <Text
            style={[styles.statusPillText, { color: statusCopy.textColor }]}
          >
            {statusCopy.label}
          </Text>
        </View>
      </View>

      <View style={styles.rowStats}>
        {status === "active" && invitation.expires_at ? (
          <View style={styles.statItem}>
            <Feather name="clock" size={12} color={colors.textSubtle} />
            <Text style={styles.statText}>
              Vence en {daysUntil(invitation.expires_at)}{" "}
              {daysUntil(invitation.expires_at) === 1 ? "día" : "días"}
            </Text>
          </View>
        ) : null}
        <View style={styles.statItem}>
          <Feather name="users" size={12} color={colors.textSubtle} />
          <Text style={styles.statText}>
            {invitation.uses} usos ·{" "}
            {invitation.max_uses === null ? "Sin límite" : invitation.max_uses}
          </Text>
        </View>
      </View>

      {errorMessage ? (
        <Text style={styles.rowErrorText}>{errorMessage}</Text>
      ) : null}

      <View style={styles.rowActions}>
        <TouchableOpacity
          onPress={handleCopy}
          style={styles.rowActionButton}
          accessibilityRole="button"
        >
          <Feather
            name={copied ? "check" : "copy"}
            size={13}
            color={copied ? colors.success : colors.textMuted}
          />
          <Text
            style={[
              styles.rowActionText,
              copied ? { color: colors.success } : null,
            ]}
          >
            {copied ? "Copiado" : "Copiar enlace"}
          </Text>
        </TouchableOpacity>

        {status === "active" ? (
          <TouchableOpacity
            onPress={handleRevoke}
            disabled={isRevoking}
            style={[
              styles.rowActionButton,
              isRevoking ? { opacity: 0.5 } : null,
            ]}
            accessibilityRole="button"
          >
            {isRevoking ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <Feather name="trash-2" size={13} color={colors.danger} />
            )}
            <Text style={[styles.rowActionText, { color: colors.danger }]}>
              {isRevoking ? "Revocando..." : "Revocar"}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Lista todas las invitaciones del server (`GET /v1/servers/:id/invites`) y
 * permite generar nuevas o revocar las activas. El back permite varias
 * invitaciones activas a la vez (no hay "la" invitación actual): mostramos
 * todo el historial en vez de fingir que hay una sola. El link no se genera
 * hasta que el dueño toca "Generar".
 */
export function InviteLinkModal({
  visible,
  serverId,
  serverName,
  onClose,
}: InviteLinkModalProps) {
  const [invitations, setInvitations] = useState<Invitation[] | null>(null);
  const [maxUsesInput, setMaxUsesInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setMaxUsesInput("");
      setErrorMessage("");
    }
  }

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;

    setInvitations(null);
    listInvitations(serverId).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setErrorMessage(result.message);
        setInvitations([]);
        return;
      }
      setInvitations(result.invitations);
    });

    return () => {
      cancelled = true;
    };
  }, [visible, serverId]);

  async function handleGenerate() {
    const trimmed = maxUsesInput.trim();
    let maxUses: number | null = null;
    if (trimmed) {
      const n = Number.parseInt(trimmed, 10);
      if (!Number.isInteger(n) || n < 1) {
        setErrorMessage(
          "El límite de usos debe ser un número entero mayor a 0.",
        );
        return;
      }
      maxUses = n;
    }

    setIsGenerating(true);
    setErrorMessage("");
    const result = await generateInvite(serverId, maxUses);
    setIsGenerating(false);

    if (!result.ok) {
      setErrorMessage(result.fieldErrors?.maxUses ?? result.message);
      return;
    }

    setInvitations((prev) => [result.invitation, ...(prev ?? [])]);
    setMaxUsesInput("");
  }

  function handleRevoked(code: string) {
    setInvitations(
      (prev) =>
        prev?.map((inv) =>
          inv.code === code
            ? { ...inv, revoked_at: new Date().toISOString() }
            : inv,
        ) ?? null,
    );
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.card}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Feather name="x" size={13} color={colors.textSubtle} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Feather name="link-2" size={17} color={colors.info} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>Invitar miembros</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {serverName}
              </Text>
            </View>
          </View>

          <View style={styles.generateSection}>
            <Text style={styles.sectionLabel}>
              Generar invitación (vence en 7 días)
            </Text>
            <View style={styles.generateRow}>
              <View style={styles.generateInputWrap}>
                <TextInput
                  value={maxUsesInput}
                  onChangeText={(text) => {
                    setMaxUsesInput(text.replace(/[^0-9]/g, ""));
                    setErrorMessage("");
                  }}
                  placeholder="Límite de usos (opcional)"
                  placeholderTextColor={colors.textSubtle}
                  keyboardType="number-pad"
                  style={styles.generateInputText}
                />
              </View>
              <TouchableOpacity
                onPress={handleGenerate}
                disabled={isGenerating}
                style={[
                  styles.generateButton,
                  isGenerating ? styles.generateButtonDisabled : null,
                ]}
                accessibilityRole="button"
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Feather name="plus" size={14} color="#ffffff" />
                    <Text style={styles.generateButtonText}>Generar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Feather name="alert-circle" size={15} color={colors.danger} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            ) : null}
          </View>

          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionLabel}>
              Invitaciones
              {invitations !== null ? ` — ${invitations.length}` : ""}
            </Text>

            {invitations === null ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.textSubtle} />
              </View>
            ) : invitations.length === 0 ? (
              <Text style={styles.emptyText}>
                Todavía no hay invitaciones. Generá una arriba.
              </Text>
            ) : (
              <View style={styles.listGap}>
                {invitations.map((inv) => (
                  <InvitationRow
                    key={inv.code}
                    invitation={inv}
                    onRevoked={handleRevoked}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    maxHeight: "90%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgModal,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 20,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(107,149,189,0.15)",
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: 2,
  },
  generateSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 28,
    paddingVertical: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: colors.textSubtle,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  generateRow: {
    flexDirection: "row",
    gap: 8,
  },
  generateInputWrap: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 14,
    minHeight: 48,
    justifyContent: "center",
  },
  generateInputText: {
    fontSize: 14,
    color: colors.text,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    backgroundColor: colors.accent,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(224,82,82,0.3)",
    backgroundColor: "rgba(224,82,82,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
  },
  errorBannerText: {
    flex: 1,
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  listScroll: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  listContent: {
    paddingHorizontal: 28,
    paddingVertical: 20,
  },
  loadingRow: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    paddingVertical: 16,
    textAlign: "center",
    fontSize: 13,
    color: colors.textMuted,
  },
  listGap: {
    gap: 10,
  },
  row: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowCode: {
    flex: 1,
    fontSize: 14,
    fontFamily: "monospace",
    color: colors.text,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  rowStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  rowErrorText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.danger,
  },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 10,
  },
  rowActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
  },
});
