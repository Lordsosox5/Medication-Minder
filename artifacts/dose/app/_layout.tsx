import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  useFonts,
} from "@expo-google-fonts/tajawal";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import * as Notifications from "expo-notifications";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppContextProvider } from "@/context/AppContext";
import { initializeUnityAds, loadInterstitial, loadTimedAd, showTimedAd } from "@/services/unity-ads";

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'transparentModal', // Show previous page behind
        // cardStyle removed: not a valid prop for NativeStackNavigationOptions
        animation: 'slide_from_right', // Slide in/out for all screens
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (Platform.OS !== "web") {
      initializeUnityAds()
        .then(() => Promise.all([loadInterstitial(), loadTimedAd()]))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const TEN_MINUTES = 10 * 60 * 1000;
    const interval = setInterval(async () => {
      await showTimedAd();
      loadTimedAd();
    }, TEN_MINUTES);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    async function setupNotifications() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      Notifications.scheduleNotificationAsync({
        content: {
          title: "مرحبا بك!",
          body: "يمكنمك الآن تتبع أدويتك بسهولة مع تابيرا.",
          sound: true,
        },
        trigger: { type: "timeInterval", seconds: 5 },
      });
    }

    setupNotifications();
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppContextProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AppContextProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

