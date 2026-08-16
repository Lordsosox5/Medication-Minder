import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Alert,
  PanResponder,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import Colors from "@/constants/colors";
import { t } from "@/constants/i18n";
import { useApp, type MedicationType, type RouteType } from "@/context/AppContext";
import { SafeAreaView } from "react-native-safe-area-context";
const INTERVALS = [0.5, 1, 2, 4, 6, 8, 12, 24];

const formatIntervalLabel = (value: number, isArabic = false) => {
  if (value === 0.5) return isArabic ? "30 د" : "30 min";
  if (value >= 1 && Number.isInteger(value)) return isArabic ? `${value} س` : `${value} h`;
  return isArabic ? `${value} س` : `${value} h`;
};

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
  const [pickerMode, setPickerMode] = useState<"date" | "time" | null>(null);
  const [sliderWidth, setSliderWidth] = useState(220);
  const dragStartIndexRef = useRef<number | null>(null);
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEditing = !!editId;
  const lang = settings.language;
  const isRTL = lang === "ar";
  const insets = useSafeAreaInsets();
  const fontBold = isRTL ? "Tajawal_700Bold" : "Inter_700Bold";
  const fontMed = isRTL ? "Tajawal_500Medium" : "Inter_500Medium";
  const fontReg = isRTL ? "Tajawal_400Regular" : "Inter_400Regular";
  const C = isDark ? Colors.dark : Colors.light;
  const activeButtonText = "#000";

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
    section: { gap: 12, marginBottom: 12 },
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
    intervalSlider: {
      position: "relative",
      width: "100%",
      minHeight: 90,
      justifyContent: "center",
      paddingBottom: 8,
    },
    intervalTrack: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 34,
      height: 20,
      borderRadius: 999,
      backgroundColor: C.surfaceSecondary,
      borderWidth: 1,
      borderColor: C.border,
    },
    intervalFill: {
      position: "absolute",
      top: 34,
      height: 20,
      borderRadius: 999,
      backgroundColor: C.primary,
    },
    intervalThumb: {
      position: "absolute",
      top: 22,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: C.primary,
      borderWidth: 4,
      borderColor: C.surface,
    },
    intervalLabels: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 90,
      alignItems: "stretch",
    },
    intervalLabel: {
      position: "absolute",
      width: 54,
      alignItems: "center",
      justifyContent: "center",
    },
    intervalLabelText: { fontSize: 13, letterSpacing: 0.1 },
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
        missedCount: 0,
      });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Navigate back to the medications tab after save
    await router.replace("/(tabs)");
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
              // Navigate back to the medications tab after delete
              await router.replace("/(tabs)");
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
  const openDatePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: form.startTime,
        mode: "date",
        is24Hour: true,
        onChange: (_event: DateTimePickerEvent, selectedDate?: Date) => {
          if (selectedDate) update("startTime", selectedDate);
        },
      });
      return;
    }

    setPickerMode("date");
    setShowPicker(true);
  };

  const openTimePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: form.startTime,
        mode: "time",
        is24Hour: true,
        onChange: (_event: DateTimePickerEvent, selectedDate?: Date) => {
          if (selectedDate) update("startTime", selectedDate);
        },
      });
      return;
    }

    setPickerMode("time");
    setShowPicker(true);
  };

  const formatDatePart = (date: Date) =>
    date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTimePart = (date: Date) =>
    date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const currentIntervalIndex = INTERVALS.indexOf(form.intervalHours);
  const trackWidth = Math.max(0, sliderWidth - 40);
  const sliderProgress = currentIntervalIndex / Math.max(1, INTERVALS.length - 1);
  const selectedIntervalPosition = sliderProgress * trackWidth;
  const thumbLeft = selectedIntervalPosition;
  const fillWidth = selectedIntervalPosition + 20;

  const getNormalizedProgress = (locationX?: number) => {
    if (!trackWidth) return 0;

    const touchX = typeof locationX === "number" ? locationX : sliderWidth / 2;
    const thumbCenter = Math.min(Math.max(touchX, 20), sliderWidth - 20);
    const thumbRelative = Math.min(trackWidth, Math.max(0, thumbCenter - 20));
    return thumbRelative / trackWidth;
  };

  const updateIntervalFromLocationX = (locationX?: number) => {
    const nextIndex = Math.round(getNormalizedProgress(locationX) * (INTERVALS.length - 1));
    update("intervalHours", INTERVALS[nextIndex]);
  };

  const intervalSliderResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        dragStartIndexRef.current = currentIntervalIndex;
        updateIntervalFromLocationX(event.nativeEvent.locationX);
      },
      onPanResponderMove: (event) => {
        updateIntervalFromLocationX(event.nativeEvent.locationX);
      },
      onPanResponderRelease: () => {
        dragStartIndexRef.current = null;
      },
      onPanResponderTerminate: () => {
        dragStartIndexRef.current = null;
      },
    })
  ).current;

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
                  color={form.type === tp ? "#000" : C.textSecondary}
                />
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color: form.type === tp ? "#000" : C.textSecondary,
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
                    { color: form.route === r ? "#000" : C.textSecondary, fontFamily: fontMed },
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
          <View
              style={[styles.intervalSlider, { direction: 'ltr' }]}
            {...intervalSliderResponder.panHandlers}
            onLayout={(event) => {
              setSliderWidth(Math.max(220, event.nativeEvent.layout.width));
            }}
          >
            <View style={styles.intervalTrack} />
            <View
              style={[
                styles.intervalFill,
                { width: fillWidth, left: 0 },
              ]}
            />
            <View
              style={[
                styles.intervalThumb,
                { left: thumbLeft },
              ]}
            />

            <View style={styles.intervalLabels} pointerEvents="none">
              {INTERVALS.map((h, index) => {
                const trackSpan = Math.max(0, sliderWidth - 40);
                const x = (index / Math.max(1, INTERVALS.length - 1)) * trackSpan;
                const isUpper = index % 2 === 0;
                return (
                  <Pressable
                    key={h}
                    onPress={() => update("intervalHours", h)}
                    style={[
                      styles.intervalLabel,
                      { left: x + 20 - 27, top: isUpper ? 4 : 62 },
                    ]}
                    pointerEvents="auto"
                  >
                    <Text
                      style={[
                        styles.intervalLabelText,
                        {
                          color: form.intervalHours === h ? C.text : C.textMuted,
                          fontFamily: form.intervalHours === h ? fontBold : fontReg,
                        },
                      ]}
                    >
                      {formatIntervalLabel(h, isRTL)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionLabel label={t("startTime", lang)} />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              style={[inputStyle(), { flex: 1, flexDirection: "row", alignItems: "center" }]}
              onPress={openDatePicker}
            >
              <Feather name="calendar" size={16} color={C.textSecondary} style={{ marginRight: 8 }} />
              <Text style={{ color: C.text, fontFamily: fontReg, flexShrink: 1 }}>
                {formatDatePart(form.startTime)}
              </Text>
            </Pressable>

            <Pressable
              style={[inputStyle(), { flex: 1, flexDirection: "row", alignItems: "center" }]}
              onPress={openTimePicker}
            >
              <Feather name="clock" size={16} color={C.textSecondary} style={{ marginRight: 8 }} />
              <Text style={{ color: C.text, fontFamily: fontReg, flexShrink: 1 }}>
                {formatTimePart(form.startTime)}
              </Text>
            </Pressable>
          </View>

          {showPicker && (
            <DateTimePicker
              value={form.startTime}
              mode={pickerMode === "time" ? "time" : "date"}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowPicker(false);
                setPickerMode(null);
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
            <Feather name="check" size={20} color="#000" />
            <Text style={[styles.saveBtnText, { fontFamily: fontBold }]}> 
              {t("saveMedication", lang)}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}


