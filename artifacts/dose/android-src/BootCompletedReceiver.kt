/**
 * BootCompletedReceiver.kt
 *
 * Handles BOOT_COMPLETED intent to restore medication alarms after device reboot.
 * Communicates with the React Native app to reschedule alarms.
 */

package com.tabira.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

class BootCompletedReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            Log.d("BootCompletedReceiver", "Device boot completed")

            // Schedule a work request to restore alarms after the system stabilizes
            val restoreAlarmsWork = OneTimeWorkRequestBuilder<RestoreAlarmsWorker>()
                .setInitialDelay(30, TimeUnit.SECONDS) // Wait 30 seconds after boot
                .build()

            try {
                WorkManager.getInstance(context).enqueueUniqueWork(
                    "restore_medication_alarms",
                    androidx.work.ExistingWorkPolicy.KEEP,
                    restoreAlarmsWork
                )
                Log.d("BootCompletedReceiver", "Scheduled alarm restoration work")
            } catch (e: Exception) {
                Log.e("BootCompletedReceiver", "Failed to schedule alarm restoration", e)
            }
        }
    }
}
