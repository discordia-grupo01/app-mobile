import {
  type ActivityStatusChoice,
  CUSTOM_STATUS_PLACEHOLDER,
  DESCRIPTION_PLACEHOLDER,
  MAX_CUSTOM_STATUS,
  MAX_DESCRIPTION,
  NO_DESCRIPTION_YET,
} from "@discordia/client-shared";

import { Fragment, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { ModalShell } from "../../../components/ui/ModalShell";
import { useAuth } from "../../auth/auth-context";
import { useOwnStatus } from "../../presence/PresenceContext";
import { MemberRoleBadges } from "../../roles/components/MemberRoleBadges";
import { clearStatus, updateOwnProfile, updateStatus } from "../service";
import type { PickedProfileImage } from "../types";
import { useRevealOnKeyboard } from "../useRevealOnKeyboard";
import { ActivityStatusRow } from "./ActivityStatusRow";
import { EditableTextSection } from "./EditableTextSection";
import { MemberSince } from "./MemberSince";
import { OwnAvatarPicker } from "./OwnAvatarPicker";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileNameField } from "./ProfileNameField";

interface OwnProfileModalProps {
  visible: boolean;
  serverId?: string | null;
  onClose: () => void;
}

export function OwnProfileModal({
  visible,
  serverId,
  onClose,
}: OwnProfileModalProps) {
  const { user, updateUser } = useAuth();
  const [wasVisible, setWasVisible] = useState(visible);
  const [openCount, setOpenCount] = useState(0);
  const { scrollViewRef, onSectionLayout, reveal } = useRevealOnKeyboard<
    "status" | "description"
  >();

  const { choice: ownChoice, setOwnStatus } = useOwnStatus();
  const [statusError, setStatusError] = useState("");

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setOpenCount((count) => count + 1);
      setStatusError("");
    }
  }

  if (!user) return null;

  async function changeActivityStatus(choice: ActivityStatusChoice) {
    setStatusError("");
    const result = await setOwnStatus(choice);
    if (!result.ok) setStatusError(result.message);
  }

  async function submitProfile(overrides: {
    name?: string;
    description?: string;
    image?: PickedProfileImage;
    removeImage?: boolean;
  }): Promise<string | null> {
    if (!user) return null;
    const result = await updateOwnProfile({
      name: overrides.name ?? user.name,
      description: overrides.description ?? user.description,
      image: overrides.image,
      removeImage: overrides.removeImage,
    });
    if (!result.ok) return result.message;
    updateUser(result.user);
    return null;
  }

  async function saveName(draft: string): Promise<string | null> {
    const name = draft.trim();
    if (!name) return "Ingresá tu nombre.";
    return submitProfile({ name });
  }

  function saveDescription(description: string): Promise<string | null> {
    return submitProfile({ description });
  }

  function uploadAvatar(image: PickedProfileImage): Promise<string | null> {
    return submitProfile({ image });
  }

  function removeAvatar(): Promise<string | null> {
    return submitProfile({ removeImage: true });
  }

  async function saveCustomStatus(draft: string): Promise<string | null> {
    const text = draft.trim();
    if (!text) return user?.status_text ? clearCustomStatus() : null;
    const result = await updateStatus(text);
    if (!result.ok) return result.message;
    updateUser(result.user);
    return null;
  }

  async function clearCustomStatus(): Promise<string | null> {
    if (!user) return null;
    const result = await clearStatus(user);
    if (!result.ok) return result.message;
    updateUser(result.user);
    return null;
  }

  return (
    <ModalShell visible={visible} onClose={onClose} className="max-w-100">
      <Fragment key={openCount}>
        <ProfileBanner onClose={onClose} />

        <ScrollView
          ref={scrollViewRef}
          contentContainerClassName="px-5.5 pt-17 pb-6.5"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-4">
            <ProfileNameField
              name={user.name}
              isPremium={user.premium}
              onSave={saveName}
            />
            <Text className="text-[12px] text-content-subtle mt-1">
              {user.email}
            </Text>
          </View>

          <View className="mb-4">
            <ActivityStatusRow
              status={ownChoice}
              error={statusError}
              onChange={changeActivityStatus}
            />
          </View>

          <View className="mb-4" onLayout={onSectionLayout("status")}>
            <EditableTextSection
              label="Estado personalizado"
              value={user.status_text}
              emptyText="Todavía no agregaste un estado personalizado."
              editLabel="Editar estado personalizado"
              maxLength={MAX_CUSTOM_STATUS}
              placeholder={CUSTOM_STATUS_PLACEHOLDER}
              onSave={saveCustomStatus}
              onStartEditing={() => reveal("status")}
            />
          </View>

          <View className="h-px bg-line mb-4" />

          <View className="mb-4" onLayout={onSectionLayout("description")}>
            <EditableTextSection
              label="Sobre mí"
              value={user.description}
              emptyText={NO_DESCRIPTION_YET}
              editLabel="Editar descripción"
              maxLength={MAX_DESCRIPTION}
              placeholder={DESCRIPTION_PLACEHOLDER}
              multiline
              onSave={saveDescription}
              onStartEditing={() => reveal("description")}
            />
          </View>

          <View className="mb-4">
            <MemberSince isoDate={user.created_at} />
          </View>

          {serverId ? (
            <View className="mb-4">
              <MemberRoleBadges
                serverId={serverId}
                userId={user.id}
                canManage={false}
              />
            </View>
          ) : null}
        </ScrollView>

        <OwnAvatarPicker
          user={user}
          onUpload={uploadAvatar}
          onRemove={removeAvatar}
        />
      </Fragment>
    </ModalShell>
  );
}
