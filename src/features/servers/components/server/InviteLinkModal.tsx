import {
  daysUntil,
  type Invitation,
  inviteStatus,
  type InviteStatus,
  MAX_USES_LABEL,
  validateMaxUses,
} from "@discordia/client-shared";

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
} from "../../api";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";

interface InviteLinkModalProps {
  visible: boolean;
  serverId: string;
  serverName: string;
  onClose: () => void;
}

const STATUS_COPY: Record<
  InviteStatus,
  { label: string; textClass: string; bgClass: string }
> = {
  active: {
    label: "Activa",
    textClass: "text-success",
    bgClass: "bg-success/15",
  },
  revoked: {
    label: "Revocada",
    textClass: "text-danger",
    bgClass: "bg-danger/15",
  },
  expired: {
    label: "Vencida",
    textClass: "text-content-subtle",
    bgClass: "bg-surface-input",
  },
  exhausted: {
    label: "Agotada",
    textClass: "text-content-subtle",
    bgClass: "bg-surface-input",
  },
};

function InvitationRow({
  invitation,
  onRevoked,
}: {
  invitation: Invitation;
  onRevoked: (code: string) => void;
}) {
  const colors = useThemeColors();
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
    <View className="rounded-xl border border-line p-3">
      <View className="flex-row items-center gap-2">
        <Text
          className="flex-1 text-[14px] text-content"
          style={styles.rowCode}
          numberOfLines={1}
        >
          {inviteLinkText(invitation.code)}
        </Text>
        <View className={cn("rounded-full px-2 py-[3px]", statusCopy.bgClass)}>
          <Text
            className={cn(
              "text-[10px] font-bold tracking-[0.6px] uppercase",
              statusCopy.textClass,
            )}
          >
            {statusCopy.label}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-3.5 mt-2">
        {status === "active" && invitation.expires_at ? (
          <View className="flex-row items-center gap-[5px]">
            <Feather name="clock" size={12} color={colors.textSubtle} />
            <Text className="text-[11px] text-content-subtle">
              Vence en {daysUntil(invitation.expires_at)}{" "}
              {daysUntil(invitation.expires_at) === 1 ? "día" : "días"}
            </Text>
          </View>
        ) : null}
        <View className="flex-row items-center gap-[5px]">
          <Feather name="users" size={12} color={colors.textSubtle} />
          <Text className="text-[11px] text-content-subtle">
            {invitation.uses} usos ·{" "}
            {invitation.max_uses === null ? "Sin límite" : invitation.max_uses}
          </Text>
        </View>
      </View>

      {errorMessage ? (
        <Text className="mt-2 text-[12px] text-danger">{errorMessage}</Text>
      ) : null}

      <View className="flex-row items-center gap-4 mt-2.5">
        <TouchableOpacity
          onPress={handleCopy}
          className="flex-row items-center gap-1.5"
          accessibilityRole="button"
        >
          <Feather
            name={copied ? "check" : "copy"}
            size={13}
            color={copied ? colors.success : colors.textMuted}
          />
          <Text
            className="text-[12px] font-bold text-content-muted"
            style={copied ? { color: colors.success } : null}
          >
            {copied ? "Copiado" : "Copiar enlace"}
          </Text>
        </TouchableOpacity>

        {status === "active" ? (
          <TouchableOpacity
            onPress={handleRevoke}
            disabled={isRevoking}
            className="flex-row items-center gap-1.5"
            style={isRevoking ? { opacity: 0.5 } : null}
            accessibilityRole="button"
          >
            {isRevoking ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <Feather name="trash-2" size={13} color={colors.danger} />
            )}
            <Text
              className="text-[12px] font-bold text-content-muted"
              style={{ color: colors.danger }}
            >
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
  const colors = useThemeColors();
  const [invitations, setInvitations] = useState<Invitation[] | null>(null);
  const [maxUsesInput, setMaxUsesInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Cada vez que el modal se abre (o cambia de server mientras está
  // abierto) hay que volver a pedir las invitaciones desde cero. Se ajusta
  // el estado acá, durante el render, en vez de al toque en un efecto, para
  // no disparar un render en cascada.
  const fetchKey = visible ? serverId : null;
  const [lastFetchKey, setLastFetchKey] = useState<string | null>(null);
  if (fetchKey !== lastFetchKey) {
    setLastFetchKey(fetchKey);
    if (fetchKey !== null) {
      setInvitations(null);
      setMaxUsesInput("");
      setErrorMessage("");
    }
  }

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;

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
    const maxUsesError = validateMaxUses(trimmed);
    if (maxUsesError) {
      setErrorMessage(maxUsesError);
      return;
    }
    // Antes usaba `parseInt`, que acepta "5abc" como 5. `validateMaxUses` usa
    // `Number`, igual que `web-client`.
    const maxUses = trimmed ? Number(trimmed) : null;

    setIsGenerating(true);
    setErrorMessage("");
    const result = await generateInvite(serverId, maxUses);
    setIsGenerating(false);

    if (!result.ok) {
      setErrorMessage(result.fieldErrors?.max_uses ?? result.message);
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
      <View className="flex-1 bg-[rgba(0,0,0,0.65)] items-center justify-center p-4">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View className="w-full max-w-115 max-h-[90%] rounded-[20px] border border-line-strong bg-surface-modal overflow-hidden">
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-2xl items-center justify-center bg-surface-input border border-line"
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Feather name="x" size={13} color={colors.textSubtle} />
          </TouchableOpacity>

          <View className="flex-row items-center gap-3 px-7 pt-8 pb-5">
            <View className="w-9 h-9 rounded-xl items-center justify-center bg-[rgba(107,149,189,0.15)]">
              <Feather name="link-2" size={17} color={colors.info} />
            </View>
            <View className="flex-1">
              <Text className="text-[17px] font-bold text-content">
                Invitar miembros
              </Text>
              <Text
                className="text-[12px] text-content-subtle mt-0.5"
                numberOfLines={1}
              >
                {serverName}
              </Text>
            </View>
          </View>

          <View className="border-t border-t-line px-7 py-5">
            <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle mb-2 uppercase">
              Generar invitación (vence en 7 días)
            </Text>
            <View className="flex-row gap-2">
              <View className="flex-1 rounded-xl border border-line bg-surface-input px-3.5 min-h-12 justify-center">
                <TextInput
                  value={maxUsesInput}
                  onChangeText={(text) => {
                    setMaxUsesInput(text.replace(/[^0-9]/g, ""));
                    setErrorMessage("");
                  }}
                  placeholder={MAX_USES_LABEL}
                  placeholderTextColor={colors.textSubtle}
                  keyboardType="number-pad"
                  className="text-[14px] text-content"
                />
              </View>
              <TouchableOpacity
                onPress={handleGenerate}
                disabled={isGenerating}
                className={cn(
                  "flex-row items-center gap-1.5 rounded-xl px-4 min-h-12 bg-accent",
                  isGenerating ? "opacity-[0.6]" : null,
                )}
                accessibilityRole="button"
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Feather name="plus" size={14} color="#ffffff" />
                    <Text className="text-[13px] font-bold text-white">
                      Generar
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            {errorMessage ? (
              <View className="flex-row items-start gap-2.5 rounded-xl border border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)] px-3.5 py-3 mt-3">
                <Feather name="alert-circle" size={15} color={colors.danger} />
                <Text className="flex-1 text-danger text-[13px] leading-[18px]">
                  {errorMessage}
                </Text>
              </View>
            ) : null}
          </View>

          <ScrollView
            className="border-t border-t-line"
            contentContainerClassName="px-7 py-5"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle mb-2 uppercase">
              Invitaciones
              {invitations !== null ? ` — ${invitations.length}` : ""}
            </Text>

            {invitations === null ? (
              <View className="py-6 items-center">
                <ActivityIndicator size="small" color={colors.textSubtle} />
              </View>
            ) : invitations.length === 0 ? (
              <Text className="py-4 text-center text-[13px] text-content-muted">
                Todavía no hay invitaciones. Generá una arriba.
              </Text>
            ) : (
              <View className="gap-2.5">
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
  rowCode: {
    fontFamily: "monospace",
  },
});
