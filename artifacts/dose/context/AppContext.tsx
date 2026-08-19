import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useColorScheme, PermissionsAndroid, Linking, Platform } from "react-native";
import type { Language } from "@/constants/i18n";
import * as Notifications from "expo-notifications";
import { medicationAlarmManager } from "@/services/MedicationAlarmManager";
// Create alarm-like notification channel for Android
async function ensureAlarmChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("alarm", {
      name: "المنبهات والتذكيرات",
      importance: Notifications.AndroidImportance.MAX,
      sound: "notify",
      vibrationPattern: [0, 500, 500, 500, 500],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      },
    });
  }
}

async function ensureNotificationPermission() {
  if (Platform.OS === "web") return true;

  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === "granted") return true;

  const requested = await Notifications.requestPermissionsAsync();
  if (requested.status === "granted") return true;

  if (Platform.OS === "android" && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (result === PermissionsAndroid.RESULTS.GRANTED) return true;
  }

  return false;
}

const DOSE_REMINDER_CATEGORY = "doseReminder";

function formatTimeForNotification(date: Date, lang: Language) {
  return date.toLocaleTimeString(lang === "ar" ? "ar-SA" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type MedicationType = "pill" | "injection";
export type RouteType =
  | "oral"
  | "im"
  | "iv"
  | "sc"
  | "sublingual"
  | "topical"
  | "inhalation"
  | "other";

export interface Medication {
  id: string;
  name: string;
  type: MedicationType;
  doseAmount: string;
  route: RouteType;
  intervalHours: number;
  startTime: string;
  lastConfirmedAt: string | null;
  nextDueAt: string;
  isAlarmActive: boolean;
  missedCount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  colorTag?: string;
}

export type MedicationStatus =
  | "upcoming"
  | "due_now"
  | "overdue"
  | "confirmed_recently";

export type NotificationActionType = "confirm" | "delay";

export interface NotificationAction {
  medId: string;
  type: NotificationActionType;
}

export type ThemeMode = "light" | "dark" | "system";

export interface AppSettings {
  themeMode: ThemeMode;
  language: Language;
  persistentAlarm: boolean;
  vibration: boolean;
  timeFormat: "12h" | "24h";
}

const MEDICATIONS_KEY = "@dose_medications";
const SETTINGS_KEY = "@dose_settings";

const defaultSettings: AppSettings = {
  themeMode: "system",
  language: "ar",
  persistentAlarm: true,
  vibration: true,
  timeFormat: "24h",
};

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function getMedicationStatus(med: Medication): MedicationStatus {
  const now = new Date();
  const nextDue = new Date(med.nextDueAt);
  const diff = nextDue.getTime() - now.getTime();
  const minutesDiff = diff / (1000 * 60);

  if (med.lastConfirmedAt) {
    const lastConfirmed = new Date(med.lastConfirmedAt);
    const minutesSince =
      (now.getTime() - lastConfirmed.getTime()) / (1000 * 60);
    if (minutesSince < 5 && minutesDiff > 0) {
      return "confirmed_recently";
    }
  }

  if (diff < 0) return "overdue";
  if (minutesDiff <= 30) return "due_now";
  return "upcoming";
}

export function getTimeRemaining(isoString: string): {
  diff: number;
  isOverdue: boolean;
  formatted: string;
} {
  const now = new Date();
  const target = new Date(isoString);
  const diff = target.getTime() - now.getTime();
  const isOverdue = diff < 0;
  const absDiff = Math.abs(diff);

  const totalSeconds = Math.floor(absDiff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let formatted: string;
  if (days > 0) {
    formatted = `${days}d ${hours}h`;
  } else if (hours > 0) {
    formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  } else {
    formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return { diff, isOverdue, formatted };
}

export function getProgressPercent(med: Medication): number {
  const intervalMs = med.intervalHours * 60 * 60 * 1000;
  const startRef = med.lastConfirmedAt
    ? new Date(med.lastConfirmedAt)
    : new Date(med.startTime);
  const now = new Date();
  const elapsed = now.getTime() - startRef.getTime();
  
  // 5-minute rest period after confirming dose
  const restPeriodMs = 5 * 60 * 1000;
  if (elapsed < restPeriodMs) {
    return 0; // Show 0% during rest period
  }
  
  // After rest period, calculate progress from the end of the rest period
  const progressElapsed = elapsed - restPeriodMs;
  const progress = Math.min(1, Math.max(0, progressElapsed / intervalMs));
  return progress;
}

interface AppContextType {
  medications: Medication[];
  settings: AppSettings;
  loaded: boolean;
  tick: number;
  isDark: boolean;
  notificationAction: NotificationAction | null;
  foregroundNotification: any;
  clearNotificationAction: () => void;
  clearForegroundNotification: () => void;
  addMedication: (
    data: Omit<
      Medication,
      | "id"
      | "lastConfirmedAt"
      | "nextDueAt"
      | "isAlarmActive"
      | "createdAt"
      | "updatedAt"
    >
  ) => Promise<void>;
  updateMedication: (id: string, data: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  confirmIntake: (id: string) => Promise<void>;
  delayMedication: (id: string, minutes?: number) => Promise<void>;
  updateSettings: (s: AppSettings) => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppContextProvider");
  return ctx;
}

export function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const systemColorScheme = useColorScheme();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);
  const [notificationAction, setNotificationAction] = useState<NotificationAction | null>(null);
  const [foregroundNotification, setForegroundNotification] = useState<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scheduleSignatureRef = useRef<Map<string, string>>(new Map());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    loadData();
    ensureAlarmChannel();
    Notifications.setNotificationCategoryAsync(DOSE_REMINDER_CATEGORY, [
      {
        identifier: "confirm",
        buttonTitle: "Confirm",
        options: { opensAppToForeground: true },
      },
      {
        identifier: "delay",
        buttonTitle: "Delay 5 min",
        options: { opensAppToForeground: true },
      },
    ]).catch(() => {});

    // Attempt to request battery-optimization whitelist on Android when app starts
    async function tryRequestIgnore() {
      if (Platform.OS !== "android") return;
      try {
        const IntentLauncher = await import("expo-intent-launcher");
        // Some devices support a direct request action that accepts a package URI
        try {
          // Import Application dynamically to avoid bundling errors when the
          // package isn't installed in dev environments.
          const Application = await import("expo-application");
          await IntentLauncher.startActivityAsync(
            "android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
            { data: `package:${Application.applicationId}` }
          );
        } catch (err) {
          // Fallback: open battery optimization settings for manual whitelist
          await IntentLauncher.startActivityAsync(
            "android.settings.BATTERY_SAVER_SETTINGS"
          );
        }
      } catch (e) {}
    }

    tryRequestIgnore();
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Verify native alarm permissions and log status (non-blocking)
  useEffect(() => {
    if (!loaded || Platform.OS !== "android") return;

    async function verifyAlarmPermissions() {
      try {
        const hasExact = await medicationAlarmManager.hasExactAlarmPermission();
        const hasNotif = await medicationAlarmManager.hasNotificationPermission();
        const whitelisted = await medicationAlarmManager.isBatteryOptimizationWhitelisted();

        console.log("Alarm permissions:", {
          exactAlarm: hasExact,
          notifications: hasNotif,
          batteryWhitelisted: whitelisted,
        });

        if (!hasExact || !hasNotif || !whitelisted) {
          console.warn(
            "Some alarm permissions are missing. Medication alarms may not work reliably. " +
            "Please check app settings and permissions."
          );
        }
      } catch (e) {
        console.warn("Could not verify alarm permissions (native module may not be available):", e);
      }
    }

    verifyAlarmPermissions();
  }, [loaded]);

  async function loadData() {
    try {
      const [medsRaw, settingsRaw] = await Promise.all([
        AsyncStorage.getItem(MEDICATIONS_KEY),
        AsyncStorage.getItem(SETTINGS_KEY),
      ]);
      if (medsRaw) {
        try {
          const parsed: Medication[] = JSON.parse(medsRaw);
          // Ensure older stored items have missedCount
          const normalized = parsed.map((m) => ({ ...m, missedCount: typeof m.missedCount === 'number' ? m.missedCount : 0 }));
          setMedications(normalized);
        } catch (e) {
          setMedications(JSON.parse(medsRaw));
        }
      }
      if (settingsRaw)
        setSettings({ ...defaultSettings, ...JSON.parse(settingsRaw) });
    } catch (_) {}
    setLoaded(true);
  }

  async function saveMedications(meds: Medication[]) {
    setMedications(meds);
    await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(meds));
  }

  async function cancelMedicationNotifications(medId: string) {
    if (Platform.OS === "web") return;
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const cancelIds = scheduled
        .filter((item) => item.content?.data?.medId === medId)
        .map((item) => item.identifier);
      await Promise.all(
        cancelIds.map((id: string) => Notifications.cancelScheduledNotificationAsync(id))
      );

      // Also cancel native Android alarm if present
      if (Platform.OS === "android") {
        await medicationAlarmManager.cancelAllAlarmsForMedication(medId);
      }
    } catch (_) {}
  }

  const getReminderSchedule = useCallback((nextDue: Date, now: Date) => {
    const dueMs = nextDue.getTime();
    const nowMs = now.getTime();
    const reminderTimes: Array<{ time: Date; kind: "soon_30" | "soon_5" | "now" }> = [];

    // 5-minute rest after the dose is due before the next reminder cycle can begin.
    const restWindowEndsAt = dueMs + 5 * 60 * 1000;
    if (dueMs <= nowMs && nowMs < restWindowEndsAt) {
      // Within rest window - don't schedule new reminders.
      return reminderTimes;
    }

    const soon30 = dueMs - 30 * 60 * 1000;
    const soon5 = dueMs - 5 * 60 * 1000;

    // Schedule 30-minute reminder if it's in the future.
    if (soon30 > nowMs) {
      reminderTimes.push({ time: new Date(soon30), kind: "soon_30" });
    }

    // Schedule 5-minute reminder if it's in the future.
    if (soon5 > nowMs) {
      reminderTimes.push({ time: new Date(soon5), kind: "soon_5" });
    }

    // Handle overdue or due-now doses, but only once per medication cycle.
    if (dueMs < nowMs) {
      reminderTimes.push({ time: now, kind: "now" });
    } else {
      reminderTimes.push({ time: nextDue, kind: "now" });
    }

    return reminderTimes.filter((item, index, arr) => {
      if (item.kind !== "now") return true;
      return arr.findIndex((candidate) => candidate.kind === "now") === index;
    });
  }, []);

  const scheduleMedicationReminders = useCallback(
    async (med: Medication) => {
      if (Platform.OS === "web") return;

      const scheduleSignature = `${med.id}:${med.nextDueAt}:${med.intervalHours}:${med.startTime}:${settings.language}:${settings.persistentAlarm}:${settings.vibration}`;
      const previousSignature = scheduleSignatureRef.current.get(med.id);
      if (previousSignature === scheduleSignature) {
        return;
      }
      scheduleSignatureRef.current.set(med.id, scheduleSignature);

      try {
        const permissionGranted = await ensureNotificationPermission();
        if (!permissionGranted) return;

        await cancelMedicationNotifications(med.id);

        const now = new Date();
        const nextDue = new Date(med.nextDueAt);
        const reminders = getReminderSchedule(nextDue, now);

      const actionTitleMap = {
        confirm: settings.language === "ar" ? "تأكيد" : "Confirm",
        delay: settings.language === "ar" ? "ذكرني بعد 5 دقائق" : "Remind me in 5 min",
      };

      await Notifications.setNotificationCategoryAsync(DOSE_REMINDER_CATEGORY, [
        {
          identifier: "confirm",
          buttonTitle: actionTitleMap.confirm,
          options: { opensAppToForeground: true },
        },
        {
          identifier: "delay",
          buttonTitle: actionTitleMap.delay,
          options: { opensAppToForeground: true },
        },
      ]);

        await Promise.all(
          reminders.map(async ({ time, kind }, index) => {
            const seconds = Math.max(1, Math.floor((time.getTime() - Date.now()) / 1000));
            const isArabic = settings.language === "ar";
            const body =
              kind === "soon_30"
                ? isArabic
                  ? `${med.doseAmount} · بعد 30 دقيقة` 
                  : `${med.doseAmount} · 30 minutes until dose`
                : kind === "soon_5"
                  ? isArabic
                    ? `${med.doseAmount} · بعد 5 دقائق`
                    : `${med.doseAmount} · 5 minutes until dose`
                  : isArabic
                    ? `${med.doseAmount} · حان وقت الدواء الآن`
                    : `${med.doseAmount} · Time to take your dose now`;

            const isExactMedicationTime = kind === "now";
            let nativeAlarmScheduled = false;

            if (isExactMedicationTime && Platform.OS === "android") {
              try {
                nativeAlarmScheduled = await medicationAlarmManager.scheduleAlarm({
                  medicationId: med.id,
                  medicationName: med.name,
                  doseAmount: med.doseAmount,
                  scheduledTimeMs: time.getTime(),
                });
              } catch (e) {
                console.warn("Failed to schedule native alarm:", e);
              }
            }

            if (nativeAlarmScheduled) return null;

            return Notifications.scheduleNotificationAsync({
              content: {
                title: med.name,
                body,
                sound: "notify",
                vibrate: settings.vibration ? [0, 250, 250, 250] : undefined,
                data: {
                  medId: med.id,
                  type: "dose_reminder",
                  reminderIndex: index,
                  reminderKind: kind,
                },
                categoryIdentifier: DOSE_REMINDER_CATEGORY,
                android: {
                  channelId: "alarm",
                  importance: Notifications.AndroidImportance.MAX,
                  priority: Notifications.AndroidNotificationPriority.MAX,
                  sticky: settings.persistentAlarm,
                  vibrate: settings.vibration ? [0, 250, 250, 250] : undefined,
                  color: "#38F7A7",
                  groupSummary: false,
                  showBadge: true,
                  fullScreenIntent: isExactMedicationTime,
                  showWhenLocked: isExactMedicationTime,
                  turnScreenOn: isExactMedicationTime,
                  autoCancel: false,
                },
              },
              trigger: { type: "date", date: time },
            } as any);
          })
        );
      } catch (error) {
        console.warn("Failed to schedule medication reminders:", error);
      }
    },
    [getReminderSchedule, settings]
  );

  useEffect(() => {
    if (!loaded) return;
    async function refreshAlarms() {
      // Schedule reminders for existing medications in the background
      // Don't await - let it happen asynchronously
      medications.forEach((med) => {
        void scheduleMedicationReminders(med);
      });
    }
    refreshAlarms();
  }, [loaded, medications, settings.persistentAlarm, settings.vibration, settings.language, scheduleMedicationReminders]);

  // Detect overdue doses and trigger immediate alarms
  // IMPORTANT: Do NOT silently advance nextDueAt. Keep unconfirmed doses active.
  useEffect(() => {
    if (!loaded) return;

    async function detectAndScheduleOverdueDoses() {
      const now = new Date();
      
      // For each medication, check if it's overdue and unconfirmed
      medications.forEach((med) => {
        const nextDue = new Date(med.nextDueAt);
        
        // If nextDueAt is in the past AND the dose hasn't been confirmed,
        // we need to ensure an alarm is triggered immediately
        if (nextDue.getTime() < now.getTime()) {
          // The dose is overdue. Trigger scheduling to ensure alarm is set.
          // scheduleMedicationReminders will handle the "now" alarm.
          void scheduleMedicationReminders(med);
        }
      });
    }

    // Run immediately on load, then periodically check
    void detectAndScheduleOverdueDoses();
    const id = setInterval(() => {
      void detectAndScheduleOverdueDoses();
    }, 5 * 1000); // Check every 5 seconds for overdue doses

    return () => clearInterval(id);
  }, [loaded, medications, scheduleMedicationReminders]);

  async function saveSettings(s: AppSettings) {
    setSettings(s);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  }

  const delayMedication = useCallback(
    async (id: string, minutes = 5) => {
      const med = medications.find((m) => m.id === id);
      if (!med) return;

      // Dismiss native alarm if running
      if (Platform.OS === "android") {
        try {
          await medicationAlarmManager.dismissAlarm();
        } catch (e) {
          console.warn("Failed to dismiss native alarm:", e);
        }
      }

      const nextDue = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      const updated = medications.map((m) =>
        m.id === id
          ? {
              ...m,
              nextDueAt: nextDue,
              updatedAt: new Date().toISOString(),
            }
          : m
      );

      await saveMedications(updated);
      const updatedMed = updated.find((m) => m.id === id);
      if (updatedMed) {
        await scheduleMedicationReminders(updatedMed);
      }
    },
    [medications, saveMedications, scheduleMedicationReminders]
  );

  const addMedication = useCallback(
  async (
    data: Omit<
      Medication,
      | "id"
      | "lastConfirmedAt"
      | "nextDueAt"
      | "isAlarmActive"
      | "createdAt"
      | "updatedAt"
    >
  ) => {
    const now = new Date().toISOString();
    const start = new Date(data.startTime); // ISO string → Date
    const nextDue = new Date(start.getTime() + data.intervalHours * 60 * 60 * 1000).toISOString();

    const med: Medication = {
      ...data,
      id: generateId(),
      lastConfirmedAt: null,
      nextDueAt: nextDue,       // ✅ properly calculated
      isAlarmActive: false,
      missedCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    await saveMedications([...medications, med]);

    // Schedule notifications in the background.
    // Don't make the Save button wait for all notifications.
    void scheduleMedicationReminders(med).catch((error) => {
      console.warn("Failed to schedule medication reminders:", error);
    });
  },
  [medications, settings, saveMedications]
);



const updateMedication = useCallback(
  async (id: string, data: Partial<Medication>) => {
    const updated = medications.map((m) => {
      if (m.id !== id) return m;

      const merged = { ...m, ...data };

      let nextDueAt = merged.nextDueAt;

      if (data.startTime || data.intervalHours) {
        const start = new Date(merged.startTime);

        nextDueAt = new Date(
          start.getTime() +
            merged.intervalHours * 60 * 60 * 1000
        ).toISOString();
      }

      return {
        ...merged,
        nextDueAt,
        updatedAt: new Date().toISOString(),
      };
    });

    // Save immediately
    await saveMedications(updated);

    // Find updated medication
    const updatedMed = updated.find((m) => m.id === id);

    // Schedule notifications in background
    if (updatedMed) {
      void scheduleMedicationReminders(updatedMed).catch((error) => {
        console.warn(
          "Failed to schedule updated medication reminders:",
          error
        );
      });
    }
  },
  [medications, saveMedications, scheduleMedicationReminders]
);

  const deleteMedication = useCallback(
    async (id: string) => {
      // Delete immediately from UI - don't wait for notification cancellation
      scheduleSignatureRef.current.delete(id);
      await saveMedications(medications.filter((m) => m.id !== id));
      // Cancel notifications in background without blocking
      void cancelMedicationNotifications(id);
    },
    [medications, saveMedications]
  );

  const confirmIntake = useCallback(
    async (id: string) => {
      const now = new Date();
      const med = medications.find((m) => m.id === id);
      if (!med) return;

      // Dismiss native alarm if running
      if (Platform.OS === "android") {
        try {
          await medicationAlarmManager.dismissAlarm();
        } catch (e) {
          console.warn("Failed to dismiss native alarm:", e);
        }
      }

      // Check if this was an overdue dose
      const wasOverdue = new Date(med.nextDueAt).getTime() < now.getTime();

      // Add 5-minute rest period before the next dose timer starts
      const restEndTime = now.getTime() + 5 * 60 * 1000; // 5 minutes rest
      const nextDue = new Date(
        restEndTime + med.intervalHours * 60 * 60 * 1000
      );

      const updated = medications.map((m) =>
        m.id === id
          ? {
              ...m,
              lastConfirmedAt: now.toISOString(),
              nextDueAt: nextDue.toISOString(),
              isAlarmActive: false,
              // Reset missedCount when dose is confirmed (even if overdue)
              missedCount: wasOverdue ? 0 : m.missedCount,
              updatedAt: now.toISOString(),
            }
          : m
      );
      await saveMedications(updated);

      const updatedMed = updated.find((m) => m.id === id);
      if (updatedMed) {
        // Cancel all existing notifications and schedule next cycle
        await cancelMedicationNotifications(id);
        await scheduleMedicationReminders(updatedMed);
      }
    },
    [medications, saveMedications, scheduleMedicationReminders, cancelMedicationNotifications]
  );

  const clearNotificationAction = useCallback(() => {
    setNotificationAction(null);
  }, []);

  const clearForegroundNotification = useCallback(() => {
    setForegroundNotification(null);
  }, []);

  useEffect(() => {
    // Handle notifications when app is in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        // Show foreground notification as full-screen modal
        const medId = notification.request.content.data?.medId;
        if (medId && typeof medId === "string") {
          setForegroundNotification(notification);
        }
      }
    );

    // Handle notification responses (when user taps a notification or action button)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        const medId = response.notification.request.content.data?.medId;
        if (!medId || typeof medId !== "string") return;

        if (response.actionIdentifier === "confirm") {
          // attempt to auto-confirm immediately when the notification action is tapped
          try {
            void confirmIntake(medId);
          } catch (e) {}
          setNotificationAction({ medId, type: "confirm" });
        } else if (response.actionIdentifier === "delay") {
          try {
            void delayMedication(medId, 5);
          } catch (e) {}
          setNotificationAction({ medId, type: "delay" });
        }
      }
    );

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, [confirmIntake, delayMedication]);

  const sendTestNotification = useCallback(async () => {
    if (Platform.OS === "web") return;
    try {
      const permissionGranted = await ensureNotificationPermission();
      if (!permissionGranted) {
        alert("Notification permission is required to show reminders.");
        return;
      }

      // Ensure alarm channel is set up
      await ensureAlarmChannel();

      // Get first medication for test notification
      const testMed = medications[0];
      if (!testMed) {
        alert("Please add a medication first");
        return;
      }

      const message = settings.language === "ar" 
        ? "اختبار الإشعار - وقت تناول الدواء الآن!"
        : "Test Notification - Time to take medication now!";

      await Notifications.setNotificationCategoryAsync(DOSE_REMINDER_CATEGORY, [
        {
          identifier: "confirm",
          buttonTitle: settings.language === "ar" ? "تأكيد" : "Confirm",
          options: { opensAppToForeground: true },
        },
        {
          identifier: "delay",
          buttonTitle: settings.language === "ar" ? "ذكرني بعد 5 دقائق" : "Remind me in 5 min",
          options: { opensAppToForeground: true },
        },
      ]);

      // Send immediate notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: testMed.name,
          body: `${testMed.doseAmount} · ${message}`,
          sound: "notify",
          vibrate: settings.vibration ? [0, 250, 250, 250] : undefined,
          data: {
            medId: testMed.id,
            type: "dose_reminder",
            isTest: true,
          },
          categoryIdentifier: DOSE_REMINDER_CATEGORY,
          android: {
            channelId: "alarm",
            importance: Notifications.AndroidImportance.MAX,
            priority: Notifications.AndroidNotificationPriority.MAX,
            sticky: settings.persistentAlarm,
            vibrate: settings.vibration ? [0, 250, 250, 250] : undefined,
            color: "#38F7A7",
            groupSummary: false,
            showBadge: true,
            fullScreenIntent: true,
            showWhenLocked: true,
            turnScreenOn: true,
            autoCancel: false,
          },
        },
        trigger: { type: "date", date: new Date(Date.now() + 1000) },
      } as any);
    } catch (error) {
      console.warn("Test notification failed:", error);
      alert("Test notification failed. Check console for details.");
    }
  }, [medications, settings]);

  const isDark =
    settings.themeMode === "dark" ||
    (settings.themeMode === "system" && systemColorScheme === "dark");

  const value: AppContextType = {
    medications,
    settings,
    loaded,
    tick,
    isDark,
    notificationAction,
    foregroundNotification,
    clearNotificationAction,
    clearForegroundNotification,
    addMedication,
    updateMedication,
    deleteMedication,
    confirmIntake,
    delayMedication,
    updateSettings: saveSettings,
    sendTestNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
