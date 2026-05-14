
import { useEffect } from "react";

// ...existing code...


import React, { useState, useMemo, useCallback, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Animated,
  Platform,
  Alert,
} from "react-native";
import UnityAdBanner from "@/components/UnityAdBanner";
import ConfirmIntakeModal from "@/components/ConfirmIntakeModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import Colors from "@/constants/colors";
import * as Notifications from "expo-notifications";
import { showInterstitial, loadInterstitial } from "@/services/unity-ads";
import { t } from "@/constants/i18n";
import {
  useApp,
  getMedicationStatus,
  getTimeRemaining,
  getProgressPercent,
  type Medication,
  type MedicationStatus,
} from "@/context/AppContext";
import { format } from "date-fns";

type FilterMode = "all" | "due_now" | "overdue" | "pill" | "injection";
type SortMode = "next_due" | "overdue_first" | "alphabetical";

function StatusBadge({
  status,
  C,
  lang,
}: {
  status: MedicationStatus;
  C: typeof Colors.light;
  lang: "en" | "ar";
}) {
  const config: Record<
    MedicationStatus,
    { bg: string; text: string; label: string }
  > = {
    upcoming: { bg: C.infoLight, text: C.info, label: t("upcoming", lang) },
    due_now: { bg: C.warningLight, text: C.warning, label: t("dueNowBadge", lang) },
    overdue: { bg: C.dangerLight, text: C.danger, label: t("overdue", lang) },
    confirmed_recently: { bg: C.successLight, text: C.success, label: t("confirmedRecently", lang) },
  };
  const cfg = config[status];
  // Helper to detect Arabic text
  const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}> 
      <Text style={[styles.badgeText, { color: cfg.text, fontFamily: lang === "ar" || isArabic(cfg.label) ? "Tajawal_500Medium" : "Inter_600SemiBold" }]}> 
        {cfg.label}
      </Text>
    </View>
  );
}

function MedicationCard({
  med,
  C,
  lang,
  isRTL,
  onConfirm,
  onDelete,
  onEdit,
  tick,
}: {
  med: Medication;
  C: typeof Colors.light;
  lang: "en" | "ar";
  isRTL: boolean;
  onConfirm: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  tick: number;
}) {
  const status = getMedicationStatus(med);
  const progress = getProgressPercent(med);
  const { diff, isOverdue, formatted } = getTimeRemaining(med.nextDueAt);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);
  const fontFamily = (txt: string) => lang === "ar" || isArabic(txt) ? "Tajawal_500Medium" : "Inter_500Medium";
  const fontBold = (txt: string) => lang === "ar" || isArabic(txt) ? "Tajawal_700Bold" : "Inter_700Bold";
  const fontReg = (txt: string) => lang === "ar" || isArabic(txt) ? "Tajawal_400Regular" : "Inter_400Regular";

  const statusColors: Record<MedicationStatus, string> = {
    upcoming: C.info,
    due_now: C.warning,
    overdue: C.danger,
    confirmed_recently: C.success,
  };
  const borderColor = statusColors[status];

  const handlePress = (action: () => void) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
    action();
  };

  const lastTakenStr = med.lastConfirmedAt
      ? format(new Date(med.lastConfirmedAt), "HH:mm, MMM d")
      : t("never", lang);

  const progressBarColor =
    status === "overdue"
      ? C.danger
      : status === "due_now"
        ? C.warning
        : status === "confirmed_recently"
          ? C.success
          : C.primary;

  return (
    <View style={{ direction: isRTL ? "rtl" : "ltr" }}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: C.surface,
            borderLeftWidth: 4,
            borderLeftColor: borderColor,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        
        <View style={[styles.cardHeader, isRTL && styles.rowReverse]}>
        <View style={[styles.cardIcon, { backgroundColor: C.primaryLight }]}>
          <MaterialCommunityIcons
            name={med.type === "pill" ? "pill" : "needle"}
            size={20}
            color={C.primary}
          />
        </View>
        <View style={[styles.cardTitleGroup, isRTL && { alignItems: "flex-end" }]}>
          <Text
            style={[styles.cardName, { color: C.text, fontFamily: fontBold(med.name) }]}
            numberOfLines={1}
          >
            {med.name}
          </Text>
          <Text
            style={[styles.cardMeta, { color: C.textSecondary, fontFamily: fontReg(`${med.doseAmount} · ${t(med.route as any, lang)} · ${t(`every${med.intervalHours}h` as any, lang)}`) }]}
          >
            {med.doseAmount} · {t(med.route as any, lang)} · {t(`every${med.intervalHours}h` as any, lang) || `${med.intervalHours}h`}
          </Text>
        </View>
        <StatusBadge status={status} C={C} lang={lang} />
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBg, { backgroundColor: C.surfaceSecondary }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: progressBarColor,
                width: `${Math.round(progress * 100)}%`,
              },
            ]}
          />
        </View>
      </View>

      <View style={[styles.countdownRow, isRTL && styles.rowReverse]}>
        <View style={isRTL && { alignItems: "flex-end" }}>
          <Text
            style={[styles.countdownLabel, { color: C.textMuted, fontFamily: fontReg(isOverdue ? t("overdueBy", lang) : t("nextDoseIn", lang)) }]}
          >
            {isOverdue ? t("overdueBy", lang) : t("nextDoseIn", lang)}
          </Text>
          <Text
            style={[
              styles.countdownTime,
              {
                color: isOverdue ? C.danger : status === "due_now" ? C.warning : C.primary,
                fontFamily: fontBold(isOverdue && status !== "confirmed_recently" ? formatted : status === "confirmed_recently" ? "✓" : formatted),
              },
            ]}
          >
            {isOverdue && status !== "confirmed_recently" ? formatted : status === "confirmed_recently" ? "✓" : formatted}
          </Text>
        </View>
        <View style={[styles.lastTakenGroup, isRTL && { alignItems: "flex-start" }]}>
          <Text style={[styles.countdownLabel, { color: C.textMuted, fontFamily: fontReg(t("lastTaken", lang)) }]}> 
            {t("lastTaken", lang)}
          </Text>
          <Text style={[styles.lastTakenValue, { color: C.textSecondary, fontFamily: fontFamily(lastTakenStr) }]}> 
            {lastTakenStr}
          </Text>
        </View>
      </View>

      <View style={[styles.cardActions, isRTL && styles.rowReverse]}>
        <Pressable
          style={({ pressed }) => [
            styles.confirmBtn,
            {
              backgroundColor:
                status === "overdue"
                  ? C.danger
                  : status === "due_now"
                    ? C.warning
                    : C.primary,
              opacity: pressed ? 0.85 : 1,
              flex: 1,
            },
          ]}
          onPress={() => handlePress(() => onConfirm(med.id))}
        >
          <Feather name="check" size={16} color="#000" />
          <Text style={[styles.confirmBtnText, { fontFamily: fontFamily(t("confirmIntake", lang)) }]}> 
            {t("confirmIntake", lang)}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.iconBtn,
            { backgroundColor: C.surfaceSecondary, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => onEdit(med.id)}
        >
          <Feather name="edit-2" size={16} color={C.textSecondary} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.iconBtn,
            { backgroundColor: C.dangerLight, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => onDelete(med.id)}
        >
          <Feather name="trash-2" size={16} color={C.danger} />
        </Pressable>
      </View>
      </Animated.View>
    </View>
  );
}


export default function HomeScreen() {
  const { medications, settings, isDark, confirmIntake, deleteMedication, tick } = useApp();
  const C = isDark ? Colors.dark : Colors.light;
  const lang = settings.language;
  const isRTL = lang === "ar";
  const insets = useSafeAreaInsets();
  const fontBold = isRTL ? "Tajawal_700Bold" : "Inter_700Bold";
  const fontMed = isRTL ? "Tajawal_500Medium" : "Inter_500Medium";
  const fontReg = isRTL ? "Tajawal_400Regular" : "Inter_400Regular";

  const [filter, setFilter] = useState<FilterMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("next_due");
  const [searchText, setSearchText] = useState("");
  const [showSort, setShowSort] = useState(false);

  const overallCounts = useMemo(() => {
    let dueNow = 0;
    let overdue = 0;
    medications.forEach((m) => {
      const s = getMedicationStatus(m);
      if (s === "due_now") dueNow++;
      if (s === "overdue") overdue++;
    });
    return { total: medications.length, dueNow, overdue };
  }, [medications, tick]);

  const filtered = useMemo(() => {
    let list = [...medications];
    if (searchText) {
      list = list.filter((m) =>
        m.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (filter === "due_now") {
      list = list.filter((m) => {
        const s = getMedicationStatus(m);
        return s === "due_now" || s === "overdue";
      });
    } else if (filter === "overdue") {
      list = list.filter((m) => getMedicationStatus(m) === "overdue");
    } else if (filter === "pill") {
      list = list.filter((m) => m.type === "pill");
    } else if (filter === "injection") {
      list = list.filter((m) => m.type === "injection");
    }
    if (sortMode === "overdue_first") {
      list.sort((a, b) => {
        const sa = getMedicationStatus(a);
        const sb = getMedicationStatus(b);
        const order = { overdue: 0, due_now: 1, upcoming: 2, confirmed_recently: 3 };
        return (order[sa] ?? 3) - (order[sb] ?? 3);
      });
    } else if (sortMode === "alphabetical") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort(
        (a, b) => new Date(a.nextDueAt).getTime() - new Date(b.nextDueAt).getTime()
      );
    }
    return list;
  }, [medications, filter, sortMode, searchText, tick]);


  // Schedule notifications for finish time and due_now status
  React.useEffect(() => {
    if (Platform.OS === "web") return;
    Notifications.cancelAllScheduledNotificationsAsync();
    filtered.forEach((med: Medication) => {
      const status = getMedicationStatus(med);
      // Schedule finish time notification
      if (med.nextDueAt) {
        const finishTime = new Date(med.nextDueAt).getTime();
        const now = Date.now();
        if (finishTime > now) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: "حان وقت الدواء",
              body: `${med.name} وقته الان!`,
              sound: "notify.wav",
            },
            trigger: { type: 'timeInterval', seconds: Math.floor((finishTime - now) / 1000), repeats: false } as any,
          });
        }
      }
      // Schedule due_now (yellow) notification if not already due_now/overdue
      if (status !== "due_now" && status !== "overdue" && med.nextDueAt) {
        const dueNowTime = new Date(med.nextDueAt).getTime() - 30 * 60 * 1000; // 30 min before due
        const now = Date.now();
        if (dueNowTime > now) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: "أقترب موعد الدواء",
              body: `${med.name} بقي 30 دقيقة على موعده!`,
              sound: "notify.wav",
            },
            trigger: { type: 'timeInterval', seconds: Math.floor((dueNowTime - now) / 1000), repeats: false } as any,
          });
        }
      }
    });
  }, [filtered, tick]);

  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; id: string | null }>({ visible: false, id: null });
  const handleConfirm = useCallback((id: string) => {
    setConfirmModal({ visible: true, id });
  }, []);
  const handleModalClose = () => setConfirmModal({ visible: false, id: null });
  const handleModalConfirm = async () => {
    if (confirmModal.id) {
      await confirmIntake(confirmModal.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setConfirmModal({ visible: false, id: null });
    await new Promise((resolve) => setTimeout(resolve, 350));
    await showInterstitial();
    loadInterstitial();
  };

  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; id: string | null }>({ visible: false, id: null });
  const handleDelete = useCallback((id: string) => {
    setDeleteModal({ visible: true, id });
  }, []);
  const handleDeleteModalClose = () => setDeleteModal({ visible: false, id: null });
  const handleDeleteModalConfirm = async () => {
    if (deleteModal.id) {
      await deleteMedication(deleteModal.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setDeleteModal({ visible: false, id: null });
    await new Promise((resolve) => setTimeout(resolve, 350));
    await showInterstitial();
    loadInterstitial();
  };

  // The edit page is not shown in the main menu; only accessible from the edit button on each medication card
  const handleEdit = useCallback((id: string) => {
    router.push({ pathname: "/edit", params: { id } });
  }, []);

  const webTopPadding = Platform.OS === "web" ? 67 : 0;
  const webBottomPadding = Platform.OS === "web" ? 34 : 0;

  const filterChips: Array<{ key: FilterMode; label: string }> = [
    { key: "all", label: t("all", lang) },
    { key: "due_now", label: t("dueNow", lang) },
    { key: "overdue", label: t("overdue", lang) },
    { key: "pill", label: t("pills", lang) },
    { key: "injection", label: t("injections", lang) },
  ];

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}> 
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={C.background} translucent={false} />
      <DeleteConfirmModal
        visible={deleteModal.visible}
        onClose={handleDeleteModalClose}
        onDelete={handleDeleteModalConfirm}
        title={t("deleteConfirmTitle", lang)}
        message={t("deleteConfirmMsg", lang)}
        deleteText={t("delete", lang)}
        cancelText={t("cancel", lang)}
        isDark={isDark}
      />
      <ConfirmIntakeModal
        visible={confirmModal.visible}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        title={t("confirmTakenTitle", lang)}
        message={t("confirmTakenMsg", lang)}
        confirmText={t("confirm", lang)}
        cancelText={t("cancel", lang)}
        isDark={isDark}
      />
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
<View style={[styles.headerTop, { flexDirection: "row" }]}>
  <View style={{ flex: 1, alignItems: "center" }}>
    <Text
      style={[
        styles.headerTitle,
        { color: C.text, fontFamily: fontBold }
      ]}
    >
      {t("medications", lang)}
    </Text>
    <Text
      style={[
        styles.headerSubtitle,
        { color: C.textSecondary, fontFamily: fontReg }
      ]}
    >
      {overallCounts.total} {t("active", lang)}
      {overallCounts.dueNow > 0 && ` · ${overallCounts.dueNow} ${t("dueNow", lang)}`}
      {overallCounts.overdue > 0 && ` · ${overallCounts.overdue} ${t("overdue", lang)}`}
    </Text>
  </View>
        </View>

        {showSort && (
          <View style={[styles.sortPanel, { backgroundColor: C.surfaceSecondary, borderColor: C.border }]}>
            {(["next_due", "overdue_first", "alphabetical"] as SortMode[]).map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.sortOption,
                  sortMode === s && { backgroundColor: C.primaryLight },
                ]}
                onPress={() => { setSortMode(s); setShowSort(false); }}
              >
                <Text style={[styles.sortOptionText, {
                  color: sortMode === s ? C.primary : C.text,
                  fontFamily: fontMed,
                }]}>
                  {s === "next_due" ? t("sortNextDue", lang) : s === "overdue_first" ? t("sortOverdueFirst", lang) : t("sortAlphabetical", lang)}
                </Text>
                {sortMode === s && <Feather name="check" size={14} color={C.primary} />}
              </Pressable>
            ))}
          </View>
        )}

        <View
          style={[
            styles.searchRow,
            { backgroundColor: C.surfaceSecondary, borderColor: C.border },
            isRTL && styles.rowReverse,
          ]}
        >
          <Feather name="search" size={16} color={C.textMuted} />
          <TextInput
            style={[
              styles.searchInput,
              {
                color: C.text,
                fontFamily: fontReg,
                textAlign: isRTL ? "right" : "left",
              },
            ]}
            placeholder={t("search", lang)}
            placeholderTextColor={C.textMuted}
            value={searchText}
            onChangeText={setSearchText}
          />
          {!!searchText && (
            <Pressable onPress={() => setSearchText("")}>
              <Feather name="x-circle" size={16} color={C.textMuted} />
            </Pressable>
          )}
        </View>

        <View style={styles.filterRow}>
          {filterChips.map(({ key, label }) => (
            <Pressable
              key={key}
              style={[
                styles.filterChip,
                filter === key
                  ? { backgroundColor: C.primary }
                  : { backgroundColor: C.surfaceSecondary, borderColor: C.border, borderWidth: 1 },
              ]}
              onPress={() => setFilter(key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: filter === key ? "#fff" : C.textSecondary, fontFamily: fontMed },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        scrollEnabled={!!filtered.length}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 + webBottomPadding },
        ]}
        renderItem={({ item }) => (
          <MedicationCard
            med={item}
            C={C}
            lang={lang}
            isRTL={isRTL}
            onConfirm={handleConfirm}
            onDelete={handleDelete}
            onEdit={handleEdit}
            tick={tick}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: C.primaryLight }]}>
              <MaterialCommunityIcons name="pill" size={40} color={C.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: C.text, fontFamily: fontBold }]}>
              {t("noMedications", lang)}
            </Text>
            <Text style={[styles.emptyDesc, { color: C.textSecondary, fontFamily: fontReg }]}>
              {t("noMedicationsDesc", lang)}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.emptyBtn,
                { backgroundColor: C.primary, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() => router.push({ pathname: "/(tabs)/add", params: {} })}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text style={[styles.emptyBtnText, { fontFamily: fontMed }]}>
                {t("addFirstMed", lang)}
              </Text>
            </Pressable>
          </View>
        }
        ListFooterComponent={<UnityAdBanner />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTitle: { fontSize: 28, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  sortBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sortPanel: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 4,
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sortOptionText: { fontSize: 14 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterChipText: { fontSize: 12 },
  listContent: { padding: 16, gap: 12 },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleGroup: { flex: 1, gap: 3 },
  cardName: { fontSize: 16 },
  cardMeta: { fontSize: 12 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11 },
  progressContainer: {},
  progressBg: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  countdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  countdownLabel: { fontSize: 11, marginBottom: 2 },
  countdownTime: { fontSize: 22, letterSpacing: -0.5 },
  lastTakenGroup: { alignItems: "flex-end" },
  lastTakenValue: { fontSize: 13 },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  confirmBtnText: {
    color: "#000",
    fontSize: 14,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowReverse: { flexDirection: "row-reverse" },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 16,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 20, textAlign: "center" },
  emptyDesc: { fontSize: 14, textAlign: "center", paddingHorizontal: 32, lineHeight: 20 },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyBtnText: { color: "#fff", fontSize: 15 },
});
