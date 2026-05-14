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
                section: { gap: 8, marginBottom: 8 },
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
                intervalChipSub: { fontSize: 10, marginTop: 2, textAlign: "center"},
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
        const { id } = useLocalSearchParams<{ id: string }>();
        const med = medications.find((m) => m.id === id);
        const [form, setForm] = useState<FormData | null>(null);

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
                router.back();
        };

        const handleDelete = () => {
                if (!med) {
                        Alert.alert('Medication not found');
                        return;
                }
                Alert.alert(
                        t('deleteConfirmTitle', lang),
                        t('deleteConfirmMsg', lang),
                        [
                                { text: t('cancel', lang), style: 'cancel' },
                                {
                                        text: t('delete', lang),
                                        style: 'destructive',
                                        onPress: async () => {
                                                await deleteMedication(med.id);
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                                router.replace('/');
                                        },
                                },
                        ]
                );
        };

        // Date/time picker
        const showDatePicker = () => {
                if (Platform.OS === 'android') {
                        DateTimePickerAndroid.open({
                                value: form?.startTime || new Date(),
                                mode: 'date',
                                is24Hour: true,
                                onChange: (event, date) => {
                                        if (date) handleChange('startTime', date);
                                },
                        });
                }
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
                                                        styles.input,
                                                        { color: C.text, borderColor: C.border, fontFamily: fontReg, textAlign: isRTL ? "right" : "left", backgroundColor: isDark ? '#241638' : '#fff', paddingHorizontal: 22 }
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
                                                                        color={form.type === type ? activeButtonText : C.textSecondary}
                                                                />
                                                                <Text style={[styles.segmentText, { color: form.type === type ? activeButtonText : C.textSecondary, fontFamily: fontMed }]}>
                                                                        {t(type, lang)}
                                                                </Text>
                                                        </Pressable>
                                                ))}
                                        </View>
                                </View>
                                <View style={styles.section}>
                                        <Text style={[styles.sectionLabel, { color: C.textSecondary, fontFamily: fontMed }]}>{t("doseAmount", lang)}</Text>
                                        <TextInput
                                                style={[styles.input, { color: C.text, borderColor: C.border, fontFamily: fontReg, textAlign: isRTL ? "right" : "left", backgroundColor: isDark ? '#241638' : '#fff' }]}
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
                                                                                { color: form.route === route ? activeButtonText : C.textSecondary, fontFamily: fontMed },
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
                                        <View style={styles.intervalGrid}>
                                                {INTERVALS.map((h) => (
                                                        <Pressable
                                                                key={h}
                                                                style={[styles.intervalChip, { backgroundColor: form.intervalHours === h ? C.primary : C.surfaceSecondary }]}
                                                                onPress={() => handleChange('intervalHours', h)}
                                                        >
                                                                <Text style={[styles.intervalChipText, { color: form.intervalHours === h ? "#000" : C.text, fontFamily: fontMed }]}>{h}h</Text>
                                                                <Text style={[styles.intervalChipSub, { color: form.intervalHours === h ? "#000" : C.textSecondary, fontFamily: fontReg }]}>
                                                                        {t((`every${h}h`) as keyof typeof import("@/constants/i18n").translations.en, lang) || `every ${h}h`}
                                                                </Text>
                                                        </Pressable>
                                                ))}
                                        </View>
                                </View>
                                <View style={styles.section}>
                                        <Text style={[styles.sectionLabel, { color: C.textSecondary, fontFamily: fontMed }]}>{t("startTime", lang)}</Text>
                                        <Pressable
                                                style={[styles.input, { flexDirection: 'row', alignItems: 'center', borderColor: C.border, backgroundColor: isDark ? '#241638' : '#ffffff' }]}
                                                onPress={showDatePicker}
                                        >
                                                <Feather name="clock" size={16} color={C.textSecondary} style={{ marginRight: 8 }} />
                                                <Text style={{ color: C.text, fontFamily: fontReg }}>
                                                        {toLocalDateTimeString(form.startTime)}
                                                </Text>
                                        </Pressable>
                                        {Platform.OS !== 'android' && (
                                                <DateTimePicker
                                                        value={form.startTime}
                                                        mode="datetime"
                                                        is24Hour={true}
                                                        display="default"
                                                        onChange={(event, date) => { if (date) handleChange('startTime', date); }}
                                                />
                                        )}
                                </View>
                                <View style={styles.section}>
                                        <Text style={[styles.sectionLabel, { color: C.textSecondary, fontFamily: fontMed }]}>{t("notes", lang)}</Text>
                                        <TextInput
                                                style={[styles.input, styles.textArea, { color: C.text, borderColor: C.border, fontFamily: fontReg, textAlign: isRTL ? "right" : "left", backgroundColor: isDark ? '#241638' : '#ffffff' }]}
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
                                        <Feather name="save" size={18} color={activeButtonText} />
                                        <Text style={[styles.saveBtnText, { fontFamily: fontBold }]}>{t("saveMedication", lang)}</Text>
                                </Pressable>
                        </View>
                </View>
        );
}
