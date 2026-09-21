import { MEMBER_PAGE_LIMIT } from "@discordia/client-shared";

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
import { resolveImageUri } from "../../../../lib/image-url";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
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
  const colors = useThemeColors();
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

    listMembers(serverId, { limit: MEMBER_PAGE_LIMIT }).then((result) => {
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
      if (result.fieldErrors?.to_user_id) {
        setStep("form");
        setGlobalError(result.fieldErrors.to_user_id);
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
        className="flex-1 bg-[rgba(0,0,0,0.65)] items-center justify-center p-4"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View className="w-full max-w-110 max-h-[90%] min-h-80 rounded-[20px] border border-line-strong bg-surface-modal overflow-hidden">
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-2xl items-center justify-center bg-surface-input border border-line"
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Feather name="x" size={13} color={colors.textSubtle} />
          </TouchableOpacity>

          {step === "already-pending" ? (
            <ScrollView
              contentContainerClassName="p-7 pt-8"
              showsVerticalScrollIndicator={false}
            >
              <View className="items-center justify-center gap-3.5">
                <View className="w-15 h-15 rounded-[18px] items-center justify-center bg-[rgba(252,227,164,0.12)] mb-1">
                  <Feather name="clock" size={26} color={colors.highlight} />
                </View>
                <Text className="text-[18px] font-bold text-content text-center">
                  Ya hay una transferencia pendiente
                </Text>
                <Text className="text-[13px] leading-[19px] text-content-muted text-center">
                  Ya enviaste una solicitud de transferencia para{" "}
                  <Text className="text-content font-bold">{serverName}</Text>.
                  Solo podés tener una activa a la vez, y no se puede cancelar
                  una vez enviada.
                </Text>
                <Text className="text-[13px] leading-[19px] text-content-muted text-center">
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
              contentContainerClassName="p-7 pt-8"
              showsVerticalScrollIndicator={false}
            >
              <View className="items-center justify-center gap-3.5">
                <View className="w-15 h-15 rounded-[18px] items-center justify-center bg-[rgba(252,227,164,0.12)] mb-1">
                  <Feather name="clock" size={26} color={colors.highlight} />
                </View>
                <Text className="text-[18px] font-bold text-content text-center">
                  Solicitud enviada
                </Text>
                <Text className="text-[13px] leading-[19px] text-content-muted text-center">
                  Le enviamos la oferta a{" "}
                  <Text className="text-content font-bold">
                    {selectedDisplayName}
                  </Text>
                  . La propiedad de{" "}
                  <Text className="text-content font-bold">{serverName}</Text>{" "}
                  no va a cambiar hasta que la acepte.
                </Text>
                <Text className="text-[13px] leading-[19px] text-content-muted text-center">
                  Si la rechaza, vas a seguir siendo el propietario. No podés
                  cancelar esta solicitud una vez enviada.
                </Text>
                <Button title="Cerrar" onPress={onClose} />
              </View>
            </ScrollView>
          ) : step === "loading-members" ? (
            <View
              className={cn("p-7 pt-8", "items-center justify-center gap-3.5")}
            >
              <ActivityIndicator size="small" color={colors.textSubtle} />
              <Text className="text-[13px] leading-[19px] text-content-muted text-center">
                Cargando miembros...
              </Text>
            </View>
          ) : step === "members-error" ? (
            <View className="p-7 pt-8">
              <View className="flex-row items-center gap-3 mb-5 pr-6">
                <View className="w-9 h-9 rounded-xl items-center justify-center bg-[rgba(107,149,189,0.15)]">
                  <Feather name="shield" size={17} color={colors.info} />
                </View>
                <View className="flex-1">
                  <Text className="text-[17px] font-bold text-content">
                    Transferir propiedad
                  </Text>
                  <Text
                    className="text-[12px] text-content-subtle mt-0.5"
                    numberOfLines={1}
                  >
                    {serverName}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-start gap-2.5 rounded-xl border border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)] px-3.5 py-3 mb-4">
                <Feather name="alert-circle" size={15} color={colors.danger} />
                <Text className="flex-1 text-danger text-[13px] leading-[18px]">
                  {membersError}
                </Text>
              </View>
              <Button title="Reintentar" onPress={handleRetryMembers} />
            </View>
          ) : (
            <View className="flex-1">
              <View className={cn("p-7 pt-8", "pb-0")}>
                <View className="flex-row items-center gap-3 mb-5 pr-6">
                  <View className="w-9 h-9 rounded-xl items-center justify-center bg-[rgba(107,149,189,0.15)]">
                    <Feather name="shield" size={17} color={colors.info} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[17px] font-bold text-content">
                      Transferir propiedad
                    </Text>
                    <Text
                      className="text-[12px] text-content-subtle mt-0.5"
                      numberOfLines={1}
                    >
                      {serverName}
                    </Text>
                  </View>
                </View>

                {globalError ? (
                  <View className="flex-row items-start gap-2.5 rounded-xl border border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)] px-3.5 py-3 mb-4">
                    <Feather
                      name="alert-circle"
                      size={15}
                      color={colors.danger}
                    />
                    <Text className="flex-1 text-danger text-[13px] leading-[18px]">
                      {globalError}
                    </Text>
                  </View>
                ) : null}
              </View>

              {step === "form" ? (
                <>
                  <Text
                    className={cn(
                      "text-[11px] font-bold tracking-[1.1px] text-content-subtle uppercase",
                      "px-7 mb-2",
                    )}
                  >
                    Elegí a quién transferirle el servidor
                  </Text>

                  {members.length === 0 ? (
                    <View className="items-center gap-2.5 px-7 py-6">
                      <Feather
                        name="users"
                        size={22}
                        color={colors.textSubtle}
                      />
                      <Text className="text-[13px] leading-[18px] text-content-subtle text-center">
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
                            className={cn(
                              "flex-row items-center gap-3 rounded-xl border px-2 py-2",
                              selected
                                ? "border-[rgba(107,149,189,0.4)] bg-[rgba(107,149,189,0.1)]"
                                : "border-transparent",
                            )}
                          >
                            <ServerAvatar
                              name={item.name ?? item.userId}
                              uri={resolveImageUri(item.avatarUrl)}
                              size={36}
                            />
                            <View className="flex-1">
                              <Text
                                className="text-[14px] font-semibold text-content"
                                numberOfLines={1}
                              >
                                {item.name ?? "Cargando..."}
                              </Text>
                              <Text
                                className="text-[11px] text-content-subtle mt-[1px]"
                                style={styles.memberId}
                                numberOfLines={1}
                              >
                                {item.userId}
                              </Text>
                            </View>
                            <View
                              className={cn(
                                "w-5 h-5 rounded-[10px] border-2 items-center justify-center",
                                selected ? "border-info" : "border-line",
                              )}
                            >
                              {selected ? (
                                <View className="w-2.5 h-2.5 rounded-[5px] bg-info" />
                              ) : null}
                            </View>
                          </TouchableOpacity>
                        );
                      }}
                    />
                  )}

                  <View className="flex-row gap-3 mt-4 pt-8 border-t border-t-line p-7">
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
                  contentContainerClassName="p-7 pt-8"
                  showsVerticalScrollIndicator={false}
                >
                  <View className="flex-row items-center gap-3 rounded-2xl border border-line-strong bg-surface-raised p-3.5 mb-4">
                    <ServerAvatar
                      name={selectedDisplayName}
                      uri={resolveImageUri(selectedMember?.avatarUrl)}
                      size={40}
                    />
                    <View className="flex-1">
                      <Text className="text-[11px] font-bold tracking-[0.6px] text-content-subtle uppercase mb-0.5">
                        Miembro seleccionado
                      </Text>
                      <Text
                        className="text-[14px] font-semibold text-content"
                        numberOfLines={1}
                      >
                        {selectedDisplayName}
                      </Text>
                    </View>
                  </View>

                  <View className="rounded-xl border border-[rgba(252,227,164,0.3)] bg-[rgba(252,227,164,0.08)] px-3.5 py-3 gap-1">
                    <Text className="text-[13px] font-bold text-highlight">
                      Antes de continuar
                    </Text>
                    <Text className="text-[12px] leading-[17px] text-[rgba(252,227,164,0.8)]">
                      La propiedad de{" "}
                      <Text className="font-bold text-highlight">
                        {serverName}
                      </Text>{" "}
                      no cambia hasta que la otra persona acepte la oferta. Una
                      vez que la envíes, no vas a poder cancelarla.
                    </Text>
                  </View>

                  <View className="flex-row gap-3 mt-4 pt-5 border-t border-t-line">
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
  list: {
    flexGrow: 0,
    maxHeight: 280,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 4,
  },
  memberId: {
    fontFamily: "monospace",
  },
});
