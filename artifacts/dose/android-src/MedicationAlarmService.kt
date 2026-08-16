/**
 * MedicationAlarmService.kt
 *
 * Foreground service that handles the native alarm lifecycle. This is the
 * Android-side component that starts the ringtone and creates the alarm
 * notification with a full-screen intent so the alarm UI can appear even when
 * the app is closed, backgrounded, or the screen is locked.
 */

package com.tabira.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.res.AssetFileDescriptor
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat

class MedicationAlarmService : Service() {
    companion object {
        const val ACTION_START_ALARM = "com.tabira.app.START_ALARM"
        const val ACTION_STOP_ALARM = "com.tabira.app.STOP_ALARM"
        const val ACTION_SNOOZE_ALARM = "com.tabira.app.SNOOZE_ALARM"
        const val NOTIFICATION_ID = 9999
        const val NOTIFICATION_CHANNEL_ID = "medication_alarm"
    }

    private var mediaPlayer: MediaPlayer? = null
    private var currentAlarmId: Int = -1
    private var currentMedicationName: String = ""
    private var currentDoseAmount: String = ""
    private var currentMedicationId: String = ""

    override fun onCreate() {
        super.onCreate()
        Log.d("MedicationAlarmService", "Service created")
        ensureNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("MedicationAlarmService", "onStartCommand: action=${intent?.action}")

        when (intent?.action) {
            ACTION_START_ALARM -> {
                val alarmId = intent.getIntExtra("alarmId", -1)
                val medicationName = intent.getStringExtra("medicationName") ?: "Medication Reminder"
                val doseAmount = intent.getStringExtra("doseAmount") ?: ""
                val medicationId = intent.getStringExtra("medicationId") ?: ""
                
                currentAlarmId = alarmId
                currentMedicationName = medicationName
                currentDoseAmount = doseAmount
                currentMedicationId = medicationId

                startAlarmSound(medicationName)
                
                val notification = buildAlarmNotification()
                startForeground(NOTIFICATION_ID, notification)
                notifyNotificationManager(notification)
            }
            ACTION_STOP_ALARM, ACTION_SNOOZE_ALARM -> {
                stopAlarmSound()
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
        }

        return START_STICKY
    }

    private fun ensureNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                enableLights(true)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun notifyNotificationManager(notification: Notification) {
        try {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.notify(NOTIFICATION_ID, notification)
        } catch (e: Exception) {
            Log.e("MedicationAlarmService", "Failed to notify notification manager", e
                setShowBadge(true)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun buildAlarmNotification(): Notification {
        val fullScreenIntent = Intent(this, MedicationAlarmActivity::class.java).apply {
            action = "com.tabira.app.ALARM_ALERT"
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("alarmId", currentAlarmId)
            putExtra("medicationId", currentMedicationId)
            putExtra("medicationName", currentMedicationName)
            putExtra("doseAmount", currentDoseAmount)
            putExtra("scheduledTime", System.currentTimeMillis())
        }

        val fullScreenPendingIntent = PendingIntent.getActivity(
            this,
            currentAlarmId + 200000,
            fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val contentText = if (currentDoseAmount.isNotBlank()) {
            "$currentMedicationName · $currentDoseAmount"
        } else {
            currentMedicationName
        }

        val builder = NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("Medication Reminder")
            .setContentText(contentText)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(false)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setContentIntent(fullScreenPendingIntent)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            try {
                builder.setFullScreenIntent(fullScreenPendingIntent, true)
            } catch (e: Exception) {
                Log.w("MedicationAlarmService", "Failed to set full-screen intent", e)
            }
        } else {
            builder.setFullScreenIntent(fullScreenPendingIntent, true)
        }

        return builder.build()
    }

    private fun startAlarmSound(medicationName: String) {
        Log.d("MedicationAlarmService", "Starting alarm sound for $medicationName")
        try {
            mediaPlayer?.release()
            mediaPlayer = MediaPlayer().apply {
                setAudioAttributes(
                    android.media.AudioAttributes.Builder()
                        .setUsage(android.media.AudioAttributes.USAGE_ALARM)
                        .setContentType(android.media.AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build()
                )

                val afd = loadRingtoneAsset()
                if (afd != null) {
                    setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
                    afd.close()
                    isLooping = true
                    prepare()
                    start()
                    Log.d("MedicationAlarmService", "Alarm audio started")
                } else {
                    Log.w("MedicationAlarmService", "Could not load ringtone asset")
                }
            }
        } catch (e: Exception) {
            Log.e("MedicationAlarmService", "Failed to start alarm audio", e)
        }
    }

    private fun stopAlarmSound() {
        try {
            mediaPlayer?.apply {
                if (isPlaying) stop()
                release()
            }
            mediaPlayer = null
            Log.d("MedicationAlarmService", "Alarm audio stopped")
        } catch (e: Exception) {
            Log.e("MedicationAlarmService", "Failed to stop alarm", e)
        }
    }

    private fun loadRingtoneAsset(): AssetFileDescriptor? {
        return try {
            assets.openFd("sounds/notify.wav")
        } catch (e: Exception) {
            Log.e("MedicationAlarmService", "Failed to load ringtone asset", e)
            null
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        stopAlarmSound()
        super.onDestroy()
    }
}
