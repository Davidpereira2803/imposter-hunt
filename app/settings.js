import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGameStore } from "../src/store/gameStore";
import { useAdConsentContext } from "../src/contexts/AdConsentContext";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import Card from "../src/components/ui/Card";
import { space, palette, type } from "../src/constants/theme";
import { Icon } from "../src/constants/icons";

const TUTORIAL_SEEN_KEY = "imposter-hunt-tutorial-seen";
const PRIVACY_POLICY_URL = "https://davidpereira2803.github.io/imposter-hunt/privacy/";

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

  const [showDebug, setShowDebug] = useState(__DEV__);

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

  const handlePrivacyPolicy = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const supported = await Linking.canOpenURL(PRIVACY_POLICY_URL);
    
    if (supported) {
      await Linking.openURL(PRIVACY_POLICY_URL);
    } else {
      Alert.alert("Error", "Cannot open privacy policy link");
    }
  };

  const handleClearData = async () => {
    Alert.alert(
      "Clear Data",
      "Remove all saved data?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            await clearStorage();
            Alert.alert("Success", "Data cleared");
          }
        }
      ]
    );
  };

  const handleManagePrivacy = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await showConsentForm();
      Alert.alert("Updated", "Privacy settings saved");
    } catch (error) {
      Alert.alert("Error", error.message || "Could not open settings");
    }
  };

  const handleResetConsent = async () => {
    Alert.alert(
      "Reset Consent",
      "This will reset your consent preferences and show the form again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await resetConsent();
              await new Promise(resolve => setTimeout(resolve, 500));
              await showConsentForm();
              Alert.alert("Success", "Consent preferences updated");
            } catch (error) {
              Alert.alert("Error", error.message || "Could not reset consent");
            }
          }
        }
      ]
    );
  };

  const getConsentStatus = () => {
    if (!consentInfo) return "Unknown";
    
    const statusMap = {
      0: "Unknown",
      1: "Required",
      2: "Not Required",
      3: "Obtained",
    };
    
    return statusMap[consentInfo.status] || `Status ${consentInfo.status}`;
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={palette.text} />
          </TouchableOpacity>
          <Title style={styles.title}>Settings</Title>
          <View style={styles.backButton} />
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="help-circle" size={20} color={palette.textDim} />
            <Text style={styles.sectionTitle}>Help</Text>
          </View>
          
          <Button 
            title="How to Play"
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
            <Text style={styles.sectionTitle}>Privacy & Ads</Text>
          </View>
          
          <Card style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Icon name="information" size={18} color={palette.textDim} />
              <Text style={styles.infoLabel}>Consent Status</Text>
            </View>
            <Text style={styles.infoValue}>
              {isLoading ? "..." : getConsentStatus()}
            </Text>
          </Card>

          <Card style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Icon name="ads" size={18} color={palette.textDim} />
              <Text style={styles.infoLabel}>Ads Enabled</Text>
            </View>
            <Text style={[
              styles.infoValue,
              { color: canShowAds ? palette.success : palette.danger }
            ]}>
              {isLoading ? "..." : canShowAds ? "Yes" : "No"}
            </Text>
          </Card>

          <Card style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Icon name="account" size={18} color={palette.textDim} />
              <Text style={styles.infoLabel}>Personalized</Text>
            </View>
            <Text style={[
              styles.infoValue,
              { color: canShowPersonalizedAds ? palette.warn : palette.success }
            ]}>
              {isLoading ? "..." : canShowPersonalizedAds ? "Yes" : "No"}
            </Text>
          </Card>

          <Button 
            title="Privacy Policy"
            onPress={handlePrivacyPolicy}
            variant="ghost"
            size="md"
            icon={<Icon name="file-document" size={20} color={palette.text} />}
            style={styles.privacyBtn}
          />

          <Button 
            title="Manage Privacy"
            onPress={handleManagePrivacy}
            variant="primary"
            size="md"
            disabled={isLoading}
            icon={<Icon name="shield-account" size={20} color={palette.text} />}
          />

          {__DEV__ && (
            <Button 
              title="Reset Consent (Dev)"
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
            <Text style={styles.sectionTitle}>Game Data</Text>
          </View>
          
          <Button 
            title="Clear All Data"
            onPress={handleClearData}
            variant="danger"
            size="md"
            icon={<Icon name="delete" size={20} color={palette.text} />}
          />
        </View>

        <View style={styles.version}>
          <Icon name="information-outline" size={16} color={palette.textDim} />
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
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
});