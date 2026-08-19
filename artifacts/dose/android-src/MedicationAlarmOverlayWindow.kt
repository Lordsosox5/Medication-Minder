package com.tabira.app

import android.content.Context
import android.graphics.Color
import android.os.Build
import android.provider.Settings
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class MedicationAlarmOverlayWindow(private val context: Context) {
    private val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private var overlayView: View? = null

    fun show(medicationName: String, doseAmount: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(context)) {
            Log.w("MedicationAlarmOverlayWindow", "Overlay permission is missing")
            return
        }

        if (overlayView != null) {
            return
        }

        val title = TextView(context).apply {
            text = "Medication Reminder"
            textSize = 28f
            setTextColor(Color.BLACK)
            gravity = Gravity.CENTER
            setPadding(32, 32, 32, 32)
        }

        val medText = TextView(context).apply {
            text = medicationName
            textSize = 24f
            setTextColor(Color.BLACK)
            gravity = Gravity.CENTER
            setPadding(32, 16, 32, 16)
        }

        val doseText = TextView(context).apply {
            text = if (doseAmount.isNotBlank()) "Dose: $doseAmount" else "Dose: Not provided"
            textSize = 20f
            setTextColor(Color.DKGRAY)
            gravity = Gravity.CENTER
            setPadding(32, 16, 32, 16)
        }

        val dismissButton = Button(context).apply {
            text = "Dismiss"
            setBackgroundColor(Color.parseColor("#B3261E"))
            setTextColor(Color.WHITE)
            setOnClickListener { hide() }
        }

        val root = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.WHITE)
            setPadding(24, 24, 24, 24)
            addView(title)
            addView(medText)
            addView(doseText)
            addView(dismissButton)
        }

        val params = WindowManager.LayoutParams().apply {
            width = WindowManager.LayoutParams.MATCH_PARENT
            height = WindowManager.LayoutParams.MATCH_PARENT
            flags = WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_FULLSCREEN or
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
            format = android.graphics.PixelFormat.TRANSLUCENT
            gravity = Gravity.CENTER
            type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                @Suppress("DEPRECATION")
                WindowManager.LayoutParams.TYPE_PHONE
            }
        }

        overlayView = root
        windowManager.addView(root, params)
        Log.d("MedicationAlarmOverlayWindow", "Overlay window added")
    }

    fun hide() {
        overlayView?.let { view ->
            try {
                windowManager.removeView(view)
            } catch (_: Exception) {
            }
            overlayView = null
        }
    }
}
