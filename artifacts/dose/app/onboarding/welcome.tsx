import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
} from "react-native";
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

function getDeviceLanguage(): "en" | "ar" {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale || "en";
  return locale.toLowerCase().startsWith("ar") ? "ar" : "en";
}

export default function WelcomeScreen() {
  const [fontsLoaded] = useFonts({ Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold });
  const colorScheme = useColorScheme();
  const C = colorScheme === "dark" ? Colors.dark : Colors.light;
  const router = useRouter();
  const lang = getDeviceLanguage();
  const isRTL = lang === "ar";

  if (!fontsLoaded) return null;

  const title = lang === "ar" ? "مرحبًا بك في تابيـرا!" : "welcome to Tabira!";
  const subtitle = lang === "ar" ? "تنبيهات ذكية، متابعة صحية، وتخطيط يومي!" : "smart reminders, healthier routines, and daily control!";
  const privacyLine =
    lang === "ar"
      ? "بياناتك خاصة بك، وتُخزن على جهازك بشكل كامل ومشفر!"
      : "Your data is yours, stored securely on your device!";
  const cta = lang === "ar" ? "متابعة إلى الإعداد" : "Continue to setup";

  return (
    <View style={[styles.container, { backgroundColor: C.background, direction: isRTL ? "rtl" : "ltr" }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} hidden={true} backgroundColor="transparent" translucent={true} />

      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.glowOrb, { top: -80, left: -50, backgroundColor: getLighter(C.primary, 0.14) }]} />
        <View style={[styles.glowOrb, { bottom: -120, right: -70, backgroundColor: getLighter(C.success, 0.12) }]} />
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
          <View style={styles.iconWrap}>
            <LinearGradient
              colors={[C.primary, getLighter(C.primary, 0.7)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconInner}
            >
              <MaterialCommunityIcons name="shield-check" size={52} color="#0B1F16" />
            </LinearGradient>
          </View>

          <Text style={[styles.eyebrow, { color: C.textMuted, fontFamily: "Tajawal_500Medium" }]}>
            {subtitle}
          </Text>

          <Text style={[styles.title, { color: C.text, fontFamily: "Tajawal_700Bold" }]}>
            {title}
          </Text>

          <View style={[styles.noticeBox, { backgroundColor: getLighter(C.primary, 0.1), borderColor: getLighter(C.primary, 0.3) }]}>
            <MaterialCommunityIcons name="lock-outline" size={26} color={C.primaryDark} />
            <Text style={[styles.noticeText, { color: C.text, fontFamily: "Tajawal_700Bold" }]}>
              {privacyLine}
            </Text>
          </View>
        </LinearGradient>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.cta,
          {
            backgroundColor: C.primary,
            opacity: pressed ? 0.88 : 1,
            shadowColor: C.primary,
          },
        ]}
        onPress={async () => {
          await AsyncStorage.setItem("welcomeSeen", "1");
          router.replace("/setup");
        }}
      >
        <Text style={[styles.ctaText, { color: "#0B1F16", fontFamily: "Tajawal_700Bold" }]}>{cta}</Text>
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
    minHeight: "100%",
  },
  glowOrb: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.9,
  },
  cardWrap: {
    width: "100%",
    marginBottom: 24,
  },
  heroCard: {
    width: "100%",
    padding: 28,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(168, 214, 197, 0.34)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 10,
    alignItems: "center",
  },
  iconWrap: {
    marginBottom: 20,
  },
  iconInner: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  eyebrow: {
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 38,
    letterSpacing: -0.8,
    textAlign: "center",
    marginBottom: 22,
  },
  noticeBox: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 28,
    textAlign: "center",
  },
  cta: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 8,
  },
  ctaText: {
    fontSize: 17,
  },
});
