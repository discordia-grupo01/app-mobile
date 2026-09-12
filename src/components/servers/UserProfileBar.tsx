import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getThemePreference,
  setThemePreference,
  type ThemePreference,
} from "../../lib/storage";
import { colors } from "../../theme/colors";
import { Button } from "../ui/Button";
import { AppearanceSheet } from "./AppearanceSheet";

interface UserProfileBarProps {
  userName?: string | null;
  onLogout: () => void;
}

export function UserProfileBar({ userName, onLogout }: UserProfileBarProps) {
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isAppearanceVisible, setIsAppearanceVisible] = useState(false);
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("dark");
  const displayName = userName?.trim() || "Mi cuenta";
  const initial = displayName.charAt(0).toUpperCase() || "?";

  useEffect(() => {
    let cancelled = false;
    getThemePreference().then((preference) => {
      if (!cancelled) setThemePreferenceState(preference);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleConfirmLogout() {
    setIsConfirmVisible(false);
    onLogout();
  }

  async function handleSelectTheme(preference: ThemePreference) {
    setThemePreferenceState(preference);
    await setThemePreference(preference);
  }

  return (
    <>
      <View style={styles.profileBar}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
          <View style={styles.statusDot} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.status}>En línea</Text>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setIsAppearanceVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Apariencia"
        >
          <Feather name="settings" size={21} color={colors.textSubtle} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setIsConfirmVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
        >
          <Feather name="log-out" size={21} color={colors.textSubtle} />
        </TouchableOpacity>
      </View>

      <AppearanceSheet
        visible={isAppearanceVisible}
        selected={themePreference}
        onSelect={handleSelectTheme}
        onClose={() => setIsAppearanceVisible(false)}
      />

      {/*
        Antes esto era un Alert.alert nativo: en Android se ve como un
        dialogo blanco del sistema, totalmente fuera del tema oscuro de la
        app. Este modal reusa el mismo patron (backdrop + card) que
        CreateServerModal/JoinServerModal para que el flujo de cerrar
        sesion se sienta parte de Discordia y no del sistema operativo.
      */}
      <Modal
        transparent
        visible={isConfirmVisible}
        animationType="fade"
        onRequestClose={() => setIsConfirmVisible(false)}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsConfirmVisible(false)}
          />

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardCloseButton}
              onPress={() => setIsConfirmVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
            >
              <Feather name="x" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.cardIcon}>
              <Feather name="log-out" size={26} color={colors.danger} />
            </View>
            <Text style={styles.cardTitle}>¿Cerrar sesión?</Text>
            <Text style={styles.cardSubtitle}>
              Vas a salir de tu cuenta. Podés volver a iniciar sesión cuando
              quieras.
            </Text>

            <View style={styles.footer}>
              <Button
                title="Cerrar sesión"
                variant="danger"
                onPress={handleConfirmLogout}
              />
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => setIsConfirmVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  profileBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgUserPanel,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },
  statusDot: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.bgUserPanel,
  },
  textWrap: {
    flex: 1,
    marginRight: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  status: {
    fontSize: 13,
    color: colors.textSubtle,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgModal,
    padding: 28,
    paddingTop: 24,
    alignItems: "center",
  },
  cardCloseButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(224,82,82,0.14)",
    marginTop: 8,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 26,
  },
  footer: {
    flexDirection: "column",
    gap: 10,
    width: "100%",
  },
});
