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
import { Platform, PermissionsAndroid } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import * as Notifications from "expo-notifications";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppContextProvider, useApp } from "@/context/AppContext";
import FullScreenNotificationModal from "@/components/FullScreenNotificationModal";

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
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="setup" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

function NotificationOverlay() {
  const {
    foregroundNotification,
    clearForegroundNotification,
    confirmIntake,
    delayMedication,
    settings,
  } = useApp();

  if (!foregroundNotification) return null;

  const isArabic = settings.language === "ar";
  const medId = foregroundNotification.request.content.data?.medId;
  const title =
    foregroundNotification.request.content.title ||
    (isArabic ? "تذكير الدواء" : "Medication Reminder");
  const body =
    foregroundNotification.request.content.body ||
    (isArabic ? "حان وقت تناول دوائك" : "Time to take your medication");

  return (
    <FullScreenNotificationModal
      visible={!!foregroundNotification}
      title={title}
      body={body}
      locale={isArabic ? "ar" : "en"}
      confirmLabel={isArabic ? "تأكيد" : "Confirm"}
      delayLabel={isArabic ? "ذكرني بعد 5 دقائق" : "Remind me in 5 min"}
      dismissLabel={isArabic ? "إغلاق" : "Dismiss"}
      onConfirm={() => {
        if (medId) void confirmIntake(medId);
        clearForegroundNotification();
      }}
      onDelay={() => {
        if (medId) void delayMedication(medId, 5);
        clearForegroundNotification();
      }}
      onDismiss={clearForegroundNotification}
    />
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
      // Unity Ads removed; no ad initialization required.
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    async function setupNotifications() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;

      if (Platform.OS === "android") {
        try {
          // On Android 13+ apps must request POST_NOTIFICATIONS at runtime
          // in addition to using Notifications.requestPermissionsAsync.
          if (Platform.Version >= 33) {
            const res = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            if (res !== PermissionsAndroid.RESULTS.GRANTED) {
              // user denied notification permission on Android 13+
            }
          }
        } catch (e) {}
      }

      // Handler for notifications when app is in foreground
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Listener for notifications when app is in foreground
      // This ensures full-screen reminder displays even with locked screen
      const foregroundSubscription = Notifications.addNotificationReceivedListener(
        (notification: Notifications.Notification) => {
          // Notification will be handled by NotificationOverlay component
          // which accesses it via useApp().foregroundNotification
          void notification;
        }
      );

      // Listener for when user interacts with notification
      const responseSubscription = Notifications.addNotificationResponseReceivedListener(
        (response: Notifications.NotificationResponse) => {
          // Handled by app's notification action system
          void response;
        }
      );

      return () => {
        foregroundSubscription.remove();
        responseSubscription.remove();
      };
    }

    const unsubscribe = setupNotifications();
    return () => {
      unsubscribe?.then(fn => fn?.());
    };
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
                <NotificationOverlay />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AppContextProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

