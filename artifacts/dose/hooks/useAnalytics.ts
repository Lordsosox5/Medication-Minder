import { useCallback } from 'react';
import AnalyticsService from '@/services/AnalyticsService';

/**
 * Hook to access Firebase Analytics service
 * Provides easy access to all analytics logging methods
 */
export function useAnalytics() {
  const logEvent = useCallback((eventName: string, parameters?: Record<string, any>) => {
    return AnalyticsService.logEvent({
      name: eventName,
      parameters,
    });
  }, []);

  const logMedicationAdded = useCallback((medicationData) => {
    return AnalyticsService.logMedicationAdded(medicationData);
  }, []);

  const logMedicationDeleted = useCallback((medicationId: string) => {
    return AnalyticsService.logMedicationDeleted(medicationId);
  }, []);

  const logMedicationIntakeConfirmed = useCallback((medicationData) => {
    return AnalyticsService.logMedicationIntakeConfirmed(medicationData);
  }, []);

  const logMedicationIntakeMissed = useCallback((medicationData) => {
    return AnalyticsService.logMedicationIntakeMissed(medicationData);
  }, []);

  const logMedicationIntakeSnoozed = useCallback((medicationData) => {
    return AnalyticsService.logMedicationIntakeSnoozed(medicationData);
  }, []);

  const logMedicationAlarmTriggered = useCallback((medicationData) => {
    return AnalyticsService.logMedicationAlarmTriggered(medicationData);
  }, []);

  const logMedicationAlarmDismissed = useCallback((medicationData) => {
    return AnalyticsService.logMedicationAlarmDismissed(medicationData);
  }, []);

  const logBMICalculated = useCallback((bmiData) => {
    return AnalyticsService.logBMICalculated(bmiData);
  }, []);

  const logIdealWeightCalculated = useCallback((data) => {
    return AnalyticsService.logIdealWeightCalculated(data);
  }, []);

  const logTDEECalculated = useCallback((data) => {
    return AnalyticsService.logTDEECalculated(data);
  }, []);

  const logWaterIntakeLogged = useCallback((data) => {
    return AnalyticsService.logWaterIntakeLogged(data);
  }, []);

  const logPregnancyInfoViewed = useCallback((data) => {
    return AnalyticsService.logPregnancyInfoViewed(data);
  }, []);

  const logScreenViewed = useCallback((data) => {
    return AnalyticsService.logScreenViewed(data);
  }, []);

  const logSettingsChanged = useCallback((data) => {
    return AnalyticsService.logSettingsChanged(data);
  }, []);

  const logPermissionRequest = useCallback((permissionType, granted) => {
    return AnalyticsService.logPermissionRequest(permissionType, granted);
  }, []);

  const logOnboardingStarted = useCallback(() => {
    return AnalyticsService.logOnboardingStarted();
  }, []);

  const logOnboardingCompleted = useCallback((data?) => {
    return AnalyticsService.logOnboardingCompleted(data);
  }, []);

  const logAPICall = useCallback((data) => {
    return AnalyticsService.logAPICall(data);
  }, []);

  const logDatabaseSync = useCallback((success, data?) => {
    return AnalyticsService.logDatabaseSync(success, data);
  }, []);

  const logNotificationEvent = useCallback((data) => {
    return AnalyticsService.logNotificationEvent(data);
  }, []);

  const logSessionStart = useCallback(() => {
    return AnalyticsService.logSessionStart();
  }, []);

  const logSessionEnd = useCallback((data?) => {
    return AnalyticsService.logSessionEnd(data);
  }, []);

  const logAppOpen = useCallback(() => {
    return AnalyticsService.logAppOpen();
  }, []);

  const logAppClose = useCallback(() => {
    return AnalyticsService.logAppClose();
  }, []);

  const logAppCrash = useCallback((data) => {
    return AnalyticsService.logAppCrash(data);
  }, []);

  const setUserId = useCallback((userId: string) => {
    return AnalyticsService.setUserId(userId);
  }, []);

  const setUserProperty = useCallback((name: string, value: string) => {
    return AnalyticsService.setUserProperty(name, value);
  }, []);

  return {
    // Medication events
    logMedicationAdded,
    logMedicationDeleted,
    logMedicationIntakeConfirmed,
    logMedicationIntakeMissed,
    logMedicationIntakeSnoozed,
    logMedicationAlarmTriggered,
    logMedicationAlarmDismissed,
    // Health tools
    logBMICalculated,
    logIdealWeightCalculated,
    logTDEECalculated,
    logWaterIntakeLogged,
    logPregnancyInfoViewed,
    // User interactions
    logScreenViewed,
    logSettingsChanged,
    logPermissionRequest,
    logOnboardingStarted,
    logOnboardingCompleted,
    // Technical metrics
    logAPICall,
    logDatabaseSync,
    logNotificationEvent,
    // Session management
    logSessionStart,
    logSessionEnd,
    logAppOpen,
    logAppClose,
    logAppCrash,
    // User properties
    setUserId,
    setUserProperty,
    // Generic event logging
    logEvent,
  };
}
