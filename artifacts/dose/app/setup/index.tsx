import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  useColorScheme,
  Switch,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold } from "@expo-google-fonts/tajawal";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { PermissionsAndroid } from "react-native";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { t } from "@/constants/i18n";

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

type SetupStep = "notifications" | "battery" | "settings" | "complete";

export default function Setup() {
  const [currentStep, setCurrentStep] = useState<SetupStep>("notifications");
  const [fontsLoaded] = useFonts({ Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold });
  const colorScheme = useColorScheme();
  const C = colorScheme === "dark" ? Colors.dark : Colors.light;
  const router = useRouter();
  const { updateSettings, settings } = useApp();
  const lang = getDeviceLanguage();
  const isRTL = lang === "ar";
  
  const [notificationStatus, setNotificationStatus] = useState<"granted" | "denied" | "checking">("checking");
  const [persistentAlarmEnabled, setPersistentAlarmEnabled] = useState(settings.persistentAlarm);
  const [vibrationEnabled, setVibrationEnabled] = useState(settings.vibration);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationStatus(status as any);
  };

  const requestNotificationPermissions = async () => {
    if (Platform.OS === "web") return;

    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationStatus(status as any);

    if (Platform.OS === "android") {
      try {
        const IntentLauncher = await import("expo-intent-launcher");
        const Application = await import("expo-application");

        await IntentLauncher.startActivityAsync(
          "android.settings.action.MANAGE_OVERLAY_PERMISSION",
          { data: `package:${Application.applicationId}` }
        );
      } catch (e) {}

      if (Platform.Version >= 33) {
        try {
          const res = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          if (res === PermissionsAndroid.RESULTS.GRANTED) {
            setNotificationStatus("granted");
          }
        } catch (e) {}
      }
    }
  };

  const openBatterySettings = async () => {
    if (Platform.OS !== "android") {
      await Linking.openSettings();
      return;
    }

    try {
      const IntentLauncher = await import("expo-intent-launcher");
      await IntentLauncher.startActivityAsync(
        "android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS"
      );
    } catch (error) {
      try {
        const IntentLauncher = await import("expo-intent-launcher");
        const Application = await import("expo-application");

        await IntentLauncher.startActivityAsync(
          "android.settings.APPLICATION_DETAILS_SETTINGS",
          {
            data: `package:${Application.applicationId}`,
          }
        );
      } catch {
        await Linking.openSettings();
      }
    }
  };

  const openNotificationSettings = async () => {
    if (Platform.OS !== "android") {
      await Linking.openSettings();
      return;
    }

    try {
      const IntentLauncher = await import("expo-intent-launcher");
      const Application = await import("expo-application");

      // Open the app-specific notification settings
      await IntentLauncher.startActivityAsync(
        "android.settings.APP_NOTIFICATION_SETTINGS",
        { 
          data: `package:${Application.applicationId}`,
          extra: {
            "android.provider.extra.APP_PACKAGE": Application.applicationId,
          },
        }
      );
      return;
    } catch (err) {}

    try {
      const IntentLauncher = await import("expo-intent-launcher");
      const Application = await import("expo-application");

      // Fallback: Open notification channel settings for alarm channel
      await IntentLauncher.startActivityAsync(
        "android.settings.CHANNEL_NOTIFICATION_SETTINGS",
        {
          data: `package:${Application.applicationId}`,
          extra: {
            "android.provider.extra.CHANNEL_ID": "alarm",
          },
        }
      );
      return;
    } catch (e) {}

    try {
      const IntentLauncher = await import("expo-intent-launcher");
      const Application = await import("expo-application");

      // Fallback: Open app details settings
      await IntentLauncher.startActivityAsync(
        "android.settings.APPLICATION_DETAILS_SETTINGS",
        { data: `package:${Application.applicationId}` }
      );
    } catch (_) {
      await Linking.openSettings();
    }
  };

  const openOverlayPermission = async () => {
    if (Platform.OS !== "android") {
      await Linking.openSettings();
      return;
    }

    try {
      const IntentLauncher = await import("expo-intent-launcher");
      const Application = await import("expo-application");

      await IntentLauncher.startActivityAsync(
        "android.settings.action.MANAGE_OVERLAY_PERMISSION",
        { data: `package:${Application.applicationId}` }
      );
    } catch (_) {
      await Linking.openSettings();
    }
  };

  const handleCompleteSetup = async () => {
    // Save settings
    await updateSettings({
      ...settings,
      persistentAlarm: persistentAlarmEnabled,
      vibration: vibrationEnabled,
    });

    // Mark setup as complete
    await AsyncStorage.setItem("setupComplete", "1");
    router.replace("/(tabs)");
  };

  if (!fontsLoaded) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case "notifications":
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[C.primary, getLighter(C.primary, 0.75)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.stepIcon}
              >
                <MaterialCommunityIcons name="bell-ring" size={48} color="#0B1F16" />
              </LinearGradient>
            </View>

            <Text style={[styles.stepTitle, { color: C.text, fontFamily: "Tajawal_700Bold" }]}>
              {lang === "ar" ? "تفعيل الإشعارات" : "Enable Notifications"}
            </Text>

            <Text style={[styles.stepDescription, { color: C.textSecondary, fontFamily: "Tajawal_400Regular" }]}>
              {lang === "ar"
                ? "الإشعارات ضرورية لتلقي تنبيهات الأدوية في الوقت المناسب. سيتمكن التطبيق من إرسال تذكيرات حتى عندما لا تستخدم الهاتف."
                : "Notifications are essential to receive medication reminders on time. Your device will send alerts even when the screen is off."}
            </Text>

            <View
              style={[
                styles.statusCard,
                {
                  backgroundColor: getLighter(
                    notificationStatus === "granted" ? C.success : C.warning,
                    0.12
                  ),
                  borderColor: getLighter(
                    notificationStatus === "granted" ? C.success : C.warning,
                    0.3
                  ),
                },
              ]}
            >
              <MaterialCommunityIcons
                name={notificationStatus === "granted" ? "check-circle" : "alert-circle"}
                size={24}
                color={notificationStatus === "granted" ? C.success : C.warning}
              />
              <Text style={[styles.statusText, { color: C.text, fontFamily: "Tajawal_500Medium" }]}>
                {notificationStatus === "granted"
                  ? lang === "ar"
                    ? "✓ الإشعارات مُفعّلة"
                    : "✓ Notifications Enabled"
                  : lang === "ar"
                    ? "الإشعارات معطّلة"
                    : "Notifications Disabled"}
              </Text>
            </View>

            {notificationStatus !== "granted" && (
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    backgroundColor: C.primary,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
                onPress={requestNotificationPermissions}
              >
                <MaterialCommunityIcons name="check" size={20} color="#0B1F16" />
                <Text style={[styles.actionBtnText, { fontFamily: "Tajawal_700Bold" }]}>
                  {lang === "ar" ? "تفعيل الإشعارات" : "Enable Notifications"}
                </Text>
              </Pressable>
            )}

            {Platform.OS === "android" && (
              <>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtn,
                    {
                      backgroundColor: C.info,
                      opacity: pressed ? 0.88 : 1,
                    },
                  ]}
                  onPress={openNotificationSettings}
                >
                  <MaterialCommunityIcons name="cog" size={20} color="#0B1F16" />
                  <Text style={[styles.actionBtnText, { fontFamily: "Tajawal_700Bold" }]}>
                    {lang === "ar" ? "فتح إعدادات المنبه والإشعارات" : "Open Alarm & Notification Settings"}
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtn,
                    {
                      backgroundColor: C.warning,
                      opacity: pressed ? 0.88 : 1,
                    },
                  ]}
                  onPress={openOverlayPermission}
                >
                  <MaterialCommunityIcons name="application-settings" size={20} color="#0B1F16" />
                  <Text style={[styles.actionBtnText, { fontFamily: "Tajawal_700Bold" }]}>
                    {lang === "ar"
                      ? "فتح إذن العرض فوق التطبيقات"
                      : "Open Display Over Other Apps"}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        );

      case "battery":
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[C.primaryDark, getLighter(C.primaryDark, 0.75)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.stepIcon}
              >
                <MaterialCommunityIcons name="battery-alert" size={48} color="#0B1F16" />
              </LinearGradient>
            </View>

            <Text style={[styles.stepTitle, { color: C.text, fontFamily: "Tajawal_700Bold" }]}>
              {lang === "ar" ? "تحسين بطارية الجهاز" : "Battery Optimization"}
            </Text>

            <Text style={[styles.stepDescription, { color: C.textSecondary, fontFamily: "Tajawal_400Regular" }]}>
              {lang === "ar"
                ? "يقوم نظام Android بإيقاف التطبيقات الخلفية لتوفير البطارية. يُرجى إضافة التطبيق إلى قائمة الاستثناءات حتى يعمل بشكل موثوق حتى عند إيقاف الشاشة."
                : "Android may stop background apps to save battery. Adding this app to the Battery Optimization whitelist ensures it runs reliably even when your screen is off."}
            </Text>

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: getLighter(C.info, 0.12),
                  borderColor: getLighter(C.info, 0.3),
                },
              ]}
            >
              <MaterialCommunityIcons name="information" size={20} color={C.info} />
              <Text style={[styles.infoText, { color: C.textSecondary, fontFamily: "Tajawal_400Regular" }]}>
                {lang === "ar"
                  ? "خطوات: الإعدادات > البطارية > تحسين البطارية > ابحث عن التطبيق وأضفه للاستثناءات"
                  : "Steps: Settings > Battery > Battery Optimization > Find this app and exclude it"}
              </Text>
            </View>

            {Platform.OS === "android" && (
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    backgroundColor: C.primary,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
                onPress={openBatterySettings}
              >
                <MaterialCommunityIcons name="cog" size={20} color="#0B1F16" />
                <Text style={[styles.actionBtnText, { fontFamily: "Tajawal_700Bold" }]}>
                  {lang === "ar" ? "فتح إعدادات البطارية" : "Open Battery Settings"}
                </Text>
              </Pressable>
            )}
          </View>
        );

      case "settings":
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[C.success, getLighter(C.success, 0.75)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.stepIcon}
              >
                <MaterialCommunityIcons name="cog" size={48} color="#0B1F16" />
              </LinearGradient>
            </View>

            <Text style={[styles.stepTitle, { color: C.text, fontFamily: "Tajawal_700Bold" }]}>
              {lang === "ar" ? "تكوين التطبيق" : "Configure App Settings"}
            </Text>

            <Text style={[styles.stepDescription, { color: C.textSecondary, fontFamily: "Tajawal_400Regular" }]}>
              {lang === "ar"
                ? "اختر الإعدادات المفضلة لك للحصول على أفضل تجربة تذكيرات الأدوية."
                : "Choose your preferred settings for the best medication reminder experience."}
            </Text>

            <View style={styles.settingsContainer}>
              <View style={[styles.settingRow, { borderBottomColor: C.border }]}>
                <View style={styles.settingInfo}>
                  <MaterialCommunityIcons name="repeat" size={24} color={C.primary} />
                  <View style={styles.settingTextWrap}>
                    <Text style={[styles.settingLabel, { color: C.text, fontFamily: "Tajawal_500Medium" }]}>
                      {lang === "ar" ? "تنبيهات مستمرة" : "Persistent Alarms"}
                    </Text>
                    <Text style={[styles.settingDesc, { color: C.textMuted, fontFamily: "Tajawal_400Regular" }]}>
                      {lang === "ar"
                        ? "تنبيهات متكررة كل دقيقة حتى تؤكد الجرعة"
                        : "Repeat reminders every minute until confirmed"}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={persistentAlarmEnabled}
                  onValueChange={setPersistentAlarmEnabled}
                  trackColor={{ false: C.border, true: getLighter(C.primary, 0.3) }}
                  thumbColor={persistentAlarmEnabled ? C.primary : C.textMuted}
                />
              </View>

              <View style={[styles.settingRow, { borderBottomColor: "transparent" }]}>
                <View style={styles.settingInfo}>
                  <MaterialCommunityIcons name="vibrate" size={24} color={C.primary} />
                  <View style={styles.settingTextWrap}>
                    <Text style={[styles.settingLabel, { color: C.text, fontFamily: "Tajawal_500Medium" }]}>
                      {lang === "ar" ? "الاهتزاز" : "Vibration"}
                    </Text>
                    <Text style={[styles.settingDesc, { color: C.textMuted, fontFamily: "Tajawal_400Regular" }]}>
                      {lang === "ar" ? "اهتزاز الجهاز عند التنبيهات" : "Vibrate on reminders"}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={setVibrationEnabled}
                  trackColor={{ false: C.border, true: getLighter(C.primary, 0.3) }}
                  thumbColor={vibrationEnabled ? C.primary : C.textMuted}
                />
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const getNextStepLabel = () => {
    switch (currentStep) {
      case "notifications":
        return lang === "ar" ? "التالي" : "Next";
      case "battery":
        return lang === "ar" ? "التالي" : "Next";
      case "settings":
        return lang === "ar" ? "ابدأ الآن" : "Get Started";
      default:
        return lang === "ar" ? "ابدأ الآن" : "Get Started";
    }
  };

  const handleNextStep = () => {
    if (currentStep === "notifications") {
      setCurrentStep("battery");
    } else if (currentStep === "battery") {
      setCurrentStep("settings");
    } else if (currentStep === "settings") {
      handleCompleteSetup();
    }
  };

  const stepOrder: SetupStep[] = ["notifications", "battery", "settings"];
  const currentStepIndex = stepOrder.indexOf(currentStep);

  return (
    <View style={[styles.container, { backgroundColor: C.background, direction: isRTL ? "rtl" : "ltr" }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} hidden={true} backgroundColor="transparent" translucent={true} />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.glowOrb, { top: -80, left: -50, backgroundColor: getLighter(C.primary, 0.14) }]} />
        <View style={[styles.glowOrb, { bottom: -120, right: -70, backgroundColor: getLighter(C.success, 0.12) }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={[styles.brandBadge, { backgroundColor: getLighter(C.primary, 0.14), borderColor: getLighter(C.primary, 0.2) }]}>
            <MaterialCommunityIcons name="cog" size={20} color={C.primaryDark} />
          </View>
        </View>

        <Text style={[styles.headerTitle, { color: C.text, fontFamily: "Tajawal_700Bold" }]}>
          {lang === "ar" ? "إعداد التطبيق" : "Setup Your App"}
        </Text>

        <View style={styles.progressContainer}>
          {stepOrder.map((step, index) => (
            <View key={step} style={styles.progressItem}>
              <View
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: index <= currentStepIndex ? C.primary : getLighter(C.primary, 0.18),
                    borderColor: index === currentStepIndex ? C.primary : getLighter(C.primary, 0.3),
                  },
                ]}
              >
                {index < currentStepIndex && (
                  <MaterialCommunityIcons name="check" size={14} color="#0B1F16" />
                )}
              </View>
              {index < stepOrder.length - 1 && (
                <View
                  style={[
                    styles.progressLine,
                    {
                      backgroundColor: index < currentStepIndex ? C.primary : getLighter(C.primary, 0.18),
                    },
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        {renderStepContent()}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [
          styles.nextBtn,
          {
            backgroundColor: C.primary,
            opacity: pressed ? 0.88 : 1,
          },
        ]}
        onPress={handleNextStep}
      >
        <Text style={[styles.nextBtnText, { color: "#0B1F16", fontFamily: "Tajawal_700Bold" }]}>
          {getNextStepLabel()}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerRow: {
    alignItems: "flex-start",
    marginBottom: 16,
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
  headerTitle: {
    fontSize: 32,
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    gap: 0,
  },
  progressItem: {
    alignItems: "center",
    flex: 1,
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  progressLine: {
    position: "absolute",
    height: 2,
    left: "50%",
    right: -50,
    top: 15,
    zIndex: -1,
  },
  stepContent: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  stepIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: {
    fontSize: 24,
    letterSpacing: -0.3,
    marginBottom: 12,
    textAlign: "center",
  },
  stepDescription: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 24,
  },
  statusCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    minWidth: 0,
  },
  statusText: {
    fontSize: 16,
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  infoCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    minWidth: 0,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 21,
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  settingsContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(168, 214, 197, 0.2)",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    minWidth: 0,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  settingTextWrap: {
    flex: 1,
    gap: 4,
    minWidth: 0,
    flexShrink: 1,
  },
  settingLabel: {
    fontSize: 16,
    flexShrink: 1,
  },
  settingDesc: {
    fontSize: 12,
    flexShrink: 1,
  },
  actionBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    marginTop: 16,
  },
  actionBtnText: {
    fontSize: 16,
    color: "#0B1F16",
    flexShrink: 1,
    textAlign: "center",
  },
  nextBtn: {
    position: "absolute",
    bottom: 28,
    left: 24,
    right: 24,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  nextBtnText: {
    fontSize: 18,
  },
});
