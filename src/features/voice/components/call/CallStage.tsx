import { useCallback, useEffect, useRef, type ComponentRef } from "react";
import { View } from "react-native";

import { useVoiceSession } from "../../voice-session-context";

interface CallStageProps {
  isCovered: boolean;
}

export function CallStage({ isCovered }: CallStageProps) {
  const { setCallStage } = useVoiceSession();
  const stageRef = useRef<ComponentRef<typeof View>>(null);

  const measure = useCallback(() => {
    if (isCovered) return;
    stageRef.current?.measureInWindow((x, y, width, height) => {
      setCallStage(width > 0 && height > 0 ? { x, y, width, height } : null);
    });
  }, [isCovered, setCallStage]);

  useEffect(() => {
    if (isCovered) setCallStage(null);
    else measure();
  }, [isCovered, measure, setCallStage]);

  useEffect(() => () => setCallStage(null), [setCallStage]);

  return <View ref={stageRef} className="flex-1" onLayout={measure} />;
}
