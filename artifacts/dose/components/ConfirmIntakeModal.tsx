import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

type ConfirmIntakeModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDark?: boolean;
};

export default function ConfirmIntakeModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDark = false,
}: ConfirmIntakeModalProps) {
  // Helper to detect Arabic text
  const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface }]}> 
          <Text style={[styles.title, { color: isDark ? "#fff" : "#222" }, isArabic(title) && { fontFamily: "Tajawal_700Bold" }]}>{title}</Text>
          <Text style={[styles.message, { color: isDark ? "#ccc" : "#444" }, isArabic(message) && { fontFamily: "Tajawal_400Regular" }]}>{message}</Text>
          <View style={styles.actions}>
            <Pressable style={[styles.button, { backgroundColor: isDark ? '#444' : '#eee' }]} onPress={onClose}>
              <Text style={[styles.buttonText, { color: isDark ? "#fff" : "#222" }, isArabic(cancelText) && { fontFamily: "Tajawal_500Medium" }]}>{cancelText}</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.confirm]} onPress={onConfirm}>
              <Text style={[styles.buttonText, { color: "#000" }, isArabic(confirmText) && { fontFamily: "Tajawal_500Medium" }]}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: 320,
    borderRadius: 38,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: "Tajawal_700Bold",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    fontFamily: "Tajawal_400Regular",
    marginBottom: 24,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 42,
    borderRadius: 20,
    fontFamily: "Tajawal_500Medium",
  },
  cancel: {
    backgroundColor: "#eee",
  },
  confirm: {
    backgroundColor: "#00ffaa",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Tajawal_500Medium",
  },
});
