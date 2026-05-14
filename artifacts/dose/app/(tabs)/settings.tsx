import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import Colors from "@/constants/colors";
import { t } from "@/constants/i18n";
import { useApp, type ThemeMode, type AppSettings } from "@/context/AppContext";

export default function SettingsScreen() {
  const { settings, isDark, updateSettings } = useApp();
  const C = isDark ? Colors.dark : Colors.light;
  const lang = settings.language;
  const isRTL = lang === "ar";
  const insets = useSafeAreaInsets();
  const fontBold = isRTL ? "Tajawal_700Bold" : "Inter_700Bold";
  const fontMed = isRTL ? "Tajawal_500Medium" : "Inter_500Medium";
  const fontReg = isRTL ? "Tajawal_400Regular" : "Inter_400Regular";

  const webTopPadding = Platform.OS === "web" ? 67 : 0;
  const webBottomPadding = Platform.OS === "web" ? 34 : 0;

  const update = async (patch: Partial<AppSettings>) => {
    Haptics.selectionAsync();
    await updateSettings({ ...settings, ...patch });
  };

  const SectionHeader = ({ label }: { label: string }) => (
    <Text
      style={[
        styles.sectionHeader,
        {
          color: C.textMuted,
          fontFamily: fontMed,
          textAlign: isRTL ? "right" : "left",
        },
      ]}
    >
      {label}
    </Text>
  );

  const SettingRow = ({
    icon,
    label,
    value,
    right,
    onPress,
    showDivider = true,
  }: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    right?: React.ReactNode;
    onPress?: () => void;
    showDivider?: boolean;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.settingRow,
        isRTL && styles.rowReverse,
        { opacity: pressed && onPress ? 0.7 : 1 },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingRowLeft, isRTL && styles.rowReverse]}>
        <View style={[styles.settingIcon, { backgroundColor: C.primaryLight }]}> 
          {icon}
        </View>
        <View style={[{ flex: 1, minWidth: 0, maxWidth: '100%' }, isRTL && { alignItems: "flex-end" }]}> 
          <Text
            style={[
              styles.settingLabel,
              {
                color: C.text,
                fontFamily: fontMed,
                flexWrap: 'wrap',
                textAlign: isRTL ? 'right' : 'left',
                wordBreak: 'break-word', // for web
                width: '100%',
              },
            ]}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {label}
          </Text>
          {value && (
            <Text
              style={[
                styles.settingValue,
                {
                  color: C.textSecondary,
                  fontFamily: fontReg,
                  flexWrap: 'wrap',
                  textAlign: isRTL ? 'right' : 'left',
                  wordBreak: 'break-word',
                  width: '100%',
                },
              ]}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {value}
            </Text>
          )}
        </View>
      </View>
      {right && <View style={styles.settingRight}>{right}</View>}
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
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
        <Text
          style={[
            styles.headerTitle,
            {
              color: C.text,
              fontFamily: fontBold,
              textAlign: isRTL ? "center" : "center",
            },
          ]}
        >
          {t("settingsTitle", lang)}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 + webBottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <SectionHeader label={t("appearance", lang)} />

          <SettingRow
            icon={<Feather name="sun" size={16} color={C.primary} />}
            label={t("theme", lang)}
            right={
              <View style={[styles.segmented, { backgroundColor: C.surfaceSecondary }]}>
                {(["light", "dark", "system"] as ThemeMode[]).map((m) => (
                  <Pressable
                    key={m}
                    style={[
                      styles.segment,
                      settings.themeMode === m && { backgroundColor: C.primary },
                    ]}
                    onPress={() => update({ themeMode: m })}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        {
                          color: settings.themeMode === m ? "#fff" : C.textSecondary,
                          fontFamily: fontMed,
                        },
                      ]}
                    >
                      {m === "light"
                        ? t("lightMode", lang)
                        : m === "dark"
                          ? t("darkMode", lang)
                          : t("systemDefault", lang)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            }
          />

          <View style={[styles.divider, { backgroundColor: C.border }]} />

          <SettingRow
            icon={<Feather name="globe" size={16} color={C.primary} />}
            label={t("language", lang)}
            right={
              <View style={[styles.segmented, { backgroundColor: C.surfaceSecondary }]}>
                {(["en", "ar"] as const).map((l) => (
                  <Pressable
                    key={l}
                    style={[
                      styles.segment,
                      settings.language === l && { backgroundColor: C.primary },
                    ]}
                    onPress={() => update({ language: l })}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        {
                          color: settings.language === l ? "#fff" : C.textSecondary,
                          fontFamily: l === "ar" ? "Tajawal_500Medium" : "Inter_500Medium",
                        },
                      ]}
                    >
                      {l === "en" ? "EN" : "عر"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            }
          />

          <View style={[styles.divider, { backgroundColor: C.border }]} />

          <SettingRow
            icon={<Feather name="clock" size={16} color={C.primary} />}
            label={t("timeFormat", lang)}
            right={
              <View style={[styles.segmented, { backgroundColor: C.surfaceSecondary }]}>
                {(["12h", "24h"] as const).map((fmt) => (
                  <Pressable
                    key={fmt}
                    style={[
                      styles.segment,
                      settings.timeFormat === fmt && { backgroundColor: C.primary },
                    ]}
                    onPress={() => update({ timeFormat: fmt })}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        {
                          color: settings.timeFormat === fmt ? "#fff" : C.textSecondary,
                          fontFamily: fontMed,
                        },
                      ]}
                    >
                      {fmt === "12h" ? t("format12h", lang) : t("format24h", lang)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            }
          />
        </View>

        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <SectionHeader label={t("alarmSettings", lang)} />

          <SettingRow
            icon={<Feather name="bell" size={16} color={C.primary} />}
            label={t("persistentAlarm", lang)}
            value={t("persistentAlarmDesc", lang)}
            right={
              <Switch
                value={settings.persistentAlarm}
                onValueChange={(v) => update({ persistentAlarm: v })}
                trackColor={{ false: C.border, true: C.primary }}
                thumbColor={"#fff"}
              />
            }
          />

          <View style={[styles.divider, { backgroundColor: C.border }]} />

          <SettingRow
            icon={<Feather name="smartphone" size={16} color={C.primary} />}
            label={t("vibration", lang)}
            right={
              <Switch
                value={settings.vibration}
                onValueChange={(v) => update({ vibration: v })}
                trackColor={{ false: C.border, true: C.primary }}
                thumbColor={"#fff"}
              />
            }
          />
        </View>

        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <SectionHeader label={t("notifications", lang)} />
          <SettingRow
            icon={<Feather name="bell-off" size={16} color={C.primary} />}
            label={t("notifications", lang)}
            value={t("notificationsEnabled", lang)}
            right={
              <Pressable
                style={({ pressed }) => [
                  styles.openSettingsBtn,
                  { backgroundColor: C.primaryLight, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => Linking.openSettings()}
              >
                <Text style={[styles.openSettingsBtnText, { color: C.primary, fontFamily: fontMed }]}>
                  {t("openSettings", lang)}
                </Text>
              </Pressable>
            }
          />
        </View>

        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <SectionHeader label={t("about", lang)} />
          <View style={[styles.aboutRow, isRTL && styles.rowReverse]}>
            <View style={[styles.aboutIcon, { backgroundColor: C.primary }]}>
              <MaterialCommunityIcons name="pill" size={24} color="#fff" />
            </View>
            <View style={isRTL && { alignItems: "flex-end" }}>
              <Text style={[styles.aboutName, { color: C.text, fontFamily: fontBold }]}>
                {t("appName", lang)}
              </Text>
              <Text style={[styles.aboutDesc, { color: C.textSecondary, fontFamily: fontReg }]}>
                {t("description", lang)}
              </Text>
              <Text style={[styles.aboutVersion, { color: C.textMuted, fontFamily: fontReg }]}>
                {lang === "ar" ? "صنع بواسطة: اسامة ادم" : "Created by: Osama Adam"}
              </Text>
              <Text style={[styles.aboutVersion, { color: C.textMuted, fontFamily: fontReg }]}>
                {t("version", lang)} 1.3.0
              </Text>
            </View>
          </View>
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
  headerTitle: { fontSize: 28, letterSpacing: -0.5 },
  content: { padding: 16, gap: 16 },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 12,
  },
  settingRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { fontSize: 15 },
  settingValue: { fontSize: 12, marginTop: 1 },
  settingRight: { flexShrink: 0 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 12 },
  segmented: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  segment: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: { fontSize: 12 },
  openSettingsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  openSettingsBtnText: { fontSize: 13 },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
  },
  aboutIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  aboutName: { fontSize: 18 },
  aboutDesc: { fontSize: 13, marginTop: 2 },
  aboutVersion: { fontSize: 12, marginTop: 4 },
  rowReverse: { flexDirection: "row-reverse" },
});
