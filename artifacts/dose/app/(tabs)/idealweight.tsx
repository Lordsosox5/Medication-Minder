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

const getIdealWeightRange = (height: number, gender: "M" | "F") => {
  // Devine formula
  const devineMale = 50 + 2.3 * ((height - 152.4) / 2.54);
  const devineFemale = 45.5 + 2.3 * ((height - 152.4) / 2.54);
  const devineIdeal = gender === "M" ? devineMale : devineFemale;

  // Robinson formula (simpler alternative)
  const robinsonMale = 52 + 1.9 * ((height - 152.4) / 2.54);
  const robinsonFemale = 49 + 1.7 * ((height - 152.4) / 2.54);
  const robinsonIdeal = gender === "M" ? robinsonMale : robinsonFemale;

  // Miller formula
  const millerMale = 56.2 + 1.41 * ((height - 152.4) / 2.54);
  const millerFemale = 53.1 + 1.36 * ((height - 152.4) / 2.54);
  const millerIdeal = gender === "M" ? millerMale : millerFemale;

  return {
    devineIdeal: Math.round(devineIdeal),
    robinsonIdeal: Math.round(robinsonIdeal),
    millerIdeal: Math.round(millerIdeal),
    avgIdeal: Math.round((devineIdeal + robinsonIdeal + millerIdeal) / 3),
  };
};

export default function IdealWeightScreen() {
  const router = useRouter();
  const { settings, isDark } = useApp();
  const C = isDark ? Colors.dark : Colors.light;
  const lang = settings.language;
  const isRTL = lang === "ar";
  const insets = useSafeAreaInsets();

  const [height, setHeight] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [hasCalculated, setHasCalculated] = useState(false);

  const result = useMemo(() => {
    if (!hasCalculated) return null;

    const parsedHeight = Number(height);

    if (!height || !Number.isFinite(parsedHeight) || parsedHeight <= 0 || parsedHeight > 300) {
      return null;
    }

    return getIdealWeightRange(parsedHeight, gender);
  }, [height, gender, hasCalculated]);

  const genderLabel = gender === "M" ? (lang === "ar" ? "ذكر" : "Male") : (lang === "ar" ? "أنثى" : "Female");

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
          {lang === "ar" ? "الوزن المثالي" : "Ideal Weight"}
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
                {t("heightCm", lang)}
              </Text>
              <TextInput
                value={height}
                onChangeText={setHeight}
                placeholder={lang === "ar" ? "الطول (سم)" : "Height (cm)"}
                keyboardType="decimal-pad"
                style={[styles.input, { backgroundColor: C.background, borderColor: C.border, color: C.text, fontFamily: isRTL ? "Tajawal_400Regular" : "Inter_400Regular" }]}
                placeholderTextColor={C.textMuted}
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left" }]}>
                {lang === "ar" ? "الجنس" : "Gender"}
              </Text>
              <View style={[styles.genderRow, isRTL && styles.genderRowReverse]}>
                <Pressable
                  onPress={() => setGender("M")}
                  style={({ pressed }) => [
                    styles.genderButton,
                    {
                      backgroundColor: gender === "M" ? C.primary : C.background,
                      borderColor: C.border,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.genderButtonText, { color: gender === "M" ? "#0B1F16" : C.text, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold" }]}>
                    {lang === "ar" ? "ذكر" : "Male"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setGender("F")}
                  style={({ pressed }) => [
                    styles.genderButton,
                    {
                      backgroundColor: gender === "F" ? C.primary : C.background,
                      borderColor: C.border,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.genderButtonText, { color: gender === "F" ? "#0B1F16" : C.text, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold" }]}>
                    {lang === "ar" ? "أنثى" : "Female"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={[styles.actionRow, isRTL && styles.actionRowReverse]}>
            <Pressable
              onPress={() => {
                if (height) {
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
                setHeight("");
                setGender("M");
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

        {result && (
          <>
            <View style={[styles.resultCard, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Text style={[styles.resultLabel, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium" }]}>
                {lang === "ar" ? "الوزن المثالي (متوسط)" : "Average Ideal Weight"}
              </Text>

              <Text style={[styles.resultValue, { color: C.text, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold" }]}>
                {result.avgIdeal} kg
              </Text>

              <Text style={[styles.resultSubtext, { color: C.textMuted, fontFamily: isRTL ? "Tajawal_400Regular" : "Inter_400Regular" }]}>
                {lang === "ar" ? `الطول: ${height} سم | ${genderLabel}` : `Height: ${height} cm | ${genderLabel}`}
              </Text>
            </View>

            <View style={[styles.formulasCard, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Text style={[styles.formulaTitle, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left" }]}>
                {lang === "ar" ? "الصيغ المختلفة" : "Different Formulas"}
              </Text>

              <View style={[styles.formulaRow, { borderBottomColor: C.border }]}>
                <Text style={[styles.formulaName, { color: C.text, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium" }]}>
                  {lang === "ar" ? "Devine" : "Devine"}
                </Text>
                <Text style={[styles.formulaValue, { color: C.primary, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold" }]}>
                  {result.devineIdeal} kg
                </Text>
              </View>

              <View style={[styles.formulaRow, { borderBottomColor: C.border }]}>
                <Text style={[styles.formulaName, { color: C.text, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium" }]}>
                  {lang === "ar" ? "Robinson" : "Robinson"}
                </Text>
                <Text style={[styles.formulaValue, { color: C.primary, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold" }]}>
                  {result.robinsonIdeal} kg
                </Text>
              </View>

              <View style={styles.formulaRow}>
                <Text style={[styles.formulaName, { color: C.text, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium" }]}>
                  {lang === "ar" ? "Miller" : "Miller"}
                </Text>
                <Text style={[styles.formulaValue, { color: C.primary, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold" }]}>
                  {result.millerIdeal} kg
                </Text>
              </View>
            </View>

            <View style={[styles.infoCard, { backgroundColor: C.primaryLight, borderColor: C.border }]}>
              <MaterialCommunityIcons name="information" size={20} color={C.primary} style={{ marginRight: 10 }} />
              <Text style={[styles.infoText, { color: C.text, fontFamily: isRTL ? "Tajawal_400Regular" : "Inter_400Regular", textAlign: isRTL ? "right" : "left" }]}>
                {lang === "ar"
                  ? "هذه التقديرات تقريبية. استشر الطبيب لتحديد وزنك الصحي المثالي بناءً على وضعك الصحي الفردي."
                  : "These are estimates. Consult your doctor for your ideal healthy weight based on your individual health profile."}
              </Text>
            </View>
          </>
        )}
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
    paddingBottom: 150,
  },
  panel: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputRowReverse: {
    flexDirection: "row-reverse",
  },
  inputGroup: {
    flex: 1,
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
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderRowReverse: {
    flexDirection: "row-reverse",
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  genderButtonText: {
    fontSize: 16,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
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
    fontSize: 14,
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
    fontSize: 14,
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    gap: 8,
  },
  resultLabel: {
    fontSize: 13,
  },
  resultValue: {
    fontSize: 48,
    lineHeight: 52,
  },
  resultSubtext: {
    fontSize: 12,
  },
  formulasCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 0,
  },
  formulaTitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  formulaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  formulaName: {
    fontSize: 14,
  },
  formulaValue: {
    fontSize: 16,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});
