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
  revokeInvite,
} from "../../features/servers/service";
import type { Invitation } from "../../features/servers/types";
import { colors } from "../../theme/colors";
import { Button } from "../ui/Button";

interface InviteLinkModalProps {
  visible: boolean;
  serverId: string;
  serverName: string;
  onClose: () => void;
}

type LinkState = "generating" | "active" | "revoking" | "revoked" | "error";

const EXPIRES_IN_DAYS = 7;

export function InviteLinkModal({
  visible,
  serverId,
  serverName,
  onClose,
}: InviteLinkModalProps) {
  const [linkState, setLinkState] = useState<LinkState>("generating");
  const [invite, setInvite] = useState<Invitation | null>(null);
  const [copied, setCopied] = useState(false);
  const [limitInput, setLimitInput] = useState("");
  const [limitError, setLimitError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setInvite(null);
      setCopied(false);
      setLimitInput("");
      setLimitError("");
      setGlobalError("");
      setConfirmRevoke(false);
      setLinkState("generating");
    }
  }

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;

    generateInvite(serverId, null).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setGlobalError(result.message);
        setLinkState("error");
        return;
      }
      setInvite(result.invitation);
      setLinkState("active");
    });

    return () => {
      cancelled = true;
    };
  }, [visible, serverId]);

  async function runGenerate(maxUses: number | null) {
    setLinkState("generating");
    setGlobalError("");
    setConfirmRevoke(false);

    const result = await generateInvite(serverId, maxUses);
    if (!result.ok) {
      setGlobalError(result.message);
      if (result.fieldErrors?.maxUses) {
        setLimitError(result.fieldErrors.maxUses);
      }
      setLinkState(invite ? "active" : "error");
      return;
    }

    setInvite(result.invitation);
    setCopied(false);
    setLinkState("active");
  }

  function handleGenerate() {
    let max: number | null = null;
    if (limitInput.trim() !== "") {
      const n = Number.parseInt(limitInput, 10);
      if (!Number.isInteger(n) || n < 1) {
        setLimitError("Ingresá un número entero mayor a 0.");
        return;
      }
      max = n;
    }
    setLimitError("");
    void runGenerate(max);
  }

  async function handleRevoke() {
    if (!confirmRevoke) {
      setConfirmRevoke(true);
      return;
    }
    if (!invite) return;

    setLinkState("revoking");
    setGlobalError("");
    const result = await revokeInvite(invite.code);
    if (!result.ok) {
      setLinkState("active");
      setGlobalError(result.message);
      return;
    }
    setLinkState("revoked");
  }

  async function handleCopy() {
    if (!invite) return;
    await Clipboard.setStringAsync(inviteLinkText(invite.code));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isLoading = linkState === "generating" || linkState === "revoking";
  const isFull =
    !!invite && invite.max_uses !== null && invite.uses >= invite.max_uses;

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

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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

            {globalError ? (
              <View style={styles.errorBanner}>
                <Feather name="alert-circle" size={15} color={colors.danger} />
                <Text style={styles.errorBannerText}>{globalError}</Text>
              </View>
            ) : null}

            <Text style={styles.sectionLabel}>Enlace de invitación</Text>
            <View
              style={[
                styles.linkBox,
                linkState === "revoked" ? styles.linkBoxRevoked : null,
              ]}
            >
              {isLoading ? (
                <View style={styles.linkLoadingRow}>
                  <ActivityIndicator size="small" color={colors.textSubtle} />
                  <Text style={styles.linkTextPlaceholder}>
                    {linkState === "revoking"
                      ? "Revocando..."
                      : "Generando enlace..."}
                  </Text>
                </View>
              ) : invite ? (
                <Text
                  style={[
                    styles.linkText,
                    linkState === "revoked" ? styles.linkTextRevoked : null,
                  ]}
                  numberOfLines={1}
                >
                  {inviteLinkText(invite.code)}
                </Text>
              ) : (
                <Text style={styles.linkTextPlaceholder}>—</Text>
              )}

              <TouchableOpacity
                onPress={handleCopy}
                disabled={isLoading || linkState === "revoked" || !invite}
                style={[
                  styles.copyButton,
                  copied ? styles.copyButtonCopied : null,
                  isLoading || linkState === "revoked" || !invite
                    ? styles.copyButtonDisabled
                    : null,
                ]}
              >
                <Feather
                  name={copied ? "check" : "copy"}
                  size={13}
                  color={copied ? colors.success : colors.sky}
                />
                <Text
                  style={[
                    styles.copyButtonText,
                    { color: copied ? colors.success : colors.sky },
                  ]}
                >
                  {copied ? "Copiado" : "Copiar"}
                </Text>
              </TouchableOpacity>
            </View>

            {linkState === "revoked" ? (
              <View style={styles.inlineWarningRow}>
                <Feather name="alert-circle" size={12} color={colors.danger} />
                <Text style={styles.inlineWarningText}>
                  Este enlace fue revocado y ya no sirve para unirse.
                </Text>
              </View>
            ) : null}

            {invite && linkState !== "revoked" ? (
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Feather name="clock" size={12} color={colors.textMuted} />
                  <Text style={styles.statText}>
                    Vence en {EXPIRES_IN_DAYS} días
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Feather name="users" size={12} color={colors.textMuted} />
                  <Text style={styles.statText}>
                    {invite.max_uses !== null
                      ? `${invite.uses} / ${invite.max_uses} usos${
                          isFull ? " · Límite alcanzado" : ""
                        }`
                      : `${invite.uses} uso${
                          invite.uses !== 1 ? "s" : ""
                        } · Sin límite`}
                  </Text>
                </View>
              </View>
            ) : null}

            <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
              Límite de usos{" "}
              <Text style={styles.sectionLabelHint}>(opcional)</Text>
            </Text>
            <View style={styles.limitRow}>
              <View
                style={[
                  styles.limitInputWrap,
                  limitError ? styles.inputError : null,
                ]}
              >
                <TextInput
                  value={limitInput}
                  onChangeText={(text) => {
                    setLimitInput(text.replace(/[^0-9]/g, ""));
                    setLimitError("");
                  }}
                  placeholder="Sin límite"
                  placeholderTextColor={colors.textSubtle}
                  keyboardType="number-pad"
                  style={styles.limitInputText}
                />
              </View>
              <TouchableOpacity
                onPress={handleGenerate}
                disabled={isLoading}
                style={[
                  styles.regenerateButton,
                  isLoading ? styles.copyButtonDisabled : null,
                ]}
              >
                {linkState === "generating" ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Feather name="refresh-cw" size={13} color="#ffffff" />
                    <Text style={styles.regenerateButtonText}>
                      Nuevo enlace
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            {limitError ? (
              <View style={styles.inlineWarningRow}>
                <Feather name="alert-circle" size={12} color={colors.danger} />
                <Text style={styles.inlineWarningText}>{limitError}</Text>
              </View>
            ) : null}
            <Text style={styles.helperText}>
              Si dejás este campo vacío, el enlace no tendrá límite de usos.
            </Text>

            <View style={styles.divider} />

            {linkState !== "revoked" ? (
              <View>
                <Text style={styles.sectionLabel}>Zona peligrosa</Text>
                {!confirmRevoke ? (
                  <TouchableOpacity
                    onPress={handleRevoke}
                    disabled={isLoading || !invite}
                    style={[
                      styles.revokeButton,
                      isLoading || !invite ? styles.copyButtonDisabled : null,
                    ]}
                  >
                    <Feather name="trash-2" size={13} color={colors.danger} />
                    <Text style={styles.revokeButtonText}>
                      Revocar enlace actual
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.confirmWrap}>
                    <View style={styles.errorBanner}>
                      <Feather
                        name="alert-circle"
                        size={14}
                        color={colors.danger}
                      />
                      <Text style={styles.errorBannerText}>
                        El enlace quedará inutilizable de inmediato. Quienes aún
                        no se unieron no van a poder hacerlo con este código.
                      </Text>
                    </View>
                    <View style={styles.confirmButtonsRow}>
                      <Button
                        title="Cancelar"
                        variant="secondary"
                        onPress={() => setConfirmRevoke(false)}
                        style={{ flex: 1, width: undefined }}
                      />
                      <Button
                        title="Confirmar"
                        variant="danger"
                        onPress={handleRevoke}
                        isLoading={linkState === "revoking"}
                        style={{ flex: 1, width: undefined }}
                      />
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <Button
                title="Generar nuevo enlace"
                iconRight="refresh-cw"
                onPress={() => {
                  setLimitInput("");
                  setLimitError("");
                  void runGenerate(null);
                }}
              />
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
    maxWidth: 440,
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
  scrollContent: {
    padding: 28,
    paddingTop: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    paddingRight: 24,
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
    marginBottom: 16,
  },
  errorBannerText: {
    flex: 1,
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: colors.textSubtle,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  sectionLabelSpaced: {
    marginTop: 20,
  },
  sectionLabelHint: {
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 0,
    textTransform: "none",
    color: colors.textSubtle,
  },
  linkBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  linkBoxRevoked: {
    borderColor: "rgba(224,82,82,0.25)",
    backgroundColor: "rgba(224,82,82,0.06)",
  },
  linkLoadingRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "monospace",
    color: colors.text,
  },
  linkTextRevoked: {
    color: colors.textSubtle,
    textDecorationLine: "line-through",
  },
  linkTextPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: colors.textSubtle,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(36,92,107,0.4)",
    backgroundColor: "rgba(36,92,107,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  copyButtonCopied: {
    borderColor: "rgba(56,161,105,0.3)",
    backgroundColor: "rgba(56,161,105,0.2)",
  },
  copyButtonDisabled: {
    opacity: 0.35,
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  inlineWarningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  inlineWarningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: colors.danger,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  limitRow: {
    flexDirection: "row",
    gap: 8,
  },
  limitInputWrap: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 14,
    minHeight: 48,
    justifyContent: "center",
  },
  inputError: {
    borderColor: colors.danger,
  },
  limitInputText: {
    fontSize: 14,
    color: colors.text,
  },
  regenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    backgroundColor: colors.accent,
  },
  regenerateButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  helperText: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSubtle,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  revokeButton: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(224,82,82,0.25)",
    backgroundColor: "rgba(224,82,82,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  revokeButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.danger,
  },
  confirmWrap: {
    gap: 10,
  },
  confirmButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
});
