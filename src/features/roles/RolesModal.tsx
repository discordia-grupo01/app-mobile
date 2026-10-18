import { outranksRole, type Role } from "@discordia/client-shared";

import { useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ModalShell } from "../../components/ui/ModalShell";

import {
  RoleDetailTabs,
  RolesModalHeader,
} from "./components/RolesModalChrome";
import { CreateRolePermissionsStep } from "./components/create/CreateRolePermissionsStep";
import { CreateRoleStep } from "./components/create/CreateRoleStep";
import { useCreateRoleForm } from "./components/create/useCreateRoleForm";
import { EditRoleStep } from "./components/edit/EditRoleStep";
import { RoleListStep } from "./components/list/RoleListStep";
import { useRolesList } from "./components/list/useRolesList";
import { RoleMembersStep } from "./components/members/RoleMembersStep";
import { useRoleMembers } from "./components/members/useRoleMembers";
import { type Step } from "./constants";
import { useToast } from "./useToast";

interface RolesModalProps {
  visible: boolean;
  serverId: string;
  serverName: string;
  /** Rango jerárquico del usuario actual (#56): decide qué roles puede arrastrar. */
  isOwner: boolean;
  myRoles: Role[];
  onClose: () => void;
}

export function RolesModal({
  visible,
  serverId,
  serverName,
  isOwner,
  myRoles,
  onClose,
}: RolesModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [step, setStep] = useState<Step>("list");
  const [selectedId, setSelectedId] = useState("");
  const [defaultRoleId, setDefaultRoleId] = useState<string | null>(null);
  const [isRoleDragActive, setIsRoleDragActive] = useState(false);

  const { toast, showToast, clearToast } = useToast();
  const rolesList = useRolesList(serverId, visible);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setStep("list");
      setSelectedId("");
      setDefaultRoleId(null);
      clearToast();
    }
  }

  const selectedRole = (rolesList.roles ?? []).find(
    (role) => role.id === selectedId,
  );
  const isEveryoneSelected = selectedRole?.is_everyone ?? false;
  const hierarchyCtx = { isOwner, roles: myRoles };
  const canManageSelected = selectedRole
    ? outranksRole(hierarchyCtx, selectedRole.position)
    : false;
  const canManageRole = (position: number) =>
    outranksRole(hierarchyCtx, position);

  function openRoleForEdit(role: Role) {
    setSelectedId(role.id);
    setStep("edit");
  }

  const membersHook = useRoleMembers(selectedRole);
  const createForm = useCreateRoleForm(serverId, {
    roles: rolesList.roles,
    everyoneRole: rolesList.everyoneRole,
    onContinueToPermissions: () => setStep("create-permissions"),
    onReturnToNameStep: () => setStep("create"),
    onCreated: (role) => {
      rolesList.appendRoleToList(role);
      openRoleForEdit(role);
    },
    onToast: showToast,
  });

  function openCreateForm() {
    createForm.resetForCreate();
    setStep("create");
  }

  function goBack() {
    if (step === "create-permissions") {
      setStep("create");
      return;
    }
    setStep("list");
  }

  function goToTab(tab: "edit" | "members") {
    setStep(tab);
  }

  async function handleReorder(orderedIds: string[]) {
    const result = await rolesList.reorder(orderedIds);
    if (!result.ok) showToast(result.message);
  }

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      className="max-w-120"
      style={{ maxHeight: windowHeight - insets.top - insets.bottom - 48 }}
      floating={
        toast ? (
          <View
            className="absolute left-6 right-6 flex-row items-center gap-2.5 self-center max-w-105 rounded-[14px] border border-line-strong bg-surface-raised px-4 py-3"
            style={{ bottom: insets.bottom + 24 }}
          >
            <View className="w-2 h-2 rounded-sm bg-accent-strong" />
            <Text
              className="flex-1 text-[13px] font-semibold text-content"
              numberOfLines={2}
            >
              {toast}
            </Text>
          </View>
        ) : null
      }
    >
      <RolesModalHeader
        step={step}
        roleName={selectedRole?.name}
        onBack={goBack}
        onClose={onClose}
      />

      {(step === "edit" || step === "members") && selectedRole ? (
        <RoleDetailTabs
          activeTab={step === "members" ? "members" : "edit"}
          onChange={goToTab}
        />
      ) : null}

      {step === "list" ? (
        <RoleListStep
          serverName={serverName}
          isLoading={rolesList.isLoading}
          loadError={rolesList.loadError}
          sortedRoles={rolesList.sortedRoles}
          draggableRoles={rolesList.draggableRoles}
          everyoneRole={rolesList.everyoneRole}
          defaultRoleId={defaultRoleId}
          canManageRole={canManageRole}
          isRoleDragActive={isRoleDragActive}
          onDragActiveChange={setIsRoleDragActive}
          onReorder={handleReorder}
          onCreateRole={openCreateForm}
          onSelectRole={openRoleForEdit}
        />
      ) : null}

      {step === "create" ? (
        <CreateRoleStep
          newName={createForm.newName}
          newColor={createForm.newColor}
          newNameError={createForm.newNameError}
          newColorError={createForm.newColorError}
          onNameChange={createForm.handleNewNameChange}
          onColorChange={createForm.handleNewColorChange}
          onContinue={createForm.handleContinueToPermissions}
          onCancel={() => setStep("list")}
        />
      ) : null}

      {step === "create-permissions" ? (
        <CreateRolePermissionsStep
          newName={createForm.newName}
          newColor={createForm.newColor}
          newPerms={createForm.newPerms}
          creating={createForm.creating}
          onTogglePerm={createForm.handleToggleNewPerm}
          onBack={() => setStep("create")}
          onSubmit={createForm.handleCreate}
        />
      ) : null}

      {step === "edit" && selectedRole ? (
        <EditRoleStep
          key={selectedRole.id}
          role={selectedRole}
          roles={rolesList.roles}
          serverId={serverId}
          canManage={canManageSelected}
          isEveryoneSelected={isEveryoneSelected}
          isDefaultRole={selectedRole.id === defaultRoleId}
          memberCount={membersHook.memberCount}
          onSaved={rolesList.updateRoleInList}
          onDeleted={() => {
            rolesList.removeRoleFromList(selectedRole.id);
            setSelectedId("");
            setStep("list");
          }}
          onDefaultChanged={setDefaultRoleId}
          onToast={showToast}
        />
      ) : null}

      {step === "members" && selectedRole ? (
        <RoleMembersStep
          key={selectedRole.id}
          serverId={serverId}
          roleId={selectedRole.id}
          isEveryoneSelected={isEveryoneSelected}
          onMembershipChange={membersHook.handleMembershipChange}
          onToast={showToast}
        />
      ) : null}
    </ModalShell>
  );
}
