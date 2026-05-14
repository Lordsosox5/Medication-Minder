import React, { useMemo, useState } from "react";
import {
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import Colors from "@/constants/colors";
import { t } from "@/constants/i18n";
import { useApp } from "@/context/AppContext";

type DoseEntry = {
  id: string;
  name: string;
  category: "Injections/Infusions" | "Syrups/Suspensions" | "Drops" | "Tablets/Capsules" | "Neonatology";
  concentration?: string;
  dose: string;
  frequency: string;
  unit?: string;
  multiplier?: number;
  minMultiplier?: number;
  maxMultiplier?: number;
  fixed?: string;
  notes?: string;
};

const DOSE_ENTRIES: DoseEntry[] = [
  // ── INJECTIONS / INFUSIONS ──────────────────────────────────────────────────
  // Adrenaline (Epinephrine)
  { id: "adrenaline-anaphylaxis", name: "Adrenaline (Epinephrine) anaphylaxis IM", category: "Injections/Infusions", concentration: "1:1000", dose: "0.01mg/kg/dose", frequency: "As required", unit: "mg", multiplier: 0.01 },
  { id: "adrenaline-cpr", name: "Adrenaline (Epinephrine) cardiac arrest IV", category: "Injections/Infusions", concentration: "1:10,000", dose: "0.01mg/kg/dose", frequency: "As required", unit: "mg", multiplier: 0.01 },
  { id: "adrenaline-neb", name: "Adrenaline (Epinephrine) nebulized", category: "Injections/Infusions", concentration: "1:1000", dose: "0.5ml/kg of 1:1000. Max 5ml/session", frequency: "Max 5ml/session", unit: "ml", multiplier: 0.5 },
  // Artesunate injection
  { id: "artesunate-small", name: "Artesunate injection less than 20kg", category: "Injections/Infusions", concentration: "30mg, 60mg, 120mg", dose: "wt x 3 per dose", frequency: "Doses 1, 2, 3", unit: "mg", multiplier: 3 },
  { id: "artesunate-large", name: "Artesunate injection 20kg or more", category: "Injections/Infusions", concentration: "30mg, 60mg, 120mg", dose: "wt x 2.4 per dose", frequency: "Doses 1, 2, 3", unit: "mg", multiplier: 2.4 },
  // Albumin
  { id: "albumin", name: "Albumin IV (hypoalbuminaemia)", category: "Injections/Infusions", dose: "0.5 - 1g/kg/dose, for 1 - 2 days. Max 25g/dose", frequency: "Over 120 minutes", unit: "g", minMultiplier: 0.5, maxMultiplier: 1 },
  // Aciclovir injection
  { id: "aciclovir-inj-regular", name: "Aciclovir injection regular dose", category: "Injections/Infusions", concentration: "200mg, 250mg, 500mg, 1g", dose: "10mg/kg/dose, 8 hourly", frequency: "8 hourly", unit: "mg", multiplier: 10 },
  { id: "aciclovir-inj-enceph-child", name: "Aciclovir injection sepsis/encephalitis birth to 12yrs", category: "Injections/Infusions", concentration: "200mg, 250mg, 500mg, 1g", dose: "20mg/kg/dose, 8 hourly", frequency: "8 hourly", unit: "mg", multiplier: 20 },
  { id: "aciclovir-inj-enceph-adult", name: "Aciclovir injection encephalitis more than 12yrs", category: "Injections/Infusions", concentration: "200mg, 250mg, 500mg, 1g", dose: "30mg/kg/day, 8 hourly", frequency: "8 hourly", unit: "mg/day", multiplier: 30 },
  // Amikacin
  { id: "amikacin", name: "Amikacin injection", category: "Injections/Infusions", concentration: "250mg/ml, 500mg/ml", dose: "15 - 22.5mg/kg/day, Od, BD, or TDS", frequency: "OD, BD, or TDS", unit: "mg/day", minMultiplier: 15, maxMultiplier: 22.5 },
  // Aminophylline (asthma exacerbation)
  { id: "aminophylline-load", name: "Aminophylline loading dose", category: "Injections/Infusions", concentration: "250mg/10ml, 500mg/20ml", dose: "5 - 6mg/kg in 20 - 30 minutes", frequency: "Now, over 20 - 30 minutes", unit: "mg", minMultiplier: 5, maxMultiplier: 6 },
  { id: "aminophylline-maint-young", name: "Aminophylline maintenance 1month - 11yrs", category: "Injections/Infusions", concentration: "250mg/10ml, 500mg/20ml", dose: "1mg/kg/hour", frequency: "Continuous infusion", unit: "mg/hr", multiplier: 1 },
  { id: "aminophylline-maint-older", name: "Aminophylline maintenance 12yrs - 17yrs", category: "Injections/Infusions", concentration: "250mg/10ml, 500mg/20ml", dose: "0.5 - 0.7mg/kg/hour", frequency: "Continuous infusion", unit: "mg/hr", minMultiplier: 0.5, maxMultiplier: 0.7 },
  // Ampicillin
  { id: "ampicillin-regular", name: "Ampicillin injection regular dose", category: "Injections/Infusions", concentration: "250mg, 500mg, 1g", dose: "50 - 100mg/kg/day, 6 hourly", frequency: "6 hourly", unit: "mg/day", minMultiplier: 50, maxMultiplier: 100 },
  { id: "ampicillin-meningitis", name: "Ampicillin injection meningitis", category: "Injections/Infusions", concentration: "250mg, 500mg, 1g", dose: "200 - 400mg/kg/day, 4 - 6 hourly. Max 8 - 12g/day", frequency: "4 - 6 hourly", unit: "mg/day", minMultiplier: 200, maxMultiplier: 400 },
  // Benzyl penicillin (Penicillin G)
  { id: "benzylpen-moderate", name: "Benzyl penicillin (Penicillin G) moderate/severe", category: "Injections/Infusions", concentration: "1 million units, 5 million units", dose: "100,000 - 250,000 u/kg/day, 4 - 6 hourly", frequency: "4 - 6 hourly", unit: "u/day", minMultiplier: 100000, maxMultiplier: 250000 },
  { id: "benzylpen-meningitis", name: "Benzyl penicillin (Penicillin G) meningitis", category: "Injections/Infusions", concentration: "1 million units, 5 million units", dose: "250,000 - 400,000 u/kg/day", frequency: "4 - 6 hourly", unit: "u/day", minMultiplier: 250000, maxMultiplier: 400000 },
  // Blood transfusion
  { id: "blood-packed-rbcs", name: "Blood transfusion packed RBCs", category: "Injections/Infusions", dose: "10 - 15ml/kg", frequency: "As directed", unit: "ml", minMultiplier: 10, maxMultiplier: 15 },
  { id: "blood-whole", name: "Blood transfusion whole blood", category: "Injections/Infusions", dose: "20ml/kg", frequency: "As directed", unit: "ml", multiplier: 20 },
  { id: "blood-platelets", name: "Blood transfusion platelets", category: "Injections/Infusions", dose: "10 - 15ml/kg", frequency: "As directed", unit: "ml", minMultiplier: 10, maxMultiplier: 15 },
  // Calcium gluconate
  { id: "calcium-gluconate-bolus", name: "Calcium gluconate bolus (convulsions)", category: "Injections/Infusions", dose: "0.5 - 2ml/kg in 20 minutes in Dextrose 10% (1:4 concentration)", frequency: "Now, over 20 minutes", unit: "ml", minMultiplier: 0.5, maxMultiplier: 2 },
  { id: "calcium-gluconate-maint", name: "Calcium gluconate maintenance", category: "Injections/Infusions", dose: "0.5 - 1.5ml/kg/hour", frequency: "Continuous infusion", unit: "ml/hr", minMultiplier: 0.5, maxMultiplier: 1.5 },
  // Cefepime
  { id: "cefepime", name: "Cefepime injection 4th gen cephalosporin", category: "Injections/Infusions", concentration: "500mg, 1g, 2g", dose: "50mg/kg/dose, TDS. Max 2g/dose", frequency: "TDS", unit: "mg", multiplier: 50 },
  // Cefotaxime
  { id: "cefotaxime-regular", name: "Cefotaxime injection regular dose", category: "Injections/Infusions", concentration: "500mg, 1g", dose: "150 - 200mg/kg/day, 6 - 8 hourly", frequency: "6 - 8 hourly", unit: "mg/day", minMultiplier: 150, maxMultiplier: 200 },
  { id: "cefotaxime-meningitis", name: "Cefotaxime injection meningitis", category: "Injections/Infusions", concentration: "500mg, 1g", dose: "200mg/kg/day, 6 - 8 hourly. Max 12g/day", frequency: "6 - 8 hourly", unit: "mg/day", multiplier: 200 },
  // Ceftazidime (Fortum)
  { id: "ceftazidime-regular", name: "Ceftazidime (Fortum) injection regular dose", category: "Injections/Infusions", concentration: "500mg, 1g", dose: "100 - 150mg/kg/day, TDS", frequency: "TDS", unit: "mg/day", minMultiplier: 100, maxMultiplier: 150 },
  { id: "ceftazidime-meningitis", name: "Ceftazidime (Fortum) injection meningitis", category: "Injections/Infusions", concentration: "500mg, 1g", dose: "200mg/kg/day, 8 hourly. Max 6g/day", frequency: "8 hourly", unit: "mg/day", multiplier: 200 },
  // Ceftriaxone (Samixone)
  { id: "ceftriaxone-mild", name: "Ceftriaxone injection mild/moderate", category: "Injections/Infusions", concentration: "500mg, 1g", dose: "50 - 75mg/kg/day. OD or BD. Max 2g/day", frequency: "OD or BD", unit: "mg/day", minMultiplier: 50, maxMultiplier: 75 },
  { id: "ceftriaxone-severe", name: "Ceftriaxone injection septic dose (severe)", category: "Injections/Infusions", concentration: "500mg, 1g", dose: "80 - 100mg/kg/day", frequency: "OD or BD", unit: "mg/day", minMultiplier: 80, maxMultiplier: 100 },
  { id: "ceftriaxone-meningitis", name: "Ceftriaxone injection meningitis", category: "Injections/Infusions", concentration: "500mg, 1g", dose: "100mg/kg/day. Max 4g/day", frequency: "OD or BD", unit: "mg/day", multiplier: 100 },
  // Cefuroxime (Maxil)
  { id: "cefuroxime-mild", name: "Cefuroxime injection mild/moderate", category: "Injections/Infusions", concentration: "750mg", dose: "75 - 100mg/kg/day, TDS", frequency: "TDS", unit: "mg/day", minMultiplier: 75, maxMultiplier: 100 },
  { id: "cefuroxime-severe", name: "Cefuroxime injection severe infection", category: "Injections/Infusions", concentration: "750mg", dose: "100 - 200mg/kg/day, 6 - 8 hourly. Max 3g/day iv", frequency: "6 - 8 hourly", unit: "mg/day", minMultiplier: 100, maxMultiplier: 200 },
  // Dexamethasone
  { id: "dexamethasone-croup", name: "Dexamethasone croup", category: "Injections/Infusions", concentration: "4mg/ml, 8mg/2ml", dose: "0.15 - 0.6mg/kg single dose. Max 10 - 12mg", frequency: "Single dose", unit: "mg", minMultiplier: 0.15, maxMultiplier: 0.6 },
  { id: "dexamethasone-meningitis", name: "Dexamethasone meningitis", category: "Injections/Infusions", concentration: "4mg/ml, 8mg/2ml", dose: "0.15mg/kg/dose, 6 hourly (2 - 4 days). Max 16mg/day", frequency: "6 hourly for 2 - 4 days", unit: "mg", multiplier: 0.15 },
  // Diazepam
  { id: "diazepam-iv", name: "Diazepam IV acute seizures", category: "Injections/Infusions", concentration: "10mg/2ml", dose: "0.1 - 0.3mg/kg/dose", frequency: "IV", unit: "mg", minMultiplier: 0.1, maxMultiplier: 0.3 },
  { id: "diazepam-rectal", name: "Diazepam rectal", category: "Injections/Infusions", concentration: "10mg/2ml", dose: "0.5mg/kg/dose", frequency: "Rectal", unit: "mg", multiplier: 0.5 },
  // Dobutamine
  { id: "dobutamine", name: "Dobutamine infusion", category: "Injections/Infusions", concentration: "250mg/20ml", dose: "5 - 20mcg/kg/minute. Max 30mcg/kg/min", frequency: "Continuous infusion in NS or D5%", unit: "mcg/min", minMultiplier: 5, maxMultiplier: 20 },
  // Dopamine
  { id: "dopamine-cardiac", name: "Dopamine infusion cardiac dose", category: "Injections/Infusions", concentration: "200mg/5ml, 400mg/5ml", dose: "3 - 10mcg/kg/min (increases contractility & cardiac output)", frequency: "Continuous infusion in NS or D5%", unit: "mcg/min", minMultiplier: 3, maxMultiplier: 10 },
  { id: "dopamine-vasopressor", name: "Dopamine infusion vasopressor dose", category: "Injections/Infusions", concentration: "200mg/5ml, 400mg/5ml", dose: "10 - 20mcg/kg/min (vasoconstriction & increase BP). Max 20mcg/kg/min", frequency: "Continuous infusion in NS or D5%", unit: "mcg/min", minMultiplier: 10, maxMultiplier: 20 },
  // Gentamicin
  { id: "gentamicin-normal", name: "Gentamicin injection normal patient", category: "Injections/Infusions", concentration: "10mg/ml, 40mg/ml", dose: "5 - 7.5mg/kg/day, OD or 8 hourly", frequency: "OD or 8 hourly", unit: "mg/day", minMultiplier: 5, maxMultiplier: 7.5 },
  { id: "gentamicin-malnutrition", name: "Gentamicin injection malnutrition", category: "Injections/Infusions", concentration: "10mg/ml, 40mg/ml", dose: "7.5mg/kg/day, OD", frequency: "OD", unit: "mg/day", multiplier: 7.5 },
  // Glucose
  { id: "glucose-bolus", name: "Glucose D10% bolus (all pediatrics & neonate)", category: "Injections/Infusions", dose: "2ml/kg of D10%", frequency: "Now", unit: "ml", multiplier: 2 },
  { id: "glucose-malnutrition-iv", name: "Glucose D10% malnutrition unconscious", category: "Injections/Infusions", dose: "5ml/kg D10% iv bolus", frequency: "Now", unit: "ml", multiplier: 5 },
  // Hydralazine
  { id: "hydralazine-crisis", name: "Hydralazine hydrochloride hypertensive crisis", category: "Injections/Infusions", concentration: "20mg/ml", dose: "0.1 - 0.5mg/kg (100 - 500mcg/kg) slowly IV, 4 hourly", frequency: "4 hourly or infusion if required", unit: "mg", minMultiplier: 0.1, maxMultiplier: 0.5 },
  // Hydrocortisone
  { id: "hydrocortisone-asthma", name: "Hydrocortisone status asthmaticus", category: "Injections/Infusions", concentration: "100mg", dose: "4mg/kg/day, 6 hourly. Max 100mg/dose", frequency: "6 hourly", unit: "mg/day", multiplier: 4 },
  { id: "hydrocortisone-antiinflam", name: "Hydrocortisone anti-inflammatory", category: "Injections/Infusions", concentration: "100mg", dose: "1 - 5mg/kg/day, OD or BD", frequency: "OD or BD", unit: "mg/day", minMultiplier: 1, maxMultiplier: 5 },
  // Hyoscine butylbromide
  { id: "hyoscine-inj", name: "Hyoscine butylbromide IV", category: "Injections/Infusions", concentration: "20mg/ml", dose: "0.3 - 0.6mg/kg/dose. Max 20mg/kg/dose", frequency: "IV or oral", unit: "mg", minMultiplier: 0.3, maxMultiplier: 0.6 },
  // Magnesium sulfate
  { id: "magnesium-sulfate", name: "Magnesium sulfate asthma 2yrs - 17yrs", category: "Injections/Infusions", concentration: "50% solution=500mg/ml, 20% solution=200mg/ml", dose: "40 - 50mg/kg/dose, infusion over 20 - 30 minutes. Max 2g", frequency: "Over 20 - 30 minutes", unit: "mg", minMultiplier: 40, maxMultiplier: 50 },
  // Mannitol
  { id: "mannitol", name: "Mannitol raised ICP / cerebral edema", category: "Injections/Infusions", concentration: "20%=200mg/ml, 10%=100mg/ml", dose: "0.25 - 1g/kg/dose, over 30 - 60 minutes", frequency: "Over 30 - 60 min, repeat every 4 - 8 hourly if needed", unit: "g", minMultiplier: 0.25, maxMultiplier: 1 },
  // Meropenem
  { id: "meropenem-mild", name: "Meropenem IV mild/moderate", category: "Injections/Infusions", concentration: "500mg, 1g", dose: "20mg/kg/dose, 8 hourly. Max 1g/dose", frequency: "8 hourly", unit: "mg", multiplier: 20 },
  { id: "meropenem-meningitis", name: "Meropenem IV meningitis/severe/cystic fibrosis", category: "Injections/Infusions", concentration: "500mg, 1g", dose: "40mg/kg/dose, 8 hourly. Max 2g/dose", frequency: "8 hourly", unit: "mg", multiplier: 40 },
  // Metoclopramide injection
  { id: "metoclopramide-inj", name: "Metoclopramide injection", category: "Injections/Infusions", concentration: "10mg/2ml", dose: "0.1 - 0.15mg/kg/dose, TDS. Max 10mg/dose", frequency: "TDS", unit: "mg", minMultiplier: 0.1, maxMultiplier: 0.15 },
  // Metronidazole IV
  { id: "metronidazole-iv-anaerobic", name: "Metronidazole IV anaerobic infection", category: "Injections/Infusions", concentration: "500mg/100ml", dose: "22.5 - 40mg/kg/day, 6 - 8 hourly. Max 4g/day", frequency: "6 - 8 hourly", unit: "mg/day", minMultiplier: 22.5, maxMultiplier: 40 },
  // Methylprednisolone
  { id: "methylprednisolone", name: "Methylprednisolone pulse therapy", category: "Injections/Infusions", concentration: "40mg, 125mg, 500mg, 1g vials", dose: "10 - 30mg/kg/day once for 3 - 5 days. Max 1g/day", frequency: "Once daily for 3 - 5 days", unit: "mg/day", minMultiplier: 10, maxMultiplier: 30 },
  // Midazolam
  { id: "midazolam-loading", name: "Midazolam IV loading status epilepticus", category: "Injections/Infusions", concentration: "1mg/ml, 5mg/ml", dose: "0.2mg/kg loading, followed by 0.05 - 0.1mg/kg/min slow IV", frequency: "Now (preferred in 2 months & older)", unit: "mg", multiplier: 0.2 },
  // Morphine
  { id: "morphine-cyanotic", name: "Morphine cyanotic spells", category: "Injections/Infusions", dose: "0.05mg/kg/dose, 8 hourly", frequency: "8 hourly", unit: "mg", multiplier: 0.05 },
  { id: "morphine-sickle-start", name: "Morphine sickle cell starting dose", category: "Injections/Infusions", dose: "0.1 - 0.15mg/kg/dose, 4 hourly slowly IV", frequency: "4 hourly", unit: "mg", minMultiplier: 0.1, maxMultiplier: 0.15 },
  { id: "morphine-sickle-maint", name: "Morphine sickle cell maintenance", category: "Injections/Infusions", dose: "0.04 - 0.07mg/kg/hour", frequency: "Continuous infusion", unit: "mg/hr", minMultiplier: 0.04, maxMultiplier: 0.07 },
  // Pethidine
  { id: "pethidine", name: "Pethidine hydrochloride injection", category: "Injections/Infusions", concentration: "50mg/ml, 100mg/ml", dose: "0.5 - 1mg/kg/dose, 4 - 6 hourly if needed. Max 100mg/dose", frequency: "4 - 6 hourly if needed", unit: "mg", minMultiplier: 0.5, maxMultiplier: 1 },
  // Phenobarbital loading
  { id: "phenobarb-load-inj", name: "Phenobarbital loading dose", category: "Injections/Infusions", dose: "15 - 20mg/kg", frequency: "Loading dose", unit: "mg", minMultiplier: 15, maxMultiplier: 20 },
  // Phenytoin
  { id: "phenytoin-load-inj", name: "Phenytoin injection loading dose", category: "Injections/Infusions", concentration: "50mg/ml", dose: "15 - 20mg/kg. Max 1500mg/day", frequency: "Now, slow IV", unit: "mg", minMultiplier: 15, maxMultiplier: 20 },
  { id: "phenytoin-maint-inj", name: "Phenytoin injection maintenance", category: "Injections/Infusions", concentration: "50mg/ml", dose: "4 - 8mg/kg/day, BD", frequency: "BD", unit: "mg/day", minMultiplier: 4, maxMultiplier: 8 },
  // Quinine
  { id: "quinine-load", name: "Quinine injection loading dose", category: "Injections/Infusions", concentration: "600mg/2ml", dose: "20mg/kg over 4 hours, diluted in D5%", frequency: "Loading, over 4 hours", unit: "mg", multiplier: 20 },
  { id: "quinine-maint", name: "Quinine injection maintenance", category: "Injections/Infusions", concentration: "600mg/2ml", dose: "10mg/kg, 8 hourly", frequency: "8 hourly (any more than 6 doses reduce to 7mg/kg/dose)", unit: "mg", multiplier: 10 },
  // Ranitidine injection
  { id: "ranitidine-inj", name: "Ranitidine injectable", category: "Injections/Infusions", concentration: "25mg/ml", dose: "1mg/kg/dose, 6 - 8 hourly", frequency: "6 - 8 hourly", unit: "mg", multiplier: 1 },
  // Sodium nitroprusside
  { id: "sodium-nitroprusside", name: "Sodium nitroprusside HTN emergency", category: "Injections/Infusions", concentration: "50mg diluted in D5%, protected from light", dose: "0.3 - 0.5mcg/kg/minute up to 0.5 - 5mcg/kg/minute. Max 8mcg/kg/min", frequency: "Continuous infusion", unit: "mcg/min", minMultiplier: 0.3, maxMultiplier: 5 },
  // Vancomycin
  { id: "vancomycin", name: "Vancomycin IV", category: "Injections/Infusions", concentration: "500mg, 1g", dose: "40 - 60mg/kg/day, 6 - 8 hourly (we give 45mg/kg/day)", frequency: "6 - 8 hourly", unit: "mg/day", minMultiplier: 40, maxMultiplier: 60 },
  // Vitamin K injection
  { id: "vit-k-proph", name: "Vitamin K prophylaxis IM", category: "Injections/Infusions", dose: "1mg IM once. (wt less than 2500g: 400mcg/kg)", frequency: "Once", fixed: "1 mg IM (or 400 mcg/kg if <2500g)" },
  { id: "vit-k-therapeutic", name: "Vitamin K therapeutic injection", category: "Injections/Infusions", dose: "0.1 - 2mg/kg/day. Max 10mg/day", frequency: "IV", unit: "mg/day", minMultiplier: 0.1, maxMultiplier: 2 },

  // ── SYRUPS / SUSPENSIONS ────────────────────────────────────────────────────
  // Paracetamol (Panadol)
  { id: "paracetamol-syrup-120", name: "Paracetamol syrup 120mg/5ml", category: "Syrups/Suspensions", concentration: "120mg/5ml", dose: "10 - 15mg/kg/dose, 4 - 6 hourly. Max 60mg/kg/day", frequency: "4 - 6 hourly", unit: "mg", minMultiplier: 10, maxMultiplier: 15 },
  { id: "paracetamol-syrup-250", name: "Paracetamol syrup 250mg/5ml", category: "Syrups/Suspensions", concentration: "250mg/5ml", dose: "10 - 15mg/kg/dose, 4 - 6 hourly. Max 60mg/kg/day", frequency: "4 - 6 hourly", unit: "mg", minMultiplier: 10, maxMultiplier: 15 },
  // Ibuprofen syrup
  { id: "ibuprofen-syrup", name: "Ibuprofen syrup analgesic/antipyretic", category: "Syrups/Suspensions", concentration: "100mg/5ml", dose: "5 - 10mg/kg/dose, 6 - 8 hourly. Max lesser of 40mg/kg/day", frequency: "6 - 8 hourly. Preferred in 6 months & above only", unit: "mg", minMultiplier: 5, maxMultiplier: 10 },
  // Mefenamic acid
  { id: "mefenamic-syrup", name: "Mefenamic acid syrup", category: "Syrups/Suspensions", concentration: "50mg/5ml", dose: "5 - 10mg/kg/dose, 6 - 8 hourly. Max 1500mg/day", frequency: "6 - 8 hourly", unit: "mg", minMultiplier: 5, maxMultiplier: 10 },
  // Amoxicillin syrup
  { id: "amoxicillin-syrup-125-regular", name: "Amoxicillin syrup 125mg/5ml regular dose", category: "Syrups/Suspensions", concentration: "125mg/5ml", dose: "25 - 50mg/kg/day, BD or TDS", frequency: "BD or TDS", unit: "mg/day", minMultiplier: 25, maxMultiplier: 50 },
  { id: "amoxicillin-syrup-250-regular", name: "Amoxicillin syrup 250mg/5ml regular dose", category: "Syrups/Suspensions", concentration: "250mg/5ml", dose: "25 - 50mg/kg/day, BD or TDS", frequency: "BD or TDS", unit: "mg/day", minMultiplier: 25, maxMultiplier: 50 },
  { id: "amoxicillin-syrup-tonsil", name: "Amoxicillin syrup tonsillitis/pharyngitis 5 - 15yrs", category: "Syrups/Suspensions", concentration: "250mg/5ml", dose: "40mg/kg/day, BD, for 10 days", frequency: "BD for 10 days", unit: "mg/day", multiplier: 40 },
  { id: "amoxicillin-syrup-severe", name: "Amoxicillin syrup severe infection", category: "Syrups/Suspensions", concentration: "250mg/5ml", dose: "80 - 100mg/kg/day, BD", frequency: "BD", unit: "mg/day", minMultiplier: 80, maxMultiplier: 100 },
  // Azithromycin suspension
  { id: "azithromycin-susp-pharyngitis", name: "Azithromycin suspension pharyngitis & tonsillitis", category: "Syrups/Suspensions", dose: "12mg/kg/day, OD for 5 days", frequency: "OD for 5 days", unit: "mg/day", multiplier: 12 },
  { id: "azithromycin-susp-under6mo", name: "Azithromycin suspension less than 6 months (whooping cough/CAP)", category: "Syrups/Suspensions", dose: "10mg/kg/day, OD for 5 days", frequency: "OD for 5 days", unit: "mg/day", multiplier: 10 },
  { id: "azithromycin-susp-over6mo", name: "Azithromycin suspension over 6 months (whooping cough/CAP)", category: "Syrups/Suspensions", dose: "10mg/kg/day OD on day 1, then 5mg/kg/day on 4 subsequent days", frequency: "OD", unit: "mg/day", multiplier: 10, notes: "Day 1: 10mg/kg OD, then 5mg/kg OD for 4 subsequent days" },
  // Cefaclor
  { id: "cefaclor-syrup", name: "Cefaclor syrup 125mg/5ml 2nd gen cephalosporin", category: "Syrups/Suspensions", concentration: "125mg/5ml, 250mg/ml", dose: "20 - 40mg/kg/day, 8 hourly. Max 1g/day", frequency: "8 hourly", unit: "mg/day", minMultiplier: 20, maxMultiplier: 40 },
  // Cefadroxil
  { id: "cefadroxil-syrup", name: "Cefadroxil syrup 1st gen cephalosporin", category: "Syrups/Suspensions", concentration: "125mg/5ml, 250mg/5ml", dose: "30 - 50mg/kg/day, OD or BD", frequency: "OD or BD", unit: "mg/day", minMultiplier: 30, maxMultiplier: 50 },
  // Cefalexin
  { id: "cefalexin-syrup-regular", name: "Cefalexin syrup regular 1st gen cephalosporin", category: "Syrups/Suspensions", concentration: "125mg/5ml, 250mg/ml", dose: "25 - 50mg/kg/day, BD or 6 hourly", frequency: "BD or 6 hourly", unit: "mg/day", minMultiplier: 25, maxMultiplier: 50 },
  { id: "cefalexin-syrup-severe", name: "Cefalexin syrup severe infection", category: "Syrups/Suspensions", concentration: "125mg/5ml, 250mg/ml", dose: "50 - 100mg/kg/day, TDS or 6 hourly. Max 4g/day", frequency: "TDS or 6 hourly", unit: "mg/day", minMultiplier: 50, maxMultiplier: 100 },
  // Cefixime
  { id: "cefixime-syrup", name: "Cefixime syrup 100mg/5ml 3rd gen cephalosporin", category: "Syrups/Suspensions", concentration: "100mg/5ml (0.4ml/kg/day)", dose: "8mg/kg/day, OD or BD. Max 400mg/day", frequency: "OD or BD", unit: "mg/day", multiplier: 8 },
  // Ciprofloxacin syrup
  { id: "ciprofloxacin-syrup", name: "Ciprofloxacin syrup", category: "Syrups/Suspensions", concentration: "250mg/5ml", dose: "20 - 30mg/kg/day, BD or TDS. Max 400mg/dose", frequency: "BD or TDS", unit: "mg/day", minMultiplier: 20, maxMultiplier: 30 },
  // Clarithromycin syrup
  { id: "clarithromycin-syrup", name: "Clarithromycin syrup", category: "Syrups/Suspensions", concentration: "125mg/5ml, 250mg/5ml", dose: "15mg/kg/day, BD. Max 1g/day", frequency: "BD", unit: "mg/day", multiplier: 15 },
  // Co-amoxiclav (Amocaln)
  { id: "coamoxiclav-syrup-regular", name: "Co-amoxiclav (Amocaln) syrup regular dose", category: "Syrups/Suspensions", concentration: "156mg/5ml, 200mg/ml, 400mg/5ml", dose: "25 - 45mg/kg/day, BD", frequency: "BD", unit: "mg/day", minMultiplier: 25, maxMultiplier: 45 },
  { id: "coamoxiclav-syrup-severe", name: "Co-amoxiclav (Amocaln) syrup severe (CAP, orbital cellulitis, AOM)", category: "Syrups/Suspensions", concentration: "156mg/5ml, 200mg/ml, 400mg/5ml", dose: "80 - 90mg/kg/day, BD or TDS", frequency: "BD or TDS", unit: "mg/day", minMultiplier: 80, maxMultiplier: 90 },
  // Co-trimoxazole syrup (Septrin)
  { id: "cotrimoxazole-syrup-mild", name: "Co-trimoxazole (Septrin) syrup mild/moderate", category: "Syrups/Suspensions", dose: "8mg/kg/day, BD", frequency: "BD", unit: "mg/day", multiplier: 8 },
  { id: "cotrimoxazole-syrup-immuno", name: "Co-trimoxazole (Septrin) syrup immunocompromised", category: "Syrups/Suspensions", dose: "15 - 20mg/kg/day, 6 hourly or TDS. Max 320mg/day", frequency: "6 hourly or TDS", unit: "mg/day", minMultiplier: 15, maxMultiplier: 20 },
  // Domperidone
  { id: "domperidone-syrup", name: "Domperidone syrup", category: "Syrups/Suspensions", concentration: "5mg/5ml", dose: "0.2 - 0.4mg/kg/dose, TDS (before meals)", frequency: "TDS before meals", unit: "mg", minMultiplier: 0.2, maxMultiplier: 0.4 },
  // Erythromycin syrup
  { id: "erythromycin-syrup-whooping", name: "Erythromycin syrup whooping cough", category: "Syrups/Suspensions", concentration: "125mg/5ml, 250mg/5ml", dose: "40 - 50mg/kg/day, 6 hourly, for 14 days", frequency: "6 hourly for 14 days", unit: "mg/day", minMultiplier: 40, maxMultiplier: 50 },
  { id: "erythromycin-syrup-chlamydia", name: "Erythromycin syrup chlamydial conjunctivitis/pneumonia", category: "Syrups/Suspensions", concentration: "125mg/5ml, 250mg/5ml", dose: "50mg/kg/day, 6 hourly, for 14 days. Max 2g/day", frequency: "6 hourly for 14 days", unit: "mg/day", multiplier: 50 },
  // Ferrous sulfate (Saferon)
  { id: "ferrous-sulfate-proph", name: "Ferrous sulfate (Saferon) syrup prophylaxis", category: "Syrups/Suspensions", concentration: "50mg/5ml", dose: "1 - 2mg/kg/day, OD or BD or TDS", frequency: "OD or BD or TDS", unit: "mg/day", minMultiplier: 1, maxMultiplier: 2 },
  { id: "ferrous-sulfate-therapy", name: "Ferrous sulfate (Saferon) syrup therapeutic", category: "Syrups/Suspensions", concentration: "50mg/5ml", dose: "3 - 6mg/kg/day. Max 150 - 200mg/day", frequency: "OD or BD or TDS", unit: "mg/day", minMultiplier: 3, maxMultiplier: 6 },
  { id: "hematin-syrup", name: "Ferrous sulfate with Folic acid (Hematin) syrup", category: "Syrups/Suspensions", concentration: "30mg/5ml", dose: "Same dose as Ferrous sulfate: 1 - 6mg/kg/day", frequency: "OD or BD or TDS", unit: "mg/day", minMultiplier: 1, maxMultiplier: 6 },
  // Fluconazole syrup
  { id: "fluconazole-mucosal", name: "Fluconazole syrup mucocutaneous candidiasis", category: "Syrups/Suspensions", concentration: "50mg/5ml, 200mg/5ml", dose: "Day 1: 6mg/kg OD, then 3mg/kg OD", frequency: "OD", unit: "mg", multiplier: 6, notes: "Day 1: 6mg/kg OD, then 3mg/kg OD from day 2" },
  { id: "fluconazole-systemic", name: "Fluconazole syrup systemic/invasive", category: "Syrups/Suspensions", concentration: "50mg/5ml, 200mg/5ml", dose: "6 - 12mg/kg OD. Max 400 - 800mg/day", frequency: "OD", unit: "mg/day", minMultiplier: 6, maxMultiplier: 12 },
  // Furosemide (Lasix) syrup
  { id: "furosemide-oral", name: "Furosemide (Lasix) oral", category: "Syrups/Suspensions", concentration: "20mg, 40mg tabs, 20mg/2ml inj", dose: "0.5 - 1mg/kg/dose, OD, BD, TDS or 6 hourly. Max 3mg/kg/day", frequency: "OD, BD, TDS or 6 hourly", unit: "mg", minMultiplier: 0.5, maxMultiplier: 1 },
  // Lactulose
  { id: "lactulose-constipation", name: "Lactulose syrup constipation", category: "Syrups/Suspensions", concentration: "10g/15ml", dose: "1 - 3ml/kg/day, OD or BD", frequency: "OD or BD", unit: "ml/day", minMultiplier: 1, maxMultiplier: 3 },
  { id: "lactulose-hepatic", name: "Lactulose syrup hepatic encephalopathy", category: "Syrups/Suspensions", concentration: "10g/15ml", dose: "1 - 2ml/kg/dose, 6 - 8 hourly", frequency: "6 - 8 hourly", unit: "ml", minMultiplier: 1, maxMultiplier: 2 },
  // Metoclopramide syrup
  { id: "metoclopramide-syrup", name: "Metoclopramide syrup", category: "Syrups/Suspensions", concentration: "5mg/5ml", dose: "0.1 - 0.15mg/kg/dose, TDS. Max 10mg/dose", frequency: "TDS", unit: "mg", minMultiplier: 0.1, maxMultiplier: 0.15 },
  // Metronidazole syrup (Flagyl)
  { id: "metronidazole-syrup-giardia", name: "Metronidazole (Flagyl) syrup giardiasis", category: "Syrups/Suspensions", concentration: "200mg/5ml", dose: "15 - 30mg/kg/day, TDS, for 5 - 7 days. Max 750mg/day", frequency: "TDS for 5 - 7 days", unit: "mg/day", minMultiplier: 15, maxMultiplier: 30 },
  { id: "metronidazole-syrup-hpylori", name: "Metronidazole (Flagyl) syrup H. pylori", category: "Syrups/Suspensions", concentration: "200mg/5ml", dose: "20mg/kg/day, BD, for 14 days. Max 1g/day", frequency: "BD for 14 days", unit: "mg/day", multiplier: 20 },
  { id: "metronidazole-syrup-amoeba", name: "Metronidazole (Flagyl) syrup amoebiasis", category: "Syrups/Suspensions", concentration: "200mg/5ml", dose: "35 - 50mg/kg/day, TDS, for 10 days. Max 750mg/dose", frequency: "TDS for 10 days", unit: "mg/day", minMultiplier: 35, maxMultiplier: 50 },
  { id: "metronidazole-syrup-anaerobic", name: "Metronidazole (Flagyl) syrup anaerobic infection oral", category: "Syrups/Suspensions", concentration: "200mg/5ml", dose: "30 - 50mg/kg/day, 8 hourly. Max 2250mg/day", frequency: "8 hourly", unit: "mg/day", minMultiplier: 30, maxMultiplier: 50 },
  { id: "metronidazole-syrup-malnutrition", name: "Metronidazole (Flagyl) syrup malnutrition", category: "Syrups/Suspensions", concentration: "200mg/5ml", dose: "7.5mg/kg/dose, TDS. Max 400 - 500mg", frequency: "TDS", unit: "mg", multiplier: 7.5 },
  // Nystatin
  { id: "nystatin-syrup", name: "Nystatin oral suspension", category: "Syrups/Suspensions", concentration: "100,000 u/ml", dose: "100,000 units (1ml), 6 hourly", frequency: "6 hourly", fixed: "1 ml (100,000 units)" },
  // Omeprazole syrup
  { id: "omeprazole-syrup", name: "Omeprazole syrup", category: "Syrups/Suspensions", concentration: "2mg/ml", dose: "0.5 - 1mg/kg/day, OD or BD", frequency: "OD or BD", unit: "mg/day", minMultiplier: 0.5, maxMultiplier: 1, notes: "Less than 10kg: 5-10mg OD; 10-20kg: 10mg OD; More than 20kg: 20mg OD. Max 40mg/day" },
  // Ondansetron syrup
  { id: "ondansetron-syrup", name: "Ondansetron syrup", category: "Syrups/Suspensions", concentration: "4mg/5ml", dose: "0.1 - 0.15mg/kg/dose, 8 - 12 hourly. Max 4mg young children, 8mg older", frequency: "8 - 12 hourly. Contraindicated less than 6 months", unit: "mg", minMultiplier: 0.1, maxMultiplier: 0.15 },
  // Ranitidine
  { id: "ranitidine-oral", name: "Ranitidine oral", category: "Syrups/Suspensions", concentration: "75mg/5ml, tabs 150mg, 300mg", dose: "2 - 4mg/kg/dose, BD. Max 300mg/day", frequency: "BD", unit: "mg", minMultiplier: 2, maxMultiplier: 4 },
  // Salbutamol nebulization
  { id: "salbutamol-neb-under5", name: "Salbutamol nebulization less than 5yrs", category: "Syrups/Suspensions", concentration: "2.5mg/2.5ml, 5mg/2.5ml", dose: "2.5mg/dose", frequency: "As directed", fixed: "2.5 mg/dose" },
  { id: "salbutamol-neb-5to11", name: "Salbutamol nebulization 5yrs - 11yrs", category: "Syrups/Suspensions", concentration: "2.5mg/2.5ml, 5mg/2.5ml", dose: "2.5 - 5mg/dose", frequency: "As directed", fixed: "2.5 - 5 mg/dose" },
  { id: "salbutamol-neb-over12", name: "Salbutamol nebulization 12yrs & more", category: "Syrups/Suspensions", concentration: "2.5mg/2.5ml, 5mg/2.5ml", dose: "5mg", frequency: "As directed", fixed: "5 mg/dose" },
  // Sodium valproate syrup
  { id: "sodium-valproate-syrup-start", name: "Sodium valproate syrup epilepsy initial", category: "Syrups/Suspensions", concentration: "200mg/5ml, 250mg/5ml", dose: "10 - 15mg/kg/day", frequency: "Initially. Max 60mg/kg/day", unit: "mg/day", minMultiplier: 10, maxMultiplier: 15 },
  { id: "sodium-valproate-syrup-maint", name: "Sodium valproate syrup maintenance", category: "Syrups/Suspensions", concentration: "200mg/5ml, 250mg/5ml", dose: "20 - 60mg/kg/day, BD", frequency: "BD", unit: "mg/day", minMultiplier: 20, maxMultiplier: 60 },

  // ── TABLETS / CAPSULES ──────────────────────────────────────────────────────
  // Aciclovir tabs
  { id: "aciclovir-tabs", name: "Aciclovir tablets", category: "Tablets/Capsules", concentration: "200mg, 400mg", dose: "15 - 20mg/kg/dose, 5 times/day. Max 800mg", frequency: "5 times per day", unit: "mg", minMultiplier: 15, maxMultiplier: 20 },
  // Albendazole
  { id: "albendazole-under2", name: "Albendazole tablets less than 2yrs", category: "Tablets/Capsules", concentration: "200mg, 400mg", dose: "200mg single dose", frequency: "Single dose (can be repeated 2 - 3 wks later)", fixed: "200 mg single dose" },
  { id: "albendazole-over2", name: "Albendazole tablets 2yrs or more", category: "Tablets/Capsules", concentration: "200mg, 400mg", dose: "400mg single dose", frequency: "Single dose (can be repeated 2 - 3 wks later)", fixed: "400 mg single dose" },
  // Amlodipine
  { id: "amlodipine-under6", name: "Amlodipine tablets less than 6yrs", category: "Tablets/Capsules", concentration: "5mg, 10mg", dose: "0.1 - 0.3mg/kg once. Max 5mg/day", frequency: "Once daily", unit: "mg", minMultiplier: 0.1, maxMultiplier: 0.3 },
  { id: "amlodipine-over6", name: "Amlodipine tablets 6yrs or more", category: "Tablets/Capsules", concentration: "5mg, 10mg", dose: "0.05 - 0.2mg/kg once. Max 10mg/day", frequency: "Once daily", unit: "mg", minMultiplier: 0.05, maxMultiplier: 0.2 },
  // Amoxicillin capsules
  { id: "amoxicillin-caps-regular", name: "Amoxicillin capsules regular dose", category: "Tablets/Capsules", concentration: "250mg, 500mg", dose: "25 - 50mg/kg/day, BD or TDS", frequency: "BD or TDS", unit: "mg/day", minMultiplier: 25, maxMultiplier: 50 },
  { id: "amoxicillin-caps-tonsil", name: "Amoxicillin capsules tonsillitis/pharyngitis 5 - 15yrs", category: "Tablets/Capsules", concentration: "250mg, 500mg", dose: "40mg/kg/day, BD, for 10 days", frequency: "BD for 10 days", unit: "mg/day", multiplier: 40 },
  { id: "amoxicillin-caps-severe", name: "Amoxicillin capsules severe infection", category: "Tablets/Capsules", concentration: "250mg, 500mg", dose: "80 - 100mg/kg/day, BD", frequency: "BD", unit: "mg/day", minMultiplier: 80, maxMultiplier: 100 },
  // Artemether with lumefantrine (Co-artem)
  { id: "coartem-2to14kg", name: "Artemether/Lumefantrine (Co-artem) 2 - 14kg", category: "Tablets/Capsules", concentration: "20/120mg", dose: "1 tab per dose", frequency: "BD x 3 days", fixed: "1 tab (20/120mg) per dose" },
  { id: "coartem-15to24kg", name: "Artemether/Lumefantrine (Co-artem) 15 - 24kg", category: "Tablets/Capsules", concentration: "20/120mg", dose: "2 tabs per dose", frequency: "BD x 3 days", fixed: "2 tabs (20/120mg) per dose" },
  { id: "coartem-25to34kg", name: "Artemether/Lumefantrine (Co-artem) 25 - 34kg", category: "Tablets/Capsules", concentration: "20/120mg", dose: "3 tabs per dose", frequency: "BD x 3 days", fixed: "3 tabs (20/120mg) per dose" },
  { id: "coartem-over35kg", name: "Artemether/Lumefantrine (Co-artem) 35kg and above", category: "Tablets/Capsules", concentration: "20/120mg or 80/480mg", dose: "4 tabs per dose (or 1 tab of 80/480mg)", frequency: "BD x 3 days", fixed: "4 tabs (20/120mg) per dose or 1 tab (80/480mg)" },
  // Aspirin (salicylic acid)
  { id: "aspirin-rheumatic", name: "Aspirin rheumatic fever anti-inflammatory", category: "Tablets/Capsules", concentration: "75mg, 80mg, 100mg, 300mg", dose: "60mg/kg/day (local protocol) for 2 wks then taper. No max dose", frequency: "6 hourly for 2 wks then taper", unit: "mg/day", multiplier: 60 },
  { id: "aspirin-kawasaki", name: "Aspirin Kawasaki disease", category: "Tablets/Capsules", concentration: "75mg, 80mg, 100mg, 300mg", dose: "80 - 100mg/kg/day, 6 hourly, during febrile phase up to 14 days, then decrease to 3 - 5mg/kg/day", frequency: "6 hourly during febrile phase, then taper", unit: "mg/day", minMultiplier: 80, maxMultiplier: 100 },
  { id: "aspirin-antiplatelet", name: "Aspirin anti-platelet", category: "Tablets/Capsules", concentration: "75mg, 80mg, 100mg", dose: "3 - 5mg/kg/day. Max 75 - 100mg/day", frequency: "Once daily", unit: "mg/day", minMultiplier: 3, maxMultiplier: 5 },
  // Azithromycin tabs/caps
  { id: "azithromycin-tabs-pharyngitis", name: "Azithromycin capsules pharyngitis & tonsillitis", category: "Tablets/Capsules", concentration: "250mg, 500mg", dose: "12mg/kg/day, OD for 5 days", frequency: "OD for 5 days", unit: "mg/day", multiplier: 12 },
  { id: "azithromycin-tabs-cap", name: "Azithromycin capsules whooping cough/CAP over 6 months", category: "Tablets/Capsules", concentration: "250mg, 500mg", dose: "10mg/kg/day OD on day 1, then 5mg/kg/day on 4 subsequent days", frequency: "OD", unit: "mg/day", multiplier: 10, notes: "Day 1: 10mg/kg OD, then 5mg/kg OD for 4 subsequent days" },
  // Baclofen
  { id: "baclofen-start", name: "Baclofen tablets starting dose", category: "Tablets/Capsules", concentration: "5mg, 10mg, 25mg", dose: "0.3mg/kg/day, TDS or 6 hourly (increase every 3 days)", frequency: "TDS or 6 hourly", unit: "mg/day", multiplier: 0.3 },
  { id: "baclofen-maint", name: "Baclofen tablets maintenance", category: "Tablets/Capsules", concentration: "5mg, 10mg, 25mg", dose: "0.75 - 2mg/kg/day. Max 40 - 60mg/day", frequency: "TDS or 6 hourly", unit: "mg/day", minMultiplier: 0.75, maxMultiplier: 2 },
  // Calcium carbonate
  { id: "calcium-carbonate", name: "Calcium carbonate", category: "Tablets/Capsules", dose: "45 - 65mg/kg/day, 6 hourly", frequency: "6 hourly", unit: "mg/day", minMultiplier: 45, maxMultiplier: 65 },
  // Captopril
  { id: "captopril-htn-start", name: "Captopril tablets hypertension starting dose", category: "Tablets/Capsules", concentration: "6.25mg, 12.5mg, 25mg, 50mg", dose: "0.3 - 0.5mg/kg/dose, TDS", frequency: "TDS", unit: "mg", minMultiplier: 0.3, maxMultiplier: 0.5 },
  { id: "captopril-htn-maint", name: "Captopril tablets hypertension maintenance", category: "Tablets/Capsules", concentration: "6.25mg, 12.5mg, 25mg, 50mg", dose: "1 - 6mg/kg/day, BD or TDS. Max 6mg/kg/day", frequency: "BD or TDS", unit: "mg/day", minMultiplier: 1, maxMultiplier: 6 },
  { id: "captopril-hf", name: "Captopril tablets heart failure", category: "Tablets/Capsules", concentration: "6.25mg, 12.5mg, 25mg, 50mg", dose: "0.1 - 0.3mg/kg/dose, BD or TDS. Max 4mg/kg/day", frequency: "BD or TDS", unit: "mg", minMultiplier: 0.1, maxMultiplier: 0.3 },
  // Carbamazepine
  { id: "carbamazepine-start", name: "Carbamazepine tablets starting dose", category: "Tablets/Capsules", concentration: "100mg, 200mg, 400mg, syrup 100mg/5ml", dose: "5mg/kg/day, BD (increase by 5mg/kg/day every 3 - 7 days)", frequency: "BD", unit: "mg/day", multiplier: 5 },
  { id: "carbamazepine-maint", name: "Carbamazepine tablets maintenance", category: "Tablets/Capsules", concentration: "100mg, 200mg, 400mg, syrup 100mg/5ml", dose: "20 - 30mg/kg/day. Max 35mg/kg/day", frequency: "BD", unit: "mg/day", minMultiplier: 20, maxMultiplier: 30 },
  // Cefaclor caps
  { id: "cefaclor-caps", name: "Cefaclor capsules 2nd gen cephalosporin", category: "Tablets/Capsules", concentration: "250mg, 500mg", dose: "20 - 40mg/kg/day, 8 hourly. Max 1g/day", frequency: "8 hourly", unit: "mg/day", minMultiplier: 20, maxMultiplier: 40 },
  // Cefadroxil caps
  { id: "cefadroxil-caps", name: "Cefadroxil capsules 1st gen cephalosporin", category: "Tablets/Capsules", concentration: "250mg, 500mg", dose: "30 - 50mg/kg/day, OD or BD", frequency: "OD or BD", unit: "mg/day", minMultiplier: 30, maxMultiplier: 50 },
  // Cefalexin caps
  { id: "cefalexin-caps-regular", name: "Cefalexin capsules regular 1st gen cephalosporin", category: "Tablets/Capsules", concentration: "250mg, 500mg", dose: "25 - 50mg/kg/day, BD or 6 hourly", frequency: "BD or 6 hourly", unit: "mg/day", minMultiplier: 25, maxMultiplier: 50 },
  { id: "cefalexin-caps-severe", name: "Cefalexin capsules severe infection", category: "Tablets/Capsules", concentration: "250mg, 500mg", dose: "50 - 100mg/kg/day, TDS or 6 hourly. Max 4g/day", frequency: "TDS or 6 hourly", unit: "mg/day", minMultiplier: 50, maxMultiplier: 100 },
  // Cefixime caps
  { id: "cefixime-caps", name: "Cefixime capsules 3rd gen cephalosporin", category: "Tablets/Capsules", concentration: "200mg, 400mg", dose: "8mg/kg/day, OD or BD. Max 400mg/day", frequency: "OD or BD", unit: "mg/day", multiplier: 8 },
  // Cefpodoxime
  { id: "cefpodoxime", name: "Cefpodoxime proxetil (Cefodox) 3rd gen cephalosporin", category: "Tablets/Capsules", dose: "10mg/kg/day, BD, for 5 - 10 days. Max 200mg/day (AOM/sinusitis Max 400mg/day)", frequency: "BD for 5 - 10 days", unit: "mg/day", multiplier: 10 },
  // Cetirizine
  { id: "cetirizine-6moto2yr", name: "Cetirizine 6 months - 2yrs (2nd gen antihistamine)", category: "Tablets/Capsules", concentration: "5mg/5ml syrup, 10mg tabs", dose: "2.5mg, OD", frequency: "OD", fixed: "2.5 mg OD" },
  { id: "cetirizine-2to6yr", name: "Cetirizine 2yrs - 6yrs (2nd gen antihistamine)", category: "Tablets/Capsules", concentration: "5mg/5ml syrup, 10mg tabs", dose: "2.5mg, BD or OD. Max 5mg", frequency: "BD or OD", fixed: "2.5 mg BD or OD (Max 5mg)" },
  { id: "cetirizine-6to12yr", name: "Cetirizine 6yrs - 12yrs (2nd gen antihistamine)", category: "Tablets/Capsules", concentration: "5mg/5ml syrup, 10mg tabs", dose: "10mg, divided BD or given OD", frequency: "BD or OD", fixed: "10 mg BD or OD" },
  { id: "cetirizine-over12", name: "Cetirizine more than 12yrs (2nd gen antihistamine)", category: "Tablets/Capsules", concentration: "5mg/5ml syrup, 10mg tabs", dose: "10mg, OD", frequency: "OD", fixed: "10 mg OD" },
  // Ciprofloxacin tabs
  { id: "ciprofloxacin-tabs", name: "Ciprofloxacin tablets", category: "Tablets/Capsules", concentration: "250mg, 500mg", dose: "20 - 30mg/kg/day, BD or TDS. Max 400mg/dose", frequency: "BD or TDS", unit: "mg/day", minMultiplier: 20, maxMultiplier: 30 },
  // Clarithromycin caps
  { id: "clarithromycin-caps", name: "Clarithromycin capsules", category: "Tablets/Capsules", concentration: "250mg, 500mg", dose: "15mg/kg/day, BD. Max 1g/day", frequency: "BD", unit: "mg/day", multiplier: 15 },
  // Clindamycin
  { id: "clindamycin", name: "Clindamycin injection", category: "Injections/Infusions", concentration: "150mg/1ml ampoules", dose: "20 - 40mg/kg/day, 6 hourly or TDS. Max 2.7g/day", frequency: "6 hourly or TDS", unit: "mg/day", minMultiplier: 20, maxMultiplier: 40 },
  // Co-amoxiclav tabs
  { id: "coamoxiclav-tabs-regular", name: "Co-amoxiclav (Amocaln) tablets regular dose", category: "Tablets/Capsules", concentration: "375mg, 625mg, 1g", dose: "25 - 45mg/kg/day, BD", frequency: "BD", unit: "mg/day", minMultiplier: 25, maxMultiplier: 45 },
  { id: "coamoxiclav-tabs-severe", name: "Co-amoxiclav (Amocaln) tablets severe (CAP, orbital cellulitis, AOM)", category: "Tablets/Capsules", concentration: "375mg, 625mg, 1g", dose: "80 - 90mg/kg/day, BD or TDS", frequency: "BD or TDS", unit: "mg/day", minMultiplier: 80, maxMultiplier: 90 },
  // Co-trimoxazole tabs (Septrin)
  { id: "cotrimoxazole-tabs-mild", name: "Co-trimoxazole (Septrin) mild/moderate", category: "Tablets/Capsules", dose: "8mg/kg/day, BD", frequency: "BD", unit: "mg/day", multiplier: 8 },
  { id: "cotrimoxazole-tabs-immuno", name: "Co-trimoxazole (Septrin) immunocompromised", category: "Tablets/Capsules", dose: "15 - 20mg/kg/day, 6 hourly or TDS. Max 320mg/day", frequency: "6 hourly or TDS", unit: "mg/day", minMultiplier: 15, maxMultiplier: 20 },
  // Diclofenac sodium suppositories
  { id: "diclofenac-supp", name: "Diclofenac sodium suppositories", category: "Tablets/Capsules", concentration: "12.5mg, 25mg, 50mg, 100mg", dose: "1 - 3mg/kg/day, OD or BD", frequency: "OD or BD", unit: "mg/day", minMultiplier: 1, maxMultiplier: 3 },
  // Doxycycline
  { id: "doxycycline", name: "Doxycycline 8yrs and older", category: "Tablets/Capsules", concentration: "50mg, 100mg caps", dose: "2 - 4mg/kg/day, BD. Max 200mg/day", frequency: "BD. Contraindicated below 8yrs", unit: "mg/day", minMultiplier: 2, maxMultiplier: 4 },
  // Esomeprazole
  { id: "esomeprazole", name: "Esomeprazole capsules", category: "Tablets/Capsules", concentration: "20mg, 40mg caps, 40mg ampule", dose: "0.5 - 1mg/kg/day, OD", frequency: "OD", unit: "mg/day", minMultiplier: 0.5, maxMultiplier: 1 },
  // Folic acid
  { id: "folic-acid-infant", name: "Folic acid folate deficiency infant", category: "Tablets/Capsules", concentration: "0.5mg, 1mg, 5mg tabs, 0.2mg/ml drops", dose: "0.5mg/day, OD for 4 months", frequency: "OD for 4 months", fixed: "0.5 mg OD for 4 months" },
  { id: "folic-acid-child", name: "Folic acid folate deficiency 1yr - 17yrs", category: "Tablets/Capsules", concentration: "0.5mg, 1mg, 5mg tabs", dose: "5mg, OD for 4 months", frequency: "OD for 4 months", fixed: "5 mg OD for 4 months" },
  { id: "folic-acid-haemolytic", name: "Folic acid haemolytic anemia", category: "Tablets/Capsules", concentration: "0.5mg, 1mg, 5mg tabs", dose: "2.5 - 5mg, OD", frequency: "OD", fixed: "2.5 - 5 mg OD" },
  // Furosemide (Lasix) tabs
  { id: "furosemide-tabs", name: "Furosemide (Lasix) tablets", category: "Tablets/Capsules", concentration: "20mg, 40mg", dose: "0.5 - 1mg/kg/dose, OD, BD, TDS or 6 hourly. Max 3mg/kg/day", frequency: "OD, BD, TDS or 6 hourly", unit: "mg", minMultiplier: 0.5, maxMultiplier: 1 },
  // Griseofulvin
  { id: "griseofulvin", name: "Griseofulvin tablets", category: "Tablets/Capsules", dose: "12.5mg/kg/day. Max 500mg/day", frequency: "OD", unit: "mg/day", multiplier: 12.5 },
  // Haloperidol
  { id: "haloperidol", name: "Haloperidol tablets agitation", category: "Tablets/Capsules", concentration: "0.5mg, 1.5mg, 5mg tabs, 5mg/ml ampoules", dose: "0.01 - 0.02mg/kg/day, OD or BD. Max 5 - 10mg/day", frequency: "OD or BD", unit: "mg/day", minMultiplier: 0.01, maxMultiplier: 0.02 },
  // Hepatitis B immunoglobulin
  { id: "hbig-post-exposure", name: "Hepatitis B immunoglobulin post-exposure prophylaxis", category: "Injections/Infusions", concentration: "100iu/ml, 220iu/ml", dose: "0.06ml/kg IM", frequency: "IM", unit: "ml", multiplier: 0.06 },
  // Hydralazine tabs
  { id: "hydralazine-tabs", name: "Hydralazine tablets chronic HTN", category: "Tablets/Capsules", concentration: "25mg, 50mg, 100mg", dose: "0.5 - 1mg/kg/day, BD or 6 hourly. Max 6mg/kg/day", frequency: "BD or 6 hourly", unit: "mg/day", minMultiplier: 0.5, maxMultiplier: 1 },
  // Hydrocortisone tabs
  { id: "hydrocortisone-tabs", name: "Hydrocortisone tablets anti-inflammatory", category: "Tablets/Capsules", concentration: "10mg, 20mg", dose: "1 - 5mg/kg/day, OD or BD", frequency: "OD or BD", unit: "mg/day", minMultiplier: 1, maxMultiplier: 5 },
  // Hyoscine tabs
  { id: "hyoscine-tabs", name: "Hyoscine butylbromide tablets", category: "Tablets/Capsules", concentration: "10mg tabs", dose: "0.3 - 0.6mg/kg/dose. Max 20mg/kg/dose", frequency: "Oral", unit: "mg", minMultiplier: 0.3, maxMultiplier: 0.6 },
  // Ibuprofen tabs
  { id: "ibuprofen-tabs-analgesic", name: "Ibuprofen tablets analgesic/antipyretic", category: "Tablets/Capsules", concentration: "200mg, 400mg", dose: "5 - 10mg/kg/dose, 6 - 8 hourly. Max lesser of 40mg/kg/day", frequency: "6 - 8 hourly. Preferred in 6 months & above", unit: "mg", minMultiplier: 5, maxMultiplier: 10 },
  { id: "ibuprofen-tabs-jra", name: "Ibuprofen tablets JRA 6months - 12yrs", category: "Tablets/Capsules", concentration: "200mg, 400mg", dose: "30 - 50mg/kg/day, 6 hourly. Max 800mg/dose or 2400mg/day", frequency: "6 hourly", unit: "mg/day", minMultiplier: 30, maxMultiplier: 50 },
  // Imipenem
  { id: "imipenem-4wkto3mo", name: "Imipenem injection 4wks - 3 months", category: "Injections/Infusions", dose: "100mg/kg/day, 6 hourly", frequency: "6 hourly", unit: "mg/day", multiplier: 100 },
  { id: "imipenem-over3mo", name: "Imipenem injection more than 3 months", category: "Injections/Infusions", dose: "60 - 100mg/kg/day, 6 hourly. Max 4g/day", frequency: "6 hourly", unit: "mg/day", minMultiplier: 60, maxMultiplier: 100 },
  // Ipratropium bromide nebulizer
  { id: "ipratropium-under5", name: "Ipratropium bromide nebulizer less than 5yrs", category: "Drops", concentration: "250mcg, 500mcg nebulized solution", dose: "250mcg/dose, 3 doses then 6 hourly. Max 1mg/day", frequency: "3 doses then 6 hourly. Moderate/severe asthma", fixed: "250 mcg/dose" },
  { id: "ipratropium-over5", name: "Ipratropium bromide nebulizer 5yrs & more", category: "Drops", concentration: "250mcg, 500mcg nebulized solution", dose: "500mcg/dose, 3 doses then 6 hourly. Max 2mg/day (GINA guideline)", frequency: "3 doses then 6 hourly", fixed: "500 mcg/dose" },
  // Itraconazole
  { id: "itraconazole-regular", name: "Itraconazole regular", category: "Tablets/Capsules", concentration: "10mg/ml oral, 100mg, 200mg caps", dose: "3 - 5mg/kg/day, OD or BD", frequency: "OD or BD", unit: "mg/day", minMultiplier: 3, maxMultiplier: 5 },
  { id: "itraconazole-severe", name: "Itraconazole severe systemic", category: "Tablets/Capsules", concentration: "10mg/ml oral, 100mg, 200mg caps", dose: "10mg/kg/day. Max 200 - 400mg/day", frequency: "OD or BD", unit: "mg/day", multiplier: 10 },
  // Ivermectin
  { id: "ivermectin", name: "Ivermectin tablets scabies (15kg or more only)", category: "Tablets/Capsules", concentration: "3mg, 6mg, 12mg", dose: "200mcg/kg (0.2mg/kg) as a single dose, repeat after 7 - 14 days", frequency: "Single dose, repeat after 7 - 14 days", unit: "mg", multiplier: 0.2 },
  // Ketotifen
  { id: "ketotifen-6moto3yr", name: "Ketotifen 6 months - 3yrs", category: "Tablets/Capsules", concentration: "1mg/5ml syrup, 1mg tabs", dose: "0.5mg, BD. For children 6 months and older", frequency: "BD", fixed: "0.5 mg BD" },
  { id: "ketotifen-over3yr", name: "Ketotifen 3yrs and more", category: "Tablets/Capsules", concentration: "1mg/5ml syrup, 1mg tabs", dose: "1mg, BD. Max 2mg BD", frequency: "BD", fixed: "1 mg BD (Max 2 mg BD)" },
  // Labetalol
  { id: "labetalol", name: "Labetalol hypertensive emergency", category: "Injections/Infusions", dose: "500mcg/kg/hour (0.5mg/kg/hr). Max 3mg/kg/hr", frequency: "Continuous infusion, dilute to 1mg/ml or 2mg/ml in D5% or D5%/NaCl 0.18%", unit: "mg/hr", multiplier: 0.5 },
  // Lansoprazole
  { id: "lansoprazole", name: "Lansoprazole capsules", category: "Tablets/Capsules", concentration: "15mg, 30mg", dose: "0.5 - 1mg/kg/day, OD", frequency: "OD", unit: "mg/day", minMultiplier: 0.5, maxMultiplier: 1 },
  // Levetiracetam (Kepra)
  { id: "levetiracetam-start-child", name: "Levetiracetam (Kepra) starting dose less than 12yrs (less than 50kg)", category: "Tablets/Capsules", concentration: "100mg/ml syrup, 250mg, 500mg, 750mg, 1g tabs", dose: "10 - 20mg/kg/day, OD or BD (increase by 10mg/kg/day every 3 - 7 days)", frequency: "OD or BD", unit: "mg/day", minMultiplier: 10, maxMultiplier: 20 },
  { id: "levetiracetam-start-teen", name: "Levetiracetam (Kepra) starting dose 12yrs - 18yrs", category: "Tablets/Capsules", concentration: "250mg, 500mg, 750mg, 1g tabs", dose: "250mg, BD (increase by 500mg BD every 7 - 14 days)", frequency: "BD", fixed: "250 mg BD initially" },
  { id: "levetiracetam-maint-under50", name: "Levetiracetam (Kepra) maintenance less than 50kg", category: "Tablets/Capsules", concentration: "100mg/ml syrup, 250mg, 500mg tabs", dose: "40mg/kg/day, BD. Max 3000mg/day", frequency: "BD", unit: "mg/day", multiplier: 40 },
  // Levocetirizine
  { id: "levocetirizine", name: "Levocetirizine hydrochloride (2nd gen antihistamine)", category: "Tablets/Capsules", concentration: "0.5mg/ml syrup, 5mg tabs", dose: "0.1mg/kg/day, once. Max 5mg/day", frequency: "Once daily", unit: "mg/day", multiplier: 0.1, notes: "6 months - 5yrs: 1.25mg OD; 6yrs - 11yrs: 2.5 - 5mg OD; 12yrs+: 5mg OD" },
  // Levofloxacin
  { id: "levofloxacin-young", name: "Levofloxacin 6months - 5yrs", category: "Tablets/Capsules", dose: "10mg/kg/dose, BD. Max 500mg/day", frequency: "BD", unit: "mg", multiplier: 10 },
  { id: "levofloxacin-older", name: "Levofloxacin 5yrs or more", category: "Tablets/Capsules", dose: "10mg/kg/dose, OD. Max 750mg/day", frequency: "OD", unit: "mg", multiplier: 10 },
  // Levothyroxine
  { id: "levothyroxine-newborn", name: "Levothyroxine sodium newborns", category: "Tablets/Capsules", concentration: "25mg, 50mg, 75mg, 100mg, 125mg, 150mg tabs", dose: "10 - 15mcg/kg/day, OD. Max 50mcg/day", frequency: "OD", unit: "mcg/day", minMultiplier: 10, maxMultiplier: 15 },
  { id: "levothyroxine-1moto1yr", name: "Levothyroxine sodium 1 month - 1yr", category: "Tablets/Capsules", concentration: "25mg, 50mg, 75mg, 100mg tabs", dose: "5mcg/kg/day. Max 50mcg/day", frequency: "OD", unit: "mcg/day", multiplier: 5 },
  // Loratadine
  { id: "loratadine", name: "Loratadine (2nd gen antihistamine)", category: "Tablets/Capsules", concentration: "5mg/5ml syrup, 10mg tabs", dose: "0.2mg/kg/day, once", frequency: "Once daily", unit: "mg/day", multiplier: 0.2, notes: "2 - 5yrs: 5mg OD; 6yrs+: 10mg OD" },
  // Mebendazole
  { id: "mebendazole-worm", name: "Mebendazole tablets ascaris/hookworm/whipworm", category: "Tablets/Capsules", concentration: "100mg tabs, 100mg/5ml syrup", dose: "100mg, BD for 3 days, then repeat after 2 - 4 wks", frequency: "BD for 3 days. Contraindicated less than 2yrs", fixed: "100 mg BD for 3 days" },
  { id: "mebendazole-pinworm", name: "Mebendazole tablets enterobius (pinworm)", category: "Tablets/Capsules", concentration: "100mg tabs, 100mg/5ml syrup", dose: "100mg single dose, repeat after 2 wks", frequency: "Single dose, repeat after 2 wks. Contraindicated less than 2yrs", fixed: "100 mg single dose" },
  // Mefenamic acid tabs
  { id: "mefenamic-tabs", name: "Mefenamic acid tablets", category: "Tablets/Capsules", concentration: "250mg, 500mg", dose: "5 - 10mg/kg/dose, 6 - 8 hourly. Max 1500mg/day", frequency: "6 - 8 hourly", unit: "mg", minMultiplier: 5, maxMultiplier: 10 },
  // Montelukast
  { id: "montelukast-6moto5yr", name: "Montelukast asthma control 6 months - 5yrs", category: "Tablets/Capsules", concentration: "4mg granules sachet, 4mg chewable, 5mg chewable, 10mg tabs", dose: "4mg, OD", frequency: "OD", fixed: "4 mg OD" },
  { id: "montelukast-6to14yr", name: "Montelukast asthma control 6yrs - 14yrs", category: "Tablets/Capsules", concentration: "5mg chewable, 10mg tabs", dose: "5mg, OD", frequency: "OD", fixed: "5 mg OD" },
  { id: "montelukast-over15", name: "Montelukast asthma control 15yrs or more", category: "Tablets/Capsules", concentration: "10mg tabs", dose: "10mg, OD", frequency: "OD", fixed: "10 mg OD" },
  // Mupirocin
  { id: "mupirocin", name: "Mupirocin impetigo (2 months or more)", category: "Drops", dose: "Apply small amount, TDS, for 5 - 10 days", frequency: "TDS for 5 - 10 days", fixed: "Small amount TDS for 5-10 days" },
  // Neomycin
  { id: "neomycin", name: "Neomycin sulfate tablets hepatic encephalopathy", category: "Tablets/Capsules", concentration: "500mg tabs", dose: "50 - 100mg/kg/day, oral, 6 hourly. Max 4g/day", frequency: "6 hourly", unit: "mg/day", minMultiplier: 50, maxMultiplier: 100 },
  // Nifedipine
  { id: "nifedipine-acute", name: "Nifedipine (IR) acute HTN", category: "Tablets/Capsules", concentration: "10mg, 20mg IR tabs", dose: "0.25 - 5mg/kg/dose, 6 - 8 hourly", frequency: "6 - 8 hourly", unit: "mg", minMultiplier: 0.25, maxMultiplier: 5 },
  { id: "nifedipine-chronic", name: "Nifedipine (SR) chronic HTN", category: "Tablets/Capsules", concentration: "30mg, 60mg SR tabs", dose: "0.5 - 3mg/kg/day, OD or BD", frequency: "OD or BD", unit: "mg/day", minMultiplier: 0.5, maxMultiplier: 3 },
  // Nitrofurantoin
  { id: "nitrofurantoin-proph", name: "Nitrofurantoin prophylaxis VUR", category: "Tablets/Capsules", concentration: "50mg, 100mg tabs, 25mg/5ml syrup", dose: "1 - 2mg/kg, OD at night", frequency: "OD at night", unit: "mg", minMultiplier: 1, maxMultiplier: 2 },
  { id: "nitrofurantoin-uti", name: "Nitrofurantoin treatment UTI", category: "Tablets/Capsules", concentration: "50mg, 100mg tabs, 25mg/5ml syrup", dose: "5 - 7mg/kg/day, 6 - 12 hourly. Max 400mg/day", frequency: "6 - 12 hourly", unit: "mg/day", minMultiplier: 5, maxMultiplier: 7 },
  // Omeprazole tabs
  { id: "omeprazole-tabs", name: "Omeprazole tablets", category: "Tablets/Capsules", concentration: "10mg, 20mg, 40mg, 2mg/ml syrup, 40mg injection", dose: "0.5 - 1mg/kg/day, OD or BD", frequency: "OD or BD", unit: "mg/day", minMultiplier: 0.5, maxMultiplier: 1, notes: "Less than 10kg: 5-10mg OD; 10-20kg: 10mg OD; More than 20kg: 20mg OD. Max 40mg/day" },
  // Ondansetron tabs
  { id: "ondansetron-tabs", name: "Ondansetron tablets/injection", category: "Tablets/Capsules", concentration: "4mg, 8mg tabs, 2mg/ml injection", dose: "0.1 - 0.15mg/kg/dose, 8 - 12 hourly. Max 4mg young children, 8mg older", frequency: "8 - 12 hourly. Contraindicated less than 6 months", unit: "mg", minMultiplier: 0.1, maxMultiplier: 0.15 },
  // Paracetamol tabs
  { id: "paracetamol-tabs", name: "Paracetamol (Panadol) tablets", category: "Tablets/Capsules", concentration: "250mg, 500mg, 1g, suppositories 60mg, 125mg, 250mg, 500mg", dose: "10 - 15mg/kg/dose, 4 - 6 hourly. Max 60mg/kg/day", frequency: "4 - 6 hourly", unit: "mg", minMultiplier: 10, maxMultiplier: 15 },
  // Pethidine tabs
  { id: "pethidine-tabs", name: "Pethidine hydrochloride oral", category: "Tablets/Capsules", concentration: "50mg/ml, 100mg/ml injection", dose: "0.5 - 1mg/kg/dose, 4 - 6 hourly if needed. Max 100mg/dose", frequency: "4 - 6 hourly if needed", unit: "mg", minMultiplier: 0.5, maxMultiplier: 1 },
  // Phenobarbital tabs
  { id: "phenobarb-load-tabs", name: "Phenobarbital loading dose", category: "Tablets/Capsules", concentration: "15mg, 30mg, 60mg, 100mg tabs", dose: "15 - 20mg/kg", frequency: "Loading dose", unit: "mg", minMultiplier: 15, maxMultiplier: 20 },
  { id: "phenobarb-maint-tabs", name: "Phenobarbital maintenance", category: "Tablets/Capsules", concentration: "15mg, 30mg, 60mg, 100mg tabs", dose: "2.5 - 5mg/kg/day (most of the time we use 5mg/kg/day), OD at night or BD", frequency: "OD at night or BD", unit: "mg/day", minMultiplier: 2.5, maxMultiplier: 5 },
  // Phenytoin
  { id: "phenytoin-load-tabs", name: "Phenytoin loading dose", category: "Tablets/Capsules", concentration: "50mg/ml injection", dose: "15 - 20mg/kg. Max 1500mg/day", frequency: "Now, slow IV", unit: "mg", minMultiplier: 15, maxMultiplier: 20 },
  { id: "phenytoin-maint-tabs", name: "Phenytoin maintenance", category: "Tablets/Capsules", concentration: "50mg/ml injection", dose: "4 - 8mg/kg/day (most of the time we use 5mg/kg/day), BD", frequency: "BD", unit: "mg/day", minMultiplier: 4, maxMultiplier: 8 },
  // Potassium chloride
  { id: "kcl-oral", name: "Potassium chloride oral maintenance", category: "Tablets/Capsules", concentration: "KCl ampule 20mmol/10ml", dose: "0.5 - 1.5ml/kg/day (1 - 2 mmol/kg)", frequency: "Daily maintenance", unit: "ml/day", minMultiplier: 0.5, maxMultiplier: 1.5 },
  { id: "kcl-iv", name: "Potassium chloride IV maintenance", category: "Injections/Infusions", concentration: "KCl ampule 20mmol/10ml", dose: "1ml/kg/day", frequency: "Daily IV maintenance", unit: "ml/day", multiplier: 1 },
  // Praziquantel
  { id: "praziquantel-schisto", name: "Praziquantel tablets schistosomiasis", category: "Tablets/Capsules", concentration: "150mg, 600mg", dose: "40 - 60mg/kg/day, 4 - 6 hourly for 1 day or single dose", frequency: "4 - 6 hourly for 1 day, or single dose", unit: "mg/day", minMultiplier: 40, maxMultiplier: 60 },
  { id: "praziquantel-taenia", name: "Praziquantel tablets taeniasis", category: "Tablets/Capsules", concentration: "150mg, 600mg", dose: "5 - 19mg/kg single dose", frequency: "Single dose", unit: "mg", minMultiplier: 5, maxMultiplier: 19 },
  // Prednisolone
  { id: "prednisolone-asthma", name: "Prednisolone tablets mild/moderate asthma", category: "Tablets/Capsules", concentration: "5mg, 10mg, 20mg tabs, 5mg/5ml, 15mg/5ml syrup", dose: "1 - 2mg/kg/day, OD or BD. Max 20mg less than 3yrs, 40mg less than 12yrs", frequency: "OD or BD for 5 - 7 days (GINA guideline)", unit: "mg/day", minMultiplier: 1, maxMultiplier: 2 },
  // Primaquine
  { id: "primaquine", name: "Primaquine tablets", category: "Tablets/Capsules", concentration: "7.5mg, 15mg", dose: "0.5mg/kg/day, OD, for 14 days. Max 30mg/day", frequency: "OD for 14 days. Contraindicated less than 6 months", unit: "mg/day", multiplier: 0.5 },
  // Propranolol
  { id: "propranolol-tof", name: "Propranolol tablets TOF", category: "Tablets/Capsules", concentration: "10mg, 40mg, 80mg tabs, 5mg/5ml syrup", dose: "0.2 - 0.4mg/kg/dose, BD or TDS (increase gradually to 1 - 1.5mg/kg/dose)", frequency: "BD or TDS", unit: "mg", minMultiplier: 0.2, maxMultiplier: 0.4 },
  { id: "propranolol-thyrotoxicosis", name: "Propranolol tablets thyrotoxicosis", category: "Tablets/Capsules", concentration: "10mg, 40mg, 80mg tabs", dose: "0.5 - 2mg/kg/day, 8 hourly. Max 40mg/dose", frequency: "8 hourly", unit: "mg/day", minMultiplier: 0.5, maxMultiplier: 2 },
  { id: "propranolol-hemangioma-start", name: "Propranolol tablets infantile hemangioma starting", category: "Tablets/Capsules", concentration: "10mg, 40mg tabs, 5mg/5ml syrup", dose: "1mg/kg/day, TDS", frequency: "TDS", unit: "mg/day", multiplier: 1 },
  { id: "propranolol-hemangioma-maint", name: "Propranolol tablets infantile hemangioma maintenance (24hrs later)", category: "Tablets/Capsules", concentration: "10mg, 40mg tabs, 5mg/5ml syrup", dose: "2mg/kg/day, BD or TDS", frequency: "BD or TDS", unit: "mg/day", multiplier: 2 },
  // Pyridoxine
  { id: "pyridoxine-load", name: "Pyridoxine pyridoxin-dependent seizures loading", category: "Injections/Infusions", dose: "50 - 100mg/dose, IM or rapid IV", frequency: "Loading dose", unit: "mg", minMultiplier: 50, maxMultiplier: 100 },
  { id: "pyridoxine-maint", name: "Pyridoxine pyridoxin-dependent seizures maintenance", category: "Tablets/Capsules", dose: "50 - 100mg/day, orally", frequency: "OD", unit: "mg/day", minMultiplier: 50, maxMultiplier: 100 },
  // Quinine tabs
  { id: "quinine-tabs-load", name: "Quinine tablets loading dose", category: "Tablets/Capsules", concentration: "300mg tabs, 600mg/2ml injection", dose: "20mg/kg over 4 hours, diluted in D5%", frequency: "Loading, over 4 hours", unit: "mg", multiplier: 20 },
  { id: "quinine-tabs-maint", name: "Quinine tablets maintenance", category: "Tablets/Capsules", concentration: "300mg tabs, 600mg/2ml injection", dose: "10mg/kg, 8 hourly", frequency: "8 hourly (reduce to 7mg/kg after 6 doses)", unit: "mg", multiplier: 10 },
  // Sildenafil
  { id: "sildenafil", name: "Sildenafil tablets pulmonary HTN", category: "Tablets/Capsules", concentration: "25mg, 50mg, 100mg", dose: "0.25 - 2mg/kg/dose, 6 - 8 hourly. Max 60mg/day", frequency: "6 - 8 hourly", unit: "mg", minMultiplier: 0.25, maxMultiplier: 2 },
  // Sodium valproate tabs
  { id: "sodium-valproate-tabs-start", name: "Sodium valproate tablets epilepsy initial", category: "Tablets/Capsules", concentration: "200mg, 300mg, 500mg", dose: "10 - 15mg/kg/day. Max 60mg/kg/day", frequency: "Initially", unit: "mg/day", minMultiplier: 10, maxMultiplier: 15 },
  { id: "sodium-valproate-tabs-maint", name: "Sodium valproate tablets maintenance", category: "Tablets/Capsules", concentration: "200mg, 300mg, 500mg", dose: "20 - 60mg/kg/day, BD", frequency: "BD", unit: "mg/day", minMultiplier: 20, maxMultiplier: 60 },
  // Spironolactone (Aldactone)
  { id: "spironolactone", name: "Spironolactone (Aldactone) tablets", category: "Tablets/Capsules", concentration: "25mg, 50mg, 100mg", dose: "1 - 3mg/kg/day, OD or BD. Max 100mg/day", frequency: "OD or BD", unit: "mg/day", minMultiplier: 1, maxMultiplier: 3 },
  // Thiamine
  { id: "thiamine", name: "Thiamine tablets deficiency", category: "Tablets/Capsules", concentration: "25mg, 50mg, 100mg", dose: "10 - 50mg/day", frequency: "OD", fixed: "10 - 50 mg/day" },
  // Tinidazole
  { id: "tinidazole-giardiasis", name: "Tinidazole tablets giardiasis", category: "Tablets/Capsules", concentration: "300mg, 500mg", dose: "50mg/kg, once. Contraindicated less than 3yrs", frequency: "Single dose", unit: "mg", multiplier: 50 },
  { id: "tinidazole-amoebiasis", name: "Tinidazole tablets amoebiasis", category: "Tablets/Capsules", concentration: "300mg, 500mg", dose: "50mg/kg/day, OD for 3 - 5 days. Contraindicated less than 3yrs", frequency: "OD for 3 - 5 days", unit: "mg/day", multiplier: 50 },
  // Tobramycin eye drops
  { id: "tobramycin-eye", name: "Tobramycin ophthalmic drops", category: "Drops", dose: "1 - 2 drops, BD for 6 - 8 days", frequency: "BD (severe: 2 drops 6 hourly, then taper)", fixed: "1 - 2 drops BD" },
  // Tranexamic acid
  { id: "tranexamic-acid", name: "Tranexamic acid tablets", category: "Tablets/Capsules", concentration: "500mg, 650mg", dose: "10 - 15mg/kg/dose, 6 - 8 hourly. Max 1g/dose", frequency: "6 - 8 hourly", unit: "mg", minMultiplier: 10, maxMultiplier: 15 },
  // Ursodeoxycholic acid
  { id: "ursodiol", name: "Ursodeoxycholic acid tablets", category: "Tablets/Capsules", concentration: "150mg, 300mg, 500mg", dose: "10 - 15mg/kg/day, OD or BD or TDS. Max 20mg/kg/day", frequency: "OD or BD or TDS", unit: "mg/day", minMultiplier: 10, maxMultiplier: 15 },
  // Vitamin A
  { id: "vit-a-under6mo", name: "Vitamin A prophylaxis less than 6 months", category: "Tablets/Capsules", dose: "50,000 IU, OD", frequency: "OD", fixed: "50,000 IU OD" },
  { id: "vit-a-6to11mo", name: "Vitamin A prophylaxis 6 months - 11 months", category: "Tablets/Capsules", dose: "100,000 IU, OD", frequency: "OD", fixed: "100,000 IU OD" },
  { id: "vit-a-over12mo", name: "Vitamin A prophylaxis 12 months and above / measles (therapeutic)", category: "Tablets/Capsules", dose: "200,000 IU, OD (therapeutic: same doses at day1, day2, and day14)", frequency: "OD (therapeutic: day 1, day 2, day 14)", fixed: "200,000 IU OD" },
  // Vitamin D3
  { id: "vit-d3-proph-1yr", name: "Vitamin D3 prophylaxis 1st year of life", category: "Tablets/Capsules", concentration: "1000 IU, 2000 IU, 5000 IU, 50000 IU, 60000 IU caps", dose: "400 IU, OD", frequency: "OD", fixed: "400 IU OD" },
  { id: "vit-d3-proph-over1", name: "Vitamin D3 prophylaxis 2nd year of life and more", category: "Tablets/Capsules", concentration: "1000 IU, 2000 IU, 5000 IU, 50000 IU, 60000 IU caps", dose: "600 IU, OD", frequency: "OD", fixed: "600 IU OD" },
  { id: "vit-d3-therapeutic", name: "Vitamin D3 therapeutic", category: "Tablets/Capsules", concentration: "1000 IU, 2000 IU, 5000 IU, 50000 IU, 60000 IU caps", dose: "1,000 - 10,000 IU/day or 50,000 IU weekly for 6 - 8 wks", frequency: "Daily or weekly", fixed: "1,000 - 10,000 IU/day or 50,000 IU weekly for 6-8 wks" },
  // Vitamin E
  { id: "vit-e", name: "Vitamin E capsules", category: "Tablets/Capsules", concentration: "100 IU, 200 IU, 400 IU caps", dose: "5 - 10mg/kg/day", frequency: "OD", unit: "mg/day", minMultiplier: 5, maxMultiplier: 10 },
  // Zinc sulfate
  { id: "zinc-under6mo", name: "Zinc sulfate less than 6 months", category: "Tablets/Capsules", concentration: "12mg/5ml, 20mg/5ml syrup, 20mg tabs", dose: "10mg, OD. For 10 - 14 days", frequency: "OD for 10 - 14 days", fixed: "10 mg OD" },
  { id: "zinc-over6mo", name: "Zinc sulfate 6 months or more", category: "Tablets/Capsules", concentration: "12mg/5ml, 20mg/5ml syrup, 20mg tabs", dose: "20mg/day, OD. For 10 - 14 days", frequency: "OD for 10 - 14 days", fixed: "20 mg OD for 10 - 14 days" },

  // ── NEONATOLOGY (all doses from NeoFax 2026) ────────────────────────────────
  // Acetaminophen (Panadol) IV
  { id: "neo-paracetamol-iv-under32", name: "NEONATAL Acetaminophen IV less than 32wks", category: "Neonatology", concentration: "IV infusion", dose: "10mg/kg/dose. Max 40mg/day, every 6 hours", frequency: "6 hourly", unit: "mg", multiplier: 10 },
  { id: "neo-paracetamol-iv-32to37", name: "NEONATAL Acetaminophen IV 32wks - 37wks", category: "Neonatology", concentration: "IV infusion", dose: "12.5mg/kg/dose. Max 50mg/day, every 6 hours", frequency: "6 hourly", unit: "mg", multiplier: 12.5 },
  { id: "neo-paracetamol-iv-term", name: "NEONATAL Acetaminophen IV term", category: "Neonatology", concentration: "IV infusion", dose: "12.5mg/kg/dose. Max 50mg/day, every 6 hours", frequency: "6 hourly", unit: "mg", multiplier: 12.5 },
  // Acetaminophen oral neonatal
  { id: "neo-paracetamol-oral-load", name: "NEONATAL Acetaminophen oral loading", category: "Neonatology", dose: "20 - 25mg/kg loading dose", frequency: "Loading dose, then maintenance", unit: "mg", minMultiplier: 20, maxMultiplier: 25 },
  { id: "neo-paracetamol-oral-maint-under32", name: "NEONATAL Acetaminophen oral maintenance less than 32wks", category: "Neonatology", dose: "12 - 15mg/kg/dose, BD", frequency: "BD", unit: "mg", minMultiplier: 12, maxMultiplier: 15 },
  { id: "neo-paracetamol-oral-maint-32to37", name: "NEONATAL Acetaminophen oral maintenance 32wks - 37wks", category: "Neonatology", dose: "12 - 15mg/kg/dose, TDS", frequency: "TDS", unit: "mg", minMultiplier: 12, maxMultiplier: 15 },
  { id: "neo-paracetamol-oral-maint-term", name: "NEONATAL Acetaminophen oral maintenance term", category: "Neonatology", dose: "12 - 15mg/kg/dose, 6 hourly", frequency: "6 hourly", unit: "mg", minMultiplier: 12, maxMultiplier: 15 },
  { id: "neo-paracetamol-pda", name: "NEONATAL Acetaminophen active PDA in preterm", category: "Neonatology", dose: "15mg/kg/dose, IV or orally, 6 hourly for 3 days", frequency: "6 hourly for 3 days", unit: "mg", multiplier: 15 },
  // Acyclovir neonatal
  { id: "neo-acyclovir-under34", name: "NEONATAL Acyclovir less than 34wks postmenstrual", category: "Neonatology", dose: "20mg/kg, BD", frequency: "BD", unit: "mg", multiplier: 20 },
  { id: "neo-acyclovir-over34", name: "NEONATAL Acyclovir more than 34wks postmenstrual", category: "Neonatology", dose: "20mg/kg, TDS", frequency: "TDS", unit: "mg", multiplier: 20 },
  // Aminophylline neonatal
  { id: "neo-aminophylline-load", name: "NEONATAL Aminophylline loading dose", category: "Neonatology", dose: "5 - 8mg/kg", frequency: "Loading dose", unit: "mg", minMultiplier: 5, maxMultiplier: 8 },
  { id: "neo-aminophylline-maint", name: "NEONATAL Aminophylline maintenance (start 12hrs after loading)", category: "Neonatology", dose: "1 - 3mg/kg/dose, BD, TDS, or 6 hourly", frequency: "BD, TDS, or 6 hourly (start 12hrs after loading)", unit: "mg", minMultiplier: 1, maxMultiplier: 3 },
  // Ampicillin neonatal
  { id: "neo-ampicillin-34wks-under7d", name: "NEONATAL Ampicillin 34wks or less, 7 days and less", category: "Neonatology", concentration: "250mg, 500mg, 1g", dose: "50mg/kg/dose, BD", frequency: "BD", unit: "mg", multiplier: 50 },
  { id: "neo-ampicillin-34wks-8to28d", name: "NEONATAL Ampicillin 34wks or less, 8 days - 28 days", category: "Neonatology", concentration: "250mg, 500mg, 1g", dose: "75mg/kg/dose, BD", frequency: "BD", unit: "mg", multiplier: 75 },
  { id: "neo-ampicillin-over34wks", name: "NEONATAL Ampicillin more than 34wks, 28 days or less", category: "Neonatology", concentration: "250mg, 500mg, 1g", dose: "50mg/kg/dose, TDS", frequency: "TDS", unit: "mg", multiplier: 50 },
  // Artesunate neonatal
  { id: "neo-artesunate", name: "NEONATAL Artesunate", category: "Neonatology", dose: "2.4mg/kg", frequency: "As directed", unit: "mg", multiplier: 2.4 },
  // Azithromycin neonatal
  { id: "neo-azithromycin-whooping", name: "NEONATAL Azithromycin whooping cough", category: "Neonatology", dose: "10mg/kg/dose, OD for 5 days", frequency: "OD for 5 days", unit: "mg", multiplier: 10 },
  { id: "neo-azithromycin-opthalmia", name: "NEONATAL Azithromycin opthalmia neonatorum", category: "Neonatology", dose: "20mg/kg/dose, OD for 3 days", frequency: "OD for 3 days", unit: "mg", multiplier: 20 },
  // Benzyl penicillin neonatal — regular dose
  { id: "neo-benzylpen-32to34-under7d", name: "NEONATAL Benzyl penicillin regular 32 - 34wks, less than 7 days", category: "Neonatology", concentration: "1 million units, 5 million units", dose: "100,000 u/kg/dose, every 12 hours", frequency: "12 hourly", unit: "u", multiplier: 100000 },
  { id: "neo-benzylpen-32to34-7to28d", name: "NEONATAL Benzyl penicillin regular 32 - 34wks, 7 - 28 days", category: "Neonatology", concentration: "1 million units, 5 million units", dose: "100,000 u/kg/dose, every 8 hours", frequency: "8 hourly", unit: "u", multiplier: 100000 },
  { id: "neo-benzylpen-over34-under7d", name: "NEONATAL Benzyl penicillin regular 34wks & more, less than 7 days", category: "Neonatology", concentration: "1 million units, 5 million units", dose: "100,000 u/kg/dose, every 8 hours", frequency: "8 hourly", unit: "u", multiplier: 100000 },
  { id: "neo-benzylpen-over34-7to28d", name: "NEONATAL Benzyl penicillin regular 34wks & more, 7 - 28 days", category: "Neonatology", concentration: "1 million units, 5 million units", dose: "100,000 u/kg/dose, every 6 hours", frequency: "6 hourly", unit: "u", multiplier: 100000 },
  // Benzyl penicillin neonatal — meningitis dose
  { id: "neo-benzylpen-mening-under7d", name: "NEONATAL Benzyl penicillin meningitis all ages, 7 days & younger", category: "Neonatology", concentration: "1 million units, 5 million units", dose: "150,000 u/kg/dose, every 8 hours", frequency: "8 hourly", unit: "u", multiplier: 150000 },
  { id: "neo-benzylpen-mening-8d-plus", name: "NEONATAL Benzyl penicillin meningitis all ages, 8 days & more", category: "Neonatology", concentration: "1 million units, 5 million units", dose: "125,000 u/kg/dose, every 6 hours", frequency: "6 hourly", unit: "u", multiplier: 125000 },
  // Cefotaxime neonatal
  { id: "neo-cefotaxime-all-under7d", name: "NEONATAL Cefotaxime all weeks, less than 7 days", category: "Neonatology", concentration: "500mg, 1g", dose: "50mg/kg/dose, BD", frequency: "BD", unit: "mg", multiplier: 50 },
  { id: "neo-cefotaxime-under32-over7d", name: "NEONATAL Cefotaxime less than 32wks, 7 days and more", category: "Neonatology", concentration: "500mg, 1g", dose: "50mg/kg/dose, BD", frequency: "BD", unit: "mg", multiplier: 50 },
  { id: "neo-cefotaxime-over32-over7d", name: "NEONATAL Cefotaxime 32wks or more, 7 days and more", category: "Neonatology", concentration: "500mg, 1g", dose: "50mg/kg/dose, 6 hourly", frequency: "6 hourly", unit: "mg", multiplier: 50 },
  // Ciprofloxacin neonatal
  { id: "neo-cipro-32to34-under7d", name: "NEONATAL Ciprofloxacin 32wks - 34wks, less than 7 days", category: "Neonatology", concentration: "2mg/ml infusion", dose: "7.5mg/kg/dose, BD", frequency: "BD", unit: "mg", multiplier: 7.5 },
  { id: "neo-cipro-32to34-8to14d", name: "NEONATAL Ciprofloxacin 32wks - 34wks, 8 - 14 days", category: "Neonatology", concentration: "2mg/ml infusion", dose: "12.5mg/kg/dose, BD", frequency: "BD", unit: "mg", multiplier: 12.5 },
  { id: "neo-cipro-over34", name: "NEONATAL Ciprofloxacin 34wks and more, all ages", category: "Neonatology", concentration: "2mg/ml infusion", dose: "12.5mg/kg/dose, BD", frequency: "BD", unit: "mg", multiplier: 12.5 },
  // Erythromycin neonatal
  { id: "neo-erythromycin-whooping", name: "NEONATAL Erythromycin whooping cough", category: "Neonatology", dose: "10 - 12.5mg/kg/dose, 6 hourly", frequency: "6 hourly", unit: "mg", minMultiplier: 10, maxMultiplier: 12.5 },
  { id: "neo-erythromycin-chlamydia", name: "NEONATAL Erythromycin chlamydia conjunctivitis", category: "Neonatology", dose: "50mg/kg/day, 6 hourly for 14 days", frequency: "6 hourly for 14 days", unit: "mg/day", multiplier: 50 },
  // Ferrous sulfate neonatal
  { id: "neo-ferrous-proph-preterm", name: "NEONATAL Ferrous sulfate prophylaxis less than 37wks", category: "Neonatology", dose: "2 - 3mg/kg/day", frequency: "OD or divided", unit: "mg/day", minMultiplier: 2, maxMultiplier: 3 },
  { id: "neo-ferrous-proph-term", name: "NEONATAL Ferrous sulfate prophylaxis 37wks and more", category: "Neonatology", dose: "1mg/kg/day", frequency: "OD", unit: "mg/day", multiplier: 1 },
  { id: "neo-ferrous-therapeutic", name: "NEONATAL Ferrous sulfate therapeutic", category: "Neonatology", dose: "3 - 6mg/kg/day", frequency: "OD or divided", unit: "mg/day", minMultiplier: 3, maxMultiplier: 6 },
  // Folic acid neonatal
  { id: "neo-folic-preterm", name: "NEONATAL Folic acid preterm", category: "Neonatology", dose: "25 - 50mcg/kg/day. Max 65mcg/day", frequency: "OD", unit: "mcg/day", minMultiplier: 25, maxMultiplier: 50 },
  { id: "neo-folic-term", name: "NEONATAL Folic acid term", category: "Neonatology", dose: "65mcg/day", frequency: "OD", fixed: "65 mcg/day" },
  // Gentamicin neonatal
  { id: "neo-gent-under29-0to7d", name: "NEONATAL Gentamicin 29wks or less, 0 - 7 days", category: "Neonatology", concentration: "10mg/ml, 40mg/ml", dose: "5mg/kg/dose, every 48 hours", frequency: "Every 48 hours", unit: "mg", multiplier: 5 },
  { id: "neo-gent-under29-8to28d", name: "NEONATAL Gentamicin 29wks or less, 8 - 28 days", category: "Neonatology", concentration: "10mg/ml, 40mg/ml", dose: "4mg/kg/dose, every 36 hours", frequency: "Every 36 hours", unit: "mg", multiplier: 4 },
  { id: "neo-gent-under29-over28d", name: "NEONATAL Gentamicin 29wks or less, more than 28 days", category: "Neonatology", concentration: "10mg/ml, 40mg/ml", dose: "4mg/kg/dose, every 24 hours", frequency: "Every 24 hours", unit: "mg", multiplier: 4 },
  { id: "neo-gent-30to34-0to7d", name: "NEONATAL Gentamicin 30 - 34wks, 0 - 7 days", category: "Neonatology", concentration: "10mg/ml, 40mg/ml", dose: "4.5mg/kg/dose, every 36 hours", frequency: "Every 36 hours", unit: "mg", multiplier: 4.5 },
  { id: "neo-gent-30to34-8plus", name: "NEONATAL Gentamicin 30 - 34wks, 8 days and more", category: "Neonatology", concentration: "10mg/ml, 40mg/ml", dose: "4mg/kg/dose, every 24 hours", frequency: "Every 24 hours", unit: "mg", multiplier: 4 },
  { id: "neo-gent-over35", name: "NEONATAL Gentamicin 35wks or more, all ages", category: "Neonatology", concentration: "10mg/ml, 40mg/ml", dose: "4mg/kg/dose, every 24 hours", frequency: "Every 24 hours", unit: "mg", multiplier: 4 },
  // Meropenem neonatal
  { id: "neo-meropenem-under32-under14d", name: "NEONATAL Meropenem less than 32wks, less than 14 days (usual)", category: "Neonatology", concentration: "500mg, 1g", dose: "20mg/kg/dose, BD", frequency: "BD", unit: "mg", multiplier: 20 },
  { id: "neo-meropenem-under32-under14d-mening", name: "NEONATAL Meropenem less than 32wks, less than 14 days (meningitis)", category: "Neonatology", concentration: "500mg, 1g", dose: "40mg/kg/dose, BD", frequency: "BD", unit: "mg", multiplier: 40 },
  { id: "neo-meropenem-under32-over14d", name: "NEONATAL Meropenem less than 32wks, 14 days or more (usual)", category: "Neonatology", concentration: "500mg, 1g", dose: "20mg/kg/dose, TDS", frequency: "TDS", unit: "mg", multiplier: 20 },
  { id: "neo-meropenem-under32-over14d-mening", name: "NEONATAL Meropenem less than 32wks, 14 days or more (meningitis)", category: "Neonatology", concentration: "500mg, 1g", dose: "40mg/kg/dose, TDS", frequency: "TDS", unit: "mg", multiplier: 40 },
  { id: "neo-meropenem-over32-under14d", name: "NEONATAL Meropenem 32wks and more, less than 14 days (usual)", category: "Neonatology", concentration: "500mg, 1g", dose: "20mg/kg/dose, TDS", frequency: "TDS", unit: "mg", multiplier: 20 },
  { id: "neo-meropenem-over32-over14d", name: "NEONATAL Meropenem 32wks and more, 14 days and more (usual)", category: "Neonatology", concentration: "500mg, 1g", dose: "30mg/kg/dose, TDS", frequency: "TDS", unit: "mg", multiplier: 30 },
  { id: "neo-meropenem-mening-all", name: "NEONATAL Meropenem meningitis dose all ages", category: "Neonatology", concentration: "500mg, 1g", dose: "40mg/kg/dose, TDS", frequency: "TDS", unit: "mg", multiplier: 40 },
  // Metronidazole neonatal
  { id: "neo-metro-load", name: "NEONATAL Metronidazole loading dose (all gestational ages)", category: "Neonatology", concentration: "500mg/100ml", dose: "15mg/kg loading", frequency: "Loading dose", unit: "mg", multiplier: 15 },
  { id: "neo-metro-24to25wks", name: "NEONATAL Metronidazole maintenance 24 - 25wks", category: "Neonatology", concentration: "500mg/100ml", dose: "7.5mg/kg, every 24 hours", frequency: "Every 24 hours", unit: "mg", multiplier: 7.5 },
  { id: "neo-metro-26to27wks", name: "NEONATAL Metronidazole maintenance 26 - 27wks", category: "Neonatology", concentration: "500mg/100ml", dose: "10mg/kg, every 24 hours", frequency: "Every 24 hours", unit: "mg", multiplier: 10 },
  { id: "neo-metro-28to33wks", name: "NEONATAL Metronidazole maintenance 28 - 33wks", category: "Neonatology", concentration: "500mg/100ml", dose: "7.5mg/kg, every 12 hours", frequency: "Every 12 hours", unit: "mg", multiplier: 7.5 },
  { id: "neo-metro-34to40wks", name: "NEONATAL Metronidazole maintenance 34 - 40wks", category: "Neonatology", concentration: "500mg/100ml", dose: "7.5mg/kg, every 8 hours", frequency: "Every 8 hours", unit: "mg", multiplier: 7.5 },
  { id: "neo-metro-over40wks", name: "NEONATAL Metronidazole maintenance more than 40wks", category: "Neonatology", concentration: "500mg/100ml", dose: "7.5mg/kg, every 6 hours", frequency: "Every 6 hours", unit: "mg", multiplier: 7.5 },
  // Omeprazole neonatal
  { id: "neo-omeprazole", name: "NEONATAL Omeprazole", category: "Neonatology", dose: "0.5 - 1.5mg/kg OD", frequency: "OD", unit: "mg", minMultiplier: 0.5, maxMultiplier: 1.5 },
  // Phenobarbital neonatal
  { id: "neo-phenobarb-load", name: "NEONATAL Phenobarbital loading dose", category: "Neonatology", concentration: "15mg, 30mg, 60mg, 100mg tabs", dose: "20mg/kg", frequency: "Loading dose (second loading dose if convulsion did not stop)", unit: "mg", multiplier: 20 },
  { id: "neo-phenobarb-maint", name: "NEONATAL Phenobarbital maintenance", category: "Neonatology", concentration: "15mg, 30mg, 60mg, 100mg tabs", dose: "3 - 5mg/kg/day, OD or BD", frequency: "OD or BD", unit: "mg/day", minMultiplier: 3, maxMultiplier: 5 },
  // Phenytoin neonatal
  { id: "neo-phenytoin-load", name: "NEONATAL Phenytoin loading dose", category: "Neonatology", concentration: "50mg/ml", dose: "15 - 20mg/kg", frequency: "Loading dose", unit: "mg", minMultiplier: 15, maxMultiplier: 20 },
  { id: "neo-phenytoin-maint", name: "NEONATAL Phenytoin maintenance", category: "Neonatology", concentration: "50mg/ml", dose: "4 - 8mg/kg/day, OD or BD", frequency: "OD or BD", unit: "mg/day", minMultiplier: 4, maxMultiplier: 8 },
  // Prednisolone neonatal (weaning from oxygen)
  { id: "neo-prednisolone-wean1", name: "NEONATAL Prednisolone weaning from oxygen phase 1", category: "Neonatology", concentration: "5mg/5ml, 15mg/5ml syrup", dose: "2mg/kg/day, BD for 5 days", frequency: "BD for 5 days", unit: "mg/day", multiplier: 2 },
  { id: "neo-prednisolone-wean2", name: "NEONATAL Prednisolone weaning from oxygen phase 2", category: "Neonatology", concentration: "5mg/5ml, 15mg/5ml syrup", dose: "1mg/kg/day, OD for 3 days", frequency: "OD for 3 days", unit: "mg/day", multiplier: 1 },
  { id: "neo-prednisolone-wean3", name: "NEONATAL Prednisolone weaning from oxygen phase 3", category: "Neonatology", concentration: "5mg/5ml, 15mg/5ml syrup", dose: "1mg/kg/day, every other day for 3 doses", frequency: "Every other day for 3 doses", unit: "mg/day", multiplier: 1 },
  // Ranitidine neonatal
  { id: "neo-ranitidine-oral", name: "NEONATAL Ranitidine oral", category: "Neonatology", concentration: "75mg/5ml", dose: "2mg/kg/dose, TDS", frequency: "TDS", unit: "mg", multiplier: 2 },
  { id: "neo-ranitidine-iv-term", name: "NEONATAL Ranitidine IV term", category: "Neonatology", concentration: "25mg/ml", dose: "1.5mg/kg/dose, TDS", frequency: "TDS", unit: "mg", multiplier: 1.5 },
  { id: "neo-ranitidine-iv-preterm", name: "NEONATAL Ranitidine IV preterm", category: "Neonatology", concentration: "25mg/ml", dose: "0.5mg/kg/dose, BD", frequency: "BD", unit: "mg", multiplier: 0.5 },
  // Vancomycin neonatal
  { id: "neo-vancomycin-under29-0to14d", name: "NEONATAL Vancomycin 29wks & less, 0 - 14 days", category: "Neonatology", concentration: "500mg, 1g", dose: "10 - 15mg/kg/dose, every 18 hours", frequency: "Every 18 hours", unit: "mg", minMultiplier: 10, maxMultiplier: 15 },
  { id: "neo-vancomycin-under29-over14d", name: "NEONATAL Vancomycin 29wks & less, older than 14 days", category: "Neonatology", concentration: "500mg, 1g", dose: "10 - 15mg/kg/dose, every 12 hours", frequency: "Every 12 hours", unit: "mg", minMultiplier: 10, maxMultiplier: 15 },
  { id: "neo-vancomycin-30to36-0to14d", name: "NEONATAL Vancomycin 30 - 36wks, 0 - 14 days", category: "Neonatology", concentration: "500mg, 1g", dose: "10 - 15mg/kg/dose, every 12 hours", frequency: "Every 12 hours", unit: "mg", minMultiplier: 10, maxMultiplier: 15 },
  { id: "neo-vancomycin-30to36-over14d", name: "NEONATAL Vancomycin 30 - 36wks, older than 14 days", category: "Neonatology", concentration: "500mg, 1g", dose: "10 - 15mg/kg/dose, every 8 hours", frequency: "Every 8 hours", unit: "mg", minMultiplier: 10, maxMultiplier: 15 },
  { id: "neo-vancomycin-37to44-0to7d", name: "NEONATAL Vancomycin 37 - 44wks, 0 - 7 days", category: "Neonatology", concentration: "500mg, 1g", dose: "10 - 15mg/kg/dose, every 12 hours", frequency: "Every 12 hours", unit: "mg", minMultiplier: 10, maxMultiplier: 15 },
  { id: "neo-vancomycin-37to44-over7d", name: "NEONATAL Vancomycin 37 - 44wks, older than 7 days", category: "Neonatology", concentration: "500mg, 1g", dose: "10 - 15mg/kg/dose, every 8 hours", frequency: "Every 8 hours", unit: "mg", minMultiplier: 10, maxMultiplier: 15 },
  { id: "neo-vancomycin-over45", name: "NEONATAL Vancomycin 45wks & more, all ages", category: "Neonatology", concentration: "500mg, 1g", dose: "10 - 15mg/kg/dose, every 6 hours", frequency: "Every 6 hours", unit: "mg", minMultiplier: 10, maxMultiplier: 15 },
  // Vitamin K neonatal
  { id: "neo-vitk-under1500", name: "NEONATAL Vitamin K less than 1500g", category: "Neonatology", dose: "0.3 - 0.5mg/kg, within 6 hours", frequency: "Once, within 6 hours of birth", unit: "mg", minMultiplier: 0.3, maxMultiplier: 0.5 },
  { id: "neo-vitk-over1500", name: "NEONATAL Vitamin K more than 1500g", category: "Neonatology", dose: "1mg/day", frequency: "Once", fixed: "1 mg" },
];

const categories = ["All", "Injections/Infusions", "Syrups/Suspensions", "Drops", "Tablets/Capsules", "Neonatology"] as const;

function formatDose(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function calculateDose(entry: DoseEntry, weight: number): string {
  if (entry.fixed) return entry.fixed;
  if (!weight || weight <= 0 || !entry.unit) return "";
  if (entry.minMultiplier !== undefined && entry.maxMultiplier !== undefined) {
    return `${formatDose(weight * entry.minMultiplier)} - ${formatDose(weight * entry.maxMultiplier)} ${entry.unit}`;
  }
  if (entry.multiplier !== undefined) {
    const base = weight * entry.multiplier;
    const adjusted = entry.id === "mefenamic-syrup" ? base + 1 : base;
    return `${formatDose(adjusted)} ${entry.unit}`;
  }
  return "";
}

export default function CalculatorScreen() {
  const { settings, isDark } = useApp();
  const C = isDark ? Colors.dark : Colors.light;
  const lang = settings.language;
  const isRTL = lang === "ar";
  const insets = useSafeAreaInsets();
  const fontBold = isRTL ? "Tajawal_700Bold" : "Inter_700Bold";
  const fontMed = isRTL ? "Tajawal_500Medium" : "Inter_500Medium";
  const fontReg = isRTL ? "Tajawal_400Regular" : "Inter_400Regular";
  const webTopPadding = Platform.OS === "web" ? 67 : 0;
  const [weightText, setWeightText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [selectedId, setSelectedId] = useState(DOSE_ENTRIES[0].id);
  const weight = Number.parseFloat(weightText.replace(",", "."));
  const selected = DOSE_ENTRIES.find((entry) => entry.id === selectedId) ?? DOSE_ENTRIES[0];

  const filteredEntries = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return DOSE_ENTRIES.filter((entry) => {
      const matchesCategory = category === "All" || entry.category === category;
      const matchesSearch = !query || entry.name.toLowerCase().includes(query) || entry.dose.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [category, searchText]);

  const result = calculateDose(selected, weight);

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View
        style={[
          styles.pageHeader,
          {
            backgroundColor: C.surface,
            paddingTop: insets.top + 16 + webTopPadding,
            borderBottomColor: C.border,
          },
        ]}
      >
        <Text style={[styles.pageTitle, { color: C.text, fontFamily: fontBold }]}>
          {t("doseCalculatorTitle", lang)}
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 150 },
          isRTL && { direction: "rtl" },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: C.surface, borderColor: C.border }, isRTL && styles.rowReverse]}>
          <View style={[styles.headerIcon, { backgroundColor: C.primaryLight }]}>
            <MaterialCommunityIcons name="calculator-variant-outline" size={28} color={C.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.subtitle, { color: C.textSecondary, fontFamily: fontReg, textAlign: isRTL ? "right" : "left" }]}>
              {t("medicalWarning", lang)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.textMuted, fontFamily: fontMed, textAlign: isRTL ? "right" : "left" }]}>
            {t("weightKg", lang)}
          </Text>
          <TextInput
            value={weightText}
            onChangeText={setWeightText}
            placeholder={t("weightPlaceholder", lang)}
            placeholderTextColor={C.textMuted}
            keyboardType="decimal-pad"
            style={[
              styles.input,
              {
                backgroundColor: C.surface,
                borderColor: C.border,
                color: C.text,
                fontFamily: fontReg,
                textAlign: isRTL ? "right" : "left",
              },
            ]}
          />
        </View>

        <View style={[styles.resultCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.resultLabel, { color: C.textMuted, fontFamily: fontMed, textAlign: isRTL ? "right" : "left" }]}>
            {t("calculatedDose", lang)}
          </Text>
          <Text style={[styles.resultValue, { color: result ? C.primary : C.textMuted, fontFamily: fontBold, textAlign: isRTL ? "right" : "left" }]}>
            {result || t("noCalculation", lang)}
          </Text>
          <View style={styles.detailGrid}>
            <Detail label={t("sourceDose", lang)} value={selected.dose} C={C} fontMed={fontMed} fontReg={fontReg} isRTL={isRTL} />
            <Detail label={t("frequency", lang)} value={selected.frequency} C={C} fontMed={fontMed} fontReg={fontReg} isRTL={isRTL} />
            {!!selected.concentration && (
              <Detail label={t("concentration", lang)} value={selected.concentration} C={C} fontMed={fontMed} fontReg={fontReg} isRTL={isRTL} />
            )}
            {!!selected.notes && (
              <Detail label={t("notes", lang)} value={selected.notes} C={C} fontMed={fontMed} fontReg={fontReg} isRTL={isRTL} />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.textMuted, fontFamily: fontMed, textAlign: isRTL ? "right" : "left" }]}>
            {t("selectMedicine", lang)}
          </Text>
          <View style={[styles.searchBox, { backgroundColor: C.surface, borderColor: C.border }, isRTL && styles.rowReverse]}>
            <Feather name="search" size={18} color={C.textMuted} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder={t("searchDrug", lang)}
              placeholderTextColor={C.textMuted}
              style={[styles.searchInput, { color: C.text, fontFamily: fontReg, textAlign: isRTL ? "right" : "left" }]}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
            {categories.map((item) => {
              const active = category === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: active ? C.primary : C.surface, borderColor: active ? C.primary : C.border },
                  ]}
                >
                  <Text style={[styles.categoryText, { color: active ? "#07120f" : C.textSecondary, fontFamily: fontMed }]}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.list}>
          {filteredEntries.map((entry) => {
            const active = entry.id === selected.id;
            return (
              <Pressable
                key={entry.id}
                onPress={() => setSelectedId(entry.id)}
                style={[
                  styles.drugCard,
                  {
                    backgroundColor: active ? C.primaryLight : C.surface,
                    borderColor: active ? C.primary : C.border,
                  },
                ]}
              >
                <View style={[styles.drugHeader, isRTL && styles.rowReverse]}>
                  <Text style={[styles.drugName, { color: C.text, fontFamily: fontBold, textAlign: isRTL ? "right" : "left" }]}>
                    {entry.name}
                  </Text>
                  {active && <Feather name="check-circle" size={20} color={C.primary} />}
                </View>
                <Text style={[styles.drugMeta, { color: C.textSecondary, fontFamily: fontReg, textAlign: isRTL ? "right" : "left" }]}>
                  {entry.dose} · {entry.frequency}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function Detail({
  label,
  value,
  C,
  fontMed,
  fontReg,
  isRTL,
}: {
  label: string;
  value: string;
  C: typeof Colors.light;
  fontMed: string;
  fontReg: string;
  isRTL: boolean;
}) {
  return (
    <View style={[styles.detailItem, { backgroundColor: C.surfaceSecondary }]}>
      <Text style={[styles.detailLabel, { color: C.textMuted, fontFamily: fontMed, textAlign: isRTL ? "right" : "left" }]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, { color: C.text, fontFamily: fontReg, textAlign: isRTL ? "right" : "left" }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  pageHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  pageTitle: { fontSize: 28, letterSpacing: -0.5, textAlign: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
  },
  rowReverse: { flexDirection: "row-reverse" },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1, gap: 4 },
  subtitle: { fontSize: 13, lineHeight: 19 },
  section: { gap: 10 },
  sectionLabel: { fontSize: 13, textTransform: "uppercase", letterSpacing: 0.6 },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  resultLabel: { fontSize: 13, textTransform: "uppercase", letterSpacing: 0.6 },
  resultValue: { fontSize: 30, letterSpacing: -0.8 },
  detailGrid: { gap: 8 },
  detailItem: { borderRadius: 14, padding: 12, gap: 4 },
  detailLabel: { fontSize: 12 },
  detailValue: { fontSize: 14, lineHeight: 20 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
  },
  categories: { gap: 8, paddingVertical: 2 },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryText: { fontSize: 12 },
  list: { gap: 10 },
  drugCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 7,
  },
  drugHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  drugName: { flex: 1, fontSize: 16 },
  drugMeta: { fontSize: 13, lineHeight: 18 },
});