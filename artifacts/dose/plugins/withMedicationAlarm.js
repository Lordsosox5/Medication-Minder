const {
  withAndroidManifest,
  withDangerousMod,
  withAppBuildGradle,
} = require("expo/config-plugins");

const fs = require("fs");
const path = require("path");

const withMedicationAlarm = (config) => {
  // =========================================================
  // ANDROID MANIFEST
  // =========================================================
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest || {};

    if (!manifest.$) {
      manifest.$ = {};
    }

    if (!manifest.application) {
      manifest.application = [{}];
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

    // =======================================================
    // PERMISSIONS
    // =======================================================

    const permissions = manifest["uses-permission"] || [];

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
        (item) =>
          item.$ &&
          item.$["android:name"] === permission
      );

      if (!exists) {
        permissions.push({
          $: {
            "android:name": permission,
          },
        });
      }
    }

    manifest["uses-permission"] = permissions;

    // =======================================================
    // RECEIVERS
    // =======================================================

    const receiverNames = new Set(
      application.receiver.map(
        (receiver) =>
          receiver.$ &&
          receiver.$["android:name"]
      )
    );

    if (!receiverNames.has(".MedicationAlarmReceiver")) {
      application.receiver.push({
        $: {
          "android:name": ".MedicationAlarmReceiver",
          "android:exported": "true",
        },
      });
    }

    if (!receiverNames.has(".BootCompletedReceiver")) {
      application.receiver.push({
        $: {
          "android:name": ".BootCompletedReceiver",
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

    // =======================================================
    // ALARM SERVICE
    // =======================================================

    const serviceNames = new Set(
      application.service.map(
        (service) =>
          service.$ &&
          service.$["android:name"]
      )
    );

    if (!serviceNames.has(".MedicationAlarmService")) {
      application.service.push({
        $: {
          "android:name": ".MedicationAlarmService",
          "android:foregroundServiceType": "specialUse",
          "android:exported": "false",
        },
        "meta-data": [
          {
            $: {
              "android:name":
                "android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE",
              "android:value":
                "Medication alarm service for time-critical medication reminders",
            },
          },
        ],
      });
    }

    // =======================================================
    // FULL SCREEN ALARM ACTIVITY
    // =======================================================

    const activityNames = new Set(
      application.activity.map(
        (activity) =>
          activity.$ &&
          activity.$["android:name"]
      )
    );

    if (!activityNames.has(".MedicationAlarmActivity")) {
      application.activity.push({
        $: {
          "android:name": ".MedicationAlarmActivity",
          "android:exported": "true",
          "android:showWhenLocked": "true",
          "android:turnScreenOn": "true",
          "android:launchMode": "singleTask",
          "android:taskAffinity": "",
          "android:excludeFromRecents": "true",
        },
      });
    }

    return config;
  });
  // =========================================================
  // ANDROIDX WORKMANAGER DEPENDENCY
  // =========================================================

  config = withAppBuildGradle(config, (config) => {
    const contents = config.modResults.contents;

    const dependency =
      'implementation("androidx.work:work-runtime-ktx:2.10.1")';

    if (!contents.includes("androidx.work:work-runtime-ktx")) {
      const dependenciesBlockRegex =
        /dependencies\s*\{/;

      if (!dependenciesBlockRegex.test(contents)) {
        throw new Error(
          "Could not find dependencies block in android/app/build.gradle"
        );
      }

      config.modResults.contents = contents.replace(
        dependenciesBlockRegex,
        `dependencies {\n    ${dependency}`
      );
    }

    return config;
  });
  config = withDangerousMod(
    config,
    [
      "android",
      async (config) => {
        const projectRoot =
          config.modRequest.projectRoot;

        const sourceDir = path.join(
          projectRoot,
          "android-src"
        );

        const packageName =
          "com.tabira.app";

        const destinationDir = path.join(
          config.modRequest.platformProjectRoot,
          "app",
          "src",
          "main",
          "java",
          ...packageName.split(".")
        );

        if (!fs.existsSync(sourceDir)) {
          throw new Error(
            `Medication alarm source directory does not exist: ${sourceDir}`
          );
        }

        fs.mkdirSync(destinationDir, {
          recursive: true,
        });

        const nativeFiles = [
          "MedicationAlarmActivity.kt",
          "MedicationAlarmModule.kt",
          "MedicationAlarmPackage.kt",
          "MedicationAlarmReceiver.kt",
          "MedicationAlarmService.kt",
          "RestoreAlarmsWorker.kt",
        ];

        for (const file of nativeFiles) {
          const sourceFile = path.join(
            sourceDir,
            file
          );

          const destinationFile = path.join(
            destinationDir,
            file
          );

          if (!fs.existsSync(sourceFile)) {
            throw new Error(
              `Missing native alarm file: ${sourceFile}`
            );
          }

          fs.copyFileSync(
            sourceFile,
            destinationFile
          );
        }

        return config;
      },
    ]
  );

  return config;
};

module.exports = withMedicationAlarm;