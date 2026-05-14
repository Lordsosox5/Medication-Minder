import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useColorScheme } from "react-native";
import type { Language } from "@/constants/i18n";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
// Create alarm-like notification channel for Android
async function ensureAlarmChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("alarm", {
      name: "Alarm",
      importance: Notifications.AndroidImportance.MAX,
      sound: "notify.wav",
      vibrationPattern: [0, 500, 500, 500, 500],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
        // flags removed: not available in Expo
      },
    });
  }
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
  language: "en",
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
  const progress = Math.min(1, Math.max(0, elapsed / intervalMs));
  return progress;
}

interface AppContextType {
  medications: Medication[];
  settings: AppSettings;
  loaded: boolean;
  tick: number;
  isDark: boolean;
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
  updateSettings: (s: AppSettings) => Promise<void>;
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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    loadData();
    ensureAlarmChannel();
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function loadData() {
    try {
      const [medsRaw, settingsRaw] = await Promise.all([
        AsyncStorage.getItem(MEDICATIONS_KEY),
        AsyncStorage.getItem(SETTINGS_KEY),
      ]);
      if (medsRaw) setMedications(JSON.parse(medsRaw));
      if (settingsRaw)
        setSettings({ ...defaultSettings, ...JSON.parse(settingsRaw) });
    } catch (_) {}
    setLoaded(true);
  }

  async function saveMedications(meds: Medication[]) {
    setMedications(meds);
    await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(meds));
  }

  async function saveSettings(s: AppSettings) {
    setSettings(s);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  }

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
      createdAt: now,
      updatedAt: now,
    };

    await saveMedications([...medications, med]);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "وقت الجرعة",
        body: `الجرعة القادمة لـ ${med.name} اقتربت!`,
        sound: "notify.wav",
        vibrate: settings.vibration ? [0, 250, 250, 250] : undefined,
      },
      trigger: settings.persistentAlarm
        ? { seconds: 60, repeats: true, type: "timeInterval" }
        : { date: new Date(nextDue), type: "calendar" },
      android: { channelId: "alarm" },
    });

  },
  [medications]
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
          start.getTime() + merged.intervalHours * 60 * 60 * 1000
        ).toISOString();
      }

      return {
        ...merged,
        nextDueAt,
        updatedAt: new Date().toISOString(),
      };
    });
    
    await saveMedications(updated);
  },
  [medications]
);

  const deleteMedication = useCallback(
    async (id: string) => {
      await saveMedications(medications.filter((m) => m.id !== id));
    },
    [medications]
  );

const confirmIntake = useCallback(
  async (id: string) => {
    const now = new Date();
    const med = medications.find((m) => m.id === id);
    if (!med) return;

    const nextDue = new Date(
      now.getTime() + med.intervalHours * 60 * 60 * 1000
    );

    const updated = medications.map((m) =>
      m.id === id
        ? {
            ...m,
            lastConfirmedAt: now.toISOString(),
            nextDueAt: nextDue.toISOString(),
            isAlarmActive: false,
            updatedAt: now.toISOString(),
          }
        : m
    );
    await saveMedications(updated);

    // ✅ Schedule the next reminder after confirming intake
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "وقت الجرعة",
          body: `الجرعة القادمة لـ ${med.name} اقتربت!`,
          sound: "notify.wav",
          vibrate: settings.vibration ? [0, 250, 250, 250] : undefined,
        },
        trigger: settings.persistentAlarm
          ? { seconds: 60, repeats: true, type: "timeInterval" }
          : { date: new Date(nextDue), type: "calendar" },
      });

  },
    [medications]
  );

  const isDark =
    settings.themeMode === "dark" ||
    (settings.themeMode === "system" && systemColorScheme === "dark");

  const value: AppContextType = {
    medications,
    settings,
    loaded,
    tick,
    isDark,
    addMedication,
    updateMedication,
    deleteMedication,
    confirmIntake,
    updateSettings: saveSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
