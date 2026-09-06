import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

import { APP_NAME } from "./src/lib/constants";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>{APP_NAME} - App Mobile</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
