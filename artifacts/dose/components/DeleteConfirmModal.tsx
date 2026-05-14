import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

interface DeleteConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  title: string;
  message: string;
  deleteText?: string;
  cancelText?: string;
  isDark?: boolean;
}

export default function DeleteConfirmModal({
  visible,
  onClose,
  onDelete,
  title,
  message,
  deleteText = "Delete",
  cancelText = "Cancel",
  isDark = false,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface }]}> 
          <Text style={[styles.title, { color: isDark ? "#fff" : "#222", fontFamily: "Tajawal_700Bold" }]}>{title}</Text>
          <Text style={[styles.message, { color: isDark ? "#ccc" : "#444", fontFamily: "Tajawal_400Regular" }]}>{message}</Text>
          <View style={styles.actions}>
            <Pressable style={[styles.button, { backgroundColor: isDark ? '#444' : '#eee' }]} onPress={onClose}>
              <Text style={[styles.buttonText, { color: isDark ? "#fff" : "#222", fontFamily: "Tajawal_500Medium" }]}>{cancelText}</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.delete]} onPress={onDelete}>
              <Text style={[styles.buttonText, { color: "#fff", fontFamily: "Tajawal_500Medium" }]}>{deleteText}</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.35)",
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
  },
  cancel: {
    backgroundColor: "#eee",
  },
  delete: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Tajawal_500Medium",
  },
});
