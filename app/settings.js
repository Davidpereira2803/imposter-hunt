import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGameStore } from "../src/store/gameStore";
import { useAdConsentContext } from "../src/contexts/AdConsentContext";
import { AdBanner } from "../src/components/AdBanner";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import Card from "../src/components/ui/Card";
import { space, palette, type } from "../src/constants/theme";
import { Icon } from "../src/constants/icons";
import { useLanguageStore } from "../src/store/languageStore";
import { useTranslation } from "../src/lib/useTranslation";
import i18n from "../src/lib/i18n";


const TUTORIAL_SEEN_KEY = "imposter-hunt-tutorial-seen";
const PRIVACY_POLICY_URL = "https://davidpereira2803.github.io/imposter-hunt/Privacy";
const AVAILABLE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "pt", name: "Português" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "lu", name: "Lëtzebuergesch" },
  { code: "it", name: "Italiano" },
  { code: "es", name: "Español" }
];

export default function Settings() {
  const router = useRouter();
  const { clearStorage } = useGameStore();
  const { 
    canShowAds, 
    canShowPersonalizedAds, 
    showConsentForm,
    resetConsent,
    consentInfo,
    isLoading 
  } = useAdConsentContext();

  const { locale: currentLanguage, setLocale } = useLanguageStore();
  const { t } = useTranslation();

  const [showDebug, setShowDebug] = useState(__DEV__);
  const [showLanguages, setShowLanguages] = useState(false);
  const SUPPORTED_LANGUAGES = AVAILABLE_LANGUAGES.filter(l => i18n?.translations?.[l.code]);

  const handleLanguageSelect = async (langCode) => {
    try { await Haptics.selectionAsync(); } catch {}
    try {
      if (!i18n?.translations?.[langCode]) return;
      setLocale(langCode);
      setShowLanguages(false);
    } catch {}
  };
  const getCurrentLanguageName = () =>
    SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.name || "English";

  const handleBack = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    router.back();
  };

  const handleViewTutorial = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    
    await AsyncStorage.removeItem(TUTORIAL_SEEN_KEY);
    router.push("/tutorial");
  };

  const getConsentStatus = () => {
    if (!consentInfo) return { text: t("settings.consent.unknown", "Unknown"), icon: "help-circle", color: palette.textDim };
    const statusMap = {
      0: { text: t("settings.consent.unknown", "Unknown"), icon: "help-circle", color: palette.textDim },
      1: { text: t("settings.consent.required", "Required"), icon: "alert-circle", color: palette.warn },
      2: { text: t("settings.consent.notRequired", "Not Required"), icon: "check-circle", color: palette.success },
      3: { text: t("settings.consent.obtained", "Obtained"), icon: "check-circle", color: palette.success },
    };
    return statusMap[consentInfo.status] ?? { text: `${consentInfo.status}`, icon: "information", color: palette.textDim };
  };

  const handlePrivacyPolicy = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const supported = await Linking.canOpenURL(PRIVACY_POLICY_URL);
    if (supported) {
      await Linking.openURL(PRIVACY_POLICY_URL);
    } else {
      Alert.alert(t("common.error", "Error"), t("settings.cannotOpenPrivacy", "Cannot open privacy policy link"));
    }
  };

  const handleClearData = async () => {
    Alert.alert(
      t("settings.clearDataTitle", "Clear Data"),
      t("settings.clearDataMessage", "Remove all saved data?"),
      [
        { text: t("common.cancel", "Cancel"), style: "cancel" },
        {
          text: t("settings.clearData", "Clear"),
          style: "destructive",
          onPress: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            await clearStorage();
            Alert.alert(t("common.success", "Success"), t("settings.dataCleared", "Data cleared"));
          }
        }
      ]
    );
  };

  const handleManagePrivacy = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await showConsentForm();
      Alert.alert(t("settings.updated", "Updated"), t("settings.privacyUpdatedMessage", "Privacy settings saved"));
    } catch (error) {
      Alert.alert(t("common.error", "Error"), error?.message || t("settings.couldNotOpen", "Could not open settings"));
    }
  };

  const handleResetConsent = async () => {
    Alert.alert(
      t("settings.resetConsentTitle", "Reset Consent"),
      t("settings.resetConsentMessage", "This will reset your consent preferences and show the form again."),
      [
        { text: t("common.cancel", "Cancel"), style: "cancel" },
        {
          text: t("settings.reset", "Reset"),
          style: "destructive",
          onPress: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await resetConsent();
              await new Promise(resolve => setTimeout(resolve, 500));
              await showConsentForm();
              Alert.alert(t("common.success", "Success"), t("settings.consentUpdated", "Consent preferences updated"));
            } catch (error) {
              Alert.alert(t("common.error", "Error"), error?.message || t("settings.couldNotReset", "Could not reset consent"));
            }
          }
        }
      ]
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={palette.text} />
          </TouchableOpacity>
          <Title style={styles.title}>{t("settings.title", "Settings")}</Title>
          <View style={styles.backButton} />
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="earth" size={20} color={palette.textDim} />
            <Text style={styles.sectionTitle}>{t("settings.language", "Language")}</Text>
          </View>

          <Card style={styles.languageCard} onPress={() => setShowLanguages(v => !v)}>
            <View style={styles.languageRow}>
              <Text style={styles.settingLabel}>{getCurrentLanguageName()}</Text>
              <Icon name={showLanguages ? "chevron-up" : "chevron-down"} size={20} color={palette.textDim} />
            </View>
          </Card>

          {showLanguages && (
            <View style={styles.languageList}>
              {SUPPORTED_LANGUAGES.map((lang) => {
                const active = currentLanguage === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => handleLanguageSelect(lang.code)}
                    style={[styles.languageItem, active && styles.languageItemActive]}
                  >
                    <Text style={[styles.languageItemText, active && styles.languageItemTextActive]}>
                      {lang.name}
                    </Text>
                    {active && <Icon name="check" size={18} color={palette.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="help-circle" size={20} color={palette.textDim} />
            <Text style={styles.sectionTitle}>{t("settings.help", "Help")}</Text>
          </View>

          <Button
            title={t("home.howToPlay", "How to Play")}
            onPress={handleViewTutorial}
            variant="primary"
            size="md"
            icon={<Icon name="book-open" size={20} color={palette.text} />}
          />
        </View>

        {/* Privacy & Ads Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="shield-check" size={20} color={palette.textDim} />
            <Text style={styles.sectionTitle}>{t("settings.privacyAndAds", "Privacy & Ads")}</Text>
          </View>

          <Card style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Icon name="shield-check" size={18} color={palette.textDim} />
              <Text style={styles.infoLabel}>{t("settings.consentStatus", "Consent Status")}</Text>
            </View>
            {isLoading ? (
              <Text style={styles.infoValue}>...</Text>
            ) : (
              <View style={styles.statusBadge}>
                <Icon name={getConsentStatus().icon} size={16} color={getConsentStatus().color} />
                <Text style={[styles.statusText, { color: getConsentStatus().color }]}>
                  {getConsentStatus().text}
                </Text>
              </View>
            )}
          </Card>

          <Card style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Icon name="advertisements" size={18} color={palette.textDim} />
              <Text style={styles.infoLabel}>{t("settings.adsEnabled", "Ads Enabled")}</Text>
            </View>
            <Text style={[styles.infoValue, { color: canShowAds ? palette.success : palette.danger }]}>
              {isLoading ? "..." : canShowAds ? t("common.yes", "Yes") : t("common.no", "No")}
            </Text>
          </Card>

          <Card style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Icon name="account" size={18} color={palette.textDim} />
              <Text style={styles.infoLabel}>{t("settings.personalized", "Personalized")}</Text>
            </View>
            <Text style={[styles.infoValue, { color: canShowPersonalizedAds ? palette.warn : palette.success }]}>
              {isLoading ? "..." : canShowPersonalizedAds ? t("common.yes", "Yes") : t("common.no", "No")}
            </Text>
          </Card>

          <Button
            title={t("settings.privacyPolicy", "Privacy Policy")}
            onPress={handlePrivacyPolicy}
            variant="ghost"
            size="md"
            icon={<Icon name="file-document" size={20} color={palette.text} />}
            style={styles.privacyBtn}
          />

          <Button
            title={t("settings.managePrivacy", "Manage Privacy")}
            onPress={handleManagePrivacy}
            variant="primary"
            size="md"
            disabled={isLoading}
            icon={<Icon name="shield-account" size={20} color={palette.text} />}
          />

          {__DEV__ && (
            <Button
              title={t("settings.resetConsentDev", "Reset Consent (Dev)")}
              onPress={handleResetConsent}
              variant="warn"
              size="md"
              disabled={isLoading}
              style={styles.devBtn}
              icon={<Icon name="refresh" size={20} color="#000" />}
            />
          )}
        </View>

        {/* Game Data Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="database" size={20} color={palette.textDim} />
            <Text style={styles.sectionTitle}>{t("settings.gameData", "Game Data")}</Text>
          </View>

          <Button
            title={t("settings.clearAllData", "Clear All Data")}
            onPress={handleClearData}
            variant="danger"
            size="md"
            icon={<Icon name="delete" size={20} color={palette.text} />}
          />
        </View>

        <View style={styles.version}>
          <Icon name="information-outline" size={16} color={palette.textDim} />
          <Text style={styles.versionText}>{t("settings.version", "Version")} 1.0.7</Text>
        </View>
      </ScrollView>

      <AdBanner />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 60,
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  section: {
    marginBottom: space.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    marginBottom: space.md,
  },
  sectionTitle: {
    color: palette.textDim,
    fontSize: type.small,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.sm,
    padding: space.md,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  infoLabel: {
    color: palette.textDim,
    fontSize: type.body,
    fontWeight: "600",
  },
  infoValue: {
    color: palette.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  privacyBtn: {
    marginBottom: space.sm,
  },
  devBtn: {
    marginTop: space.sm,
  },
  version: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
    marginTop: space.xl,
  },
  versionText: {
    color: palette.textDim,
    fontSize: type.small,
  },
  languageCard: {
    padding: space.md,
    marginBottom: space.sm,
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  languageList: {
    gap: space.xs,
    marginBottom: space.md,
  },
  languageItem: {
    padding: space.md,
    backgroundColor: palette.panel,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  languageItemActive: {
    backgroundColor: palette.primary + "22",
  },
  languageItemText: {
    color: palette.text,
    fontSize: type.body,
    fontWeight: "600",
  },
  languageItemTextActive: {
    color: palette.primary,
    fontWeight: "800",
  },
  settingCard: {
    marginBottom: space.sm,
    padding: space.md,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLabel: {
    color: palette.text,
    fontSize: type.body,
    fontWeight: "600",
  },
  volumeText: {
    color: palette.textDim,
    fontSize: type.small,
    textAlign: 'center',
    marginTop: space.sm,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: 12,
    backgroundColor: palette.panel,
  },
  statusText: {
    fontSize: type.small,
    fontWeight: "700",
  },
});