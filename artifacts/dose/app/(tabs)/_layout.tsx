import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { t } from "@/constants/i18n";

function NativeTabLayout() {
  const { settings } = useApp();
  const lang = settings.language;
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>{t("home", lang)}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="add">
        <Icon sf={{ default: "plus.circle", selected: "plus.circle.fill" }} />
        <Label>{t("add", lang)}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calculator">
        <Icon sf={{ default: "function", selected: "function" }} />
        <Label>{t("doseCalculator", lang)}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} />
        <Label>{t("settings", lang)}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const { settings, isDark } = useApp();
  const lang = settings.language;
  const isArabic = lang === "ar";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const C = isDark ? Colors.dark : Colors.light;
  const safeAreaInsets = useSafeAreaInsets();
  const tabFont = isArabic ? "Tajawal_500Medium" : "Inter_500Medium";
  const centerTabIconStyle = { marginTop: 15, marginBottom: -20, flex: 1, justifyContent: "center" as const, alignItems: "center" as const };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.tabIconDefault,
        tabBarLabelStyle: {
          fontFamily: tabFont,
          fontSize: 11,
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          marginHorizontal: 0,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : C.surface,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: C.border,
          // Shadow for iOS and Android
          shadowColor: isDark ? C.primary : "#000",
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.35,
          shadowRadius: 24,
          elevation: 24,
          borderTopLeftRadius: 25, // Slightly rounded corners
          borderTopRightRadius: 25, // Slightly rounded corners
          paddingBottom: safeAreaInsets.bottom,
          marginBottom: 0,
          paddingHorizontal: 28,
          paddingVertical: 20, // Reasonable vertical padding
          height: 120,    // Increased height for main menu only
          alignItems: "stretch",
          justifyContent: "space-between",
          ...(isWeb ? { height: 120 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: C.surface }]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home", lang),
          headerTitleAlign: "center",
           headerTitleStyle: { textAlign: "center" },
          tabBarIcon: ({ color }) => (
            <View style={centerTabIconStyle}>
              {isIOS ? (
                <SymbolView name="house" tintColor={color} size={24} />
              ) : (
                <Feather name="home" size={28} color={color} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: t("add", lang),
          headerTitleAlign: "center",
          headerTitleStyle: { textAlign: "center", fontSize: 28, letterSpacing: -0.5 },
          tabBarIcon: ({ color }) => (
            <View style={centerTabIconStyle}>
              {isIOS ? (
                <SymbolView name="plus.circle" tintColor={color} size={24} />
              ) : (
                <Feather name="plus-circle" size={28} color={color} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: t("doseCalculator", lang),
          headerTitleAlign: "center",
          headerTitleStyle: { textAlign: "center" },
          tabBarIcon: ({ color }) => (
            <View style={centerTabIconStyle}>
              {isIOS ? (
                <SymbolView name="function" tintColor={color} size={24} />
              ) : (
                <MaterialCommunityIcons name="calculator-variant-outline" size={30} color={color} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings", lang),
          headerTitleAlign: "center",
           headerTitleStyle: { textAlign: "center" },
          tabBarIcon: ({ color }) => (
            <View style={centerTabIconStyle}>
              {isIOS ? (
                <SymbolView name="gearshape" tintColor={color} size={24} />
              ) : (
                <Feather name="settings" size={28} color={color} />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
