import { type Category, type Channel } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { createChannel } from "../../api";
import { colors } from "../../../../theme/colors";
import { Button } from "../../../../components/ui/Button";

const MAX_NAME = 100;

interface CreateChannelModalProps {
  visible: boolean;
  serverId: string;
  categories: Category[];
  defaultCategoryId?: string | null;
  onClose: () => void;
  onCreated: (channel: Channel) => void;
}

export function CreateChannelModal({
  visible,
  serverId,
  categories,
  defaultCategoryId = null,
  onClose,
  onCreated,
}: CreateChannelModalProps) {
  const [kind, setKind] = useState<"text" | "voice">("text");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId ?? "");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [nameError, setNameError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setKind("text");
      setName("");
      setCategoryId(defaultCategoryId ?? "");
      setIsCategoryDropdownOpen(false);
      setNameError("");
      setGlobalError("");
      setIsSubmitting(false);
    }
  }

  const trimmed = name.trim();
  const selectedCategoryName =
    categories.find((category) => category.id === categoryId)?.name ??
    "Sin categoría";

  function handleSelectCategory(id: string) {
    setCategoryId(id);
    setIsCategoryDropdownOpen(false);
  }

  async function handleSubmit() {
    setNameError("");
    setGlobalError("");

    if (!trimmed) {
      setNameError("Ingresá un nombre para el canal.");
      return;
    }

    setIsSubmitting(true);
    const result = await createChannel(serverId, {
      name: trimmed,
      kind,
      categoryId: categoryId || undefined,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.fieldErrors?.name) setNameError(result.fieldErrors.name);
      if (!result.fieldErrors) setGlobalError(result.message);
      return;
    }

    onCreated(result.channel);
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.card}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Feather name="x" size={13} color={colors.textSubtle} />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Crear Canal</Text>
              <Text style={styles.headerSubtitle}>
                Agrega un canal de texto o voz al servidor.
              </Text>
            </View>

            {globalError ? (
              <View style={styles.errorBanner}>
                <Feather name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorBannerText}>{globalError}</Text>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>TIPO DE CANAL</Text>
              <View style={styles.kindRow}>
                <TouchableOpacity
                  onPress={() => setKind("text")}
                  style={[
                    styles.kindOption,
                    kind === "text" ? styles.kindOptionActive : null,
                  ]}
                  accessibilityRole="button"
                >
                  <View style={styles.kindOptionHeader}>
                    <Feather name="hash" size={16} color={colors.textMuted} />
                    <Text style={styles.kindOptionTitle}>Texto</Text>
                  </View>
                  <Text style={styles.kindOptionSubtitle}>
                    Para mensajes y links
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setKind("voice")}
                  style={[
                    styles.kindOption,
                    kind === "voice" ? styles.kindOptionActive : null,
                  ]}
                  accessibilityRole="button"
                >
                  <View style={styles.kindOptionHeader}>
                    <Feather
                      name="volume-2"
                      size={16}
                      color={colors.textMuted}
                    />
                    <Text style={styles.kindOptionTitle}>Voz</Text>
                  </View>
                  <Text style={styles.kindOptionSubtitle}>
                    Para charlar en tiempo real
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>NOMBRE DEL CANAL</Text>
              <View
                style={[styles.input, nameError ? styles.inputError : null]}
              >
                <Text style={styles.inputHash}>#</Text>
                <TextInput
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setNameError("");
                    setGlobalError("");
                  }}
                  placeholder="mi-nuevo-canal"
                  placeholderTextColor={colors.textSubtle}
                  maxLength={MAX_NAME + 10}
                  autoFocus
                  autoCapitalize="none"
                  style={styles.inputText}
                />
              </View>
              {nameError ? (
                <View style={styles.fieldErrorRow}>
                  <Feather
                    name="alert-circle"
                    size={13}
                    color={colors.danger}
                  />
                  <Text style={styles.fieldErrorText}>{nameError}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>CATEGORÍA</Text>
              <TouchableOpacity
                onPress={() => setIsCategoryDropdownOpen((prev) => !prev)}
                style={[
                  styles.categorySelect,
                  isCategoryDropdownOpen ? styles.categorySelectActive : null,
                ]}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Elegir categoría"
              >
                <Text style={styles.categorySelectText} numberOfLines={1}>
                  {selectedCategoryName}
                </Text>
                <Feather
                  name={isCategoryDropdownOpen ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.textSubtle}
                />
              </TouchableOpacity>

              {isCategoryDropdownOpen ? (
                <View style={styles.categoryDropdown}>
                  <TouchableOpacity
                    onPress={() => handleSelectCategory("")}
                    style={styles.categoryDropdownOption}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        styles.categoryDropdownOptionText,
                        categoryId === ""
                          ? styles.categoryDropdownOptionTextActive
                          : null,
                      ]}
                      numberOfLines={1}
                    >
                      Sin categoría
                    </Text>
                    {categoryId === "" ? (
                      <Feather
                        name="check"
                        size={16}
                        color={colors.accentBright}
                      />
                    ) : null}
                  </TouchableOpacity>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => handleSelectCategory(category.id)}
                      style={styles.categoryDropdownOption}
                      accessibilityRole="button"
                    >
                      <Text
                        style={[
                          styles.categoryDropdownOptionText,
                          categoryId === category.id
                            ? styles.categoryDropdownOptionTextActive
                            : null,
                        ]}
                        numberOfLines={1}
                      >
                        {category.name}
                      </Text>
                      {categoryId === category.id ? (
                        <Feather
                          name="check"
                          size={16}
                          color={colors.accentBright}
                        />
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={styles.footer}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={onClose}
                style={{ flex: 1, width: undefined }}
              />
              <Button
                title="Crear Canal"
                onPress={handleSubmit}
                disabled={!trimmed}
                isLoading={isSubmitting}
                style={{ flex: 1, width: undefined }}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "90%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgModal,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollContent: {
    padding: 28,
    paddingTop: 32,
  },
  header: {
    marginBottom: 20,
    paddingRight: 24,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: 4,
    lineHeight: 17,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(224,82,82,0.3)",
    backgroundColor: "rgba(224,82,82,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    flex: 1,
    color: colors.danger,
    fontSize: 13,
  },
  field: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: colors.textSubtle,
    marginBottom: 8,
  },
  kindRow: {
    flexDirection: "row",
    gap: 8,
  },
  kindOption: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  kindOptionActive: {
    borderColor: colors.accentBright,
    backgroundColor: "rgba(45,122,140,0.12)",
  },
  kindOptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  kindOptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  kindOptionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textSubtle,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputHash: {
    color: colors.textSubtle,
    fontSize: 14,
  },
  inputText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  fieldErrorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  fieldErrorText: {
    color: colors.danger,
    fontSize: 12,
  },
  categorySelect: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  categorySelectActive: {
    borderColor: colors.accentBright,
  },
  categorySelectText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  categoryDropdown: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgModal,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  categoryDropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  categoryDropdownOptionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  categoryDropdownOptionTextActive: {
    color: colors.accentBright,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
