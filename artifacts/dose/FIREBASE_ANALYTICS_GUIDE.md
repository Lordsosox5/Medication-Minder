# Firebase Analytics Implementation Guide

This guide demonstrates how to integrate and use Firebase Analytics throughout your Tabira medication reminder app.

## Files Added

1. **analytics.json** - Configuration file with tracked events and custom dimensions
2. **services/AnalyticsService.ts** - Core analytics service with all event logging methods
3. **hooks/useAnalytics.ts** - React hook for easy analytics access in components
4. **package.json** - Updated with Firebase dependencies

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

The following packages have been added:
- `firebase` - Firebase SDK
- `react-native-firebase` - React Native Firebase wrapper
- `@react-native-firebase/analytics` - Analytics module
- `@react-native-firebase/app` - Core app module

### 2. Initialize Analytics in App Root

Update your [app/_layout.tsx](app/_layout.tsx) to initialize analytics on app startup:

```typescript
import { useEffect } from 'react';
import AnalyticsService from '@/services/AnalyticsService';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function RootLayout() {
  const analytics = useAnalytics();

  useEffect(() => {
    // Log app open event
    analytics.logAppOpen();
    
    // Log session start
    analytics.logSessionStart();

    return () => {
      // Log app close when app unmounts
      analytics.logAppClose();
    };
  }, [analytics]);

  // ... rest of your layout
}
```

### 3. Configure Firebase Project

Update the `analytics.json` file with your actual Firebase credentials:

```json
{
  "analytics_config": {
    "project_id": "your-project-id",
    "measurement_id": "G-YOUR_MEASUREMENT_ID",
    "api_secret": "YOUR_ANALYTICS_API_SECRET",
    "enabled": true,
    "debug_mode": false
  }
}
```

## Usage Examples

### Using the Hook in Components

Import the hook in any component:

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

export function MedicationForm() {
  const { logMedicationAdded, logScreenViewed } = useAnalytics();

  useEffect(() => {
    // Log screen view
    logScreenViewed({
      screen_name: 'medication_add',
      screen_class: 'MedicationForm'
    });
  }, []);

  const handleAddMedication = async (medicationData) => {
    // Your logic here
    
    // Log analytics event
    logMedicationAdded({
      medication_id: medicationData.id,
      name: medicationData.name,
      dosage: medicationData.dosage,
      frequency: medicationData.frequency
    });
  };

  return (
    // Your form JSX
  );
}
```

### Medication Events

```typescript
const { logMedicationIntakeConfirmed, logMedicationIntakeMissed } = useAnalytics();

// When user confirms taking medication
logMedicationIntakeConfirmed({
  medication_id: 'med_123',
  medication_name: 'Aspirin',
  scheduled_time: '09:00',
  actual_time: '09:05',
  time_difference_minutes: 5
});

// When medication is missed
logMedicationIntakeMissed({
  medication_id: 'med_123',
  medication_name: 'Aspirin',
  scheduled_time: '09:00'
});

// When alarm is snoozed
logMedicationIntakeSnoozed({
  medication_id: 'med_123',
  medication_name: 'Aspirin',
  snooze_duration_minutes: 5
});
```

### Health Tools Events

```typescript
const { logBMICalculated, logTDEECalculated, logWaterIntakeLogged } = useAnalytics();

// BMI calculation
logBMICalculated({
  bmi_value: 24.5,
  weight: 70,
  height: 170,
  category: 'normal'
});

// TDEE calculation
logTDEECalculated({
  tdee_value: 2500,
  bmr: 1700,
  activity_level: 'moderate'
});

// Water intake tracking
logWaterIntakeLogged({
  amount_ml: 250,
  daily_total_ml: 1000,
  daily_goal_ml: 2000
});
```

### User Interactions

```typescript
const { logPermissionRequest, logOnboardingCompleted, logSettingsChanged } = useAnalytics();

// Permission requests
logPermissionRequest('notification', true); // granted
logPermissionRequest('alarm', false); // denied

// Onboarding tracking
logOnboardingCompleted({
  duration_minutes: 5,
  steps_completed: 4
});

// Settings changes
logSettingsChanged({
  setting_name: 'reminder_time',
  old_value: '09:00',
  new_value: '08:00'
});
```

### Technical Metrics

```typescript
const { logAPICall, logDatabaseSync, logNotificationEvent } = useAnalytics();

// API calls
logAPICall({
  endpoint: '/api/medications',
  method: 'POST',
  status_code: 201,
  duration_ms: 150,
  success: true
});

// Database sync
logDatabaseSync(true, {
  records_synced: 5,
  duration_ms: 200
});

// Notifications
logNotificationEvent({
  notification_id: 'notif_123',
  notification_type: 'medication_reminder',
  success: true
});
```

### User Properties

```typescript
const { setUserId, setUserProperty } = useAnalytics();

// Set user ID for identification
setUserId('user_abc123');

// Set custom user properties
setUserProperty('preferred_language', 'ar');
setUserProperty('medication_count', '3');
setUserProperty('subscription_tier', 'premium');
```

## Tracked Events Summary

### Medication Events
- `medication_added` - When a new medication is added
- `medication_deleted` - When a medication is removed
- `medication_edited` - When medication details are modified
- `medication_intake_confirmed` - When user confirms taking medication
- `medication_intake_missed` - When a scheduled intake is missed
- `medication_intake_snoozed` - When alarm is snoozed
- `medication_alarm_triggered` - When alarm goes off
- `medication_alarm_dismissed` - When alarm is dismissed

### Health Tools Events
- `bmi_calculated` - BMI calculator usage
- `ideal_weight_calculated` - Ideal weight calculator usage
- `tdee_calculated` - TDEE calculator usage
- `water_intake_logged` - Water intake tracking
- `pregnancy_info_viewed` - Pregnancy information access

### User Interaction Events
- `screen_viewed` - Page/screen navigation
- `settings_changed` - Preference updates
- `notification_permission_granted/denied` - Notification permissions
- `alarm_permission_granted/denied` - Alarm permissions
- `location_permission_granted/denied` - Location permissions
- `onboarding_started` - Onboarding process started
- `onboarding_completed` - Onboarding process completed

### Technical Metrics
- `api_call_success/failed` - API endpoint calls
- `database_sync_success/failed` - Database synchronization
- `notification_sent/failed` - Notification delivery
- `session_start` - Session begins
- `session_end` - Session ends
- `app_open` - App launched
- `app_close` - App closed
- `app_crash` - App crashed

## Custom Dimensions

The analytics service automatically tracks these dimensions:

- `user_id` - User identifier
- `app_version` - Application version
- `device_platform` - Android/iOS
- `os_version` - Operating system version
- `locale` - Device language/locale
- `medication_count` - Number of medications user has
- `daily_intake_schedule` - User's intake frequency
- `reminder_type` - Type of reminder used

## Debug Mode

To enable debug logging, set `__DEV__` to true or modify the AnalyticsService:

```typescript
// In development, analytics will log all events to console
// This helps verify events are being tracked correctly
```

## Firebase Console Access

To view analytics data:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project "tabira-7d7dd"
3. Navigate to Analytics section
4. View real-time events, user metrics, and engagement data

## Integration Checklist

- [ ] Install dependencies with `pnpm install`
- [ ] Update `analytics.json` with Firebase credentials
- [ ] Initialize analytics in app root layout
- [ ] Import `useAnalytics` hook in components
- [ ] Add event logging to medication management screens
- [ ] Add event logging to health calculator tools
- [ ] Add event logging to settings and user interactions
- [ ] Test in development (debug mode on)
- [ ] Monitor events in Firebase Console
- [ ] Disable debug mode before production release

## Best Practices

1. **Always use the hook** - Use `useAnalytics()` hook rather than importing service directly
2. **Include timestamps** - Service automatically includes timestamps, don't override
3. **Meaningful event names** - Use descriptive, snake_case event names
4. **Consistent parameters** - Use consistent parameter names across similar events
5. **User privacy** - Don't log personally sensitive information
6. **Performance** - Events are logged asynchronously, won't block UI
7. **Error handling** - Service handles errors gracefully, won't crash app

## Troubleshooting

### Events not appearing in Firebase Console

1. Verify Firebase credentials in `analytics.json`
2. Check network connectivity
3. Enable debug mode to see console logs
4. Ensure analytics is initialized in app root
5. Wait 24-48 hours for historical data to appear

### Debug logs not showing

1. Confirm `__DEV__` is true
2. Check browser console (web) or device logs (mobile)
3. Rebuild app after changes

### Performance issues

1. Events are non-blocking and asynchronous
2. If experiencing issues, check Firebase quota limits
3. Contact Firebase support for quota increase

## References

- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [React Native Firebase Analytics](https://rnfirebase.io/analytics/usage)
- [Analytics Best Practices](https://support.google.com/firebase/answer/6317519)
