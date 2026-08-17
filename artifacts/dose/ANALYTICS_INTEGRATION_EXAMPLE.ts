/**
 * EXAMPLE: MedicationScreen with Analytics Integration
 * 
 * This file demonstrates how to integrate Firebase Analytics into
 * your existing components. Copy these patterns to other screens.
 */

import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import { useAnalytics } from '@/hooks/useAnalytics';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  scheduledTime: string;
}

export function MedicationScreenExample() {
  const { 
    logScreenViewed,
    logMedicationAdded,
    logMedicationDeleted,
    logMedicationIntakeConfirmed,
    logMedicationIntakeMissed,
    logMedicationIntakeSnoozed,
    logAPICall,
  } = useAnalytics();

  const [medications, setMedications] = useState<Medication[]>([]);

  // ===== EXAMPLE 1: Log screen view on mount =====
  useEffect(() => {
    // Log that user viewed this screen
    logScreenViewed({
      screen_name: 'medications_list',
      screen_class: 'MedicationScreen'
    });
  }, []);

  // ===== EXAMPLE 2: Log medication addition =====
  const handleAddMedication = async (medication: Medication) => {
    try {
      const startTime = Date.now();
      
      // Your API call or database operation
      const response = await fetch('/api/medications', {
        method: 'POST',
        body: JSON.stringify(medication),
      });
      
      const duration = Date.now() - startTime;
      const success = response.ok;

      // Log the API call
      logAPICall({
        endpoint: '/api/medications',
        method: 'POST',
        status_code: response.status,
        duration_ms: duration,
        success,
      });

      if (success) {
        setMedications([...medications, medication]);

        // Log the medication addition event
        logMedicationAdded({
          medication_id: medication.id,
          name: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
        });
      }
    } catch (error) {
      console.error('Error adding medication:', error);
      logAPICall({
        endpoint: '/api/medications',
        method: 'POST',
        status_code: 500,
        duration_ms: 0,
        success: false,
      });
    }
  };

  // ===== EXAMPLE 3: Log medication deletion =====
  const handleDeleteMedication = async (medicationId: string) => {
    try {
      const startTime = Date.now();
      
      // Your API call
      const response = await fetch(`/api/medications/${medicationId}`, {
        method: 'DELETE',
      });
      
      const duration = Date.now() - startTime;
      const success = response.ok;

      // Log the API call
      logAPICall({
        endpoint: `/api/medications/${medicationId}`,
        method: 'DELETE',
        status_code: response.status,
        duration_ms: duration,
        success,
      });

      if (success) {
        setMedications(medications.filter(m => m.id !== medicationId));

        // Log medication deletion
        logMedicationDeleted(medicationId);
      }
    } catch (error) {
      console.error('Error deleting medication:', error);
    }
  };

  // ===== EXAMPLE 4: Log medication intake confirmation =====
  const handleConfirmIntake = async (medication: Medication) => {
    try {
      const scheduledTime = medication.scheduledTime;
      const actualTime = new Date().toISOString();
      
      // Calculate time difference
      const scheduled = new Date(scheduledTime).getTime();
      const actual = new Date(actualTime).getTime();
      const diffMs = actual - scheduled;
      const diffMinutes = Math.round(diffMs / (1000 * 60));

      // Your API call to confirm intake
      const response = await fetch(`/api/medications/${medication.id}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ confirmedAt: actualTime }),
      });

      if (response.ok) {
        // Log medication intake confirmation
        logMedicationIntakeConfirmed({
          medication_id: medication.id,
          medication_name: medication.name,
          scheduled_time: scheduledTime,
          actual_time: actualTime,
          time_difference_minutes: diffMinutes,
        });
      }
    } catch (error) {
      console.error('Error confirming intake:', error);
    }
  };

  // ===== EXAMPLE 5: Log snooze action =====
  const handleSnoozeMedication = (
    medication: Medication,
    snoozeMinutes: number
  ) => {
    // Log snooze action
    logMedicationIntakeSnoozed({
      medication_id: medication.id,
      medication_name: medication.name,
      snooze_duration_minutes: snoozeMinutes,
    });

    // Your snooze logic here
    // e.g., reschedule alarm for snoozeMinutes from now
  };

  // ===== EXAMPLE 6: Log missed intake =====
  const handleMarkMissed = async (medication: Medication) => {
    try {
      // Your API call
      const response = await fetch(`/api/medications/${medication.id}/mark-missed`, {
        method: 'POST',
      });

      if (response.ok) {
        // Log missed intake
        logMedicationIntakeMissed({
          medication_id: medication.id,
          medication_name: medication.name,
          scheduled_time: medication.scheduledTime,
        });
      }
    } catch (error) {
      console.error('Error marking as missed:', error);
    }
  };

  // Render medication item
  const renderMedicationItem = ({ item }: { item: Medication }) => (
    <View style={{ padding: 16, borderBottomWidth: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
      <Text>{item.dosage}</Text>
      <Text>{item.frequency}</Text>
      <Text>Scheduled: {item.scheduledTime}</Text>

      {/* Action buttons */}
      <TouchableOpacity onPress={() => handleConfirmIntake(item)}>
        <Text>✓ Confirm Intake</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleSnoozeMedication(item, 5)}>
        <Text>⏰ Snooze 5 min</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleMarkMissed(item)}>
        <Text>✗ Mark Missed</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleDeleteMedication(item.id)}>
        <Text>🗑️ Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View>
      <FlatList
        data={medications}
        renderItem={renderMedicationItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

/**
 * ===== INTEGRATION CHECKLIST FOR YOUR COMPONENTS =====
 * 
 * For each screen/component, follow these steps:
 * 
 * 1. Import the hook at the top:
 *    import { useAnalytics } from '@/hooks/useAnalytics';
 * 
 * 2. Destructure needed methods in component:
 *    const { logScreenViewed, logMedicationAdded, ... } = useAnalytics();
 * 
 * 3. In useEffect, log screen view:
 *    useEffect(() => {
 *      logScreenViewed({ screen_name: 'your_screen_name' });
 *    }, []);
 * 
 * 4. For each action (button click, form submission, etc.):
 *    - Before async operation: calculate duration start time
 *    - After operation: log the event with parameters
 *    - Include success/failure status
 *    - Include relevant IDs and names
 * 
 * 5. For calculations (BMI, TDEE, etc.):
 *    - Log with all relevant values
 *    - Include category/result interpretation
 * 
 * 6. For permission requests:
 *    - Log with permission type and granted status
 * 
 * ===== WHAT TO TRACK IN EACH SCREEN =====
 * 
 * Add Screen (add.tsx):
 *   - logScreenViewed()
 *   - logMedicationAdded() on form submit
 *   - logAPICall() for API calls
 * 
 * Medications List Screen (index.tsx):
 *   - logScreenViewed()
 *   - logMedicationIntakeConfirmed() 
 *   - logMedicationIntakeMissed()
 *   - logMedicationIntakeSnoozed()
 *   - logMedicationDeleted()
 * 
 * Edit Screen (edit/index.tsx):
 *   - logScreenViewed()
 *   - logMedicationEdited() on save
 * 
 * BMI Calculator (bmi.tsx):
 *   - logScreenViewed()
 *   - logBMICalculated() on calculate
 * 
 * TDEE Calculator (tdee.tsx):
 *   - logScreenViewed()
 *   - logTDEECalculated() on calculate
 * 
 * Water Tracker (water.tsx):
 *   - logScreenViewed()
 *   - logWaterIntakeLogged() on add water
 * 
 * Settings (settings.tsx):
 *   - logScreenViewed()
 *   - logSettingsChanged() on change
 *   - logPermissionRequest() for permissions
 * 
 * Onboarding (onboarding/index.tsx):
 *   - logOnboardingStarted() at start
 *   - logOnboardingCompleted() at end
 * 
 * ===== PERFORMANCE NOTES =====
 * 
 * - All logging is async and non-blocking
 * - Events are queued and sent in batches
 * - Won't impact UI performance
 * - Safe to call from any component
 * - If you catch errors, don't re-throw - logging handles errors gracefully
 */
