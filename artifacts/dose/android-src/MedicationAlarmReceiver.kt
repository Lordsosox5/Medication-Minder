/**
 * MedicationAlarmReceiver.kt
 *
 * BroadcastReceiver that handles alarm triggers from AlarmManager.
 * Delegates to the foreground service to handle the notification with full-screen intent.
 * The full-screen intent mechanism ensures the alarm appears over other apps.
 */

package com.tabira.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.content.ContextCompat

class MedicationAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        Log.d("MedicationAlarmReceiver", "Alarm triggered: ${intent.action}")

        when (intent.action) {
            "com.tabira.app.MEDICATION_ALARM" -> {
                val alarmId = intent.getIntExtra("alarmId", -1)
                val medicationId = intent.getStringExtra("medicationId") ?: ""
                val medicationName = intent.getStringExtra("medicationName") ?: ""
                val doseAmount = intent.getStringExtra("doseAmount") ?: ""

                Log.d(
                    "MedicationAlarmReceiver",
                    "Medication alarm: $medicationName ($doseAmount) - alarmId=$alarmId"
                )

                val serviceIntent = Intent(context, MedicationAlarmService::class.java).apply {
                    action = MedicationAlarmService.ACTION_START_ALARM
                    putExtra("alarmId", alarmId)
                    putExtra("medicationId", medicationId)
                    putExtra("medicationName", medicationName)
                    putExtra("doseAmount", doseAmount)
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    ContextCompat.startForegroundService(context, serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }
        }
    }
}

