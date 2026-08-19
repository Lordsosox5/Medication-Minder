/**
 * MedicationAlarmManager
 *
 * Bridge between React Native and native Android AlarmManager.
 * Handles scheduling and cancelling exact medication alarms.
 *
 * For Android 12+, requires SCHEDULE_EXACT_ALARM permission.
 * For Android 31+, app must be in battery optimization whitelist.
 */

import { Platform, NativeModules, Alert } from "react-native";

const LINKING_ERROR =
  `The package 'medication-alarm' doesn't seem to be linked. Make sure: ` +
  `\n\n` +
  `- You rebuilt the app after installing the dependency\n` +
  `- You are not using Expo Go (use a development build instead)`;

const MedicationAlarm = NativeModules.MedicationAlarm
  ? NativeModules.MedicationAlarm
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export interface AlarmRequest {
  /** Unique medication ID */
  medicationId: string;
  /** Medication name (for display) */
  medicationName: string;
  /** Dose amount (for display) */
  doseAmount: string;
  /** Scheduled time in milliseconds since epoch */
  scheduledTimeMs: number;
  /** Optional: alarm ID for tracking (defaults to hash of medId + occurrence) */
  alarmId?: number;
}

export interface AlarmAction {
  action: "taken" | "snooze" | "dismiss";
  medicationId: string;
  alarmId: number;
  timestamp: number;
}

class MedicationAlarmManagerImpl {
  /**
   * Check if exact alarm permission is granted.
   * Required for Android 12+.
   */
  async hasExactAlarmPermission(): Promise<boolean> {
    if (Platform.OS !== "android") return true;
    try {
      return await MedicationAlarm.hasExactAlarmPermission();
    } catch (e) {
      console.warn("Failed to check exact alarm permission:", e);
      return false;
    }
  }

  /**
   * Check if notification permission is granted.
   * Required for foreground service notification.
   */
  async hasNotificationPermission(): Promise<boolean> {
    if (Platform.OS !== "android") return true;
    try {
      return await MedicationAlarm.hasNotificationPermission();
    } catch (e) {
      console.warn("Failed to check notification permission:", e);
      return false;
    }
  }

  async hasFullScreenIntentPermission(): Promise<boolean> {
    if (Platform.OS !== "android" || Platform.Version < 34) return true;
    try {
      return await MedicationAlarm.hasFullScreenIntentPermission();
    } catch (e) {
      console.warn("Failed to check full-screen intent permission:", e);
      return false;
    }
  }

  /**
   * Check if app is in battery optimization whitelist.
   * Affects alarm reliability on Android 6+.
   */
  async isBatteryOptimizationWhitelisted(): Promise<boolean> {
    if (Platform.OS !== "android") return true;
    try {
      return await MedicationAlarm.isBatteryOptimizationWhitelisted();
    } catch (e) {
      console.warn("Failed to check battery optimization whitelist:", e);
      return false;
    }
  }

  /**
   * Schedule an exact medication alarm.
   *
   * @param request Alarm scheduling details
   * @returns Promise<boolean> - true if scheduled successfully
   *
   * Throws if:
   * - Exact alarm permission not granted (Android 12+)
   * - Notification permission not granted
   * - Time is in the past
   */
  async scheduleAlarm(request: AlarmRequest): Promise<boolean> {
    if (Platform.OS !== "android") {
      console.log("scheduleAlarm: skipping on non-Android platform");
      return true;
    }

    try {
      // Validate input
      if (request.scheduledTimeMs <= Date.now()) {
        console.warn("scheduleAlarm: scheduled time is in the past");
        return false;
      }

      // Generate deterministic alarm ID if not provided
      const alarmId = request.alarmId || this.generateAlarmId(request.medicationId);

      // Call native scheduling
      const result = await MedicationAlarm.scheduleAlarm({
        alarmId,
        medicationId: request.medicationId,
        medicationName: request.medicationName,
        doseAmount: request.doseAmount,
        scheduledTimeMs: Math.floor(request.scheduledTimeMs),
      });

      console.log(`Alarm scheduled: ${request.medicationName} at ${new Date(request.scheduledTimeMs).toISOString()}`);
      return result === true;
    } catch (e) {
      console.error("Failed to schedule alarm:", e);
      return false;
    }
  }

  /**
   * Cancel a scheduled medication alarm.
   *
   * @param medicationId The medication ID
   * @param alarmId Optional alarm ID (if not provided, generates one)
   * @returns Promise<boolean> - true if cancelled successfully
   */
  async cancelAlarm(medicationId: string, alarmId?: number): Promise<boolean> {
    if (Platform.OS !== "android") {
      return true;
    }

    try {
      const id = alarmId || this.generateAlarmId(medicationId);
      await MedicationAlarm.cancelAlarm(id);
      console.log(`Alarm cancelled: medication ${medicationId}`);
      return true;
    } catch (e) {
      console.error("Failed to cancel alarm:", e);
      return false;
    }
  }

  /**
   * Cancel all alarms for a medication.
   * Useful when editing/deleting medications.
   */
  async cancelAllAlarmsForMedication(medicationId: string): Promise<boolean> {
    if (Platform.OS !== "android") {
      return true;
    }

    try {
      await MedicationAlarm.cancelAllAlarmsForMedication(medicationId);
      console.log(`All alarms cancelled for medication: ${medicationId}`);
      return true;
    } catch (e) {
      console.error("Failed to cancel all alarms:", e);
      return false;
    }
  }

  /**
   * Dismiss/stop the currently playing alarm.
   */
  async dismissAlarm(): Promise<boolean> {
    if (Platform.OS !== "android") {
      return true;
    }

    try {
      await MedicationAlarm.dismissAlarm();
      return true;
    } catch (e) {
      console.error("Failed to dismiss alarm:", e);
      return false;
    }
  }

  /**
   * Snooze the current alarm for specified minutes.
   */
  async snoozeAlarm(minutes: number = 5): Promise<boolean> {
    if (Platform.OS !== "android") {
      return true;
    }

    try {
      await MedicationAlarm.snoozeAlarm(Math.floor(minutes));
      return true;
    } catch (e) {
      console.error("Failed to snooze alarm:", e);
      return false;
    }
  }

  /**
   * Get all currently scheduled alarms.
   * Useful for reconciliation on app startup.
   */
  async getScheduledAlarms(): Promise<
    Array<{
      alarmId: number;
      medicationId: string;
      scheduledTimeMs: number;
    }>
  > {
    if (Platform.OS !== "android") {
      return [];
    }

    try {
      return await MedicationAlarm.getScheduledAlarms();
    } catch (e) {
      console.error("Failed to get scheduled alarms:", e);
      return [];
    }
  }

  /**
   * Generate deterministic alarm ID from medication ID.
   * Ensures same medication always gets same ID for cancellation.
   */
  private generateAlarmId(medicationId: string): number {
    let hash = 0;
    for (let i = 0; i < medicationId.length; i++) {
      const char = medicationId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Convert to positive 32-bit integer, reserve some range for multiple occurrences
    return Math.abs(hash) % 2147483647;
  }

  /**
   * Generate alarm ID for a specific occurrence of a recurring medication.
   * Used when same medication has multiple daily/weekly occurrences.
   */
  generateOccurrenceAlarmId(medicationId: string, occurrenceIndex: number): number {
    const baseId = this.generateAlarmId(medicationId);
    // Add occurrence offset to base ID (mod to keep in 32-bit range)
    return (baseId + occurrenceIndex) % 2147483647;
  }

  /**
   * Verify permissions and show user-friendly alerts if missing.
   */
  async verifyPermissionsAndAlert(): Promise<boolean> {
    if (Platform.OS !== "android") return true;

    const hasExact = await this.hasExactAlarmPermission();
    const hasNotif = await this.hasNotificationPermission();
    const whitelisted = await this.isBatteryOptimizationWhitelisted();

    let issues: string[] = [];

    if (!hasExact) {
      issues.push("Exact Alarms permission not granted");
    }

    if (!hasNotif) {
      issues.push("Notification permission not granted");
    }

    if (!whitelisted) {
      issues.push("App not whitelisted from battery optimization");
    }

    if (issues.length > 0) {
      Alert.alert(
        "Alarm Permission Issue",
        `Medication alarms may not work reliably:\n\n${issues.join("\n")}\n\nPlease check app settings and permissions.`,
        [{ text: "OK" }]
      );
      return false;
    }

    return true;
  }
}

export const medicationAlarmManager = new MedicationAlarmManagerImpl();
