import { createContext, useContext } from "react";
import {
  type EdgeInsets,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export const DeviceInsetsContext = createContext<EdgeInsets | null>(null);

export function useModalInsets(): EdgeInsets {
  const deviceInsets = useContext(DeviceInsetsContext);
  const insets = useSafeAreaInsets();
  return deviceInsets ?? insets;
}
