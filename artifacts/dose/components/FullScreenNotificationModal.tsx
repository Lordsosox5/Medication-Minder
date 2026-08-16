import React from "react";
import { View, Text, StyleSheet, Modal, Pressable, useColorScheme } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface Props {
  visible: boolean;
  title: string;
  body: string;
  locale: "en" | "ar";
  confirmLabel: string;
  delayLabel: string;
  dismissLabel: string;
  onConfirm: () => void;
  onDelay: () => void;
  onDismiss: () => void;
}

export default function FullScreenNotificationModal({
  visible,
  title,
  body,
  locale,
  confirmLabel,
  delayLabel,
  dismissLabel,
  onConfirm,
  onDelay,
  onDismiss,
}: Props) {
  const colorScheme = useColorScheme();
  const C = colorScheme === "dark" ? Colors.dark : Colors.light;
  const isArabic = locale === "ar";

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      hardwareAccelerated={true}
    >
      <View style={[styles.container, { backgroundColor: C.primary }]}>
        <View style={[styles.pulseCircle1, { backgroundColor: "rgba(255,255,255,0.1)" }]} />
        <View style={[styles.pulseCircle2, { backgroundColor: "rgba(255,255,255,0.05)" }]} />

        <View style={styles.content}>
          <MaterialCommunityIcons name="alarm-bell" size={80} color="#0B1F16" />

          <Text
            style={[
              styles.title,
              {
                color: "#0B1F16",
                marginTop: 24,
                fontFamily: "Tajawal_700Bold",
                writingDirection: isArabic ? "rtl" : "ltr",
              },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.body,
              {
                color: "#0B1F16",
                marginTop: 12,
                fontFamily: "Tajawal_400Regular",
                writingDirection: isArabic ? "rtl" : "ltr",
              },
            ]}
          >
            {body}
          </Text>

          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.confirmButton,
                { opacity: pressed ? 0.8 : 1, flexDirection: isArabic ? "row-reverse" : "row" },
              ]}
              onPress={onConfirm}
            >
              <MaterialCommunityIcons name="check-circle" size={24} color="#0B1F16" />
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: "#0B1F16",
                    fontFamily: "Tajawal_700Bold",
                    writingDirection: isArabic ? "rtl" : "ltr",
                  },
                ]}
              >
                {confirmLabel}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.delayButton,
                { opacity: pressed ? 0.8 : 1, flexDirection: isArabic ? "row-reverse" : "row" },
              ]}
              onPress={onDelay}
            >
              <MaterialCommunityIcons name="clock-outline" size={24} color="#0B1F16" />
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: "#0B1F16",
                    fontFamily: "Tajawal_700Bold",
                    writingDirection: isArabic ? "rtl" : "ltr",
                  },
                ]}
              >
                {delayLabel}
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.dismissButton,
              { opacity: pressed ? 0.6 : 0.3 },
            ]}
            onPress={onDismiss}
          >
            <Text
              style={[
                styles.dismissText,
                {
                  color: "#0B1F16",
                  fontFamily: "Tajawal_500Medium",
                  writingDirection: isArabic ? "rtl" : "ltr",
                },
              ]}
            >
              {dismissLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  pulseCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -100,
    right: -100,
  },
  pulseCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: -50,
    left: -50,
  },
  content: {
    alignItems: "center",
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    textAlign: "center",
    fontFamily: "Tajawal_700Bold",
    includeFontPadding: false,
  },
  body: {
    fontSize: 18,
    textAlign: "center",
    maxWidth: "80%",
    lineHeight: 24,
    fontFamily: "Tajawal_400Regular",
  },
  buttonContainer: {
    marginTop: 40,
    width: "100%",
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  confirmButton: {
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  delayButton: {
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  dismissButton: {
    marginTop: 20,
    paddingVertical: 12,
  },
  dismissText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
