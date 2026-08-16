import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useState } from "react";
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
import { useApp } from "@/context/AppContext";

const WATER_STORAGE_KEY = "@dose_water_tracking";

type WaterEntry = {
  id: string;
  amount: number;
  time: string;
};

type WaterDayLog = {
  total: number;
  entries: WaterEntry[];
};

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function WaterIntakeScreen() {
  const router = useRouter();
  const { settings, isDark } = useApp();
  const C = isDark ? Colors.dark : Colors.light;
  const lang = settings.language;
  const isRTL = lang === "ar";
  const insets = useSafeAreaInsets();

  const [weight, setWeight] = useState("");
  const [exercise, setExercise] = useState("");
  const [customAmount, setCustomAmount] = useState("250");
  const [waterLog, setWaterLog] = useState<Record<string, WaterDayLog>>({});

  useEffect(() => {
    let mounted = true;

    async function loadLogs() {
      try {
        const raw = await AsyncStorage.getItem(WATER_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Record<string, WaterDayLog>;
        if (mounted) setWaterLog(parsed);
      } catch (_) {
      } finally {
      }
    }

    void loadLogs();
    return () => {
      mounted = false;
    };
  }, []);

  const todayKey = getTodayKey();
  const todayLog = waterLog[todayKey] ?? { total: 0, entries: [] };

  const result = useMemo(() => {
    const parsedWeight = Number(weight);
    const parsedExercise = Number(exercise);

    if (!weight || !Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      return null;
    }

    const baseMl = parsedWeight * 35;
    const bonusMl = Number.isFinite(parsedExercise) && parsedExercise > 0 ? parsedExercise * 350 : 0;
    const totalMl = Math.round(baseMl + bonusMl);

    return {
      ml: totalMl,
      liters: (totalMl / 1000).toFixed(1),
      glasses: Math.max(1, Math.round(totalMl / 250)),
    };
  }, [weight, exercise]);

  const target = result ?? { ml: 0, liters: "0.0", glasses: 0 };
  const remaining = Math.max(target.ml - todayLog.total, 0);
  const progress = target.ml > 0 ? Math.min((todayLog.total / target.ml) * 100, 100) : 0;

  const saveLog = async (nextLog: Record<string, WaterDayLog>) => {
    setWaterLog(nextLog);
    await AsyncStorage.setItem(WATER_STORAGE_KEY, JSON.stringify(nextLog));
  };

  const handleAddWater = async (amount: number) => {
    const nextLog = { ...waterLog };
    const currentDay = nextLog[todayKey] ?? { total: 0, entries: [] };
    const entry: WaterEntry = {
      id: `${Date.now()}-${Math.random()}`,
      amount,
      time: new Date().toISOString(),
    };

    nextLog[todayKey] = {
      total: currentDay.total + amount,
      entries: [entry, ...currentDay.entries].slice(0, 8),
    };

    await saveLog(nextLog);
  };

  const handleReset = async () => {
    const nextLog = { ...waterLog };
    delete nextLog[todayKey];
    await saveLog(nextLog);
  };

  const quickAddAmounts = [250, 500, 750];

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
        >
          {lang === "ar" ? "شرب الماء" : "Water Intake"}
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
              <Text
                style={[
                  styles.label,
                  {
                    color: C.textSecondary,
                    fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium",
                    textAlign: isRTL ? "right" : "left",
                  },
                ]}
              >
                {lang === "ar" ? "الوزن (كجم)" : "Weight (kg)"}
              </Text>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder={lang === "ar" ? "الوزن (كجم)" : "Weight (kg)"}
                keyboardType="decimal-pad"
                style={[
                  styles.input,
                  {
                    backgroundColor: C.background,
                    borderColor: C.border,
                    color: C.text,
                    fontFamily: isRTL ? "Tajawal_400Regular" : "Inter_400Regular",
                  },
                ]}
                placeholderTextColor={C.textMuted}
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  {
                    color: C.textSecondary,
                    fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium",
                    textAlign: isRTL ? "right" : "left",
                  },
                ]}
              >
                {lang === "ar" ? "مدة التمرين (دقيقة)" : "Exercise (min)"}
              </Text>
              <TextInput
                value={exercise}
                onChangeText={setExercise}
                placeholder={lang === "ar" ? "التمرين (دقيقة)" : "Exercise (min)"}
                keyboardType="number-pad"
                style={[
                  styles.input,
                  {
                    backgroundColor: C.background,
                    borderColor: C.border,
                    color: C.text,
                    fontFamily: isRTL ? "Tajawal_400Regular" : "Inter_400Regular",
                  },
                ]}
                placeholderTextColor={C.textMuted}
                textAlign={isRTL ? "right" : "left"}
              />
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: C.background, borderColor: C.border }]}>
            <MaterialCommunityIcons name="cup-water" size={32} color={C.primary} />
            <View style={styles.summaryTextWrap}>
              <Text
                style={[
                  styles.summaryLabel,
                  {
                    color: C.textSecondary,
                    fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium",
                    textAlign: isRTL ? "right" : "left",
                  },
                ]}
              >
                {lang === "ar" ? "الهدف اليومي" : "Daily Goal"}
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color: C.text,
                    fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold",
                    textAlign: isRTL ? "right" : "left",
                  },
                ]}
              >
                {lang === "ar" ? `${target.ml} مل` : `${target.ml} ml`}
              </Text>
            </View>
          </View>

          <View style={styles.resultGrid}>
            <View style={[styles.resultBox, { backgroundColor: C.background, borderColor: C.border }]}> 
              <Text style={[styles.resultLabel, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left" }]}>
                {lang === "ar" ? "لترات" : "Liters"}
              </Text>
              <Text style={[styles.resultValue, { color: C.text, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold", textAlign: isRTL ? "right" : "left" }]}>
                {target.liters}
              </Text>
            </View>

            <View style={[styles.resultBox, { backgroundColor: C.background, borderColor: C.border }]}> 
              <Text style={[styles.resultLabel, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left" }]}>
                {lang === "ar" ? "أكواب" : "Glasses"}
              </Text>
              <Text style={[styles.resultValue, { color: C.text, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold", textAlign: isRTL ? "right" : "left" }]}>
                {target.glasses}
              </Text>
            </View>
          </View>

          <View style={[styles.tipBox, { backgroundColor: C.primaryLight, borderColor: C.border }]}>
            <Text style={[styles.tipText, { color: C.text, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left" }]}>
              {lang === "ar"
                ? "نصيحة: اشرب كوبًا من الماء كل 2–3 ساعات، وزد الكمية أثناء التمرين أو في الطقس الحار."
                : "Tip: Drink a glass every 2–3 hours and increase your intake during exercise or hot weather."}
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSpacer: {
    width: 32,
    height: 32,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 28,
    letterSpacing: -0.5,
    textAlign: "center",
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  panel: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 18,
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
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryTextWrap: {
    flex: 1,
    gap: 2,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 28,
  },
  progressWrap: {
    gap: 8,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 13,
  },
  progressValue: {
    fontSize: 14,
  },
  progressBarTrack: {
    width: "100%",
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  quickAddWrap: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
  },
  quickAddRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  quickButtonText: {
    fontSize: 14,
  },
  customRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  customInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  customButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  customButtonText: {
    fontSize: 14,
  },
  resultGrid: {
    flexDirection: "row",
    gap: 12,
  },
  resultBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  resultLabel: {
    fontSize: 13,
  },
  resultValue: {
    fontSize: 22,
  },
  historyBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resetButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resetText: {
    fontSize: 12,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  historyText: {
    flex: 1,
    fontSize: 14,
  },
  historyTime: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 8,
  },
  tipBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
