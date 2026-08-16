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

const calculatePregnancyInfo = (lmpDate: Date) => {
  const today = new Date();
  const dueDate = new Date(lmpDate);
  dueDate.setDate(dueDate.getDate() + 280); // Naegele's rule

  const weeksPassed = Math.floor((today.getTime() - lmpDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const daysPassed = Math.floor((today.getTime() - lmpDate.getTime()) / (24 * 60 * 60 * 1000));
  const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  const weeksUntilDue = Math.floor(daysUntilDue / 7);
  const daysRemaining = daysUntilDue % 7;

  let trimester = 1;
  if (weeksPassed >= 13) trimester = 2;
  if (weeksPassed >= 27) trimester = 3;

  return {
    dueDate,
    weeksPassed,
    daysPassed,
    daysUntilDue,
    weeksUntilDue,
    daysRemaining,
    trimester,
    isOverdue: daysUntilDue < 0,
  };
};

export default function PregnancyScreen() {
  const router = useRouter();
  const { settings, isDark } = useApp();
  const C = isDark ? Colors.dark : Colors.light;
  const lang = settings.language;
  const isRTL = lang === "ar";
  const insets = useSafeAreaInsets();

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [hasCalculated, setHasCalculated] = useState(false);

  const result = useMemo(() => {
    if (!hasCalculated || !day || !month || !year) return null;

    const parsedDay = Number(day);
    const parsedMonth = Number(month);
    const parsedYear = Number(year);

    if (!Number.isFinite(parsedDay) || !Number.isFinite(parsedMonth) || !Number.isFinite(parsedYear)) return null;
    if (parsedMonth < 1 || parsedMonth > 12 || parsedDay < 1 || parsedDay > 31) return null;

    const date = new Date(parsedYear, parsedMonth - 1, parsedDay);
    if (date.getFullYear() !== parsedYear || date.getMonth() !== parsedMonth - 1 || date.getDate() !== parsedDay) return null;

    const today = new Date();
    if (date > today) return null; // LMP cannot be in the future

    return calculatePregnancyInfo(date);
  }, [day, month, year, hasCalculated]);

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTrimesterLabel = (trimester: number) => {
    if (lang === "ar") {
      return trimester === 1 ? "الثلث الأول" : trimester === 2 ? "الثلث الثاني" : "الثلث الثالث";
    }
    return trimester === 1 ? "First Trimester" : trimester === 2 ? "Second Trimester" : "Third Trimester";
  };

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
          {lang === "ar" ? "موعد الولادة" : "Due Date"}
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
          <Text style={[styles.label, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left" }]}>
            {lang === "ar" ? "آخر دورة شهرية" : "Last Menstrual Period"}
          </Text>

          <View style={[styles.dateInputRow, isRTL && styles.dateInputRowReverse]}>
            <View style={styles.dateInputGroup}>
              <Text style={[styles.dateLabel, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: "center" }]}>
                {lang === "ar" ? "اليوم" : "Day"}
              </Text>
              <TextInput
                value={day}
                onChangeText={setDay}
                placeholder={lang === "ar" ? "DD" : "DD"}
                keyboardType="number-pad"
                maxLength={2}
                style={[styles.dateInput, { backgroundColor: C.background, borderColor: C.border, color: C.text, fontFamily: isRTL ? "Tajawal_400Regular" : "Inter_400Regular" }]}
                placeholderTextColor={C.textMuted}
                textAlign="center"
              />
            </View>

            <View style={styles.dateInputGroup}>
              <Text style={[styles.dateLabel, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: "center" }]}>
                {lang === "ar" ? "الشهر" : "Month"}
              </Text>
              <TextInput
                value={month}
                onChangeText={setMonth}
                placeholder={lang === "ar" ? "MM" : "MM"}
                keyboardType="number-pad"
                maxLength={2}
                style={[styles.dateInput, { backgroundColor: C.background, borderColor: C.border, color: C.text, fontFamily: isRTL ? "Tajawal_400Regular" : "Inter_400Regular" }]}
                placeholderTextColor={C.textMuted}
                textAlign="center"
              />
            </View>

            <View style={styles.dateInputGroup}>
              <Text style={[styles.dateLabel, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: "center" }]}>
                {lang === "ar" ? "السنة" : "Year"}
              </Text>
              <TextInput
                value={year}
                onChangeText={setYear}
                placeholder={lang === "ar" ? "YYYY" : "YYYY"}
                keyboardType="number-pad"
                maxLength={4}
                style={[styles.dateInput, { backgroundColor: C.background, borderColor: C.border, color: C.text, fontFamily: isRTL ? "Tajawal_400Regular" : "Inter_400Regular" }]}
                placeholderTextColor={C.textMuted}
                textAlign="center"
              />
            </View>
          </View>

          <View style={[styles.actionRow, isRTL && styles.actionRowReverse]}>
            <Pressable
              onPress={() => {
                if (day && month && year) {
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
                setDay("");
                setMonth("");
                setYear("");
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
              <View style={styles.resultHeader}>
                <MaterialCommunityIcons name="baby-carriage" size={32} color={C.primary} />
                <View style={styles.resultHeaderText}>
                  <Text style={[styles.resultLabel, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left", }]}>
                    {lang === "ar" ? "موعد الولادة المتوقع" : "Expected Due Date"}
                  </Text>
                  <Text style={[styles.dueDateValue, { color: C.text, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold", textAlign: isRTL ? "right" : "left", }]}>
                    {formatDateForDisplay(result.dueDate)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.infoGrid, { gap: 12 }]}>
              <View style={[styles.infoCard, { backgroundColor: C.surface, borderColor: C.border }]}>
                <Text style={[styles.infoLabel, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left", }]}>
                  {lang === "ar" ? "أسابيع مضت" : "Weeks Passed"}
                </Text>
                <Text style={[styles.infoValue, { color: C.text, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold", textAlign: isRTL ? "right" : "left", }]}>
                  {result.weeksPassed}
                </Text>
              </View>

              <View style={[styles.infoCard, { backgroundColor: C.surface, borderColor: C.border }]}>
                <Text style={[styles.infoLabel, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left", }]}>
                  {lang === "ar" ? "أسابيع متبقية" : "Weeks Left"}
                </Text>
                <Text style={[styles.infoValue, { color: C.text, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold", textAlign: isRTL ? "right" : "left", }]}>
                  {result.weeksUntilDue}
                </Text>
              </View>

              <View style={[styles.infoCard, { backgroundColor: C.surface, borderColor: C.border }]}>
                <Text style={[styles.infoLabel, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left", }]}>
                  {lang === "ar" ? "أيام متبقية" : "Days Left"}
                </Text>
                <Text style={[styles.infoValue, { color: C.text, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold", textAlign: isRTL ? "right" : "left", }]}>
                  {result.daysUntilDue}
                </Text>
              </View>
            </View>

            <View style={[styles.trimesterCard, { backgroundColor: C.primaryLight, borderColor: C.border }]}>
              <View style={[styles.trimesterHeader, isRTL && styles.trimesterHeaderReverse]}>
                <MaterialCommunityIcons name="baby" size={24} color={C.primary} />
                <View>
                  <Text style={[styles.trimesterLabel, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left" }]}>
                    {lang === "ar" ? "المرحلة الحالية" : "Current Stage"}
                  </Text>
                  <Text style={[styles.trimesterValue, { color: C.text, fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold", textAlign: isRTL ? "right" : "left" }]}>
                    {getTrimesterLabel(result.trimester)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.trimesterProgress, { color: C.text, fontFamily: isRTL ? "Tajawal_400Regular" : "Inter_400Regular", textAlign: isRTL ? "right" : "left" }]}>
                {lang === "ar"
                  ? `${result.weeksPassed} أسبوع و ${result.daysPassed % 7} أيام من الحمل`
                  : `${result.weeksPassed} weeks and ${result.daysPassed % 7} days of pregnancy`}
              </Text>
            </View>

            {result.isOverdue && (
              <View style={[styles.warningCard, { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" }]}>
                <MaterialCommunityIcons name="alert-circle" size={20} color="#DC2626" />
                <Text style={[styles.warningText, { color: "#991B1B", fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left", }]}>
                  {lang === "ar" ? "تجاوز موعد الولادة المتوقع - تواصلي مع طبيبك" : "Past due date - contact your doctor"}
                </Text>
              </View>
            )}

            <View style={[styles.tipsCard, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Text style={[styles.tipsTitle, { color: C.textSecondary, fontFamily: isRTL ? "Tajawal_500Medium" : "Inter_500Medium", textAlign: isRTL ? "right" : "left", }]}>
                {lang === "ar" ? "نصائح صحية" : "Health Tips"}
              </Text>
              <Text style={[styles.tipText, { color: C.text, fontFamily: isRTL ? "Tajawal_400Regular" : "Inter_400Regular", textAlign: isRTL ? "right" : "left", }]}>
                {lang === "ar"
                  ? "• تابعي فحوصات الحمل المنتظمة\n• احصلي على قسط كافٍ من الراحة والنوم\n• اتبعي نظاماً غذائياً صحياً متوازناً\n• مارسي التمارين الآمنة أثناء الحمل"
                  : "• Attend regular prenatal checkups\n• Get adequate rest and sleep\n• Follow a balanced healthy diet\n• Practice safe pregnancy exercises"}
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
    gap: 12,
  },
  inputGroup: {
    gap: 8,
  },
  inputGroupReverse: {
    flexDirection: "column-reverse",
  },
  label: {
    fontSize: 14,
    marginBottom: 12,
  },
  dateInputRow: {
    flexDirection: "row",
    gap: 10,
  },
  dateInputRowReverse: {
    flexDirection: "row-reverse",
  },
  dateInputGroup: {
    flex: 1,
    gap: 6,
  },
  dateLabel: {
    fontSize: 12,
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
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
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resultHeaderText: {
    flex: 1,
    gap: 2,
  },
  resultLabel: {
    fontSize: 12,
  },
  dueDateValue: {
    fontSize: 20,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    minWidth: "30%",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 24,
    marginTop: 4,
  },
  trimesterCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  trimesterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  trimesterHeaderReverse: {
    flexDirection: "row-reverse",
  },
  trimesterLabel: {
    fontSize: 12,
  },
  trimesterValue: {
    fontSize: 16,
  },
  trimesterProgress: {
    fontSize: 13,
    lineHeight: 20,
  },
  warningCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
  },
  tipsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
