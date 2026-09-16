import { Feather } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getPublicUser } from "../../../../features/auth/service";
import { initiateOwnershipTransfer, listMembers } from "../../api";
import { colors } from "../../../../theme/colors";
import { Button } from "../../../../components/ui/Button";
import { ServerAvatar } from "../ServerAvatar";

interface TransferOwnershipModalProps {
  visible: boolean;
  serverId: string;
  serverName: string;
  currentUserId?: string | null;
  onClose: () => void;
}

type Step =
  | "loading-members"
  | "members-error"
  | "form"
  | "confirm"
  | "sent"
  | "already-pending";

interface PickerMember {
  userId: string;
  name: string | null;
  avatarUrl: string | null;
}

export function TransferOwnershipModal({
  visible,
  serverId,
  serverName,
  currentUserId,
  onClose,
}: TransferOwnershipModalProps) {
  const [step, setStep] = useState<Step>("loading-members");
  const [members, setMembers] = useState<PickerMember[]>([]);
  const [membersError, setMembersError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setStep("loading-members");
      setMembers([]);
      setMembersError("");
      setSelectedUserId(null);
      setGlobalError("");
      setIsSubmitting(false);
    }
  }

  const fetchMembers = useCallback(() => {
    let cancelled = false;

    listMembers(serverId, { limit: 100 }).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setMembersError(result.message);
        setStep("members-error");
        return;
      }

      const candidates = result.members.filter(
        (m) => !m.is_owner && m.user_id !== currentUserId,
      );
      setMembers(
        candidates.map((m) => ({
          userId: m.user_id,
          name: null,
          avatarUrl: null,
        })),
      );
      setStep("form");

      candidates.forEach((m) => {
        getPublicUser(m.user_id).then((profile) => {
          if (cancelled || !profile) return;
          setMembers((prev) =>
            prev.map((item) =>
              item.userId === m.user_id
                ? { ...item, name: profile.name, avatarUrl: profile.avatar_url }
                : item,
            ),
          );
        });
      });
    });

    return () => {
      cancelled = true;
    };
  }, [serverId, currentUserId]);

  useEffect(() => {
    if (!visible) return;
    return fetchMembers();
  }, [visible, fetchMembers]);

  function handleRetryMembers() {
    setStep("loading-members");
    setMembersError("");
    fetchMembers();
  }

  function handleContinue() {
    if (!selectedUserId) return;
    setGlobalError("");
    setStep("confirm");
  }

  async function handleConfirm() {
    if (!selectedUserId) return;
    setGlobalError("");
    setIsSubmitting(true);
    const result = await initiateOwnershipTransfer(serverId, selectedUserId);
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.reason === "transfer_already_pending") {
        setStep("already-pending");
        return;
      }
      if (result.fieldErrors?.toUserId) {
        setStep("form");
        setGlobalError(result.fieldErrors.toUserId);
        return;
      }
      setGlobalError(result.message);
      return;
    }

    setStep("sent");
  }

  const selectedMember =
    members.find((m) => m.userId === selectedUserId) ?? null;
  const selectedDisplayName = selectedMember?.name ?? selectedUserId ?? "";

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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

          {step === "already-pending" ? (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.centerWrap}>
                <View style={styles.iconCircleHighlight}>
                  <Feather name="clock" size={26} color={colors.highlight} />
                </View>
                <Text style={styles.centerTitle}>
                  Ya hay una transferencia pendiente
                </Text>
                <Text style={styles.centerSubtitle}>
                  Ya enviaste una solicitud de transferencia para{" "}
                  <Text style={styles.centerSubtitleStrong}>{serverName}</Text>.
                  Solo podés tener una activa a la vez, y no se puede cancelar
                  una vez enviada.
                </Text>
                <Text style={styles.centerSubtitle}>
                  Esperá a que el miembro acepte o rechace la oferta.
                </Text>
                <Button
                  title="Entendido"
                  variant="secondary"
                  onPress={onClose}
                />
              </View>
            </ScrollView>
          ) : step === "sent" ? (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.centerWrap}>
                <View style={styles.iconCircleHighlight}>
                  <Feather name="clock" size={26} color={colors.highlight} />
                </View>
                <Text style={styles.centerTitle}>Solicitud enviada</Text>
                <Text style={styles.centerSubtitle}>
                  Le enviamos la oferta a{" "}
                  <Text style={styles.centerSubtitleStrong}>
                    {selectedDisplayName}
                  </Text>
                  . La propiedad de{" "}
                  <Text style={styles.centerSubtitleStrong}>{serverName}</Text>{" "}
                  no va a cambiar hasta que la acepte.
                </Text>
                <Text style={styles.centerSubtitle}>
                  Si la rechaza, vas a seguir siendo el propietario. No podés
                  cancelar esta solicitud una vez enviada.
                </Text>
                <Button title="Cerrar" onPress={onClose} />
              </View>
            </ScrollView>
          ) : step === "loading-members" ? (
            <View style={[styles.scrollContent, styles.centerWrap]}>
              <ActivityIndicator size="small" color={colors.textSubtle} />
              <Text style={styles.centerSubtitle}>Cargando miembros...</Text>
            </View>
          ) : step === "members-error" ? (
            <View style={styles.scrollContent}>
              <View style={styles.header}>
                <View style={styles.headerIcon}>
                  <Feather name="shield" size={17} color={colors.info} />
                </View>
                <View style={styles.headerTextWrap}>
                  <Text style={styles.headerTitle}>Transferir propiedad</Text>
                  <Text style={styles.headerSubtitle} numberOfLines={1}>
                    {serverName}
                  </Text>
                </View>
              </View>
              <View style={styles.errorBanner}>
                <Feather name="alert-circle" size={15} color={colors.danger} />
                <Text style={styles.errorBannerText}>{membersError}</Text>
              </View>
              <Button title="Reintentar" onPress={handleRetryMembers} />
            </View>
          ) : (
            <View style={styles.flexOne}>
              <View style={[styles.scrollContent, styles.headerBlock]}>
                <View style={styles.header}>
                  <View style={styles.headerIcon}>
                    <Feather name="shield" size={17} color={colors.info} />
                  </View>
                  <View style={styles.headerTextWrap}>
                    <Text style={styles.headerTitle}>Transferir propiedad</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>
                      {serverName}
                    </Text>
                  </View>
                </View>

                {globalError ? (
                  <View style={styles.errorBanner}>
                    <Feather
                      name="alert-circle"
                      size={15}
                      color={colors.danger}
                    />
                    <Text style={styles.errorBannerText}>{globalError}</Text>
                  </View>
                ) : null}
              </View>

              {step === "form" ? (
                <>
                  <Text style={[styles.sectionLabel, styles.listLabel]}>
                    Elegí a quién transferirle el servidor
                  </Text>

                  {members.length === 0 ? (
                    <View style={styles.emptyMembers}>
                      <Feather
                        name="users"
                        size={22}
                        color={colors.textSubtle}
                      />
                      <Text style={styles.emptyMembersText}>
                        Todavía no hay otros miembros en este servidor. Invitá
                        gente antes de transferir la propiedad.
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={members}
                      keyExtractor={(item) => item.userId}
                      style={styles.list}
                      contentContainerStyle={styles.listContent}
                      showsVerticalScrollIndicator={false}
                      renderItem={({ item }) => {
                        const selected = item.userId === selectedUserId;
                        return (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setSelectedUserId(item.userId)}
                            style={[
                              styles.memberRow,
                              selected ? styles.memberRowSelected : null,
                            ]}
                          >
                            <ServerAvatar
                              name={item.name ?? item.userId}
                              uri={item.avatarUrl}
                              size={36}
                            />
                            <View style={styles.memberTextWrap}>
                              <Text style={styles.memberName} numberOfLines={1}>
                                {item.name ?? "Cargando..."}
                              </Text>
                              <Text style={styles.memberId} numberOfLines={1}>
                                {item.userId}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.radio,
                                selected ? styles.radioSelected : null,
                              ]}
                            >
                              {selected ? (
                                <View style={styles.radioDot} />
                              ) : null}
                            </View>
                          </TouchableOpacity>
                        );
                      }}
                    />
                  )}

                  <View style={[styles.footer, styles.scrollContent]}>
                    <Button
                      title="Cancelar"
                      variant="secondary"
                      onPress={onClose}
                      style={{ flex: 1, width: undefined }}
                    />
                    <Button
                      title="Continuar"
                      onPress={handleContinue}
                      disabled={!selectedUserId}
                      iconRight="arrow-right"
                      style={{ flex: 1, width: undefined }}
                    />
                  </View>
                </>
              ) : (
                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.targetCard}>
                    <ServerAvatar
                      name={selectedDisplayName}
                      uri={selectedMember?.avatarUrl}
                      size={40}
                    />
                    <View style={styles.targetTextWrap}>
                      <Text style={styles.targetLabel}>
                        Miembro seleccionado
                      </Text>
                      <Text style={styles.targetId} numberOfLines={1}>
                        {selectedDisplayName}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.warningBox}>
                    <Text style={styles.warningTitle}>Antes de continuar</Text>
                    <Text style={styles.warningText}>
                      La propiedad de{" "}
                      <Text style={styles.warningTextStrong}>{serverName}</Text>{" "}
                      no cambia hasta que la otra persona acepte la oferta. Una
                      vez que la envíes, no vas a poder cancelarla.
                    </Text>
                  </View>

                  <View style={styles.footer}>
                    <Button
                      title="Volver"
                      variant="secondary"
                      onPress={() => {
                        setStep("form");
                        setGlobalError("");
                      }}
                      disabled={isSubmitting}
                      style={{ flex: 1, width: undefined }}
                    />
                    <Button
                      title="Enviar solicitud"
                      onPress={handleConfirm}
                      isLoading={isSubmitting}
                      style={{ flex: 1, width: undefined }}
                    />
                  </View>
                </ScrollView>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
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
    minHeight: 320,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgModal,
    overflow: "hidden",
  },
  flexOne: {
    flex: 1,
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
  centerWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  headerBlock: {
    paddingBottom: 0,
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
    textTransform: "uppercase",
  },
  listLabel: {
    paddingHorizontal: 28,
    marginBottom: 8,
  },
  list: {
    flexGrow: 0,
    maxHeight: 280,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 4,
  },
  emptyMembers: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  emptyMembersText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSubtle,
    textAlign: "center",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  memberRowSelected: {
    borderColor: "rgba(107,149,189,0.4)",
    backgroundColor: "rgba(107,149,189,0.1)",
  },
  memberTextWrap: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  memberId: {
    fontSize: 11,
    fontFamily: "monospace",
    color: colors.textSubtle,
    marginTop: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: colors.info,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.info,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  targetCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgCard,
    padding: 14,
    marginBottom: 16,
  },
  targetTextWrap: {
    flex: 1,
  },
  targetLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: colors.textSubtle,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  targetId: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  warningBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(252,227,164,0.3)",
    backgroundColor: "rgba(252,227,164,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.highlight,
  },
  warningText: {
    fontSize: 12,
    lineHeight: 17,
    color: "rgba(252,227,164,0.8)",
  },
  warningTextStrong: {
    fontWeight: "700",
    color: colors.highlight,
  },
  iconCircleHighlight: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(252,227,164,0.12)",
    marginBottom: 4,
  },
  centerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  centerSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    textAlign: "center",
  },
  centerSubtitleStrong: {
    color: colors.text,
    fontWeight: "700",
  },
});
