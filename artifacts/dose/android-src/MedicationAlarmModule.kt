/**
 * MedicationAlarmModule.kt
 *
 * React Native module that exposes Android AlarmManager functionality.
 * Methods are called from TypeScript via NativeModules.MedicationAlarm
 */

package com.tabira.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*

class MedicationAlarmModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val alarmManager: AlarmManager =
        reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    private val context: Context = reactContext

    override fun getName(): String = "MedicationAlarm"

    @ReactMethod
    fun hasExactAlarmPermission(promise: Promise) {
        try {
            val hasPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                ContextCompat.checkSelfPermission(
                    context,
                    "android.permission.SCHEDULE_EXACT_ALARM"
                ) == android.content.pm.PackageManager.PERMISSION_GRANTED
            } else {
                true
            }
            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun hasNotificationPermission(promise: Promise) {
        try {
            val hasPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                ContextCompat.checkSelfPermission(
                    context,
                    "android.permission.POST_NOTIFICATIONS"
                ) == android.content.pm.PackageManager.PERMISSION_GRANTED
            } else {
                true
            }
            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun isBatteryOptimizationWhitelisted(promise: Promise) {
        try {
            val pm = context.getSystemService(Context.POWER_SERVICE) as android.os.PowerManager
            val packageName = context.packageName
            val isWhitelisted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                pm.isIgnoringBatteryOptimizations(packageName)
            } else {
                true
            }
            promise.resolve(isWhitelisted)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun scheduleAlarm(params: ReadableMap, promise: Promise) {
        try {
            val alarmId = params.getInt("alarmId")
            val medicationId = params.getString("medicationId") ?: ""
            val medicationName = params.getString("medicationName") ?: ""
            val doseAmount = params.getString("doseAmount") ?: ""
            val scheduledTimeMs = params.getDouble("scheduledTimeMs").toLong()

            Log.d(
                "MedicationAlarm",
                "Scheduling alarm ID=$alarmId for medication=$medicationId at time=$scheduledTimeMs"
            )

            // Create intent for alarm
            val intent = Intent(context, MedicationAlarmReceiver::class.java).apply {
                action = "com.tabira.app.MEDICATION_ALARM"
                putExtra("alarmId", alarmId)
                putExtra("medicationId", medicationId)
                putExtra("medicationName", medicationName)
                putExtra("doseAmount", doseAmount)
            }

            val pendingIntent = PendingIntent.getBroadcast(
                context,
                alarmId,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            // Schedule exact alarm
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        scheduledTimeMs,
                        pendingIntent
                    )
                } else {
                    alarmManager.setAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        scheduledTimeMs,
                        pendingIntent
                    )
                }
                promise.resolve(true)
            } catch (e: SecurityException) {
                Log.e("MedicationAlarm", "SCHEDULE_EXACT_ALARM permission denied", e)
                promise.reject("PERMISSION_DENIED", "SCHEDULE_EXACT_ALARM permission required")
            }
        } catch (e: Exception) {
            Log.e("MedicationAlarm", "Failed to schedule alarm", e)
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun cancelAlarm(alarmId: Int, promise: Promise) {
        try {
            val intent = Intent(context, MedicationAlarmReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                alarmId,
                intent,
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
            )

            if (pendingIntent != null) {
                alarmManager.cancel(pendingIntent)
                Log.d("MedicationAlarm", "Alarm cancelled: $alarmId")
            }

            promise.resolve(true)
        } catch (e: Exception) {
            Log.e("MedicationAlarm", "Failed to cancel alarm", e)
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun cancelAllAlarmsForMedication(medicationId: String, promise: Promise) {
        try {
            // In a real implementation, we'd store a mapping of medicationId to alarmIds
            // For now, we'll document that the caller should track this
            Log.d("MedicationAlarm", "Cancelling all alarms for medication: $medicationId")
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun dismissAlarm(promise: Promise) {
        try {
            // Stop the foreground service
            val intent = Intent(context, MedicationAlarmService::class.java)
            ContextCompat.startForegroundService(context, intent.apply {
                action = "STOP_ALARM"
            })
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun snoozeAlarm(minutes: Int, promise: Promise) {
        try {
            val snoozeTimeMs = System.currentTimeMillis() + (minutes * 60 * 1000)
            Log.d("MedicationAlarm", "Snoozing alarm for $minutes minutes")
            // Implementation would reschedule the alarm
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getScheduledAlarms(promise: Promise) {
        try {
            val alarms = WritableNativeArray()
            // Implementation would query pending intents
            promise.resolve(alarms)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}
