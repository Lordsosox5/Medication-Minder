import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import Colors from "@/constants/colors";
import { t } from "@/constants/i18n";
import { useApp } from "@/context/AppContext";

const getBmiCategory = (bmi: number) => {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "healthy";
  if (bmi < 30) return "overweight";
  return "obese";
};

export default function BmiScreen() {
  const router = useRouter();
  const { settings, isDark } = useApp();
  const C = isDark ? Colors.dark : Colors.light;
  const lang = settings.language;
  const isRTL = lang === "ar";
  const insets = useSafeAreaInsets();

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [hasCalculated, setHasCalculated] = useState(false);

  const result = useMemo(() => {
    if (!hasCalculated) return null;

    const parsedWeight = Number(weight);
    const parsedHeight = Number(height) / 100;

    if (!weight || !height || !Number.isFinite(parsedWeight) || !Number.isFinite(parsedHeight) || parsedHeight <= 0) {
      return null;
    }

    const bmi = parsedWeight / (parsedHeight * parsedHeight);
    return {
      bmi,
      category: getBmiCategory(bmi),
    };
  }, [weight, height, hasCalculated]);

  const categoryLabel = result
  ? t(result.category as Parameters<typeof t>[0], lang)
  : "";
  const bmiText = result ? result.bmi.toFixed(1) : "--";

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: C.surface,
            borderBottomColor: C.border,
            paddingTop: insets.top + 16,
          },
        ]}
      >
        {isRTL ? (
          <View style={styles.headerSpacer} />
        ) : (
          <Pressable onPress={() => router.push("/(tabs)/tools")} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={C.text} />
          </Pressable>
        )}

        <Text
          style={[
            styles.headerTitle,
            {
              color: C.text,
              fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold",
            },
          ]}
          numberOfLines={1}
        >
          {t("bmiTitle", lang)}
        </Text>

        {isRTL ? (
          <Pressable onPress={() => router.push("/(tabs)/tools")} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-right" size={24} color={C.text} />
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.panel, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[styles.inputRow, isRTL && styles.inputRowReverse]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left" }]}>
                {t("weightKg", lang)}
              </Text>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder={t("weightKg", lang)}
                keyboardType="decimal-pad"
                style={[styles.input, { backgroundColor: C.background, borderColor: C.border, color: C.text, fontFamily: isRTL ? "Tajawal_400Regular" : "Inter_400Regular" }]}
                placeholderTextColor={C.textMuted}
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left" }]}>
                {t("heightCm", lang)}
              </Text>
              <TextInput
                value={height}
                onChangeText={setHeight}
                placeholder={t("heightCm", lang)}
                keyboardType="decimal-pad"
                style={[styles.input, { backgroundColor: C.background, borderColor: C.border, color: C.text, fontFamily: isRTL ? "Tajawal_400Regular" : "Inter_400Regular" }]}
                placeholderTextColor={C.textMuted}
                textAlign={isRTL ? "right" : "left"}
              />
            </View>
          </View>

          <View style={[styles.actionRow, isRTL && styles.actionRowReverse]}>
            <Pressable
              onPress={() => {
                if (weight && height) {
                  setHasCalculated(true);
                }
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: C.primary, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Text style={[styles.primaryButtonText, { color: C.buttonText, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold" }]}>
                {t("calculate", lang)}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setWeight("");
                setHeight("");
                setHasCalculated(false);
              }}
              style={({ pressed }) => [
                styles.secondaryButton,
                { backgroundColor: C.background, borderColor: C.border, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Text style={[styles.secondaryButtonText, { color: C.text, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold" }]}>
                {t("clear", lang)}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.resultCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.resultLabel, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium" }]}>
            {t("bmiResult", lang)}
          </Text>

          <Text style={[styles.bmiValue, { color: C.text, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold" }]}>
            {bmiText}
          </Text>

          <View style={[styles.categoryPill, { backgroundColor: C.primaryLight, borderColor: C.border }]}>
            <Text style={[styles.categoryText, { color: C.text, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold" }]}>
              {result ? categoryLabel : "--"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    flex: 1,
    fontSize: 28,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: 20,
    gap: 18,
  },
  panel: {
    borderWidth: 0,
    borderRadius: 18,
    padding: 14,
  },
  inputRow: {
    gap: 12,
  },
  inputRowReverse: {
    flexDirection: "column-reverse",
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  actionRowReverse: {
    flexDirection: "row-reverse",
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 15,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
  },
  resultCard: {
    borderWidth: 0,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  bmiValue: {
    fontSize: 42,
    marginBottom: 12,
  },
  categoryPill: {
    borderWidth: 0,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryText: {
    fontSize: 14,
  },
});
