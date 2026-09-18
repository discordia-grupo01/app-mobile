import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { colors } from "../../../theme/colors";
import { styles } from "../styles";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <View style={styles.fieldErrorRow}>
      <Feather name="alert-circle" size={13} color={colors.danger} />
      <Text style={styles.fieldErrorText}>{message}</Text>
    </View>
  );
}
