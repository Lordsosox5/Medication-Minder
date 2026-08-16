# Quick Start: Testing Tabira Medication Alarms

## Prerequisites

- Windows PC with Node.js 18+ and npm/pnpm
- EAS account (free tier: https://expo.dev)
- Android test device with USB debugging enabled
- USB cable to connect device

## Setup

### 1. Install EAS CLI

```powershell
npm install -g eas-cli
```

### 2. Configure EAS

```powershell
cd c:\Users\Lordsosox\medication-remainder-app-main\artifacts\dose
eas login
# Enter your Expo/EAS credentials
```

### 3. Check Configuration

```powershell
# Verify app.json is correctly configured
cat app.json | grep -A 5 "plugins"

# Should see:
# "plugins": [
#   "./plugins/withMedicationAlarm",
#   ...
# ]
```

## Build & Test

### Option 1: Build APK (Easiest)

```powershell
cd c:\Users\Lordsosox\medication-remainder-app-main\artifacts\dose

# Build with EAS (generates APK)
eas build --platform android --profile preview

# This creates an .apk file in the cloud (5-10 minutes)
# Check console for download link
# Or: Open https://expo.dev → Projects → dose → Builds
```

### Option 2: Local Build (Requires Android SDK)

```powershell
cd c:\Users\Lordsosox\medication-remainder-app-main\artifacts\dose

# Prebuild native code
npx expo prebuild --clean

# Build APK locally
npm run android

# Or manually:
cd android
./gradlew assembleRelease
cd ..

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

## Install on Device

### Via ADB

```powershell
# Connect device via USB
# Enable USB Debugging: Settings → Developer Options → USB Debugging

# Check device is detected
adb devices

# Install APK
adb install -r path/to/app-release.apk

# Or if using EAS, download APK and:
adb install -r Downloads\tabira-preview-*.apk
```

### Via USB File Manager

1. Connect device via USB
2. Copy APK to device
3. Open file manager on device
4. Tap APK to install
5. Grant permissions when prompted

## Grant Permissions

On device:

1. Open Settings
2. Find **Tabira** app
3. Tap **Permissions**
4. Grant:
   - **Notifications**
   - **Alarms and Reminders** (if shown)
5. Go back → Apps
6. Find Tabira → **Battery**
7. Select "Unrestricted" or "Not optimized"

Or via ADB:

```powershell
adb shell pm grant com.tabira.app android.permission.POST_NOTIFICATIONS
adb shell pm grant com.tabira.app android.permission.SCHEDULE_EXACT_ALARM
adb shell cmd appops set --uidMode com.tabira.app MANAGE_ALARMS deny
```

## Run First Test

### Test: Alarm in 2 Minutes

**On Device:**

1. Open Tabira
2. Tap "**+**" to add medication
3. Enter:
   - Name: "Test Pill"
   - Dose: "500mg"
   - Interval: "8 hours"
   - **Start Time: NOW + 2 minutes**
   - Save

4. Optionally, close/minimize Tabira
5. Wait 2 minutes

**Expected Result:**

- Audio plays (notify.wav)
- Screen wakes (if asleep)
- Full-screen alarm UI appears
- Device vibrates (if enabled)
- Can tap "Taken", "Snooze", or "Dismiss"

**Debugging:**

If alarm doesn't trigger:

```powershell
# Check logs
adb logcat | grep -i MedicationAlarm

# List scheduled alarms
adb shell dumpsys alarm

# Check notification
adb shell dumpsys notification | grep -i tabira
```

## Systematic Testing

Run these tests in order:

### Test A: Basic Scheduling
- [ ] Create medication for NOW + 2 min
- [ ] Audio plays at exact time
- [ ] Full-screen appears
- [ ] Can confirm dose

### Test B: Screen Off
- [ ] Lock phone before alarm time
- [ ] Alarm still triggers with locked screen
- [ ] Can interact with alarm (requires screen to wake first, normal on Android)

### Test C: App Closed
- [ ] Close Tabira completely
- [ ] Alarm still triggers
- [ ] App doesn't crash on resume

### Test D: Multiple Medications
- [ ] Create Medication A: NOW + 5 min
- [ ] Create Medication B: NOW + 5 min  
- [ ] Wait for 5 min mark
- [ ] Both alarms should trigger (or handle gracefully)

### Test E: Edit Medication
- [ ] Create medication for 14:00
- [ ] Edit: Change time to 15:00
- [ ] At 14:00: NO alarm (old one cancelled)
- [ ] At 15:00: Alarm triggers (new time)

### Test F: Delete Medication
- [ ] Create medication for future time
- [ ] Delete it
- [ ] At scheduled time: NO alarm

### Test G: Reboot Device
- [ ] Create medication for future time
- [ ] Reboot device
- [ ] App restarts automatically (or manual)
- [ ] Medication still visible
- [ ] Alarm still triggers at scheduled time

### Test H: Snooze
- [ ] Alarm triggers
- [ ] Tap "Snooze (5 min)"
- [ ] Audio stops immediately
- [ ] Notification reappears in 5 min
- [ ] Original dose not confirmed

### Test I: Do Not Disturb
- [ ] Enable DND mode
- [ ] Mute media volume
- [ ] Schedule alarm
- [ ] Alarm audio still plays (not muted)

### Test J: Different Times
- [ ] Create medication for specific time today
- [ ] Test at that exact time
- [ ] Verify it's accurate (±5 seconds)

## Verification Checklist

After all tests pass:

- [ ] No crashes or force closes
- [ ] No duplicate alarms
- [ ] Audio plays consistently
- [ ] Notifications show correct medication name
- [ ] Dose history records properly
- [ ] Settings persist after reboot
- [ ] No excessive battery drain

## Troubleshooting

### "Alarm didn't trigger"

1. Check permissions:
   ```powershell
   adb shell pm list permissions -d | grep -i alarm
   ```

2. Check app permissions in Settings → Apps → Tabira

3. Verify notification permission:
   ```powershell
   adb shell dumpsys permission | grep -i notification | grep tabira
   ```

4. Check battery optimization:
   ```powershell
   adb shell cmd appops get com.tabira.app
   ```
   Look for `OP_RUN_IN_BACKGROUND`

5. View alarm logs:
   ```powershell
   adb logcat -c
   # Wait for alarm time...
   adb logcat | grep -i "Alarm\|Medication"
   ```

### "Audio doesn't play"

1. Verify file exists:
   ```powershell
   adb shell ls -la /data/app/com.tabira.app-*/base.apk
   # (APK contains assets/sounds/notify.wav)
   ```

2. Check audio volume:
   - Open Settings → Sound & vibration
   - Ensure Alarm volume is not 0

3. Check system audio playback:
   ```powershell
   adb shell am broadcast \
     -a android.intent.action.RINGTONE \
     -p com.android.systemui
   ```

### "App crashes on alarm"

1. View crash logs:
   ```powershell
   adb logcat -c
   # Trigger alarm...
   adb logcat | grep FATAL\|Exception\|crash
   ```

2. Check native module loading:
   ```powershell
   adb logcat | grep "MedicationAlarmModule"
   ```

3. Verify prebuild succeeded:
   ```powershell
   ls android/app/src/main/java/com/tabira/app/
   # Should contain MedicationAlarmModule.kt, MedicationAlarmService.kt, etc.
   ```

## Performance Check

Monitor device while alarm plays:

```powershell
adb shell dumpsys battery
# Should show:
# current now: 50-150 mA (normal)
# (Not 500+ mA which would indicate bug)

adb shell dumpsys meminfo com.tabira.app
# PSS should be 30-60 MB
# (Not 200+ MB which would indicate leak)
```

## Next Steps

Once all tests pass:

1. **Merge to production branch**
2. **Update app version** in app.json
3. **Rebuild with eas build --platform android**
4. **Create release build** (production profile)
5. **Test on 3+ different devices** (Samsung, Google Pixel, OnePlus)
6. **Deploy to users**

## Support

**For issues:**

1. Check [ANDROID_ALARM_IMPLEMENTATION.md](./ANDROID_ALARM_IMPLEMENTATION.md) "Troubleshooting" section
2. Review logs: `adb logcat | grep -i medication`
3. Check Android documentation: https://developer.android.com/guide/topics/manifest/manifest-element
4. Open issue in GitHub with logs and device info

---

**Version:** 1.0  
**Last Updated:** 2025-01-19  
**Status:** Ready for Testing
