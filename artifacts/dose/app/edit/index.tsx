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
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
const INTERVALS = [0.5, 1, 2, 4, 6, 8, 12, 24];

const formatIntervalLabel = (value: number, isArabic = false) => {
        if (value === 0.5) return isArabic ? "30 د" : "30 min";
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

export default function EditScreen() {
        // All hooks at the top!
        const { medications, settings, isDark, updateMedication, deleteMedication } = useApp();
        const C = isDark ? Colors.dark : Colors.light;
        const activeButtonText = "#000";
        const styles = StyleSheet.create({
                container: { flex: 1 },
                header: {
                        paddingHorizontal: 16,
                        paddingBottom: 16,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                },
                headerRow: {
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                },
                headerTitle: { fontSize: 20, flex: 1, textAlign: "center" },
                closeBtn: {
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
                        backgroundColor: '#241638',
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
                        
                        
                },
                saveBtn: {
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        paddingVertical: 16,
                        borderRadius: 16,
            marginBottom: 40,
                },
                saveBtnText: { color: activeButtonText, fontSize: 16 },
                rowReverse: { flexDirection: "row-reverse" },
        });
        const lang = settings.language;
        const isRTL = lang === "ar";
        const insets = useSafeAreaInsets();
        const fontBold = isRTL ? "Tajawal_700Bold" : "Inter_700Bold";
        const fontMed = isRTL ? "Tajawal_500Medium" : "Inter_500Medium";
        const fontReg = isRTL ? "Tajawal_400Regular" : "Inter_400Regular";
        const inputStyle = () => [
                styles.input,
                {
                        backgroundColor: C.surfaceSecondary,
                        borderColor: C.border,
                        color: C.text,
                        fontFamily: fontReg,
                        textAlign: isRTL ? "right" as const : "left" as const,
                },
        ];
        const { id } = useLocalSearchParams<{ id: string }>();
        const med = medications.find((m) => m.id === id);
        const [form, setForm] = useState<FormData | null>(null);
        const [pickerMode, setPickerMode] = useState<"date" | "time" | null>(null);
        const [sliderWidth, setSliderWidth] = useState(220);
        const [deleteModalVisible, setDeleteModalVisible] = useState(false);
        const dragStartIndexRef = useRef<number | null>(null);

        useEffect(() => {
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
                } else {
                        setForm(null);
                }
        }, [med]);

        // Handlers and all other hooks here
        const handleChange = (key: keyof FormData, value: any) => {
                setForm((prev) => prev ? { ...prev, [key]: value } : null);
        };


        const handleSave = async () => {
                if (!form || !form.name.trim()) {
                        Alert.alert('Name is required');
                        return;
                }
                if (!med) {
                        Alert.alert('Medication not found');
                        return;
                }
                await updateMedication(med.id, {
                        ...form,
                        startTime: form.startTime.toISOString(),
                });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.replace("..");
        };

        const handleDelete = () => {
                if (!med) {
                        Alert.alert('Medication not found');
                        return;
                }
                setDeleteModalVisible(true);
        };

        const confirmDelete = async () => {
                if (!med) return;
                setDeleteModalVisible(false);
                await deleteMedication(med.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.replace("..");
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

        const currentIntervalHours = form?.intervalHours ?? 8;
        const currentIntervalIndex = INTERVALS.indexOf(currentIntervalHours);
        const trackWidth = Math.max(0, sliderWidth - 40);
        const sliderProgress =
                currentIntervalIndex / Math.max(1, INTERVALS.length - 1);
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
                handleChange('intervalHours', INTERVALS[nextIndex]);
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

        const openDatePicker = () => {
                if (Platform.OS === 'android') {
                        DateTimePickerAndroid.open({
                                value: form?.startTime || new Date(),
                                mode: 'date',
                                is24Hour: true,
                                onChange: (_event: DateTimePickerEvent, date?: Date) => {
                                        if (date) handleChange('startTime', date);
                                },
                        });
                        return;
                }

                setPickerMode('date');
        };

        const openTimePicker = () => {
                if (Platform.OS === 'android') {
                        DateTimePickerAndroid.open({
                                value: form?.startTime || new Date(),
                                mode: 'time',
                                is24Hour: true,
                                onChange: (_event: DateTimePickerEvent, date?: Date) => {
                                        if (date) handleChange('startTime', date);
                                },
                        });
                        return;
                }

                setPickerMode('time');
        };

        // Settings for pills and needles
        // const pillSettings = [t("swallowWhole", lang), t("withWater", lang), t("beforeMeal", lang), t("afterMeal", lang)];
        // const needleSettings = [t("rotateInjectionSite", lang), t("alcoholWipe", lang), t("disposeNeedleSafely", lang)];
        const pillRoutes: RouteType[] = ["oral", "sublingual", "topical", "inhalation", "other"];
        const injectionRoutes: RouteType[] = ["im", "iv", "sc", "other"];
        const routes = form?.type === "pill" ? pillRoutes : injectionRoutes;

        useEffect(() => {
                if (!form) return;
                if (form.type === "pill" && !pillRoutes.includes(form.route)) {
                        handleChange("route", "oral");
                } else if (form.type === "injection" && !injectionRoutes.includes(form.route)) {
                        handleChange("route", "im");
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [form && form.type]);

        // Only render conditionally, do not call hooks conditionally!
        if (!med || !form) {
                return (
                        <SafeAreaView style={[styles.container, { backgroundColor: C.background, direction: isRTL ? 'rtl' : 'ltr' }]}> 
                                <View style={styles.header}>
                                        <View style={styles.headerRow}>
                                                <Pressable style={styles.closeBtn} onPress={() => router.back()}>
                                                        <Feather name="x" size={22} color={C.text} />
                                                </Pressable>
                                                <Text style={[styles.headerTitle, { color: C.text, fontFamily: fontBold }]}>Edit Medication</Text>
                                                <View style={{ width: 40 }} />
                                        </View>
                                </View>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: C.textSecondary, fontFamily: fontReg }}>{t("medicationNotFound", lang)}</Text>
                                </View>
                        </SafeAreaView>
                );
        }

        // Match add page: pills and syringes (routes) choices
        return (
                <View style={[styles.container, { backgroundColor: C.background, direction: isRTL ? 'rtl' : 'ltr' }]}> 
                        <DeleteConfirmModal
                                visible={deleteModalVisible}
                                onClose={() => setDeleteModalVisible(false)}
                                onDelete={confirmDelete}
                                title={t("deleteConfirmTitle", lang)}
                                message={t("deleteConfirmMsg", lang)}
                                deleteText={t("delete", lang)}
                                cancelText={t("cancel", lang)}
                                isDark={isDark}
                        />
                        <View
                                style={[
                                        styles.header,
                                        {
                                                backgroundColor: C.surface,
                                                paddingTop: insets.top + 16 + (Platform.OS === "web" ? 67 : 0),
                                                borderBottomColor: C.border,
                                        },
                                ]}
                        >
                                <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
                                        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
                                                <Feather name="x" size={22} color={C.text} />
                                        </Pressable>
                                        <Text style={[styles.headerTitle, { color: C.text, fontFamily: fontBold }]}> 
                                                {t("editMedication", lang)}
                                        </Text>
                                        <Pressable style={styles.deleteHeaderBtn} onPress={handleDelete}>
                                                <Feather name="trash-2" size={20} color={C.danger} />
                                        </Pressable>
                                </View>
                        </View>
                        <ScrollView
                                contentContainerStyle={[
                                        styles.content,
                                        { paddingBottom: insets.bottom + 100 + (Platform.OS === "web" ? 34 : 0) },
                                ]}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                        >
                                <View style={styles.section}>
                                        <Text style={[styles.sectionLabel, { color: C.textSecondary, fontFamily: fontMed }]}>{t("medicationName", lang)}</Text>
                                        <TextInput
                                                style={[
                                                        inputStyle(),
                                                        { paddingHorizontal: 22 }
                                                ]}
                                                value={form.name}
                                                onChangeText={v => handleChange('name', v)}
                                                placeholder={t("medicationNamePlaceholder", lang)}
                                                placeholderTextColor={C.textMuted}
                                        />
                                </View>
                                <View style={styles.section}>
                                        <Text style={[styles.sectionLabel, { color: C.textSecondary, fontFamily: fontMed }]}>{t("medicationType", lang)}</Text>
                                        <View style={[styles.segmented, { backgroundColor: C.surfaceSecondary }]}> 
                                                {(["pill", "injection"] as MedicationType[]).map((type) => (
                                                        <Pressable
                                                                key={type}
                                                                style={[styles.segment, form.type === type && { backgroundColor: C.primary }]}
                                                                onPress={() => handleChange('type', type)}
                                                        >
                                                                <MaterialCommunityIcons
                                                                        name={type === 'pill' ? 'pill' : 'needle'}
                                                                        size={18}
                                                                        color={form.type === type ? '#000' : C.textSecondary}
                                                                />
                                                                <Text style={[styles.segmentText, { color: form.type === type ? '#000' : C.textSecondary, fontFamily: fontMed }]}>
                                                                        {t(type, lang)}
                                                                </Text>
                                                        </Pressable>
                                                ))}
                                        </View>
                                </View>
                                <View style={styles.section}>
                                        <Text style={[styles.sectionLabel, { color: C.textSecondary, fontFamily: fontMed }]}>{t("doseAmount", lang)}</Text>
                                        <TextInput
                                                style={inputStyle()}
                                                value={form.doseAmount}
                                                onChangeText={v => handleChange('doseAmount', v)}
                                                placeholder={t("doseAmountPlaceholder", lang)}
                                                placeholderTextColor={C.textMuted}
                                        />
                                </View>
                                <View style={styles.section}>
                                        <Text style={[styles.sectionLabel, { color: C.textSecondary, fontFamily: fontMed }]}>{t("route", lang)}</Text>
                                        <View style={styles.chipsRow}>
                                                {routes.map((route) => (
                                                        <Pressable
                                                                key={route}
                                                                style={[
                                                                        styles.chip,
                                                                        form.route === route
                                                                                ? { backgroundColor: C.primary }
                                                                                : { backgroundColor: C.surfaceSecondary, borderColor: C.border, borderWidth: 1 },
                                                                ]}
                                                                onPress={() => handleChange('route', route)}
                                                        >
                                                                <Text
                                                                        style={[
                                                                                styles.chipText,
                                                                                { color: form.route === route ? '#000' : C.textSecondary, fontFamily: fontMed },
                                                                        ]}
                                                                >
                                                                        {t(route, lang)}
                                                                </Text>
                                                        </Pressable>
                                                ))}
                                        </View>
                                </View>
                                <View style={styles.section}>
                                        <Text style={[styles.sectionLabel, { color: C.textSecondary, fontFamily: fontMed }]}>{t("interval", lang)}</Text>
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
                                                                                onPress={() => handleChange('intervalHours', h)}
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
                                        <Text style={[styles.sectionLabel, { color: C.textSecondary, fontFamily: fontMed }]}>{t("startTime", lang)}</Text>
                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                                <Pressable
                                                        style={[styles.input, { flex: 1, flexDirection: 'row', alignItems: 'center', borderColor: C.border, backgroundColor: C.surfaceSecondary }]}
                                                        onPress={openDatePicker}
                                                >
                                                        <Feather name="calendar" size={16} color={C.textSecondary} style={{ marginRight: 8 }} />
                                                        <Text style={{ color: C.text, fontFamily: fontReg, flexShrink: 1 }}>
                                                                {formatDatePart(form.startTime)}
                                                        </Text>
                                                </Pressable>
                                                <Pressable
                                                        style={[styles.input, { flex: 1, flexDirection: 'row', alignItems: 'center', borderColor: C.border, backgroundColor: C.surfaceSecondary }]}
                                                        onPress={openTimePicker}
                                                >
                                                        <Feather name="clock" size={16} color={C.textSecondary} style={{ marginRight: 8 }} />
                                                        <Text style={{ color: C.text, fontFamily: fontReg, flexShrink: 1 }}>
                                                                {formatTimePart(form.startTime)}
                                                        </Text>
                                                </Pressable>
                                        </View>
                                        {Platform.OS !== 'android' && pickerMode && (
                                                <DateTimePicker
                                                        value={form.startTime}
                                                        mode={pickerMode}
                                                        is24Hour={true}
                                                        display="default"
                                                        onChange={(_event: DateTimePickerEvent, date?: Date) => {
                                                                setPickerMode(null);
                                                                if (date) handleChange('startTime', date);
                                                        }}
                                                />
                                        )}
                                </View>
                                <View style={styles.section}>
                                        <Text style={[styles.sectionLabel, { color: C.textSecondary, fontFamily: fontMed }]}>{t("notes", lang)}</Text>
                                        <TextInput
                                                style={[inputStyle(), styles.textArea]}
                                                value={form.notes}
                                                onChangeText={v => handleChange('notes', v)}
                                                placeholder={t("notesPlaceholder", lang)}
                                                placeholderTextColor={C.textMuted}
                                                multiline
                                        />
                                </View>
                        </ScrollView>
                        <View style={[styles.footer, { marginBottom: 40 }]}> {/* Elevate the save button higher */}
                                <Pressable
                                        style={[styles.saveBtn, { backgroundColor: C.primary }]}
                                        onPress={handleSave}
                                >
                                        <Feather name="save" size={18} color="#000" />
                                        <Text style={[styles.saveBtnText, { fontFamily: fontBold }]}>{t("saveMedication", lang)}</Text>
                                </Pressable>
                        </View>
                </View>
        );
}
