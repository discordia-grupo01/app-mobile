import {
  MEMBER_PAGE_LIMIT,
  type OwnershipTransfer,
} from "@discordia/client-shared";

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
import {
  acceptOwnershipTransfer,
  cancelOwnershipTransfer,
  initiateOwnershipTransfer,
  listMembers,
  rejectOwnershipTransfer,
} from "../../api";
import { resolveImageUri } from "../../../../lib/image-url";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
import { Button } from "../../../../components/ui/Button";
import { ServerAvatar } from "../ServerAvatar";

interface TransferOwnershipModalProps {
  visible: boolean;
  serverId: string;
  serverName: string;
  isOwner: boolean;
  currentUserId: string | null;
  pendingTransfer: OwnershipTransfer | null;
  isLoadingPendingTransfer: boolean;
  onPendingTransferChange: (transfer: OwnershipTransfer | null) => void;
  onClose: () => void;
  onOwnershipAccepted: () => void;
}

type InitiateStep = "loading-members" | "members-error" | "form" | "confirm";

interface PickerMember {
  userId: string;
  name: string | null;
  avatarUrl: string | null;
}

export function TransferOwnershipModal({
  visible,
  serverId,
  serverName,
  isOwner,
  currentUserId,
  pendingTransfer,
  isLoadingPendingTransfer,
  onPendingTransferChange,
  onClose,
  onOwnershipAccepted,
}: TransferOwnershipModalProps) {
  const colors = useThemeColors();
  const [initiateStep, setInitiateStep] =
    useState<InitiateStep>("loading-members");
  const [members, setMembers] = useState<PickerMember[]>([]);
  const [membersError, setMembersError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [counterpartName, setCounterpartName] = useState<string | null>(null);
  const [wasVisible, setWasVisible] = useState(visible);

  const canInitiate = isOwner && pendingTransfer === null;
  const isIncoming =
    pendingTransfer !== null &&
    currentUserId !== null &&
    pendingTransfer.to_user_id === currentUserId;
  const isOutgoing =
    pendingTransfer !== null &&
    currentUserId !== null &&
    pendingTransfer.from_user_id === currentUserId;
  const counterpartUserId = isOutgoing
    ? pendingTransfer?.to_user_id
    : isIncoming
      ? pendingTransfer?.from_user_id
      : undefined;

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setInitiateStep("loading-members");
      setMembers([]);
      setMembersError("");
      setSelectedUserId(null);
      setErrorMessage("");
      setIsSubmitting(false);
      setCounterpartName(null);
    }
  }

  const fetchMembers = useCallback(() => {
    let cancelled = false;

    listMembers(serverId, { limit: MEMBER_PAGE_LIMIT }).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setMembersError(result.message);
        setInitiateStep("members-error");
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
      setInitiateStep("form");

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
    if (!visible || !canInitiate) return;
    return fetchMembers();
  }, [visible, canInitiate, fetchMembers]);

  const [resolvedCounterpartId, setResolvedCounterpartId] = useState<
    string | undefined
  >(counterpartUserId);
  if (counterpartUserId !== resolvedCounterpartId) {
    setResolvedCounterpartId(counterpartUserId);
    setCounterpartName(null);
  }

  useEffect(() => {
    if (!counterpartUserId) return;
    let cancelled = false;
    getPublicUser(counterpartUserId).then((profile) => {
      if (cancelled || !profile) return;
      setCounterpartName(profile.name);
    });
    return () => {
      cancelled = true;
    };
  }, [counterpartUserId]);

  function handleRetryMembers() {
    setInitiateStep("loading-members");
    setMembersError("");
    fetchMembers();
  }

  function handleContinue() {
    if (!selectedUserId) return;
    setErrorMessage("");
    setInitiateStep("confirm");
  }

  async function handleInitiate() {
    if (!selectedUserId) return;
    setErrorMessage("");
    setIsSubmitting(true);
    const result = await initiateOwnershipTransfer(serverId, selectedUserId);
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.fieldErrors?.to_user_id) {
        setInitiateStep("form");
        setErrorMessage(result.fieldErrors.to_user_id);
        return;
      }
      setErrorMessage(result.message);
      return;
    }

    onPendingTransferChange(result.transfer);
  }

  async function handleCancel() {
    if (!pendingTransfer) return;
    setIsSubmitting(true);
    setErrorMessage("");
    const result = await cancelOwnershipTransfer(serverId, pendingTransfer.id);
    setIsSubmitting(false);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }
    onPendingTransferChange(null);
  }

  async function handleAccept() {
    if (!pendingTransfer) return;
    setIsSubmitting(true);
    setErrorMessage("");
    const result = await acceptOwnershipTransfer(serverId, pendingTransfer.id);
    setIsSubmitting(false);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }
    onPendingTransferChange(null);
    onOwnershipAccepted();
  }

  async function handleReject() {
    if (!pendingTransfer) return;
    setIsSubmitting(true);
    setErrorMessage("");
    const result = await rejectOwnershipTransfer(serverId, pendingTransfer.id);
    setIsSubmitting(false);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }
    onPendingTransferChange(null);
    onClose();
  }

  const selectedMember =
    members.find((m) => m.userId === selectedUserId) ?? null;
  const selectedDisplayName = selectedMember?.name ?? selectedUserId ?? "";

  const errorBanner = errorMessage ? (
    <View className="flex-row items-start gap-2.5 rounded-xl border border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)] px-3.5 py-3 mb-4">
      <Feather name="alert-circle" size={15} color={colors.danger} />
      <Text className="flex-1 text-danger text-[13px] leading-[18px]">
        {errorMessage}
      </Text>
    </View>
  ) : null;

  function renderContent() {
    if (isLoadingPendingTransfer) {
      return (
        <View className="p-7 pt-8 items-center justify-center gap-3.5">
          <ActivityIndicator size="small" color={colors.textSubtle} />
        </View>
      );
    }

    if (pendingTransfer && isIncoming) {
      return (
        <ScrollView
          contentContainerClassName="p-7 pt-8"
          showsVerticalScrollIndicator={false}
        >
          {errorBanner}
          <View className="items-center justify-center gap-3.5">
            <View className="w-15 h-15 rounded-[18px] items-center justify-center bg-[rgba(252,227,164,0.12)] mb-1">
              <Feather name="award" size={26} color={colors.highlight} />
            </View>
            <Text className="text-[13px] leading-[19px] text-content-muted text-center">
              <Text className="text-content font-bold">
                {counterpartName ?? pendingTransfer.from_user_id}
              </Text>{" "}
              quiere transferirte la propiedad de{" "}
              <Text className="text-content font-bold">{serverName}</Text>. Si
              aceptás, pasás a ser el nuevo propietario.
            </Text>
            <View className="flex-row gap-3 w-full mt-2">
              <Button
                title="Rechazar"
                variant="secondary"
                onPress={handleReject}
                disabled={isSubmitting}
                style={{ flex: 1, width: undefined }}
              />
              <Button
                title="Aceptar"
                onPress={handleAccept}
                isLoading={isSubmitting}
                style={{ flex: 1, width: undefined }}
              />
            </View>
          </View>
        </ScrollView>
      );
    }

    if (pendingTransfer && isOutgoing) {
      return (
        <ScrollView
          contentContainerClassName="p-7 pt-8"
          showsVerticalScrollIndicator={false}
        >
          {errorBanner}
          <View className="items-center justify-center gap-3.5">
            <View className="w-15 h-15 rounded-[18px] items-center justify-center bg-[rgba(107,149,189,0.15)] mb-1">
              <Feather name="repeat" size={26} color={colors.info} />
            </View>
            <Text className="text-[13px] leading-[19px] text-content-muted text-center">
              Le ofreciste la propiedad de{" "}
              <Text className="text-content font-bold">{serverName}</Text> a{" "}
              <Text className="text-content font-bold">
                {counterpartName ?? pendingTransfer.to_user_id}
              </Text>
              . Todavía no respondió: podés cancelar la transferencia mientras
              esté pendiente.
            </Text>
            <TouchableOpacity
              onPress={handleCancel}
              disabled={isSubmitting}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text className="text-danger text-[13px] font-bold">
                {isSubmitting ? "Cancelando..." : "Cancelar transferencia"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    if (pendingTransfer) {
      // Otro miembro (ni el owner ni el destinatario) mirando el estado.
      return (
        <View className="p-7 pt-8">
          <Text className="text-[13px] leading-[19px] text-content-muted text-center">
            Hay una transferencia de propiedad pendiente para este servidor.
          </Text>
        </View>
      );
    }

    if (!isOwner) {
      return (
        <View className="p-7 pt-8">
          <Text className="text-[13px] leading-[19px] text-content-muted text-center">
            No hay ninguna transferencia de propiedad pendiente.
          </Text>
        </View>
      );
    }

    if (initiateStep === "loading-members") {
      return (
        <View className="p-7 pt-8 items-center justify-center gap-3.5">
          <ActivityIndicator size="small" color={colors.textSubtle} />
          <Text className="text-[13px] leading-[19px] text-content-muted text-center">
            Cargando miembros...
          </Text>
        </View>
      );
    }

    if (initiateStep === "members-error") {
      return (
        <View className="p-7 pt-8">
          <View className="flex-row items-start gap-2.5 rounded-xl border border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)] px-3.5 py-3 mb-4">
            <Feather name="alert-circle" size={15} color={colors.danger} />
            <Text className="flex-1 text-danger text-[13px] leading-[18px]">
              {membersError}
            </Text>
          </View>
          <Button title="Reintentar" onPress={handleRetryMembers} />
        </View>
      );
    }

    if (initiateStep === "form") {
      return (
        <View className="flex-1">
          {errorMessage ? <View className="px-7">{errorBanner}</View> : null}
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
              <Feather name="users" size={22} color={colors.textSubtle} />
              <Text className="text-[13px] leading-[18px] text-content-subtle text-center">
                Todavía no hay otros miembros en este servidor. Invitá gente
                antes de transferir la propiedad.
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
        </View>
      );
    }

    // initiateStep === "confirm"
    return (
      <ScrollView
        contentContainerClassName="p-7 pt-8"
        showsVerticalScrollIndicator={false}
      >
        {errorBanner}
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
            <Text className="font-bold text-highlight">{serverName}</Text> no
            cambia hasta que la otra persona acepte la oferta. Vas a poder
            cancelarla mientras siga pendiente.
          </Text>
        </View>

        <View className="flex-row gap-3 mt-4 pt-5 border-t border-t-line">
          <Button
            title="Volver"
            variant="secondary"
            onPress={() => {
              setInitiateStep("form");
              setErrorMessage("");
            }}
            disabled={isSubmitting}
            style={{ flex: 1, width: undefined }}
          />
          <Button
            title="Enviar solicitud"
            onPress={handleInitiate}
            isLoading={isSubmitting}
            style={{ flex: 1, width: undefined }}
          />
        </View>
      </ScrollView>
    );
  }

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

          <View className="p-7 pt-8 pb-0">
            <View className="flex-row items-center gap-3 mb-5 pr-6">
              <View className="w-9 h-9 rounded-xl items-center justify-center bg-[rgba(107,149,189,0.15)]">
                <Feather name="shield" size={17} color={colors.info} />
              </View>
              <View className="flex-1">
                <Text className="text-[17px] font-bold text-content">
                  {isIncoming
                    ? "Transferencia de propiedad"
                    : "Transferir propiedad"}
                </Text>
                <Text
                  className="text-[12px] text-content-subtle mt-0.5"
                  numberOfLines={1}
                >
                  {serverName}
                </Text>
              </View>
            </View>
          </View>

          {renderContent()}
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
