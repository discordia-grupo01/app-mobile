import { outranksRole, type Role } from "@discordia/client-shared";

import { type ReactNode, useState } from "react";
import { View } from "react-native";

import { RoleDetailTabs, roleStepTitle } from "./components/RolesModalChrome";
import { CreateRolePermissionsStep } from "./components/create/CreateRolePermissionsStep";
import { CreateRoleStep } from "./components/create/CreateRoleStep";
import { useCreateRoleForm } from "./components/create/useCreateRoleForm";
import { EditRoleStep } from "./components/edit/EditRoleStep";
import { RoleListStep } from "./components/list/RoleListStep";
import { useRolesList } from "./components/list/useRolesList";
import { RoleMembersStep } from "./components/members/RoleMembersStep";
import { useRoleMembers } from "./components/members/useRoleMembers";
import { type Step } from "./constants";
import { Toast } from "../../components/ui/Toast";
import { useToast } from "../../hooks/useToast";

export interface RolesHeaderInfo {
  step: Step;
  title: string;
  /** Vuelve un nivel. En la lista es `onExit`, si quien lo monta tiene adónde volver. */
  onBack: (() => void) | undefined;
}

interface RolesPanelProps {
  serverId: string;
  serverName: string;
  isOwner: boolean;
  myRoles: Role[];
  renderHeader: (info: RolesHeaderInfo) => ReactNode;
  /** Desde la lista: en configuración vuelve al menú; en el modal suelto no hay. */
  onExit?: () => void;
}

export function RolesPanel({
  serverId,
  isOwner,
  myRoles,
  renderHeader,
  onExit,
}: RolesPanelProps) {
  const [step, setStep] = useState<Step>("list");
  const [selectedId, setSelectedId] = useState("");
  const [defaultRoleId, setDefaultRoleId] = useState<string | null>(null);
  const [isRoleDragActive, setIsRoleDragActive] = useState(false);

  const { toast, showToast } = useToast();
  const rolesList = useRolesList(serverId, true);

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

  const membersHook = useRoleMembers(rolesList.roles, selectedId);
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
    setStep(step === "create-permissions" ? "create" : "list");
  }

  async function handleReorder(orderedIds: string[]) {
    const result = await rolesList.reorder(orderedIds);
    if (!result.ok) showToast(result.message);
  }

  return (
    <View className="min-h-0 shrink">
      {renderHeader({
        step,
        title: roleStepTitle(step, selectedRole?.name),
        onBack: step === "list" ? onExit : goBack,
      })}

      {(step === "edit" || step === "members") && selectedRole ? (
        <RoleDetailTabs
          activeTab={step === "members" ? "members" : "edit"}
          onChange={setStep}
        />
      ) : null}

      {step === "list" ? (
        <RoleListStep
          isLoading={rolesList.isLoading}
          loadError={rolesList.loadError}
          sortedRoles={rolesList.sortedRoles}
          draggableRoles={rolesList.draggableRoles}
          everyoneRole={rolesList.everyoneRole}
          defaultRoleId={defaultRoleId}
          memberCounts={membersHook.counts}
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

      <Toast message={toast} />
    </View>
  );
}
