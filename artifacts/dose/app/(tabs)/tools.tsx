import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import Colors from "@/constants/colors";
import { t } from "@/constants/i18n";
import { useApp } from "@/context/AppContext";

export default function ToolsScreen() {
  const { settings, isDark } = useApp();
  const router = useRouter();
  const C = isDark ? Colors.dark : Colors.light;
  const lang = settings.language;
  const isRTL = lang === "ar";
  const insets = useSafeAreaInsets();
  const fontBold = isRTL ? "Tajawal_700Bold" : "Inter_700Bold";
  const fontMed = isRTL ? "Tajawal_500Medium" : "Inter_500Medium";
  const fontReg = isRTL ? "Tajawal_400Regular" : "Inter_400Regular";

  const unifiedIconColor = C.primary;

  const toolItems = [
    {
      id: "monitoring",
      icon: "clipboard-list-outline",
      label: t("dosesMonitoringTracking", lang),
      description:
        lang === "ar"
          ? "تابع الجرعات والحالة والتذكيرات في مكان واحد."
          : "Track doses, status, and reminders in one place.",
      accent: unifiedIconColor,
      action: () => router.push("/(tabs)/monitoring"),
    },
    {
      id: "calculator",
      icon: "calculator-variant-outline",
      label: t("doseCalculator", lang),
      description:
        lang === "ar"
          ? "احسب جرعات الأدوية بسرعة وسهولة."
          : "Calculate medication doses quickly and accurately.",
      accent: unifiedIconColor,
      action: () => router.push("/(tabs)/calculator"),
    },
    {
      id: "bmi",
      icon: "scale-bathroom",
      label: t("bmiCalculator", lang),
      description:
        lang === "ar"
          ? "احسب مؤشر كتلة الجسم في ثوانٍ."
          : "Calculate your BMI in seconds.",
      accent: unifiedIconColor,
      action: () => router.push("/(tabs)/bmi"),
    },
    {
      id: "tdee",
      icon: "fire",
      label: t("dailyCalorieTdee", lang),
      description:
        lang === "ar"
          ? "قدّر احتياجك اليومي من السعرات والتعرّف على TDEE."
          : "Estimate your daily calorie needs and TDEE.",
      accent: unifiedIconColor,
      action: () => router.push("/(tabs)/tdee"),
    },
    {
      id: "water",
      icon: "cup-water",
      label: lang === "ar" ? "شرب الماء" : "Water Intake",
      description:
        lang === "ar"
          ? "تعرّف على هدفك اليومي من الماء وكم تحتاج من السوائل."
          : "Track your daily hydration goal and water intake target.",
      accent: unifiedIconColor,
      action: () => router.push("/(tabs)/water"),
    },
    {
      id: "idealweight",
      icon: "target",
      label: lang === "ar" ? "الوزن المثالي" : "Ideal Weight",
      description:
        lang === "ar"
          ? "احسب وزنك المثالي بناءً على طولك والعوامل الأخرى."
          : "Calculate your ideal weight based on height and body metrics.",
      accent: unifiedIconColor,
      action: () => router.push("/(tabs)/idealweight"),
    },
    {
      id: "pregnancy",
      icon: "baby-carriage",
      label: lang === "ar" ? "موعد الولادة" : "Pregnancy Due Date",
      description:
        lang === "ar"
          ? "احسب موعد الولادة المتوقع بناءً على آخر دورة شهرية."
          : "Calculate your expected due date based on last menstrual period.",
      accent: unifiedIconColor,
      action: () => router.push("/(tabs)/pregnancy"),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}> 
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
        <Text
          style={[
            styles.headerTitle,
            {
              color: C.text,
              fontFamily: fontBold,
              textAlign: "center",
            },
          ]}
        >
          {t("tools", lang)}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 110 + (Platform.OS === "web" ? 40 : 0) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: "transparent", borderColor: "transparent", shadowOpacity: 0, elevation: 0 }]}> 
          <Text
            style={[
              styles.sectionTitle,
              {
                color: C.textMuted,
                fontFamily: fontMed,
                textAlign: isRTL ? "right" : "left",
              },
            ]}
          ></Text>

          {toolItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={item.action}
              style={({ pressed }) => [
                styles.toolButton,
                {
                  backgroundColor: C.surface,
                  borderColor: C.border,
                  opacity: pressed ? 0.9 : 1,
                  flexDirection: isRTL ? "row-reverse" : "row",
                },
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: `${item.accent}14`,
                    borderColor: `${item.accent}4D`,
                  },
                ]}
              >
                <MaterialCommunityIcons name={item.icon as any} size={26} color={item.accent} />
              </View>

              <View style={styles.toolTextWrap}>
                <Text
                  style={[
                    styles.toolTitle,
                    {
                      color: C.text,
                      fontFamily: fontMed,
                      textAlign: isRTL ? "right" : "left",
                    },
                  ]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.toolDescription,
                    {
                      color: C.textMuted,
                      fontFamily: fontReg,
                      textAlign: isRTL ? "right" : "left",
                    },
                  ]}
                >
                  {item.description}
                </Text>
              </View>

              <Feather name={isRTL ? "chevron-left" : "chevron-right"} size={18} color={C.textMuted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
  content: {
    padding: 1,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 0,
    padding: 14,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  toolButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    transform: [{ translateY: -1 }],
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  toolTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  toolTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
});
