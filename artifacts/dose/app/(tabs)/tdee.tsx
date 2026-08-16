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

const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export default function TdeeScreen() {
  const router = useRouter();
  const { settings, isDark } = useApp();
  const C = isDark ? Colors.dark : Colors.light;
  const lang = settings.language;
  const isRTL = lang === "ar";
  const insets = useSafeAreaInsets();

  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activity, setActivity] = useState<keyof typeof ACTIVITY_FACTORS>("moderate");
  const [hasCalculated, setHasCalculated] = useState(false);

  const result = useMemo(() => {
    if (!hasCalculated) return null;

    const parsedAge = Number(age);
    const parsedWeight = Number(weight);
    const parsedHeight = Number(height);

    if (
      !age ||
      !weight ||
      !height ||
      !Number.isFinite(parsedAge) ||
      !Number.isFinite(parsedWeight) ||
      !Number.isFinite(parsedHeight) ||
      parsedAge <= 0 ||
      parsedWeight <= 0 ||
      parsedHeight <= 0
    ) {
      return null;
    }

    const bmr =
      gender === "male"
        ? 10 * parsedWeight + 6.25 * parsedHeight - 5 * parsedAge + 5
        : 10 * parsedWeight + 6.25 * parsedHeight - 5 * parsedAge - 161;

    const tdee = bmr * ACTIVITY_FACTORS[activity];

    return {
      bmr,
      tdee,
      maintenance: Math.round(tdee),
      deficit: Math.round(tdee - 300),
      surplus: Math.round(tdee + 300),
    };
  }, [age, weight, height, gender, activity, hasCalculated]);

  const activityLabel =
    lang === "ar"
      ? {
          sedentary: "قليل الحركة",
          light: "حركة خفيفة",
          moderate: "متوسط",
          active: "نشط",
          veryActive: "نشط جدًا",
        }[activity]
      : {
          sedentary: "Sedentary",
          light: "Light",
          moderate: "Moderate",
          active: "Active",
          veryActive: "Very Active",
        }[activity];

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
          {lang === "ar" ? "السعرات اليومية" : "Daily Calories"}
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
                {lang === "ar" ? "العمر" : "Age"}
              </Text>
              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder={lang === "ar" ? "العمر" : "Age"}
                keyboardType="number-pad"
                style={[styles.input, { backgroundColor: C.background, borderColor: C.border, color: C.text, fontFamily: isRTL ? "Tajawal_400Regular" : "Inter_400Regular" }]}
                placeholderTextColor={C.textMuted}
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left" }]}>
                {lang === "ar" ? "الوزن (كجم)" : "Weight (kg)"}
              </Text>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder={lang === "ar" ? "الوزن (كجم)" : "Weight (kg)"}
                keyboardType="decimal-pad"
                style={[styles.input, { backgroundColor: C.background, borderColor: C.border, color: C.text, fontFamily: isRTL ? "Tajawal_400Regular" : "Inter_400Regular" }]}
                placeholderTextColor={C.textMuted}
                textAlign={isRTL ? "right" : "left"}
              />
            </View>
          </View>

          <View style={[styles.inputRow, isRTL && styles.inputRowReverse]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left" }]}>
                {lang === "ar" ? "الطول (سم)" : "Height (cm)"}
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
              <View style={[styles.segment, { backgroundColor: C.background, borderColor: C.border }]}> 
                <Pressable
                  onPress={() => setGender("male")}
                  style={[styles.segmentButton, gender === "male" && { backgroundColor: C.primary }, gender === "male" && { borderColor: C.primary }]}
                >
                  <Text style={[styles.segmentText, { color: gender === "male" ? C.buttonText : C.text, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium" }]}>
                    {lang === "ar" ? "ذكر" : "Male"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setGender("female")}
                  style={[styles.segmentButton, gender === "female" && { backgroundColor: C.primary }, gender === "female" && { borderColor: C.primary }]}
                >
                  <Text style={[styles.segmentText, { color: gender === "female" ? C.buttonText : C.text, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium" }]}>
                    {lang === "ar" ? "أنثى" : "Female"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.sectionWrap}>
            <Text style={[styles.label, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left" }]}>
              {lang === "ar" ? "مستوى النشاط" : "Activity Level"}
            </Text>
            <View style={[styles.activityGrid, { backgroundColor: C.background, borderColor: C.border }]}> 
              {Object.entries(ACTIVITY_FACTORS).map(([key, value]) => (
                <Pressable
                  key={key}
                  onPress={() => setActivity(key as keyof typeof ACTIVITY_FACTORS)}
                  style={[
                    styles.activityCard,
                    activity === key && { backgroundColor: C.primaryLight, borderColor: C.primary },
                  ]}
                >
                  <Text style={[styles.activityName, { color: C.text, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium" }]}>
                    {lang === "ar"
                      ? {
                          sedentary: "قليل الحركة",
                          light: "خفيف",
                          moderate: "متوسط",
                          active: "نشط",
                          veryActive: "نشط جدًا",
                        }[key as keyof typeof ACTIVITY_FACTORS]
                      : {
                          sedentary: "Sedentary",
                          light: "Light",
                          moderate: "Moderate",
                          active: "Active",
                          veryActive: "Very Active",
                        }[key as keyof typeof ACTIVITY_FACTORS]}
                  </Text>
                  <Text style={[styles.activityFactor, { color: C.textMuted, fontFamily: isRTL ? "Tajawal_400Regular" : "Inter_400Regular" }]}>
                    {value.toFixed(2)}x
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={[styles.actionRow, isRTL && styles.actionRowReverse]}>
            <Pressable
              onPress={() => {
                if (age && weight && height) {
                  setHasCalculated(true);
                }
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: C.primary, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Text style={[styles.primaryButtonText, { color: C.buttonText, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold" }]}>
                {lang === "ar" ? "احسب" : "Calculate"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setAge("");
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
                {lang === "ar" ? "مسح" : "Clear"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.resultCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.resultLabel, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left" }]}>
            {lang === "ar" ? "نتيجة TDEE" : "TDEE Result"}
          </Text>

          <Text style={[styles.value, { color: C.text, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold", textAlign: isRTL ? "right" : "left" }]}>
            {result ? `${result.maintenance.toLocaleString()} kcal` : "--"}
          </Text>

          <View style={[styles.summaryGrid, { gap: 12 }]}> 
            <View style={[styles.summaryItem, { backgroundColor: C.background, borderColor: C.border }]}> 
              <Text style={[styles.summaryLabel, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium" }]}>
                {lang === "ar" ? "BMR" : "BMR"}
              </Text>
              <Text style={[styles.summaryValue, { color: C.text, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold" }]}>
                {result ? `${Math.round(result.bmr).toLocaleString()} kcal` : "--"}
              </Text>
            </View>

            <View style={[styles.summaryItem, { backgroundColor: C.background, borderColor: C.border }]}> 
              <Text style={[styles.summaryLabel, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium" }]}>
                {lang === "ar" ? "مستوى النشاط" : "Activity"}
              </Text>
              <Text style={[styles.summaryValue, { color: C.text, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold" }]}>
                {result ? activityLabel : "--"}
              </Text>
            </View>
          </View>

          {result && (
            <View style={styles.goalRow}>
              <View style={[styles.goalPill, { backgroundColor: C.primaryLight, borderColor: C.border }]}>
                <Text style={[styles.goalLabel, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium" }]}>
                  {lang === "ar" ? "خسارة 300" : "-300 kcal"}
                </Text>
                <Text style={[styles.goalValue, { color: C.text, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold" }]}>
                  {result.deficit.toLocaleString()}
                </Text>
              </View>

              <View style={[styles.goalPill, { backgroundColor: C.primaryLight, borderColor: C.border }]}>
                <Text style={[styles.goalLabel, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium" }]}>
                  {lang === "ar" ? "زيادة 300" : "+300 kcal"}
                </Text>
                <Text style={[styles.goalValue, { color: C.text, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold" }]}>
                  {result.surplus.toLocaleString()}
                </Text>
              </View>
            </View>
          )}
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
    paddingBottom: 180,
  },
  panel: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  inputRowReverse: {
    flexDirection: "row-reverse",
  },
  inputGroup: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 13,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  segment: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "transparent",
  },
  segmentText: {
    fontSize: 13,
  },
  sectionWrap: {
    marginTop: 12,
  },
  activityGrid: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  activityCard: {
    flexBasis: "48%",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  activityName: {
    fontSize: 12,
    marginBottom: 2,
  },
  activityFactor: {
    fontSize: 11,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  actionRowReverse: {
    flexDirection: "row-reverse",
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 15,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
  },
  resultCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginTop: 20,
  },
  resultLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  value: {
    fontSize: 32,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  summaryItem: {
    flex: 1,
    minWidth: 120,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 16,
  },
  goalRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  goalPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  goalLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 18,
  },
});
