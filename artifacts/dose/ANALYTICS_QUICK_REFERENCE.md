# Firebase Analytics - Quick Reference

## Quick Setup

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

export function MyComponent() {
  const analytics = useAnalytics();
  
  // Use analytics methods...
}
```

## Common Events

### Track Screen Views
```typescript
useEffect(() => {
  analytics.logScreenViewed({
    screen_name: 'medications_list',
    screen_class: 'MedicationsScreen'
  });
}, []);
```

### Track Medication Actions
```typescript
// Add medication
analytics.logMedicationAdded({
  medication_id: med.id,
  name: med.name,
  dosage: med.dosage,
  frequency: med.frequency
});

// Confirm intake
analytics.logMedicationIntakeConfirmed({
  medication_id: med.id,
  medication_name: med.name,
  scheduled_time: '09:00',
  actual_time: new Date().toISOString(),
  time_difference_minutes: 0
});

// Miss intake
analytics.logMedicationIntakeMissed({
  medication_id: med.id,
  medication_name: med.name,
  scheduled_time: '09:00'
});

// Snooze alarm
analytics.logMedicationIntakeSnoozed({
  medication_id: med.id,
  medication_name: med.name,
  snooze_duration_minutes: 5
});
```

### Track Health Calculators
```typescript
// BMI
analytics.logBMICalculated({
  bmi_value: 24.5,
  weight: 70,
  height: 170,
  category: 'normal'
});

// TDEE
analytics.logTDEECalculated({
  tdee_value: 2500,
  bmr: 1700,
  activity_level: 'moderate'
});

// Water Intake
analytics.logWaterIntakeLogged({
  amount_ml: 250,
  daily_total_ml: 1000,
  daily_goal_ml: 2000
});

// Ideal Weight
analytics.logIdealWeightCalculated({
  ideal_weight: 72,
  height: 170,
  formula_type: 'devine'
});
```

### Track User Interactions
```typescript
// Permission
analytics.logPermissionRequest('notification', true);

// Settings change
analytics.logSettingsChanged({
  setting_name: 'reminder_type',
  old_value: 'sound',
  new_value: 'vibration'
});

// Onboarding
analytics.logOnboardingStarted();
// ... later
analytics.logOnboardingCompleted({
  duration_minutes: 5,
  steps_completed: 4
});
```

### Track Technical Events
```typescript
// API Call
analytics.logAPICall({
  endpoint: '/api/medications',
  method: 'GET',
  status_code: 200,
  duration_ms: 150,
  success: true
});

// Database Sync
analytics.logDatabaseSync(true, {
  records_synced: 5,
  duration_ms: 200
});

// Notification
analytics.logNotificationEvent({
  notification_id: 'notif_123',
  notification_type: 'reminder',
  success: true
});

// App Lifecycle
analytics.logAppOpen();
analytics.logAppClose();
analytics.logAppCrash({
  error_message: 'Memory error',
  error_type: 'OutOfMemory',
  stack_trace: '...'
});
```

### Set User Properties
```typescript
analytics.setUserId('user_123');
analytics.setUserProperty('subscription', 'premium');
analytics.setUserProperty('language', 'ar');
```

## Event Parameters

### All events include:
- `timestamp` - ISO 8601 format, auto-added

### Standard parameter names:
- `medication_id` - UUID or identifier
- `medication_name` - Full medication name
- `screen_name` - Screen/page identifier
- `duration_minutes` - Time in minutes
- `duration_ms` - Time in milliseconds
- `success` - boolean
- `error_message` - Error description
- `status_code` - HTTP status code
- `timestamp` - Event time (auto-added)

## Files Location

| File | Purpose |
|------|---------|
| `analytics.json` | Config & event definitions |
| `services/AnalyticsService.ts` | Core service (220+ lines) |
| `hooks/useAnalytics.ts` | React hook for components |
| `FIREBASE_ANALYTICS_GUIDE.md` | Full documentation |

## Integration Points

### In Medication Management
- [add.tsx](app/%28tabs%29/add.tsx) - Log `medication_added`
- [index.tsx](app/%28tabs%29/index.tsx) - Log `medication_intake_confirmed`, `medication_deleted`
- [edit/index.tsx](app/edit/index.tsx) - Log `medication_edited`

### In Health Tools
- [bmi.tsx](app/%28tabs%29/bmi.tsx) - Log `bmi_calculated`
- [idealweight.tsx](app/%28tabs%29/idealweight.tsx) - Log `ideal_weight_calculated`
- [tdee.tsx](app/%28tabs%29/tdee.tsx) - Log `tdee_calculated`
- [water.tsx](app/%28tabs%29/water.tsx) - Log `water_intake_logged`
- [pregnancy.tsx](app/%28tabs%29/pregnancy.tsx) - Log `pregnancy_info_viewed`

### In Settings
- [settings.tsx](app/%28tabs%29/settings.tsx) - Log `settings_changed`, `permission_request`

### In Onboarding
- [onboarding/index.tsx](app/onboarding/index.tsx) - Log `onboarding_started`, `onboarding_completed`

### In App Root
- [app/_layout.tsx](app/_layout.tsx) - Log `app_open`, `session_start`, `app_close`

## Dependencies Added

```json
{
  "firebase": "^10.7.0",
  "react-native-firebase": "^21.5.0",
  "@react-native-firebase/analytics": "^21.5.0",
  "@react-native-firebase/app": "^21.5.0"
}
```

## Verification

Check if analytics is working:
1. Enable debug mode in console
2. Perform an action that logs an event
3. Look for `[Analytics]` prefixed logs
4. Check Firebase Console after 24-48 hours

## Common Issues

| Issue | Solution |
|-------|----------|
| Events not logging | Check `isInitialized()` returns true |
| Firebase auth error | Verify credentials in `analytics.json` |
| Events not in console | Wait 24-48 hours for historical sync |
| Debug logs missing | Ensure `__DEV__` is true |
| Performance issues | Events are async, shouldn't impact performance |
