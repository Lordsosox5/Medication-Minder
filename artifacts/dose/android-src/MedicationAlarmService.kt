/**
 * MedicationAlarmService.kt
 *
 * Foreground service responsible for:
 * - Playing the medication alarm sound
 * - Creating the high-priority alarm notification
 * - Launching the full-screen alarm activity
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

        Log.d(
            "MedicationAlarmService",
            "Service created"
        )

        ensureNotificationChannel()
    }

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int
    ): Int {

        Log.d(
            "MedicationAlarmService",
            "onStartCommand: action=${intent?.action}"
        )

        when (intent?.action) {

            ACTION_START_ALARM -> {

                currentAlarmId =
                    intent.getIntExtra("alarmId", -1)

                currentMedicationName =
                    intent.getStringExtra("medicationName")
                        ?: "Medication Reminder"

                currentDoseAmount =
                    intent.getStringExtra("doseAmount")
                        ?: ""

                currentMedicationId =
                    intent.getStringExtra("medicationId")
                        ?: ""

                Log.d(
                    "MedicationAlarmService",
                    "Starting alarm: id=$currentAlarmId, medication=$currentMedicationName"
                )

                startAlarmSound()
                launchAlarmActivity()

                val notification =
                    buildAlarmNotification()

                startForeground(
                    NOTIFICATION_ID,
                    notification
                )
            }

            ACTION_STOP_ALARM,
            ACTION_SNOOZE_ALARM -> {

                Log.d(
                    "MedicationAlarmService",
                    "Stopping alarm"
                )

                stopAlarmSound()

                stopForeground(
                    STOP_FOREGROUND_REMOVE
                )

                stopSelf()
            }
        }

        return START_NOT_STICKY
    }

    private fun launchAlarmActivity() {
        try {
            val alarmIntent = Intent(this, MedicationAlarmActivity::class.java).apply {
                action = "com.tabira.app.ALARM_ALERT"
                addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP or
                        Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS
                )
                putExtra("alarmId", currentAlarmId)
                putExtra("medicationId", currentMedicationId)
                putExtra("medicationName", currentMedicationName)
                putExtra("doseAmount", currentDoseAmount)
                putExtra("scheduledTime", System.currentTimeMillis())
            }

            startActivity(alarmIntent)
            Log.d("MedicationAlarmService", "Started alarm activity over current app")
        } catch (e: Exception) {
            Log.e("MedicationAlarmService", "Failed to launch alarm activity", e)
        }
    }

    /**
     * Creates the Android notification channel used by the alarm.
     */
    private fun ensureNotificationChannel() {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "Medication Alarms",
                NotificationManager.IMPORTANCE_MAX
            )

            channel.description =
                "Medication reminder alarms"

            channel.setShowBadge(true)

            channel.lockscreenVisibility =
                Notification.VISIBILITY_PUBLIC

            channel.setSound(
                null,
                null
            )

            val notificationManager =
                getSystemService(
                    Context.NOTIFICATION_SERVICE
                ) as NotificationManager

            notificationManager.createNotificationChannel(
                channel
            )
        }
    }

    /**
     * Builds the full-screen alarm notification.
     */
    private fun buildAlarmNotification(): Notification {

        val fullScreenIntent =
            Intent(
                this,
                MedicationAlarmActivity::class.java
            ).apply {

                action =
                    "com.tabira.app.ALARM_ALERT"

                flags =
                    Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP

                putExtra(
                    "alarmId",
                    currentAlarmId
                )

                putExtra(
                    "medicationId",
                    currentMedicationId
                )

                putExtra(
                    "medicationName",
                    currentMedicationName
                )

                putExtra(
                    "doseAmount",
                    currentDoseAmount
                )

                putExtra(
                    "scheduledTime",
                    System.currentTimeMillis()
                )
            }

        val fullScreenPendingIntent =
            PendingIntent.getActivity(
                this,
                currentAlarmId + 200000,
                fullScreenIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or
                    PendingIntent.FLAG_IMMUTABLE
            )

        val contentText =
            if (currentDoseAmount.isNotBlank()) {
                "$currentMedicationName · $currentDoseAmount"
            } else {
                currentMedicationName
            }

        val builder =
            NotificationCompat.Builder(
                this,
                NOTIFICATION_CHANNEL_ID
            )
                .setSmallIcon(
                    android.R.drawable.ic_lock_idle_alarm
                )
                .setContentTitle(
                    "Medication Reminder"
                )
                .setContentText(
                    contentText
                )
                .setPriority(
                    NotificationCompat.PRIORITY_MAX
                )
                .setCategory(
                    NotificationCompat.CATEGORY_ALARM
                )
                .setAutoCancel(false)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setVisibility(
                    NotificationCompat.VISIBILITY_PUBLIC
                )
                .setContentIntent(
                    fullScreenPendingIntent
                )
                .setFullScreenIntent(
                    fullScreenPendingIntent,
                    true
                )

        return builder.build()
    }

    /**
     * Starts the custom notify.wav alarm sound.
     */
    private fun startAlarmSound() {

        Log.d(
            "MedicationAlarmService",
            "Starting alarm sound"
        )

        try {

            stopAlarmSound()

            val afd =
                loadRingtoneAsset()

            if (afd == null) {

                Log.e(
                    "MedicationAlarmService",
                    "notify.wav could not be loaded"
                )

                return
            }

            mediaPlayer =
                MediaPlayer().apply {

                    setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(
                                AudioAttributes.USAGE_ALARM
                            )
                            .setContentType(
                                AudioAttributes.CONTENT_TYPE_MUSIC
                            )
                            .build()
                    )

                    setDataSource(
                        afd.fileDescriptor,
                        afd.startOffset,
                        afd.length
                    )

                    afd.close()

                    isLooping = true

                    prepare()

                    start()
                }

            Log.d(
                "MedicationAlarmService",
                "Alarm audio started"
            )

        } catch (e: Exception) {

            Log.e(
                "MedicationAlarmService",
                "Failed to start alarm audio",
                e
            )

            stopAlarmSound()
        }
    }

    /**
     * Stops and releases the alarm sound.
     */
    private fun stopAlarmSound() {

        try {

            mediaPlayer?.let { player ->

                try {
                    if (player.isPlaying) {
                        player.stop()
                    }
                } catch (_: Exception) {
                }

                try {
                    player.release()
                } catch (_: Exception) {
                }
            }

            mediaPlayer = null

            Log.d(
                "MedicationAlarmService",
                "Alarm audio stopped"
            )

        } catch (e: Exception) {

            Log.e(
                "MedicationAlarmService",
                "Failed to stop alarm audio",
                e
            )
        }
    }

    /**
     * Loads notify.wav from Android res/raw.
     *
     * The config plugin should copy notify.wav into:
     * android/app/src/main/res/raw/notify.wav
     */
    private fun loadRingtoneAsset(): AssetFileDescriptor? {

        return try {

            val resourceId =
                resources.getIdentifier(
                    "notify",
                    "raw",
                    packageName
                )

            if (resourceId == 0) {

                Log.e(
                    "MedicationAlarmService",
                    "Raw resource notify.wav was not found"
                )

                null

            } else {

                resources.openRawResourceFd(
                    resourceId
                )
            }

        } catch (e: Exception) {

            Log.e(
                "MedicationAlarmService",
                "Failed to load notify.wav",
                e
            )

            null
        }
    }

    override fun onBind(
        intent: Intent?
    ): IBinder? = null

    override fun onDestroy() {

        Log.d(
            "MedicationAlarmService",
            "Service destroyed"
        )

        stopAlarmSound()

        super.onDestroy()
    }
}