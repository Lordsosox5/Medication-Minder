import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, useColorScheme, Dimensions, Image } from "react-native";
import { useFonts, Tajawal_400Regular, Tajawal_700Bold } from "@expo-google-fonts/tajawal";
// Helper for lighter icon color
function getLighter(color: string, opacity = 0.12) {
  // Accepts hex or rgba
  if (color.startsWith("#")) {
    // Convert hex to rgba
    const bigint = parseInt(color.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${opacity})`;
  }
  return color;
}
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import { t } from "@/constants/i18n";
import { useApp } from "@/context/AppContext";

const screensEn = [
  {
    title: "Welcome to Medication Minder!",
    description: "Easily track your medications and never miss a dose again.",
    icon: { name: "pill", color: "#fff", bg: "primary" },
  },
  {
    title: "Smart Reminders",
    description: "Get timely notifications and reminders for all your medications.",
    icon: { name: "bell-ring", color: "#fff", bg: "primaryDark" },
  },
  {
    title: "Stay in Control",
    description: "Manage your schedule, view history, and keep your health on track!",
    icon: { name: "calendar-check", color: "#fff", bg: "success" },
  },
];

const screensAr = [
  {
    title: "مرحبًا بك في تابيرا!",
    description: "تابع أدويتك بسهولة ولا تفوّت أي جرعة بعد اليوم.",
    icon: { name: "pill", color: "#fff", bg: "primary" },
  },
  {
    title: "تذكيرات ذكية",
    description: "احصل على إشعارات وتنبيهات في الوقت المناسب لكل أدويتك.",
    icon: { name: "bell-ring", color: "#fff", bg: "primaryDark" },
  },
  {
    title: "تحكم كامل بصحتك",
    description: "نظم جدولك، راقب تاريخك، وابقَ على المسار الصحيح!",
    icon: { name: "calendar-check", color: "#fff", bg: "success" },
  },
];

export default function Onboarding() {
  const [screen, setScreen] = useState(0);
  const [fontsLoaded] = useFonts({ Tajawal_400Regular, Tajawal_700Bold });
  const colorScheme = useColorScheme();
  const C = colorScheme === "dark" ? Colors.dark : Colors.light;
  const router = useRouter();
  const { width } = Dimensions.get("window");
  // Force onboarding to always show in Arabic for titles and descriptions
  const lang = "ar";
  const screens = screensAr;
  const isRTL = true;

  if (!fontsLoaded) return null;

  return (
    <View style={[styles.container, { backgroundColor: C.background, direction: isRTL ? 'rtl' : 'ltr' }]}>  

      {/* Decorative background icons */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {/* Top left */}
        <MaterialCommunityIcons
          name={screens[screen].icon.name as any}
          size={110}
          color={getLighter(C[screens[screen].icon.bg as keyof typeof C] || C.primary, 0.13)}
          style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
        />
        {/* Bottom right */}
        <MaterialCommunityIcons
          name={screens[screen].icon.name as any}
          size={140}
          color={getLighter(C[screens[screen].icon.bg as keyof typeof C] || C.primary, 0.09)}
          style={{ position: "absolute", bottom: 0, right: 0, zIndex: 0 }}
        />
        {/* Center right, rotated */}
        <MaterialCommunityIcons
          name={screens[screen].icon.name as any}
          size={80}
          color={getLighter(C[screens[screen].icon.bg as keyof typeof C] || C.primary, 0.10)}
          style={{ position: "absolute", top: "40%", right: 10, zIndex: 0, transform: [{ rotate: "-18deg" }] }}
        />
        {/* Center left, rotated */}
        <MaterialCommunityIcons
          name={screens[screen].icon.name as any}
          size={60}
          color={getLighter(C[screens[screen].icon.bg as keyof typeof C] || C.primary, 0.08)}
          style={{ position: "absolute", top: "60%", left: 10, zIndex: 0, transform: [{ rotate: "12deg" }] }}
        />
      </View>
      <View style={styles.content}>
        <View style={[styles.iconWrapper, { backgroundColor: C[screens[screen].icon.bg as keyof typeof C] || C.primary }]}> 
          <MaterialCommunityIcons
            name={screens[screen].icon.name as any}
            size={54}
            color={screens[screen].icon.color}
          />
        </View>
        <Text
          style={[
            styles.title,
            { color: C.primaryDark, fontSize: 32, marginBottom: 12, letterSpacing: 0.2 }
          ]}
        >
          {screens[screen].title}
        </Text>
        <Text
          style={[
            styles.description,
            { color: C.textSecondary }
          ]}
        >
          {screens[screen].description}
        </Text>
      </View>
      <View style={styles.dotsRow}>
        {screens.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: screen === i ? C.primary : C.surfaceSecondary, width: screen === i ? 32 : 10 },
            ]}
          />
        ))}
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.nextBtn,
          { backgroundColor: C.primary, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={async () => {
          if (screen < screens.length - 1) setScreen(screen + 1);
          else {
            await AsyncStorage.setItem("onboardingComplete", "1");
            router.replace("/(tabs)");
          }
        }}
      >
        <Text
          style={[
            styles.nextBtnText,
            { color: C.buttonText, fontSize: 20, letterSpacing: 0.2, paddingHorizontal: 50, fontFamily: "Tajawal_700Bold" }
          ]}
        >
          {screen < screens.length - 1 ? "التالي" : "ابدأ الآن"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  artWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  artImage: {
    width: 120,
    height: 120,
    borderRadius: 32,
    marginBottom: 8,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 18,
    textAlign: "center",
      fontFamily: "Tajawal_700Bold",
  },
    description: {
      fontSize: 20,
      textAlign: "center",
      marginBottom: 32,
      lineHeight: 32,
      fontFamily: "Tajawal_400Regular",
    },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    gap: 8,
  },
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    // transition removed for RN compatibility
  },
  nextBtn: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 50,
    marginBottom: 32,
  },
  nextBtnText: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
    fontFamily: "Tajawal_700Bold",
  },
});
