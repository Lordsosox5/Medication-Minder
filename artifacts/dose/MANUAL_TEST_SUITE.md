# 🧪 MANUAL TESTING GUIDE - Complete Test Suite

## Quick Start (Choose One Method)

### Method 1: EAS Build (Cloud - No Local Setup Needed) ⭐ RECOMMENDED

```powershell
cd "c:\Users\Lordsosox\medication-remainder-app-main\artifacts\dose"
eas login
eas build --platform android --profile preview
# Wait 5-10 minutes, check email for APK download link
```

### Method 2: Local Build (Requires Android SDK)

```powershell
cd "c:\Users\Lordsosox\medication-remainder-app-main\artifacts\dose"
npx expo prebuild --clean
npm run android
```

---

## Installation on Android Device

### Via ADB (Command Line)

```powershell
# Connect device via USB, enable USB Debugging
adb devices
adb install -r path\to\app-release.apk
```

### Via USB File Transfer

1. Connect device via USB cable
2. Enable File Transfer mode on device
3. Copy APK to device
4. Use file manager to navigate and tap APK
5. Grant install permissions

### Via Download Link (if using EAS)

1. Download APK from email link or Expo Dashboard
2. Transfer to device via email, cloud drive, or USB
3. Tap file to install

---

## Grant Required Permissions (IMPORTANT!)

### Via Settings (Device GUI)

1. **Open Settings app**
2. **Find "Apps" or "Applications"**
3. **Search for "Tabira"** and tap it
4. **Tap "Permissions"**
5. **Grant the following:**
   - ✅ Notifications
   - ✅ Alarms and Reminders (if shown)
6. **Go back → Battery or Device Care**
7. **Find Tabira app**
8. **Select "Unrestricted" or "Not optimized"** (battery whitelist)

### Via ADB (Command Line)

```powershell
adb shell pm grant com.tabira.app android.permission.POST_NOTIFICATIONS
adb shell pm grant com.tabira.app android.permission.SCHEDULE_EXACT_ALARM
adb shell pm grant com.tabira.app android.permission.RECEIVE_BOOT_COMPLETED
adb shell pm grant com.tabira.app android.permission.WAKE_LOCK
```

---

## TEST 1: Basic Alarm Scheduling ⏰

### Setup
1. Open Tabira app
2. Tap **"+" button** to add medication
3. Fill in:
   - **Name:** "Test Pill"
   - **Dose:** "500mg"
   - **Interval:** "8 hours"
   - **Start Time:** Set to **NOW + 2 MINUTES**
4. Tap **Save**

### Action
1. **Close or minimize the app** (optional, but tests background reliability)
2. **Wait exactly 2 minutes** ⏱️
3. Optionally **lock the phone** before alarm time

### Expected Results ✅
- [ ] Audio plays (`notify.wav` sound)
- [ ] Screen wakes up (if locked/off)
- [ ] Full-screen alarm UI appears with:
  - Medication name ("Test Pill")
  - Dose amount ("500mg")
  - Current time
- [ ] Three buttons visible:
  - [ ] "Taken" button
  - [ ] "Snooze" button (or "Delay")
  - [ ] "Dismiss" button
- [ ] Can interact with buttons
- [ ] No force close or crash

### Verification
```powershell
adb logcat | grep -i "MedicationAlarm"
# Should see: "Alarm triggered", "Service started", "Activity launched"
```

### Pass/Fail
- ✅ PASS: All audio plays, UI shows, buttons work
- ❌ FAIL: No audio, UI doesn't appear, buttons don't respond

---

## TEST 2: Lock Screen Behavior 🔒

### Setup
1. Create medication same as Test 1
2. Set time to NOW + 2 MINUTES

### Action
1. **Lock the phone** immediately after saving
2. **Do NOT unlock**
3. **Wait for alarm time**

### Expected Results ✅
- [ ] Alarm triggers EVEN with locked screen
- [ ] Audio plays
- [ ] Full-screen UI appears over lock screen
- [ ] Can tap buttons without unlocking first
- [ ] Screen wakes up automatically

### Verification
```powershell
adb logcat | grep "setShowWhenLocked\|turnScreenOn"
# Should be set to true in MedicationAlarmActivity
```

### Pass/Fail
- ✅ PASS: Alarm works with locked screen
- ❌ FAIL: Requires unlock to see alarm

---

## TEST 3: App Completely Closed 🚫

### Setup
1. Create medication for NOW + 3 MINUTES
2. Save it

### Action
1. **Swipe Tabira out of recents** (close completely)
2. **Don't reopen the app**
3. **Wait for alarm time**

### Expected Results ✅
- [ ] Alarm STILL triggers (native Android, not JS-dependent)
- [ ] Audio plays
- [ ] Full-screen UI appears
- [ ] App doesn't crash when resuming
- [ ] Medication data is preserved

### Debugging
```powershell
# If alarm doesn't trigger:
adb shell dumpsys alarm
# Look for com.tabira.app in output
```

### Pass/Fail
- ✅ PASS: Alarm triggers even with app closed
- ❌ FAIL: Requires app to be running/backgrounded

---

## TEST 4: Multiple Medications at Same Time 📋

### Setup
1. Create Medication A: "Aspirin", 100mg, 8h interval, START TIME = NOW + 5 MIN
2. Create Medication B: "Vitamin D", 1000IU, 6h interval, START TIME = NOW + 5 MIN
3. Both medications scheduled for exact same time

### Action
1. Wait 5 minutes
2. Both alarms should trigger around same time

### Expected Results ✅
- [ ] Both alarms trigger (or handled gracefully)
- [ ] Audio plays
- [ ] UI shows first medication OR both
- [ ] No duplicate alarms
- [ ] No crashes or conflicts
- [ ] Both can be confirmed independently

### Verification
```powershell
adb logcat | grep "medicationId"
# Should see both medication IDs in logs
```

### Pass/Fail
- ✅ PASS: Both handled without crashes
- ❌ FAIL: Crash, only one shows, duplicates appear

---

## TEST 5: Edit Medication (Cancel Old, Schedule New) ✏️

### Setup
1. Create medication: "Lisinopril", 10mg, scheduled for **14:00** (future time)
2. App schedules alarm for 14:00
3. Wait a few seconds

### Action
1. **Edit the medication** (long press or tap edit button)
2. **Change start time to 15:00**
3. **Save**

### Expected Results ✅
- [ ] **At 14:00:** NO alarm triggers (old alarm cancelled)
- [ ] **At 15:00:** Alarm triggers (new alarm scheduled)
- [ ] No duplicate alarms at both times
- [ ] Notifications appear at:
  - 14:30 (15:00 - 30 min) ← Advance warning
  - 14:55 (15:00 - 5 min)  ← Final warning
  - 15:00 (exact time)      ← Main alarm ← NEW TIME

### Verification
```powershell
# Check alarm list before and after edit
adb shell dumpsys alarm
# Should show only 15:00 alarm, not 14:00
```

### Pass/Fail
- ✅ PASS: Only new time triggers, no old alarm
- ❌ FAIL: Both times trigger, or old time still works

---

## TEST 6: Delete Medication (Cancel Alarm) 🗑️

### Setup
1. Create medication scheduled for future time (e.g., 20:00)
2. Verify it appears in list

### Action
1. **Delete the medication** from list
2. **Wait for original scheduled time** (20:00)

### Expected Results ✅
- [ ] Medication removed from list immediately
- [ ] **At 20:00:** NO alarm triggers
- [ ] No false alarms
- [ ] App doesn't crash

### Verification
```powershell
adb shell dumpsys alarm | grep medicationId
# Deleted medication ID should NOT appear
```

### Pass/Fail
- ✅ PASS: Medication deleted, no alarm at scheduled time
- ❌ FAIL: Alarm still triggers at old time

---

## TEST 7: Device Reboot (Alarm Restoration) 🔄

### Setup
1. Create medication scheduled for **future time** (e.g., 20:00 today or tomorrow)
2. Note the medication name and time
3. Verify it's in the list

### Action
1. **Reboot the Android device** (Power off → Power on)
2. Wait for device to fully restart
3. **Open Tabira app** (let it initialize)
4. Wait for original scheduled time

### Expected Results ✅
- [ ] Device reboots normally
- [ ] Tabira opens and loads medications
- [ ] Medication still visible in list
- [ ] **At scheduled time:** Alarm triggers
- [ ] No manual re-scheduling needed
- [ ] Alarm works exactly as before reboot

### Verification
```powershell
# After reboot, check if alarms were restored
adb shell dumpsys alarm | grep com.tabira.app
# Should show alarm for medication that was scheduled before reboot
```

### Pass/Fail
- ✅ PASS: Alarm restored after reboot, triggers at time
- ❌ FAIL: Alarm lost, requires manual re-scheduling

---

## TEST 8: Snooze/Delay Functionality ⏸️

### Setup
1. Create medication for NOW + 2 MINUTES
2. Wait for alarm to trigger

### Action
1. **When alarm appears, tap "Snooze" (or Delay) button**
2. Should reschedule for +5 minutes
3. **Don't tap "Taken"** (we're testing snooze, not confirmation)

### Expected Results ✅
- [ ] Audio stops immediately when button tapped
- [ ] Full-screen UI closes
- [ ] Medication is **NOT marked as confirmed**
- [ ] Alarm reschedules for +5 minutes
- [ ] At +5 minutes: Alarm triggers again
- [ ] Can tap "Taken" on second alarm to confirm

### Verification
```powershell
adb logcat | grep "snooze\|delay"
# Should see snooze action logged
```

### Pass/Fail
- ✅ PASS: Audio stops, alarm reschedules, reappears in 5 min
- ❌ FAIL: Dose marked confirmed, or doesn't reschedule

---

## TEST 9: Do Not Disturb & Volume Muting 🔕

### Setup
1. Enable **Do Not Disturb (DND) mode** on device
2. **Mute media volume** to 0
3. Create medication for NOW + 2 MINUTES

### Action
1. Wait for alarm time
2. Observe audio behavior

### Expected Results ✅
- [ ] Alarm audio **STILL PLAYS** (not muted)
- [ ] DND doesn't block alarm
- [ ] Volume controls don't affect alarm (uses USAGE_ALARM stream)
- [ ] Vibration works if enabled in Tabira settings
- [ ] Full-screen UI appears normally

### Technical Details
- Alarm uses `AudioAttributes.USAGE_ALARM` (alarm audio stream)
- This stream bypasses mute, DND, and media volume
- Separate from notification, media, and ringtone streams

### Verification
```powershell
adb shell cmd media_session dump
# Should show audio routing through USAGE_ALARM
```

### Pass/Fail
- ✅ PASS: Alarm plays even with DND on and volume muted
- ❌ FAIL: No audio when muted or DND enabled

---

## TEST 10: Exact Timing Verification ⏱️

### Setup
1. Create medication with precise time (e.g., 14:30:00)
2. Have phone clock visible and synchronized

### Action
1. Wait for exact scheduled time
2. Note when alarm actually triggers
3. Compare with scheduled time

### Expected Results ✅
- [ ] Alarm triggers **within ±5 seconds** of scheduled time
- [ ] Not more than 10 seconds late
- [ ] Consistent timing across multiple tests
- [ ] No early false alarms

### Verification
```powershell
adb logcat | grep "alarm triggered\|Alarm trigger time"
# Check timestamp in logs vs scheduled time
```

### Pass/Fail
- ✅ PASS: Alarm within ±5 seconds of scheduled time
- ❌ FAIL: Alarm is 15+ seconds late

---

## TEST 11: Dose Confirmation Flow 📝

### Setup
1. Create medication scheduled for NOW + 2 MINUTES
2. Wait for alarm

### Action
1. When alarm triggers, tap **"Taken"** button
2. Check if dose is marked as confirmed
3. Verify next dose is scheduled

### Expected Results ✅
- [ ] Audio stops immediately
- [ ] Full-screen UI closes
- [ ] Medication shows as "confirmed" or grayed out
- [ ] Timer resets (5-minute rest period starts)
- [ ] Next dose time calculated correctly
- [ ] Next alarm scheduled for next interval

### Verification
```powershell
# Check app state
adb logcat | grep "confirmIntake\|dose confirmed"
```

### Pass/Fail
- ✅ PASS: Dose confirmed, next dose scheduled
- ❌ FAIL: Dose not marked confirmed, or next dose missing

---

## TEST 12: Permission Warnings ⚠️

### Setup
1. On first app launch (or after clearing data)
2. Check if app requests permissions

### Action
1. Deny some permissions initially
2. Reopen app
3. Check for permission warnings/prompts

### Expected Results ✅
- [ ] App requests notification permission on first launch
- [ ] If permission denied: Shows warning message
- [ ] App still functions (gracefully degraded)
- [ ] Can re-request permissions via Settings prompt

### Pass/Fail
- ✅ PASS: Permissions requested, warnings shown if denied
- ❌ FAIL: App crashes if permissions denied

---

## Complete Test Checklist

Copy and paste this checklist to track all tests:

```
BASIC FUNCTIONALITY
[ ] Test 1:  Basic scheduling (NOW + 2 min) - Audio plays, UI appears
[ ] Test 11: Dose confirmation - Marked confirmed, next dose scheduled
[ ] Test 12: Permission warnings - Requests shown, graceful degradation

BACKGROUND & RELIABILITY
[ ] Test 2:  Locked screen - Alarm works with locked device
[ ] Test 3:  App closed - Alarm triggers even if app isn't running
[ ] Test 7:  Device reboot - Alarms restored after reboot

SCHEDULING MANAGEMENT
[ ] Test 5:  Edit medication - Old alarm cancelled, new scheduled
[ ] Test 6:  Delete medication - Alarm cancelled immediately
[ ] Test 8:  Snooze - Audio stops, reschedules for +5 min

MULTIPLE MEDICATIONS
[ ] Test 4:  Multiple at same time - Both handled without crashes

AUDIO & SYSTEM
[ ] Test 9:  DND & volume muting - Audio plays despite DND/mute
[ ] Test 10: Exact timing - Alarm within ±5 seconds

TOTAL: 12 tests
PASSED: __ / 12
FAILED: __ / 12
```

---

## Troubleshooting

### Alarm Doesn't Trigger

**Checklist:**
1. [ ] Permissions granted in Settings
2. [ ] App whitelisted from battery optimization
3. [ ] Medication time is in future (not past)
4. [ ] Device time is correct
5. [ ] Notification permission enabled
6. [ ] Check logs: `adb logcat | grep -i medication`

**Try:**
```powershell
# Restart app
adb shell am force-stop com.tabira.app
adb shell am start -n com.tabira.app/.MainActivity

# Check scheduled alarms
adb shell dumpsys alarm | grep com.tabira.app
```

### Audio Doesn't Play

**Check:**
```powershell
# Verify audio file exists in APK
adb shell am broadcast -a android.intent.action.RINGTONE \
  -d file:///system/media/audio/alarms/notify.wav

# Check volume
adb shell media volume --show
# Alarm volume should be > 0
```

**Try:**
1. Enable alarm volume in Settings → Sound
2. Disable DND if blocking audio
3. Restart device

### App Crashes on Alarm

**Check logs:**
```powershell
adb logcat -c
# Wait for alarm time...
adb logcat | grep "FATAL\|Exception\|Crash"
```

**Try:**
```powershell
# Reinstall app
adb uninstall com.tabira.app
adb install -r path\to\app.apk

# Check native module
adb logcat | grep "MedicationAlarmModule\|NativeModules"
```

### Multiple Alarms Fire

**Check:**
```powershell
adb shell dumpsys alarm | grep "com.tabira.app"
# Should see unique alarm ID per medication
```

**Try:**
- Delete and re-create medication
- Uninstall and reinstall app
- Check no duplicate entries in database

---

## Success Criteria

### Minimum (Core Functionality)
- ✅ Test 1 passes (basic alarm + audio)
- ✅ Test 2 passes (locked screen)
- ✅ Test 3 passes (app closed)
- ✅ Test 11 passes (dose confirmation)

### Standard (Most Features)
- All minimum criteria met
- ✅ Test 4, 5, 6 pass (multiple, edit, delete)
- ✅ Test 7 passes (device reboot)
- ✅ Test 8 passes (snooze)

### Full (All Features)
- All standard criteria met
- ✅ Test 9, 10, 12 pass (DND, timing, permissions)
- ✅ No crashes or unexpected behavior
- ✅ Consistent performance across multiple runs

---

## Reporting Results

If tests fail, collect this information for debugging:

```powershell
# Device info
adb shell getprop | grep "ro.build\|ro.product"

# App logs
adb logcat -d > logcat.txt

# Alarm system state
adb shell dumpsys alarm > alarms.txt

# Permission state
adb shell dumpsys permission | grep com.tabira.app > permissions.txt

# Share these files for debugging
```

---

## Quick Test Execution Timeline

**Total time: ~30-45 minutes** (including waits for scheduled times)

| Test | Duration | Notes |
|------|----------|-------|
| 1. Basic Scheduling | 5 min | 2-min wait |
| 2. Locked Screen | 5 min | Similar to test 1 |
| 3. App Closed | 5 min | 3-min wait |
| 4. Multiple | 10 min | 5-min wait |
| 5. Edit | 15 min | Wait for both times |
| 6. Delete | 5 min | Just verify no alarm |
| 7. Reboot | 10 min | Device restart |
| 8. Snooze | 10 min | 2-min + 5-min waits |
| 9. DND | 5 min | 2-min wait |
| 10. Timing | 5 min | Precision test |
| 11. Confirm | 5 min | Part of test 1 |
| 12. Permissions | 2 min | Quick check |

**Parallel tests (while waiting):**
- Run tests 2-6 while waiting for test 1
- Run tests 9-12 while waiting for test 7

---

**Version:** 1.0  
**Last Updated:** August 14, 2026  
**Status:** Ready for Testing  
