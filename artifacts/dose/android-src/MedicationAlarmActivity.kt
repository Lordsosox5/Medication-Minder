/**
 * MedicationAlarmActivity.kt
 *
 * Full-screen alarm UI that appears when medication reminders trigger.
 * Designed to appear over other apps, in the background,
 * and when the device is locked.
 */

package com.tabira.app

import android.app.Activity
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat

class MedicationAlarmActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        configureWindowForFullScreen()

        val medicationName =
            intent.getStringExtra("medicationName")
                ?: "Medication Reminder"

        val doseAmount =
            intent.getStringExtra("doseAmount")
                ?: ""

        val scheduledTime =
            intent.getLongExtra(
                "scheduledTime",
                System.currentTimeMillis()
            )

        val alarmId =
            intent.getIntExtra(
                "alarmId",
                -1
            )

        val medicationId =
            intent.getStringExtra("medicationId")
                ?: ""

        Log.d(
            "MedicationAlarmActivity",
            "Alarm activity opened: " +
                "$medicationName, " +
                "alarmId=$alarmId, " +
                "scheduledTime=$scheduledTime"
        )

        // ---------------------------------------------------------
        // Title
        // ---------------------------------------------------------

        val title = TextView(this).apply {
            text = "Medication Reminder"
            textSize = 30f
            setTextColor(Color.BLACK)
            gravity = Gravity.CENTER
            setPadding(0, 32, 0, 24)
        }

        // ---------------------------------------------------------
        // Medication name
        // ---------------------------------------------------------

        val medText = TextView(this).apply {
            text = medicationName
            textSize = 26f
            setTextColor(Color.BLACK)
            gravity = Gravity.CENTER
            setPadding(0, 12, 0, 12)
        }

        // ---------------------------------------------------------
        // Dose
        // ---------------------------------------------------------

        val doseText = TextView(this).apply {
            text =
                if (doseAmount.isNotBlank()) {
                    "Dose: $doseAmount"
                } else {
                    "Dose: Not provided"
                }

            textSize = 22f
            setTextColor(Color.DKGRAY)
            gravity = Gravity.CENTER
            setPadding(0, 12, 0, 12)
        }

        // ---------------------------------------------------------
        // Scheduled time
        // ---------------------------------------------------------

        val timeText = TextView(this).apply {
            text =
                "Scheduled: ${
                    java.text.SimpleDateFormat
                        .getDateTimeInstance()
                        .format(scheduledTime)
                }"

            textSize = 16f
            setTextColor(Color.GRAY)
            gravity = Gravity.CENTER
            setPadding(0, 12, 0, 48)
        }

        // ---------------------------------------------------------
        // Taken button
        // ---------------------------------------------------------

        val takenButton = Button(this).apply {
            text = "Taken"

            setOnClickListener {
                handleTaken()
            }
        }

        // ---------------------------------------------------------
        // Snooze button
        // ---------------------------------------------------------

        val snoozeButton = Button(this).apply {
            text = "Snooze"

            setOnClickListener {
                handleSnooze(
                    alarmId,
                    medicationId
                )
            }
        }

        // ---------------------------------------------------------
        // Dismiss button
        // ---------------------------------------------------------

        val dismissButton = Button(this).apply {
            text = "Dismiss"

            setOnClickListener {
                handleDismiss()
            }
        }

        // ---------------------------------------------------------
        // Main layout
        // ---------------------------------------------------------

        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER

            setBackgroundColor(Color.WHITE)

            setPadding(
                32,
                32,
                32,
                32
            )

            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.MATCH_PARENT
            )

            addView(title)
            addView(medText)
            addView(doseText)
            addView(timeText)
            addView(takenButton)
            addView(snoozeButton)
            addView(dismissButton)
        }

        setContentView(layout)
    }

    // =============================================================
    // Full-screen / lock-screen configuration
    // =============================================================

    private fun configureWindowForFullScreen() {
        // Modern Android (8.1+): Use the built-in lock screen methods
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
            @Suppress("DEPRECATION")
            setImmersive(true)
        } else {
            // Older Android: Use window flags
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                    WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                    WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
            )
        }

        // Keep screen on and allow interaction while locked
        window.addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON
        )

        // Allow the activity to use the display cutout area (notch, etc.)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.attributes = window.attributes.apply {
                layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
            }
        }

        // Ensure the window cannot be swiped away or dismissed by touch outside
        window.setBackgroundDrawableResource(android.R.color.white)
    }

    // =============================================================
    // Taken
    // =============================================================

    private fun handleTaken() {

        Log.d(
            "MedicationAlarmActivity",
            "User pressed Taken"
        )

        stopCurrentAlarm()

        setResult(
            Activity.RESULT_OK,
            Intent().putExtra(
                "action",
                "TAKEN"
            )
        )

        finish()
    }

    // =============================================================
    // Dismiss
    // =============================================================

    private fun handleDismiss() {

        Log.d(
            "MedicationAlarmActivity",
            "User pressed Dismiss"
        )

        stopCurrentAlarm()

        setResult(
            Activity.RESULT_OK,
            Intent().putExtra(
                "action",
                "DISMISS"
            )
        )

        finish()
    }

    // =============================================================
    // Snooze
    // =============================================================

    private fun handleSnooze(
        alarmId: Int,
        medicationId: String
    ) {

        Log.d(
            "MedicationAlarmActivity",
            "User pressed Snooze"
        )

        // Snooze for 5 minutes.
        val snoozeMinutes = 5

        val nextAlarmTime =
            System.currentTimeMillis() +
                (snoozeMinutes * 60 * 1000L)

        val alarmManager =
            getSystemService(
                Context.ALARM_SERVICE
            ) as AlarmManager

        val alarmIntent =
            Intent(
                this,
                MedicationAlarmReceiver::class.java
            ).apply {

                action =
                    "com.tabira.app.MEDICATION_ALARM"

                putExtra(
                    "alarmId",
                    alarmId + 10000
                )

                putExtra(
                    "medicationId",
                    medicationId
                )

                putExtra(
                    "medicationName",
                    intent.getStringExtra(
                        "medicationName"
                    ) ?: "Medication Reminder"
                )

                putExtra(
                    "doseAmount",
                    intent.getStringExtra(
                        "doseAmount"
                    ) ?: ""
                )
            }

        val pendingIntent =
            PendingIntent.getBroadcast(
                this,
                alarmId + 10000,
                alarmIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or
                    PendingIntent.FLAG_IMMUTABLE
            )

        try {

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {

                if (alarmManager.canScheduleExactAlarms()) {

                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        nextAlarmTime,
                        pendingIntent
                    )

                } else {

                    // Exact alarm permission is unavailable.
                    // Fall back to an inexact alarm that can still
                    // wake the device while idle.

                    alarmManager.setAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        nextAlarmTime,
                        pendingIntent
                    )
                }

            } else {

                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    nextAlarmTime,
                    pendingIntent
                )
            }

            Log.d(
                "MedicationAlarmActivity",
                "Alarm snoozed for $snoozeMinutes minutes"
            )

        } catch (e: Exception) {

            Log.e(
                "MedicationAlarmActivity",
                "Failed to snooze alarm",
                e
            )
        }

        // Stop the currently playing alarm.
        stopCurrentAlarm()

        setResult(
            Activity.RESULT_OK,
            Intent()
                .putExtra(
                    "action",
                    "SNOOZE"
                )
                .putExtra(
                    "minutes",
                    snoozeMinutes
                )
        )

        finish()
    }

    // =============================================================
    // Stop current alarm
    // =============================================================

    private fun stopCurrentAlarm() {

        val stopIntent =
            Intent(
                this,
                MedicationAlarmService::class.java
            ).apply {

                action =
                    MedicationAlarmService.ACTION_STOP_ALARM

                putExtra(
                    "alarmId",
                    intent.getIntExtra(
                        "alarmId",
                        -1
                    )
                )
            }

        try {

            ContextCompat.startForegroundService(
                this,
                stopIntent
            )

        } catch (e: Exception) {

            Log.e(
                "MedicationAlarmActivity",
                "Failed to stop alarm service",
                e
            )
        }
    }

    // =============================================================
    // Back button
    // =============================================================

    @Suppress("DEPRECATION")
    override fun onBackPressed() {

        Log.d(
            "MedicationAlarmActivity",
            "Back button pressed - ignoring during alarm"
        )

        // Intentionally do nothing.
        // The user must press Taken, Snooze, or Dismiss.
    }
}