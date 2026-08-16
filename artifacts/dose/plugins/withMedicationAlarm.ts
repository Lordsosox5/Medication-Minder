/**
 * Expo Config Plugin: Medication Alarm Service
 *
 * Adds Android native alarm plumbing:
 * - Exact alarms
 * - Boot restore
 * - Medication alarm receiver
 * - Foreground alarm service
 * - Full-screen alarm Activity
 * - WorkManager
 * - Required permissions
 */

import {
  ConfigPlugin,
  withAndroidManifest,
  withAppBuildGradle,
} from "@expo/config-plugins";

const withMedicationAlarm: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    // Expo's AndroidManifest TypeScript type is stricter than the
    // underlying XML representation, so use the XML representation
    // for these custom manifest modifications.
    const manifest = config.modResults as any;

    // ---------------------------------------------------------
    // Manifest root
    // ---------------------------------------------------------

    if (!manifest.$) {
      manifest.$ = {};
    }

    // ---------------------------------------------------------
    // Application
    // ---------------------------------------------------------

    if (!manifest.application) {
      manifest.application = [];
    }

    if (!manifest.application[0]) {
      manifest.application[0] = {};
    }

    const application = manifest.application[0];

    if (!application.$) {
      application.$ = {};
    }

    if (!application.receiver) {
      application.receiver = [];
    }

    if (!application.service) {
      application.service = [];
    }

    if (!application.activity) {
      application.activity = [];
    }

    // ---------------------------------------------------------
    // Permissions
    // ---------------------------------------------------------

    if (!manifest["uses-permission"]) {
      manifest["uses-permission"] = [];
    }

    const permissions = manifest["uses-permission"];

    const requiredPermissions = [
      "android.permission.WAKE_LOCK",
      "android.permission.RECEIVE_BOOT_COMPLETED",
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.SCHEDULE_EXACT_ALARM",
      "android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
      "android.permission.USE_FULL_SCREEN_INTENT",
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.POST_NOTIFICATIONS",
    ];

    for (const permission of requiredPermissions) {
      const exists = permissions.some(
        (entry: any) =>
          entry?.$?.["android:name"] === permission
      );

      if (!exists) {
        permissions.push({
          $: {
            "android:name": permission,
          },
        });
      }
    }

    // ---------------------------------------------------------
    // Receivers
    // ---------------------------------------------------------

    const receiverNames = new Set(
      application.receiver.map(
        (receiver: any) =>
          receiver?.$?.["android:name"]
      )
    );

    // Boot receiver
    if (
      !receiverNames.has(
        ".receivers.BootCompletedReceiver"
      )
    ) {
      application.receiver.push({
        $: {
          "android:name":
            ".receivers.BootCompletedReceiver",
          "android:exported": "true",
        },
        "intent-filter": [
          {
            action: [
              {
                $: {
                  "android:name":
                    "android.intent.action.BOOT_COMPLETED",
                },
              },
            ],
          },
        ],
      });
    }

    // Medication alarm receiver
    if (
      !receiverNames.has(
        ".receivers.MedicationAlarmReceiver"
      )
    ) {
      application.receiver.push({
        $: {
          "android:name":
            ".receivers.MedicationAlarmReceiver",
          "android:exported": "true",
        },
      });
    }

    // ---------------------------------------------------------
    // Alarm service
    // ---------------------------------------------------------

    const serviceNames = new Set(
      application.service.map(
        (service: any) =>
          service?.$?.["android:name"]
      )
    );

    if (
      !serviceNames.has(
        ".services.MedicationAlarmService"
      )
    ) {
      application.service.push({
        $: {
          "android:name":
            ".services.MedicationAlarmService",

          /*
           * "specialUse" is the appropriate foreground-service
           * type for a custom alarm/reminder service.
           */
          "android:foregroundServiceType":
            "specialUse",

          "android:exported": "false",
        },

        "meta-data": [
          {
            $: {
              "android:name":
                "android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE",

              "android:value":
                "Time-critical medication reminder alarm",
            },
          },
        ],
      });
    }

    // ---------------------------------------------------------
    // Full-screen alarm Activity
    // ---------------------------------------------------------

    const activityNames = new Set(
      application.activity.map(
        (activity: any) =>
          activity?.$?.["android:name"]
      )
    );

    if (
      !activityNames.has(
        ".activities.MedicationAlarmActivity"
      )
    ) {
      application.activity.push({
        $: {
          "android:name":
            ".activities.MedicationAlarmActivity",

          "android:exported": "true",

          // Show above lock screen
          "android:showWhenLocked": "true",

          // Turn screen on when alarm fires
          "android:turnScreenOn": "true",

          // Keep alarm Activity available on the device
          "android:showForAllUsers": "true",

          // Prevent multiple alarm Activities
          "android:launchMode": "singleTop",

          "android:taskAffinity": "",

          "android:excludeFromRecents": "true",

          "android:windowSoftInputMode":
            "stateAlwaysHidden",
        },

        "intent-filter": [
          {
            action: [
              {
                $: {
                  "android:name":
                    "com.tabira.app.ALARM_ALERT",
                },
              },
            ],

            category: [
              {
                $: {
                  "android:name":
                    "android.intent.category.DEFAULT",
                },
              },
            ],
          },
        ],
      });
    }

    return config;
  });
};

// =============================================================
// WorkManager dependency
// =============================================================

const withWorkManagerDependency: ConfigPlugin = (config) => {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    const workManagerDependency =
      'implementation("androidx.work:work-runtime-ktx:2.10.1")';

    if (
      !contents.includes(
        "androidx.work:work-runtime-ktx"
      )
    ) {
      const dependenciesRegex =
        /dependencies\s*\{/;

      if (!dependenciesRegex.test(contents)) {
        throw new Error(
          "Could not find the dependencies block in android/app/build.gradle"
        );
      }

      contents = contents.replace(
        dependenciesRegex,
        `dependencies {
    ${workManagerDependency}`
      );

      config.modResults.contents = contents;
    }

    return config;
  });
};

// =============================================================
// Export plugin
// =============================================================

const plugin: ConfigPlugin = (config) => {
  config = withMedicationAlarm(config);
  config = withWorkManagerDependency(config);

  return config;
};

export default plugin;