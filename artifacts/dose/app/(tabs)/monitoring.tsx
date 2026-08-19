import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const TIME_BUCKETS = ["00", "03", "06", "09", "12", "15", "18", "21"];

function formatDateTime(date: Date, lang: "en" | "ar") {
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-SA" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function MonitoringScreen() {
  const { medications, settings, isDark } = useApp();
  const C = isDark ? Colors.dark : Colors.light;
  const lang = settings.language;
  const isRTL = lang === "ar";
  const insets = useSafeAreaInsets();
  const fontBold = isRTL ? "Tajawal_700Bold" : "Inter_700Bold";
  const fontMed = isRTL ? "Tajawal_500Medium" : "Inter_500Medium";
  const fontReg = isRTL ? "Tajawal_400Regular" : "Inter_400Regular";

  const stats = useMemo(() => {
    const now = new Date();
    const bucketTaken = Object.fromEntries(TIME_BUCKETS.map((b) => [b, 0]));
    const bucketMissed = Object.fromEntries(TIME_BUCKETS.map((b) => [b, 0]));

    let totalTaken = 0;
    let totalMissed = 0;

    medications.forEach((med) => {
      const due = new Date(med.nextDueAt);
      const last = med.lastConfirmedAt ? new Date(med.lastConfirmedAt) : null;
      const missedDoseCount = Math.max(0, Number(med.missedCount) || 0);

      totalMissed += missedDoseCount;

      if (last && last.getTime() > now.getTime() - 1000 * 60 * 60 * 24) {
        totalTaken += 1;
        const hour = String(last.getHours()).padStart(2, "0");
        const bucket = TIME_BUCKETS.find((b) => Number(hour) >= Number(b) && Number(hour) < Number(b) + 3) ?? "00";
        bucketTaken[bucket] += 1;
      }

      if (missedDoseCount > 0 || (due.getTime() < now.getTime() && (!last || last.getTime() < due.getTime()))) {
        const hour = String(due.getHours()).padStart(2, "0");
        const bucket = TIME_BUCKETS.find((b) => Number(hour) >= Number(b) && Number(hour) < Number(b) + 3) ?? "00";
        bucketMissed[bucket] += Math.max(1, missedDoseCount);
      }
    });

    const totalTracked = medications.length;
    const adherence = totalTracked === 0 ? 0 : Math.round((totalTaken / totalTracked) * 100);
    const maxValue = Math.max(1, ...TIME_BUCKETS.map((b) => Math.max(bucketTaken[b], bucketMissed[b])));

    return {
      totalTracked,
      totalTaken,
      totalMissed,
      adherence,
      bucketTaken,
      bucketMissed,
      maxValue,
    };
  }, [medications]);

  const medicationRows = useMemo(
    () =>
      medications.map((med) => {
        const now = new Date();
        const nextDue = new Date(med.nextDueAt);
        const lastConfirmed = med.lastConfirmedAt ? new Date(med.lastConfirmedAt) : null;
        const missedDoseCount = Math.max(0, Number(med.missedCount) || 0);
        const isMissed = missedDoseCount > 0 || (nextDue.getTime() < now.getTime() && (!lastConfirmed || lastConfirmed.getTime() < nextDue.getTime()));
        const isRecent = lastConfirmed && now.getTime() - lastConfirmed.getTime() < 1000 * 60 * 60 * 5;
        const statusText = isMissed
          ? missedDoseCount > 0
            ? lang === "ar"
              ? `${missedDoseCount} مفقود${missedDoseCount > 1 ? "ة" : ""}`
              : `${missedDoseCount} missed`
            : lang === "ar"
              ? "مفقود"
              : "Missed"
          : isRecent
            ? lang === "ar"
              ? "تمت حديثاً"
              : "Taken"
            : lang === "ar"
              ? "مجدول"
              : "On track";

        const statusColor = isMissed ? C.danger : isRecent ? C.success : C.primary;

        return {
          ...med,
          statusText,
          statusColor,
          nextDueLabel: formatDateTime(nextDue, lang),
          lastTakenLabel: lastConfirmed ? formatDateTime(lastConfirmed, lang) : lang === "ar" ? "لم يتم" : "Not taken",
        };
      }),
    [C.danger, C.primary, C.success, lang, medications]
  );

  const weeklyTrend = useMemo(() => {
    const totalMedicines = Math.max(1, medications.length);
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const dayLabel = date.toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
        weekday: "short",
      });

      const takenOnDay = medications.filter((med) => {
        if (!med.lastConfirmedAt) return false;
        const lastConfirmed = new Date(med.lastConfirmedAt);
        return (
          lastConfirmed.getFullYear() === date.getFullYear() &&
          lastConfirmed.getMonth() === date.getMonth() &&
          lastConfirmed.getDate() === date.getDate()
        );
      }).length;

      const percent = Math.min(100, Math.round((takenOnDay / totalMedicines) * 100));

      return {
        label: dayLabel,
        percent,
      };
    });

    return days;
  }, [lang, medications]);

  const insights = useMemo(() => {
    const items = medications.map((med) => {
      const now = new Date();
      const nextDue = new Date(med.nextDueAt);
      const lastConfirmed = med.lastConfirmedAt ? new Date(med.lastConfirmedAt) : null;
      const wasMissed = nextDue.getTime() < now.getTime() && (!lastConfirmed || lastConfirmed.getTime() < nextDue.getTime());
      const score = Math.max(0, Math.min(100, med.lastConfirmedAt ? 85 : 40));

      return {
        name: med.name,
        score: wasMissed ? Math.min(score, 35) : Math.min(100, score + 15),
        isMissed: wasMissed,
      };
    });

    const best = [...items].sort((a, b) => b.score - a.score)[0] ?? { name: lang === "ar" ? "لا توجد بيانات" : "No data", score: 0 };
    const worst = [...items].sort((a, b) => a.score - b.score)[0] ?? { name: lang === "ar" ? "لا توجد بيانات" : "No data", score: 0 };

    return { best, worst };
  }, [lang, medications]);

  const summaryCards = [
    { label: lang === "ar" ? "إجمالي" : "Total", value: String(stats.totalTracked), color: C.primary },
    { label: lang === "ar" ? "تمت" : "Taken", value: String(stats.totalTaken), color: C.success },
    { label: lang === "ar" ? "مفقود" : "Missed", value: String(stats.totalMissed), color: C.danger },
    { label: "%", value: `${stats.adherence}%`, color: C.info },
  ];

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}> 
      <View
        style={[
          styles.header,
          {
            backgroundColor: C.surface,
            borderBottomColor: C.border,
            paddingTop: insets.top + 16,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: C.text, fontFamily: fontBold, textAlign: "center" }]}>
          {lang === "ar" ? "مراقبة الجرعات" : "Medication Monitoring"}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 120 + (Platform.OS === "web" ? 40 : 0) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsRow}>
          {summaryCards.map((card) => (
            <View
              key={card.label}
              style={[
                styles.statCard,
                {
                  backgroundColor: C.surface,
                  borderColor: C.border,
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 2,
                },
              ]}
            >
              <Text style={[styles.statValue, { color: card.color, fontFamily: fontBold }]}>{card.value}</Text>
              <Text style={[styles.statLabel, { color: C.textMuted, fontFamily: fontMed }]}>{card.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.adherencePanel, { backgroundColor: C.surface, borderColor: C.border }]}> 
          <View style={[styles.ring, { borderColor: C.primary }]}>
            <View style={[styles.ringInner, { backgroundColor: C.background }]}> 
              <Text style={[styles.ringValue, { color: C.primary, fontFamily: fontBold }]}>{stats.adherence}%</Text>
            </View>
          </View>

          <View style={styles.adherenceTextWrap}>
            <Text style={[styles.adherenceTitle, { color: C.text, fontFamily: fontMed, textAlign: isRTL ? "right" : "left" }]}>
              {lang === "ar" ? "معدل الالتزام" : "Adherence rate"}
            </Text>
            <Text style={[styles.adherenceCaption, { color: C.textSecondary, fontFamily: fontReg, textAlign: isRTL ? "right" : "left" }]}>
              {lang === "ar"
                ? "الهدف المثالي هو الحفاظ على الالتزام فوق 90٪."
                : "Aim to stay above 90% for better control."}
            </Text>
          </View>
        </View>

        <View style={[styles.trendPanel, { backgroundColor: C.surface, borderColor: C.border }]}> 
          <Text style={[styles.panelTitle, { color: C.text, fontFamily: fontMed, textAlign: isRTL ? "right" : "left" }]}>
            {lang === "ar" ? "الاتجاه الأسبوعي" : "Weekly trend"}
          </Text>

          <View style={[styles.weekChartFrame, { borderColor: C.border }]}> 
            <View pointerEvents="none" style={styles.gridLines}>
              <View style={[styles.gridLine, { backgroundColor: `${C.border}99` }]} />
              <View style={[styles.gridLine, { backgroundColor: `${C.border}66` }]} />
              <View style={[styles.gridLine, { backgroundColor: `${C.border}66` }]} />
              <View style={[styles.gridLine, { backgroundColor: `${C.border}99` }]} />
            </View>
            <View style={styles.weekRow}>
              {weeklyTrend.map((day, index) => (
                <View key={`${day.label}-${index}`} style={styles.dayCol}>
                  <View style={[styles.barTrack, { backgroundColor: `${C.primary}1A` }]}> 
                    <View
                      style={[
                        styles.dayBar,
                        {
                          height: `${day.percent}%`,
                          backgroundColor: day.percent >= 70 ? C.success : day.percent >= 40 ? C.warning : C.danger,
                        },
                      ]}
                    />
                  </View>
                  <Text numberOfLines={1} style={[styles.dayLabel, { color: C.textMuted, fontFamily: fontReg }]}>{day.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.insightsPanel, { backgroundColor: C.surface, borderColor: C.border }]}> 
          <Text style={[styles.panelTitle, { color: C.text, fontFamily: fontMed, textAlign: isRTL ? "right" : "left" }]}>
            {lang === "ar" ? "التنبيهات" : "Insights"}
          </Text>

          <View style={styles.insightRow}>
            <View style={[styles.insightCard, { backgroundColor: `${C.success}14`, borderColor: `${C.success}66` }]}> 
              <Text style={[styles.insightLabel, { color: C.textMuted, fontFamily: fontReg }]}>{lang === "ar" ? "أفضل التزام" : "Best adherence"}</Text>
              <Text style={[styles.insightName, { color: C.text, fontFamily: fontMed }]}>{insights.best.name}</Text>
              <Text style={[styles.insightScore, { color: C.success, fontFamily: fontBold }]}>{Math.round(insights.best.score)}%</Text>
            </View>

            <View style={[styles.insightCard, { backgroundColor: `${C.danger}14`, borderColor: `${C.danger}66` }]}> 
              <Text style={[styles.insightLabel, { color: C.textMuted, fontFamily: fontReg }]}>{lang === "ar" ? "يحتاج انتباه" : "Needs attention"}</Text>
              <Text style={[styles.insightName, { color: C.text, fontFamily: fontMed }]}>{insights.worst.name}</Text>
              <Text style={[styles.insightScore, { color: C.danger, fontFamily: fontBold }]}>{Math.round(insights.worst.score)}%</Text>
            </View>
          </View>
        </View>

        <View style={[styles.panel, { backgroundColor: C.surface, borderColor: C.border }]}> 
          <Text style={[styles.panelTitle, { color: C.text, fontFamily: fontMed, textAlign: isRTL ? "right" : "left" }]}>
            {lang === "ar" ? "الجرعات خلال اليوم" : "Dose pattern through the day"}
          </Text>

          <View style={[styles.dailyChartFrame, { borderColor: C.border }]}> 
            <View pointerEvents="none" style={styles.gridLines}>
              <View style={[styles.gridLine, { backgroundColor: `${C.border}99` }]} />
              <View style={[styles.gridLine, { backgroundColor: `${C.border}66` }]} />
              <View style={[styles.gridLine, { backgroundColor: `${C.border}66` }]} />
              <View style={[styles.gridLine, { backgroundColor: `${C.border}99` }]} />
            </View>
            <View style={styles.chartWrap}>
              {TIME_BUCKETS.map((bucket) => {
                const taken = stats.bucketTaken[bucket] || 0;
                const missed = stats.bucketMissed[bucket] || 0;
                const max = stats.maxValue || 1;

                return (
                  <View key={bucket} style={styles.chartCol}>
                    <View style={styles.chartBars}>
                      <View style={[styles.bar, { height: `${(taken / max) * 100}%`, backgroundColor: C.success }]} />
                      <View style={[styles.bar, { height: `${(missed / max) * 100}%`, backgroundColor: C.danger }]} />
                    </View>
                    <Text style={[styles.chartLabel, { color: C.textMuted, fontFamily: fontReg }]}>{bucket}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: C.success }]} />
              <Text style={[styles.legendText, { color: C.textSecondary, fontFamily: fontReg }]}>{lang === "ar" ? "تمت" : "Taken"}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: C.danger }]} />
              <Text style={[styles.legendText, { color: C.textSecondary, fontFamily: fontReg }]}>{lang === "ar" ? "مفقود" : "Missed"}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.listPanel, { backgroundColor: C.surface, borderColor: C.border }]}> 
          <Text style={[styles.panelTitle, { color: C.text, fontFamily: fontMed, textAlign: isRTL ? "right" : "left" }]}>
            {lang === "ar" ? "جميع الأدوية" : "All medications"}
          </Text>

          {medicationRows.length === 0 ? (
            <Text style={[styles.emptyState, { color: C.textMuted, fontFamily: fontReg, textAlign: isRTL ? "right" : "left" }]}>
              {lang === "ar" ? "لا توجد أدوية مضافة بعد." : "No medications added yet."}
            </Text>
          ) : (
            medicationRows.map((med) => (
              <View key={med.id} style={[styles.medRow, { borderColor: C.border, direction: isRTL ? "rtl" : "ltr" }]}> 
                {isRTL ? (
                  <View style={[styles.medHeader, { flexDirection: "row-reverse" }]}> 
                    <View style={[styles.statusPill, { backgroundColor: `${med.statusColor}1A`, borderColor: `${med.statusColor}33` }]}> 
                      <Text style={[styles.statusText, { color: med.statusColor, fontFamily: fontMed, textAlign: "right" }]}>{med.statusText}</Text>
                    </View>
                    <View style={[styles.medTitleWrap, { alignItems: "flex-start" }]}> 
                      <Text style={[styles.medName, { color: C.text, fontFamily: fontMed, textAlign: "right" }]}>{med.name}</Text>
                      <Text style={[styles.medMeta, { color: C.textSecondary, fontFamily: fontReg, textAlign: "right" }]}>{med.doseAmount}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.medHeader, { flexDirection: "row" }]}> 
                    <View style={[styles.medTitleWrap, { alignItems: "flex-start" }]}> 
                      <Text style={[styles.medName, { color: C.text, fontFamily: fontMed, textAlign: "left" }]}>{med.name}</Text>
                      <Text style={[styles.medMeta, { color: C.textSecondary, fontFamily: fontReg, textAlign: "left" }]}>{med.doseAmount}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: `${med.statusColor}1A`, borderColor: `${med.statusColor}33` }]}> 
                      <Text style={[styles.statusText, { color: med.statusColor, fontFamily: fontMed, textAlign: "left" }]}>{med.statusText}</Text>
                    </View>
                  </View>
                )}

                <View style={[styles.metaGrid, { flexDirection: isRTL ? "row-reverse" : "row" }]}> 
                  <View style={styles.metaItem}>
                    <Text style={[styles.metaLabel, { color: C.textMuted, fontFamily: fontReg }]}>{lang === "ar" ? "التالي" : "Next"}</Text>
                    <Text style={[styles.metaValue, { color: C.text, fontFamily: fontMed }]}>{med.nextDueLabel}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={[styles.metaLabel, { color: C.textMuted, fontFamily: fontReg }]}>{lang === "ar" ? "آخر جرعة" : "Last dose"}</Text>
                    <Text style={[styles.metaValue, { color: C.text, fontFamily: fontMed }]}>{med.lastTakenLabel}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
  content: {
    padding: 16,
  },
  cardsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flexBasis: "48%",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  adherencePanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 16,
  },
  ring: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  ringValue: {
    fontSize: 16,
  },
  adherenceTextWrap: {
    flex: 1,
  },
  adherenceTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  adherenceCaption: {
    fontSize: 12,
    lineHeight: 18,
  },
  statValue: {
    fontSize: 26,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  trendPanel: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 16,
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 132,
    paddingHorizontal: 8,
  },
  weekChartFrame: {
    height: 164,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  dayCol: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
    minWidth: 0,
  },
  barTrack: {
    width: 18,
    height: 82,
    borderRadius: 10,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  dayBar: {
    width: "100%",
    borderRadius: 10,
    minHeight: 0,
  },
  dayLabel: {
    marginTop: 8,
    fontSize: 10,
    maxWidth: 38,
  },
  insightsPanel: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 16,
  },
  insightRow: {
    flexDirection: "row",
    gap: 12,
  },
  insightCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  insightLabel: {
    fontSize: 11,
    marginBottom: 6,
  },
  insightName: {
    fontSize: 15,
    marginBottom: 4,
  },
  insightScore: {
    fontSize: 20,
  },
  panel: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 14,
    marginBottom: 18,
  },
  chartWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 180,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 0,
  },
  dailyChartFrame: {
    height: 198,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  chartCol: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
    minWidth: 0,
  },
  chartBars: {
    width: "100%",
    height: 140,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
    overflow: "hidden",
  },
  bar: {
    flex: 1,
    borderRadius: 8,
    minHeight: 0,
    maxWidth: 14,
  },
  chartLabel: {
    marginTop: 10,
    fontSize: 10,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginTop: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
  },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  gridLine: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
  listPanel: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  medRow: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
  },
  medHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  medTitleWrap: {
    flex: 1,
  },
  medName: {
    fontSize: 16,
    marginBottom: 2,
  },
  medMeta: {
    fontSize: 12,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 11,
  },
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
  },
  metaItem: {
    flex: 1,
    minWidth: 0,
  },
  metaLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 12,
  },
  emptyState: {
    fontSize: 14,
    marginTop: 8,
  },
});
