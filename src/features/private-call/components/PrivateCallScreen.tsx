import { type ReactNode, useEffect } from "react";
import { BackHandler, Modal, StyleSheet, View } from "react-native";

import { avatarUriOf } from "../../../lib/userProfile";
import { useAuth } from "../../auth/auth-context";
import { useOptionalPrivateCall } from "../private-call-context";
import { PrivateCallPanel } from "./PrivateCallPanel";

const noop = () => undefined;

export function PrivateCallScreen() {
  const privateCall = useOptionalPrivateCall();
  const { user } = useAuth();

  const phase = privateCall?.state.phase ?? "idle";
  const partner = privateCall?.state.partner;
  if (!privateCall || phase === "idle" || !partner || !user) return null;

  const isInRoom = phase === "connecting" || phase === "in_call";
  const content = (
    <PrivateCallPanel
      phase={phase}
      partner={partner}
      me={{ name: user.name, avatarUrl: avatarUriOf(user) }}
    />
  );

  if (!isInRoom) {
    return (
      <Modal
        visible
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={noop}
      >
        {content}
      </Modal>
    );
  }

  return (
    <InRoomLayer
      isVisible={!privateCall.isMinimized}
      onBack={privateCall.minimize}
    >
      {content}
    </InRoomLayer>
  );
}

/**
 * En llamada no puede ser un `Modal`: en Android es otra ventana y taparia al
 * WebView que dibuja los videos (vive una sola vez en `VoiceSessionProvider`,
 * que lo pinta encima de sus hijos, donde marque `CallStage`).
 */
function InRoomLayer({
  isVisible,
  onBack,
  children,
}: {
  isVisible: boolean;
  onBack: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!isVisible) return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onBack();
        return true;
      },
    );
    return () => subscription.remove();
  }, [isVisible, onBack]);

  if (!isVisible) return null;
  return <View style={StyleSheet.absoluteFill}>{children}</View>;
}
