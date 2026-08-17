import * as Analytics from 'expo-firebase-analytics';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
}

interface CustomDimensions {
  [key: string]: string | number | boolean;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private isInitialized = false;
  private debugMode = false;

  private constructor() {
    this.initializeAnalytics();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private initializeAnalytics(): void {
    try {
      this.debugMode = __DEV__ || false;
      this.isInitialized = true;
      
      if (this.debugMode) {
        console.log('[Analytics] Service initialized in debug mode');
      }

      // Set user properties
      this.setUserProperties();
    } catch (error) {
      console.error('[Analytics] Initialization error:', error);
    }
  }

  private setUserProperties(): void {
    try {
      const deviceInfo = {
        platform: Platform.OS,
        os_version: Platform.Version,
        app_version: Constants.expoConfig?.version || '1.0.0',
        device_type: Platform.isPad ? 'tablet' : 'phone',
      };

      Object.entries(deviceInfo).forEach(([key, value]) => {
        this.setUserProperty(key, String(value));
      });
    } catch (error) {
      console.error('[Analytics] Error setting user properties:', error);
    }
  }

  /**
   * Log a custom event
   */
  public logEvent(event: AnalyticsEvent): Promise<void> {
    return this.logEventInternal(event.name, event.parameters || {});
  }

  private logEventInternal(
    eventName: string,
    parameters: Record<string, any> = {}
  ): Promise<void> {
    if (!this.isInitialized) {
      console.warn('[Analytics] Service not initialized');
      return Promise.resolve();
    }

    if (this.debugMode) {
      console.log(`[Analytics] Event logged: ${eventName}`, parameters);
    }

    try {
      return Analytics.logEvent(eventName, parameters).catch(error => {
        console.error(`[Analytics] Error logging event ${eventName}:`, error);
      });
    } catch (error) {
      console.error(`[Analytics] Unexpected error in logEvent:`, error);
      return Promise.resolve();
    }
  }

  /**
   * Set a user property
   */
  public setUserProperty(name: string, value: string): Promise<void> {
    if (!this.isInitialized) {
      console.warn('[Analytics] Service not initialized');
      return Promise.resolve();
    }

    if (this.debugMode) {
      console.log(`[Analytics] User property set: ${name} = ${value}`);
    }

    try {
      return Analytics.setUserProperty(name, value).catch(error => {
        console.error(`[Analytics] Error setting user property ${name}:`, error);
      });
    } catch (error) {
      console.error('[Analytics] Unexpected error in setUserProperty:', error);
      return Promise.resolve();
    }
  }

  /**
   * Set user ID for identification
   */
  public setUserId(userId: string): Promise<void> {
    return this.setUserProperty('user_id', userId);
  }

  // ===== Medication Events =====

  public logMedicationAdded(medicationData: {
    medication_id: string;
    name: string;
    dosage: string;
    frequency: string;
  }): Promise<void> {
    return this.logEventInternal('medication_added', {
      medication_id: medicationData.medication_id,
      medication_name: medicationData.name,
      dosage: medicationData.dosage,
      frequency: medicationData.frequency,
      timestamp: new Date().toISOString(),
    });
  }

  public logMedicationDeleted(medicationId: string): Promise<void> {
    return this.logEventInternal('medication_deleted', {
      medication_id: medicationId,
      timestamp: new Date().toISOString(),
    });
  }

  public logMedicationEdited(medicationData: {
    medication_id: string;
    changed_fields: string[];
  }): Promise<void> {
    return this.logEventInternal('medication_edited', {
      medication_id: medicationData.medication_id,
      changed_fields: medicationData.changed_fields.join(','),
      timestamp: new Date().toISOString(),
    });
  }

  public logMedicationIntakeConfirmed(medicationData: {
    medication_id: string;
    medication_name: string;
    scheduled_time: string;
    actual_time: string;
    time_difference_minutes: number;
  }): Promise<void> {
    return this.logEventInternal('medication_intake_confirmed', {
      medication_id: medicationData.medication_id,
      medication_name: medicationData.medication_name,
      scheduled_time: medicationData.scheduled_time,
      actual_time: medicationData.actual_time,
      time_difference_minutes: medicationData.time_difference_minutes,
      timestamp: new Date().toISOString(),
    });
  }

  public logMedicationIntakeMissed(medicationData: {
    medication_id: string;
    medication_name: string;
    scheduled_time: string;
  }): Promise<void> {
    return this.logEventInternal('medication_intake_missed', {
      medication_id: medicationData.medication_id,
      medication_name: medicationData.medication_name,
      scheduled_time: medicationData.scheduled_time,
      timestamp: new Date().toISOString(),
    });
  }

  public logMedicationIntakeSnoozed(medicationData: {
    medication_id: string;
    medication_name: string;
    snooze_duration_minutes: number;
  }): Promise<void> {
    return this.logEventInternal('medication_intake_snoozed', {
      medication_id: medicationData.medication_id,
      medication_name: medicationData.medication_name,
      snooze_duration_minutes: medicationData.snooze_duration_minutes,
      timestamp: new Date().toISOString(),
    });
  }

  public logMedicationAlarmTriggered(medicationData: {
    medication_id: string;
    medication_name: string;
    alarm_type: 'notification' | 'fullscreen' | 'sound';
  }): Promise<void> {
    return this.logEventInternal('medication_alarm_triggered', {
      medication_id: medicationData.medication_id,
      medication_name: medicationData.medication_name,
      alarm_type: medicationData.alarm_type,
      timestamp: new Date().toISOString(),
    });
  }

  public logMedicationAlarmDismissed(medicationData: {
    medication_id: string;
    medication_name: string;
    dismissal_method: 'user' | 'auto_snooze' | 'timeout';
  }): Promise<void> {
    return this.logEventInternal('medication_alarm_dismissed', {
      medication_id: medicationData.medication_id,
      medication_name: medicationData.medication_name,
      dismissal_method: medicationData.dismissal_method,
      timestamp: new Date().toISOString(),
    });
  }

  // ===== Health Tools Events =====

  public logBMICalculated(bmiData: {
    bmi_value: number;
    weight: number;
    height: number;
    category: string;
  }): Promise<void> {
    return this.logEventInternal('bmi_calculated', {
      bmi_value: bmiData.bmi_value,
      weight: bmiData.weight,
      height: bmiData.height,
      category: bmiData.category,
      timestamp: new Date().toISOString(),
    });
  }

  public logIdealWeightCalculated(data: {
    ideal_weight: number;
    height: number;
    formula_type: string;
  }): Promise<void> {
    return this.logEventInternal('ideal_weight_calculated', {
      ideal_weight: data.ideal_weight,
      height: data.height,
      formula_type: data.formula_type,
      timestamp: new Date().toISOString(),
    });
  }

  public logTDEECalculated(data: {
    tdee_value: number;
    bmr: number;
    activity_level: string;
  }): Promise<void> {
    return this.logEventInternal('tdee_calculated', {
      tdee_value: data.tdee_value,
      bmr: data.bmr,
      activity_level: data.activity_level,
      timestamp: new Date().toISOString(),
    });
  }

  public logWaterIntakeLogged(data: {
    amount_ml: number;
    daily_total_ml: number;
    daily_goal_ml: number;
  }): Promise<void> {
    return this.logEventInternal('water_intake_logged', {
      amount_ml: data.amount_ml,
      daily_total_ml: data.daily_total_ml,
      daily_goal_ml: data.daily_goal_ml,
      completion_percentage: Math.round(
        (data.daily_total_ml / data.daily_goal_ml) * 100
      ),
      timestamp: new Date().toISOString(),
    });
  }

  public logPregnancyInfoViewed(data: {
    trimester: string;
    information_type: string;
  }): Promise<void> {
    return this.logEventInternal('pregnancy_info_viewed', {
      trimester: data.trimester,
      information_type: data.information_type,
      timestamp: new Date().toISOString(),
    });
  }

  // ===== User Interaction Events =====

  public logScreenViewed(data: {
    screen_name: string;
    screen_class?: string;
  }): Promise<void> {
    return this.logEventInternal('screen_viewed', {
      screen_name: data.screen_name,
      screen_class: data.screen_class || data.screen_name,
      timestamp: new Date().toISOString(),
    });
  }

  public logSettingsChanged(data: {
    setting_name: string;
    old_value: string;
    new_value: string;
  }): Promise<void> {
    return this.logEventInternal('settings_changed', {
      setting_name: data.setting_name,
      old_value: data.old_value,
      new_value: data.new_value,
      timestamp: new Date().toISOString(),
    });
  }

  public logPermissionRequest(permissionType: 'notification' | 'alarm' | 'location', granted: boolean): Promise<void> {
    const eventName = granted 
      ? `${permissionType}_permission_granted`
      : `${permissionType}_permission_denied`;
    
    return this.logEventInternal(eventName, {
      permission_type: permissionType,
      granted,
      timestamp: new Date().toISOString(),
    });
  }

  public logOnboardingStarted(): Promise<void> {
    return this.logEventInternal('onboarding_started', {
      timestamp: new Date().toISOString(),
    });
  }

  public logOnboardingCompleted(data?: {
    duration_minutes: number;
    steps_completed: number;
  }): Promise<void> {
    return this.logEventInternal('onboarding_completed', {
      duration_minutes: data?.duration_minutes || 0,
      steps_completed: data?.steps_completed || 0,
      timestamp: new Date().toISOString(),
    });
  }

  // ===== Technical Metrics Events =====

  public logAPICall(data: {
    endpoint: string;
    method: string;
    status_code: number;
    duration_ms: number;
    success: boolean;
  }): Promise<void> {
    const eventName = data.success ? 'api_call_success' : 'api_call_failed';
    return this.logEventInternal(eventName, {
      endpoint: data.endpoint,
      method: data.method,
      status_code: data.status_code,
      duration_ms: data.duration_ms,
      timestamp: new Date().toISOString(),
    });
  }

  public logDatabaseSync(success: boolean, data?: {
    records_synced: number;
    duration_ms: number;
  }): Promise<void> {
    const eventName = success ? 'database_sync_success' : 'database_sync_failed';
    return this.logEventInternal(eventName, {
      records_synced: data?.records_synced || 0,
      duration_ms: data?.duration_ms || 0,
      timestamp: new Date().toISOString(),
    });
  }

  public logNotificationEvent(data: {
    notification_id: string;
    notification_type: string;
    success: boolean;
  }): Promise<void> {
    const eventName = data.success ? 'notification_sent' : 'notification_failed';
    return this.logEventInternal(eventName, {
      notification_id: data.notification_id,
      notification_type: data.notification_type,
      timestamp: new Date().toISOString(),
    });
  }

  // ===== Session Management =====

  public logSessionStart(): Promise<void> {
    return this.logEventInternal('session_start', {
      timestamp: new Date().toISOString(),
    });
  }

  public logSessionEnd(data?: {
    duration_seconds: number;
    events_logged: number;
  }): Promise<void> {
    return this.logEventInternal('session_end', {
      duration_seconds: data?.duration_seconds || 0,
      events_logged: data?.events_logged || 0,
      timestamp: new Date().toISOString(),
    });
  }

  public logAppOpen(): Promise<void> {
    return this.logEventInternal('app_open', {
      timestamp: new Date().toISOString(),
    });
  }

  public logAppClose(): Promise<void> {
    return this.logEventInternal('app_close', {
      timestamp: new Date().toISOString(),
    });
  }

  public logAppCrash(data: {
    error_message: string;
    error_type: string;
    stack_trace?: string;
  }): Promise<void> {
    return this.logEventInternal('app_crash', {
      error_message: data.error_message,
      error_type: data.error_type,
      stack_trace: data.stack_trace || '',
      timestamp: new Date().toISOString(),
    });
  }

  public isDebugMode(): boolean {
    return this.debugMode;
  }

  public isInitialized(): boolean {
    return this.isInitialized;
  }
}

export default AnalyticsService.getInstance();
