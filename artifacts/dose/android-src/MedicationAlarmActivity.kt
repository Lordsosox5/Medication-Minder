/**
 * MedicationAlarmActivity.kt
 *
 * Full-screen alarm UI that appears when medication reminders trigger.
 * Designed to be launched by Android's full-screen notification intent,
 * allowing it to appear over other apps, even when Tabira is closed/backgrounded.
 */

package com.tabira.app

import android.app.Activity
import android.app.AlarmManager
import android.app.KeyguardManager
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

        val medicationName = intent.getStringExtra("medicationName") ?: "Medication Reminder"
        val doseAmount = intent.getStringExtra("doseAmount") ?: ""
        val scheduledTime = intent.getLongExtra("scheduledTime", System.currentTimeMillis())
        val alarmId = intent.getIntExtra("alarmId", -1)
        val medicationId = intent.getStringExtra("medicationId") ?: ""

        Log.d(
            "MedicationAlarmActivity",
            "Alarm activity opened: $medicationName, alarmId=$alarmId, scheduledTime=$scheduledTime"
        )

        val title = TextView(this).apply {
            text = "Medication Reminder"
            textSize = 30f
            setTextColor(Color.BLACK)
            gravity = Gravity.CENTER
            setPadding(0, 32, 0, 24)
        }

        val medText = TextView(this).apply {
            text = medicationName
            textSize = 26f
            setTextColor(Color.BLACK)
            gravity = Gravity.CENTER
            setPadding(0, 12, 0, 12)
        }

        val doseText = TextView(this).apply {
            text = if (doseAmount.isNotBlank()) "Dose: $doseAmount" else "Dose: Not provided"
            textSize = 22f
            setTextColor(Color.DKGRAY)
            gravity = Gravity.CENTER
            setPadding(0, 12, 0, 12)
        }

        val timeText = TextView(this).apply {
            text = "Scheduled: ${java.text.SimpleDateFormat.getDateTimeInstance().format(scheduledTime)}"
            textSize = 16f
            setTextColor(Color.GRAY)
            gravity = Gravity.CENTER
            setPadding(0, 12, 0, 48)
        }

        val takenButton = Button(this).apply {
            text = "Taken"
            setOnClickListener { handleTaken() }
        }

        val snoozeButton = Button(this).apply {
            text = "Snooze"
            setOnClickListener { handleSnooze(alarmId, medicationId) }
        }

        val dismissButton = Button(this).apply {
            text = "Dismiss"
            setOnClickListener { handleDismiss() }
        }

        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.WHITE)
            setPadding(32, 32, 32, 32)
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

    private fun configureWindowForFullScreen() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
            setImmersive(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                    WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                    WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
            )
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.attributes = window.attributes.apply {
                layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
            }
        }

        window.addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON
        )
    }

    private fun handleTaken() {
        Log.d("MedicationAlarmActivity", "User pressed Taken")
        stopCurrentAlarm()
        setResult(Activity.RESULT_OK, Intent().putExtra("action", "TAKEN"))
        finish()
    }

    private fun handleDismiss() {
        Log.d("MedicationAlarmActivity", "User pressed Dismiss")
        stopCurrentAlarm()
        setResult(Activity.RESULT_OK, Intent().putExtra("action", "DISMISS"))
        finish()
    }

    private fun handleSnooze(alarmId: Int, medicationId: String) {
        Log.d("MedicationAlarmActivity", "User pressed Snooze")
        val snoozeMinutes = 5
        val nextAlarmTime = System.currentTimeMillis() + (snoozeMinutes * 60 * 1000L)

        val alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val alarmIntent = Intent(this, MedicationAlarmReceiver::class.java).apply {
            action = "com.tabira.app.MEDICATION_ALARM"
            putExtra("alarmId", alarmId + 10000)
            putExtra("medicationId", medicationId)
            putExtra("medicationName", intent.getStringExtra("medicationName") ?: "Medication Reminder")
            putExtra("doseAmount", intent.getStringExtra("doseAmount") ?: "")
        }

        val pendingIntent = PendingIntent.getBroadcast(
            this,
            alarmId + 10000,
            alarmIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
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
        } catch (e: Exception) {
            Log.e("MedicationAlarmActivity", "Failed to snooze alarm", e)
        }

        stopCurrentAlarm()
        setResult(Activity.RESULT_OK, Intent().putExtra("action", "SNOOZE").putExtra("minutes", snoozeMinutes))
        finish()
    }

    private fun stopCurrentAlarm() {
        val stopIntent = Intent(this, MedicationAlarmService::class.java).apply {
            action = MedicationAlarmService.ACTION_STOP_ALARM
            putExtra("alarmId", intent.getIntExtra("alarmId", -1))
        }
        ContextCompat.startForegroundService(this, stopIntent)
    }

    override fun onBackPressed() {
        Log.d("MedicationAlarmActivity", "Back button pressed - ignoring during alarm")
        // Don't allow back button to dismiss the alarm
    }
}


        val medicationName = intent.getStringExtra("medicationName") ?: "Medication Reminder"
        val doseAmount = intent.getStringExtra("doseAmount") ?: ""
        val scheduledTime = intent.getLongExtra("scheduledTime", System.currentTimeMillis())
        val alarmId = intent.getIntExtra("alarmId", -1)

        Log.d(
            "MedicationAlarmActivity",
            "Alarm activity opened: $medicationName, alarmId=$alarmId, scheduledTime=$scheduledTime"
        )

        val title = TextView(this).apply {
            text = "Medication Reminder"
            textSize = 30f
            setTextColor(Color.BLACK)
            gravity = Gravity.CENTER
            setPadding(0, 32, 0, 24)
        }

        val medText = TextView(this).apply {
            text = medicationName
            textSize = 26f
            setTextColor(Color.BLACK)
            gravity = Gravity.CENTER
            setPadding(0, 12, 0, 12)
        }

        val doseText = TextView(this).apply {
            text = if (doseAmount.isNotBlank()) "Dose: $doseAmount" else "Dose: Not provided"
            textSize = 22f
            setTextColor(Color.DKGRAY)
            gravity = Gravity.CENTER
            setPadding(0, 12, 0, 12)
        }

        val timeText = TextView(this).apply {
            text = "Scheduled: ${java.text.SimpleDateFormat.getDateTimeInstance().format(scheduledTime)}"
            textSize = 16f
            setTextColor(Color.GRAY)
            gravity = Gravity.CENTER
            setPadding(0, 12, 0, 48)
        }

        val takenButton = Button(this).apply {
            text = "Taken"
            setOnClickListener { handleTaken() }
        }

        val snoozeButton = Button(this).apply {
            text = "Snooze"
            setOnClickListener { handleSnooze(alarmId) }
        }

        val dismissButton = Button(this).apply {
            text = "Dismiss"
            setOnClickListener { handleDismiss() }
        }

        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.WHITE)
            setPadding(32, 32, 32, 32)
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

    private fun handleTaken() {
        Log.d("MedicationAlarmActivity", "User pressed Taken")
        stopCurrentAlarm()
        setResult(Activity.RESULT_OK, Intent().putExtra("action", "TAKEN"))
        finish()
    }

    private fun handleDismiss() {
        Log.d("MedicationAlarmActivity", "User pressed Dismiss")
        stopCurrentAlarm()
        setResult(Activity.RESULT_OK, Intent().putExtra("action", "DISMISS"))
        finish()
    }

    private fun handleSnooze(alarmId: Int, medicationId: String) {
        Log.d("MedicationAlarmActivity", "User pressed Snooze")
        val snoozeMinutes = 5
        val nextAlarmTime = System.currentTimeMillis() + (snoozeMinutes * 60 * 1000L)

        val alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val alarmIntent = Intent(this, MedicationAlarmReceiver::class.java).apply {
            action = "com.tabira.app.MEDICATION_ALARM"
            putExtra("alarmId", alarmId + 10000)
            putExtra("medicationId", medicationId)
            putExtra("medicationName", intent.getStringExtra("medicationName") ?: "Medication Reminder")
            putExtra("doseAmount", intent.getStringExtra("doseAmount") ?: "")
        }

        val pendingIntent = PendingIntent.getBroadcast(
            this,
            alarmId + 10000,
            alarmIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (alarmManager.canScheduleExactAlarms()) {
                alarmManager.setExactAndAllowWhileIdle(
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

        stopCurrentAlarm()
        setResult(Activity.RESULT_OK, Intent().putExtra("action", "SNOOZE").putExtra("minutes", snoozeMinutes))
        finish()
    }

    private fun stopCurrentAlarm() {
        val stopIntent = Intent(this, MedicationAlarmService::class.java).apply {
            action = MedicationAlarmService.ACTION_STOP_ALARM
            putExtra("alarmId", intent.getIntExtra("alarmId", -1))
        }
        ContextCompat.startForegroundService(this, stopIntent)
    }

    override fun onBackPressed() {
        Log.d("MedicationAlarmActivity", "Back button pressed - ignoring during alarm")
    }
}
            putExtra("medicationName", intent.getStringExtra("medicationName") ?: "Medication Reminder")
            putExtra("doseAmount", intent.getStringExtra("doseAmount") ?: "")
        }

        val pendingIntent = PendingIntent.getBroadcast(
            this,
            alarmId + 10000,
            alarmIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (alarmManager.canScheduleExactAlarms()) {
                alarmManager.setExactAndAllowWhileIdle(
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

        stopCurrentAlarm()
        setResult(Activity.RESULT_OK, Intent().putExtra("action", "SNOOZE").putExtra("minutes", snoozeMinutes))
        finish()
    }

    private fun stopCurrentAlarm() {
        val stopIntent = Intent(this, MedicationAlarmService::class.java).apply {
            action = MedicationAlarmService.ACTION_STOP_ALARM
            putExtra("alarmId", intent.getIntExtra("alarmId", -1))
        }
        ContextCompat.startForegroundService(this, stopIntent)
    }

    override fun onBackPressed() {
        Log.d("MedicationAlarmActivity", "Back button ignored while alarm is active")
    }
}
