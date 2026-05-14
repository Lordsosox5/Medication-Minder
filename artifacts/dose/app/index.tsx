import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import Colors from "@/constants/colors";
import { t } from "@/constants/i18n";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ND = Platform.OS !== "web";

export default function SplashScreen() {
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const { settings, isDark, loaded } = useApp();
  const C = isDark ? Colors.dark : Colors.light;
  const lang = settings.language;
  const isRTL = lang === "ar";
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: ND,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: ND,
        }),
      ]),
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: ND,
      }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 1000,
            useNativeDriver: ND,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: ND,
          }),
        ])
      ).start();
    });
    // Check onboarding status
    (async () => {
      try {
        const seen = await AsyncStorage.getItem("onboardingComplete");
        setOnboardingChecked(true);
        if (!seen) {
          setTimeout(() => router.replace("/onboarding"), 1200);
        }
      } catch {
        setOnboardingChecked(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded || !onboardingChecked) return;
    (async () => {
      const seen = await AsyncStorage.getItem("onboardingComplete");
      if (seen) {
        const timer = setTimeout(() => {
          router.replace("/(tabs)");
        }, 1200);
        return () => clearTimeout(timer);
      }
    })();
  }, [loaded, onboardingChecked]);

  const webTopPadding = Platform.OS === "web" ? 67 : 0;
  const webBottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: C.background,
          paddingTop: insets.top + webTopPadding,
          paddingBottom: insets.bottom + webBottomPadding,
          borderRadius: 0,
          overflow: "visible",
        },
      ]}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: C.primary,
              opacity: fadeAnim,
              transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
            },
          ]}
        >
          <MaterialCommunityIcons name="pill" size={56} color="#fff" />
        </Animated.View>

        <Animated.Text
          style={[
            styles.appName,
            {
              color: C.text,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              fontFamily: isRTL ? "Tajawal_700Bold" : "Inter_700Bold",
            },
          ]}
        >
          {t("appName", lang)}
        </Animated.Text>

        <Animated.Text
          style={[
            styles.tagline,
            {
              color: C.textSecondary,
              opacity: taglineFade,
              fontFamily: isRTL ? "Tajawal_400Regular" : "Inter_400Regular",
            },
          ]}
        >
          {t("tagline", lang)}
        </Animated.Text>
      </View>

      <Animated.View style={[styles.dotsContainer, { opacity: taglineFade }]}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === 1 ? C.primary : C.border },
            ]}
          />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
    borderRadius: 0,
    overflow: "visible",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  iconWrapper: {
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
  appName: {
    fontSize: 48,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    letterSpacing: 0.3,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
