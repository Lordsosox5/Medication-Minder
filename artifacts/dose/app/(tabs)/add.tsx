import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import Colors from "@/constants/colors";
import { t } from "@/constants/i18n";
import { useApp, type MedicationType, type RouteType } from "@/context/AppContext";
import { showInterstitial, loadInterstitial } from "@/services/unity-ads";
import { SafeAreaView } from "react-native-safe-area-context";
const INTERVALS = [2, 4, 6, 8, 12, 24];

type FormData = {
  name: string;
  type: MedicationType;
  doseAmount: string;
  route: RouteType;
  intervalHours: number;
  startTime: Date; 
  notes: string;
};

function toLocalDateTimeString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AddScreen() {
  const { medications, settings, isDark, addMedication, updateMedication, deleteMedication } = useApp();
  const [form, setForm] = useState<FormData>({
    name: "",
    type: "pill",
    doseAmount: "",
    route: "oral",
    intervalHours: 8,
    startTime: new Date(),
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showPicker, setShowPicker] = useState(false);
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEditing = !!editId;
  const lang = settings.language;
  const isRTL = lang === "ar";
  const insets = useSafeAreaInsets();
  const fontBold = isRTL ? "Tajawal_700Bold" : "Inter_700Bold";
  const fontMed = isRTL ? "Tajawal_500Medium" : "Inter_500Medium";
  const fontReg = isRTL ? "Tajawal_400Regular" : "Inter_400Regular";
  const C = isDark ? Colors.dark : Colors.light;
  const activeButtonText = isDark ? Colors.dark.activeButtonText : "#fff";

  // Reset form state when editId changes
  useEffect(() => {
    if (editId) {
      const med = medications.find((m) => m.id === editId);
      if (med) {
        setForm({
          name: med.name,
          type: med.type,
          doseAmount: med.doseAmount,
          route: med.route,
          intervalHours: med.intervalHours,
          startTime: new Date(med.startTime),
          notes: med.notes,
        });
      }
    } else {
      setForm({
        name: "",
        type: "pill",
        doseAmount: "",
        route: "oral",
        intervalHours: 8,
        startTime: new Date(),
        notes: "",
      });
      setErrors({});
    }
    // Clean form on unmount
    return () => {
      setForm({
        name: "",
        type: "pill",
        doseAmount: "",
        route: "oral",
        intervalHours: 8,
        startTime: new Date(),
        notes: "",
      });
      setErrors({});
    };
  }, [editId, medications]);
  const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    headerTitle: { fontSize: 28, flex: 1, textAlign: "center" },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteHeaderBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    content: { padding: 16, gap: 8 },
    section: { gap: 8, marginBottom: 8 },
    sectionLabel: { fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 },
    input: {
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 13,
      fontSize: 15,
    },
    textArea: { minHeight: 80, textAlignVertical: "top" },
    errorText: { fontSize: 12 },
    hintText: { fontSize: 11 },
    segmented: {
      flexDirection: "row",
      borderRadius: 12,
      padding: 4,
      gap: 4,
    },
    segment: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      borderRadius: 10,
    },
    segmentText: { fontSize: 14 },
    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
    },
    chipText: { fontSize: 13 },
    intervalGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    intervalChip: {
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      alignItems: "center",
      minWidth: 90,
      flex: 1,
    },
    intervalChipText: { fontSize: 18 },
    intervalChipSub: { fontSize: 10, marginTop: 2, textAlign: "center" },
    footer: {
      paddingHorizontal: 16,
      paddingTop: 12,

      marginBottom: 15, // Move the save button up by 15 units
    },
    saveBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 16,
      borderRadius: 16,
    },
    saveBtnText: { color: activeButtonText, fontSize: 16 },
    rowReverse: { flexDirection: "row-reverse" },
  });
  // Removed duplicate/erroneous return and misplaced code block

  // (Removed unnecessary navigation and cleanup effects)

  const update = useCallback(<K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }, []);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) newErrors.name = t("requiredField", lang);
    if (!form.doseAmount.trim()) newErrors.doseAmount = t("requiredField", lang);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const startIso = form.startTime.toISOString();

    if (isEditing && editId) {
      await updateMedication(editId, {
        name: form.name.trim(),
        type: form.type,
        doseAmount: form.doseAmount.trim(),
        route: form.route,
        intervalHours: form.intervalHours,
        startTime: startIso,
        notes: form.notes.trim(),
      });
    } else {
      await addMedication({
        name: form.name.trim(),
        type: form.type,
        doseAmount: form.doseAmount.trim(),
        route: form.route,
        intervalHours: form.intervalHours,
        startTime: startIso,
        notes: form.notes.trim(),
      });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await showInterstitial();
    loadInterstitial();
    // Force navigation to the home page tab
    router.replace("/(tabs)");
  };

  const handleDelete = () => {
    if (!editId) return;
    Alert.alert(
      t("deleteConfirmTitle", lang),
      t("deleteConfirmMsg", lang),
      [
        { text: t("cancel", lang), style: "cancel" },
        {
          text: t("delete", lang),
          style: "destructive",
          onPress: async () => {
            await deleteMedication(editId);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/(tabs)");
          },
        },
      ]
    );
  };

  const pillRoutes: RouteType[] = ["oral", "sublingual", "topical", "inhalation", "other"];
  const injectionRoutes: RouteType[] = ["im", "iv", "sc", "other"];
  const routes = form.type === "pill" ? pillRoutes : injectionRoutes;

  useEffect(() => {
    if (form.type === "pill" && !pillRoutes.includes(form.route)) {
      update("route", "oral");
    } else if (form.type === "injection" && !injectionRoutes.includes(form.route)) {
      update("route", "im");
    }
  }, [form.type]);

  const webTopPadding = Platform.OS === "web" ? 67 : 0;
  const webBottomPadding = Platform.OS === "web" ? 34 : 0;
  // Extra fallback padding for devices with gesture nav/cutouts (e.g., Honor/Huawei)
  const fallbackBottomPadding = 32;

  const inputStyle = (hasError?: boolean) => [
    styles.input,
    {
      backgroundColor: C.surfaceSecondary,
      borderColor: hasError ? C.danger : C.border,
      color: C.text,
      fontFamily: fontReg,
      textAlign: isRTL ? "right" as const : "left" as const,
    },
  ];

  const SectionLabel = ({ label }: { label: string }) => (
    <Text style={[styles.sectionLabel, { color: C.textSecondary, fontFamily: fontMed }]}>
      {label}
    </Text>
  );

  // Move openPicker function here, before return
  const openPicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: form.startTime,
        mode: "date",
        is24Hour: true,
        onChange: (event, selectedDate) => {
          if (selectedDate) update("startTime", selectedDate);
        },
      });
    } else {
      setShowPicker(true); // iOS only
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background, direction: isRTL ? 'rtl' : 'ltr' }]}> 
      <View
        style={[
          styles.header,
          {
            backgroundColor: C.surface,
            paddingTop: insets.top + 16 + webTopPadding,
            borderBottomColor: C.border,
          },
        ]}
      >
        <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
          {/* No back button in add mode. In edit mode, show eraser button. */}
          <View style={{ width: 40 }} />
          <Text style={[styles.headerTitle, { color: C.text, fontFamily: fontBold }]}> 
            {isEditing ? t("editMedication", lang) : t("addMedication", lang)}
          </Text>
          {isEditing ? (
            <Pressable
              style={({ pressed }) => [
                styles.deleteHeaderBtn,
                { backgroundColor: C.surfaceSecondary, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => {
                setForm({
                  name: "",
                  type: "pill",
                  doseAmount: "",
                  route: "oral",
                  intervalHours: 8,
                  startTime: new Date(),
                  notes: "",
                });
                setErrors({});
              }}
            >
              <Feather name="x-circle" size={20} color={C.text} />
            </Pressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            // Ensure enough space for the button on all devices
            paddingBottom:
              Math.max(insets.bottom, fallbackBottomPadding) + 100 + webBottomPadding,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        <View style={styles.section}>
          <SectionLabel label={t("medicationName", lang)} />
          <TextInput
            style={inputStyle(!!errors.name)}
            placeholder={t("medicationNamePlaceholder", lang)}
            placeholderTextColor={C.textMuted}
            value={form.name}
            onChangeText={(v) => update("name", v)}
            autoCapitalize="words"
          />
          {errors.name && (
            <Text style={[styles.errorText, { color: C.danger, fontFamily: fontReg }]}>
              {errors.name}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <SectionLabel label={t("medicationType", lang)} />
          <View style={[styles.segmented, { backgroundColor: C.surfaceSecondary }]}> 
            {(["pill", "injection"] as MedicationType[]).map((tp) => (
              <Pressable
                key={tp}
                style={[
                  styles.segment,
                  form.type === tp && { backgroundColor: C.primary },
                ]}
                onPress={() => update("type", tp)}
              >
                <MaterialCommunityIcons
                  name={tp === "pill" ? "pill" : "needle"}
                  size={18}
                  color={form.type === tp ? activeButtonText : C.textSecondary}
                />
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color: form.type === tp ? activeButtonText : C.textSecondary,
                      fontFamily: fontMed,
                    },
                  ]}
                >
                  {t(tp, lang)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionLabel label={t("doseAmount", lang)} />
          <TextInput
            style={inputStyle(!!errors.doseAmount)}
            placeholder={t("doseAmountPlaceholder", lang)}
            placeholderTextColor={C.textMuted}
            value={form.doseAmount}
            onChangeText={(v) => update("doseAmount", v)}
          />
          {errors.doseAmount && (
            <Text style={[styles.errorText, { color: C.danger, fontFamily: fontReg }]}>
              {errors.doseAmount}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <SectionLabel label={t("route", lang)} />
          <View style={styles.chipsRow}>
            {routes.map((r) => (
              <Pressable
                key={r}
                style={[
                  styles.chip,
                  form.route === r
                    ? { backgroundColor: C.primary }
                    : { backgroundColor: C.surfaceSecondary, borderColor: C.border, borderWidth: 1 },
                ]}
                onPress={() => update("route", r)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: form.route === r ? activeButtonText : C.textSecondary, fontFamily: fontMed },
                  ]}
                >
                  {t(r, lang)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionLabel label={t("interval", lang)} />
          <View style={styles.intervalGrid}>
            {INTERVALS.map((h) => (
              <Pressable
                key={h}
                style={[
                  styles.intervalChip,
                  form.intervalHours === h
                    ? { backgroundColor: C.primary }
                    : { backgroundColor: C.surfaceSecondary, borderColor: C.border, borderWidth: 1 },
                ]}
                onPress={() => update("intervalHours", h)}
              >
                <Text
                  style={[
                    styles.intervalChipText,
                    { color: form.intervalHours === h ? activeButtonText : C.text, fontFamily: fontBold },
                  ]}
                >
                  {h}h
                </Text>
                <Text
                  style={[
                    styles.intervalChipSub,
                    { color: form.intervalHours === h ? activeButtonText : C.textMuted, fontFamily: fontReg },
                  ]}
                >
                  {t(`every${h}h` as any, lang) || `every ${h}h`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
        <SectionLabel label={t("startTime", lang)} />

        <Pressable style={inputStyle()} onPress={openPicker}>
          <Text style={{ color: C.text, fontFamily: fontReg }}>
            {toLocalDateTimeString(form.startTime)}   {/* format for display */}
          </Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker
            value={form.startTime}
            mode="datetime"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) {
                update("startTime", selectedDate);
              }
            }}
          />
        )}
        </View>

        <View style={styles.section}>
          <SectionLabel label={t("notes", lang)} />
          <TextInput
            style={[inputStyle(), styles.textArea]}
            placeholder={t("notesPlaceholder", lang)}
            placeholderTextColor={C.textMuted}
            value={form.notes}
            onChangeText={(v) => update("notes", v)}
            multiline
            numberOfLines={3}
          />
        </View>
        {/* Save button now appears after all fields, not fixed in footer */}
        <View style={[styles.footer, { backgroundColor: "transparent", borderTopColor: undefined, paddingBottom: 0 }]}> 
          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: C.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleSave}
          >
            <Feather name="check" size={20} color={activeButtonText} />
            <Text style={[styles.saveBtnText, { fontFamily: fontBold }]}> 
              {t("saveMedication", lang)}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}


