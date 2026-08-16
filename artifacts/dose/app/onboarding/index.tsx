import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold } from "@expo-google-fonts/tajawal";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";

function getLighter(color: string, opacity = 0.15) {
  if (color.startsWith("#")) {
    const bigint = parseInt(color.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${opacity})`;
  }
  return color;
}

const screensEn = [
  {
    eyebrow: "Your daily care companion",
    title: "Welcome to Medication Minder",
    description: "Stay on top of every dose with clear routines, gentle reminders, and confidence in your care.",
    icon: { name: "pill", color: "#0B1F16", bg: "primary" },
  },
  {
    eyebrow: "Smart support",
    title: "Never miss a reminder",
    description: "Receive timely alerts designed to keep your schedule consistent without feeling overwhelming.",
    icon: { name: "bell-ring", color: "#0B1F16", bg: "primaryDark" },
  },
  {
    eyebrow: "Healthy habits",
    title: "Make wellness feel effortless",
    description: "Track intake, review your routine, and stay in control of your health with a calmer daily rhythm.",
    icon: { name: "calendar-check", color: "#0B1F16", bg: "success" },
  },
];

const screensAr = [
  {
    eyebrow: "رفيق روتينك اليومي",
    title: "مرحبًا بك في تابيرا",
    description: "تابع أدويتك بسهولة مع روتين واضح، تنبيهات لطيفة، وثقة أكبر في صحتك اليومية.",
    icon: { name: "pill", color: "#0B1F16", bg: "primary" },
  },
  {
    eyebrow: "دعم ذكي",
    title: "لا تفوّت أي تذكير",
    description: "استقبل تنبيهات مناسبة وفي الوقت المناسب للحفاظ على جدولك من دون ضغط أو تشويش.",
    icon: { name: "bell-ring", color: "#0B1F16", bg: "primaryDark" },
  },
  {
    eyebrow: "عادات صحية",
    title: "اجعل العناية بالصحة أسهل",
    description: "تابع جرعاتك، راجع روتينك، وكن في سيطرة كاملة على صحتك بروح أكثر هدوءًا.",
    icon: { name: "calendar-check", color: "#0B1F16", bg: "success" },
  },
];

function getDeviceLanguage(): "en" | "ar" {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale || "en";
  return locale.toLowerCase().startsWith("ar") ? "ar" : "en";
}

export default function Onboarding() {
  const [screen, setScreen] = useState(0);
  const [fontsLoaded] = useFonts({ Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold });
  const colorScheme = useColorScheme();
  const C = colorScheme === "dark" ? Colors.dark : Colors.light;
  const router = useRouter();
  const lang = getDeviceLanguage();
  const screens = lang === "ar" ? screensAr : screensEn;
  const isRTL = lang === "ar";
  const nextLabel =
    screen < screens.length - 1
      ? lang === "ar"
        ? "التالي"
        : "Next"
      : lang === "ar"
        ? "ابدأ الآن"
        : "Get Started";

  if (!fontsLoaded) return null;

  const currentIconColor = C[screens[screen].icon.bg as keyof typeof C] || C.primary;

  return (
    <View style={[styles.container, { backgroundColor: C.background, direction: isRTL ? "rtl" : "ltr" }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} hidden={true} backgroundColor="transparent" translucent={true} />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.glowOrb, { top: -80, left: -50, backgroundColor: getLighter(C.primary, 0.14) }]} />
        <View style={[styles.glowOrb, { bottom: -120, right: -70, backgroundColor: getLighter(C.success, 0.12) }]} />
        <View style={[styles.smallOrb, { top: "28%", right: 24, backgroundColor: getLighter(C.primaryDark, 0.1) }]} />
        <View style={[styles.smallOrb, { bottom: "18%", left: 24, backgroundColor: getLighter(C.info, 0.08) }]} />
      </View>

      <View style={styles.headerRow}>
        <View style={[styles.brandBadge, { backgroundColor: getLighter(C.primary, 0.14), borderColor: getLighter(C.primary, 0.2) }]}>
          <MaterialCommunityIcons name="pill" size={20} color={C.primaryDark} />
        </View>
      </View>

      <View style={styles.cardWrap}>
        <LinearGradient
          colors={
            colorScheme === "dark"
              ? ["rgba(15, 42, 30, 0.96)", "rgba(11, 31, 22, 0.96)"]
              : ["rgba(255,255,255,0.92)", "rgba(240,253,249,0.96)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <Text style={[styles.eyebrow, { color: C.textMuted, fontFamily: "Tajawal_500Medium" }]}>
              {screens[screen].eyebrow}
            </Text>
            <View style={[styles.statusPill, { backgroundColor: getLighter(C.success, 0.12), borderColor: getLighter(C.success, 0.2) }]}>
              <MaterialCommunityIcons name="check-decagram" size={14} color={C.success} />
            </View>
          </View>

          <View style={styles.heroIconWrap}>
            <LinearGradient
              colors={[currentIconColor, getLighter(currentIconColor, 0.75)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroIconInner}
            >
              <MaterialCommunityIcons name={screens[screen].icon.name as any} size={54} color={"#0B1F16"} />
            </LinearGradient>
          </View>

          <Text style={[styles.title, { color: C.text, fontFamily: "Tajawal_700Bold" }]}>
            {screens[screen].title}
          </Text>

          <Text style={[styles.description, { color: C.textSecondary, fontFamily: "Tajawal_400Regular" }]}>
            {screens[screen].description}
          </Text>
        </LinearGradient>
      </View>

      <View style={styles.dotsRow}>
        {screens.map((_, i) => (
          <Pressable key={i} onPress={() => setScreen(i)} accessibilityRole="button">
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: screen === i ? C.primary : getLighter(C.primary, 0.18),
                  width: screen === i ? 34 : 10,
                  borderColor: screen === i ? getLighter(C.primary, 0.4) : "transparent",
                },
              ]}
            />
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.nextBtn,
          {
            backgroundColor: C.primary,
            opacity: pressed ? 0.88 : 1,
            shadowColor: C.primary,
          },
        ]}
        onPress={async () => {
          if (screen < screens.length - 1) setScreen(screen + 1);
          else {
            await AsyncStorage.setItem("onboardingComplete", "1");
            router.replace("/onboarding/welcome");
          }
        }}
      >
        <Text style={[styles.nextBtnText, { color: "#0B1F16", fontFamily: "Tajawal_700Bold" }]}>{nextLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 28,
  },
  headerRow: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  brandBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  glowOrb: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.9,
  },
  smallOrb: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.7,
  },
  cardWrap: {
    width: "100%",
    marginBottom: 24,
  },
  heroCard: {
    width: "100%",
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(168, 214, 197, 0.34)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 10,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  statusPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  heroIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heroIconInner: {
    width: 120,
    height: 120,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 8,
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 18,
    lineHeight: 30,
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 28,
  },
  dot: {
    height: 10,
    borderRadius: 999,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  nextBtn: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingVertical: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 7,
  },
  nextBtnText: {
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 0.2,
  },
});
