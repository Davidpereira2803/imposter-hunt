import React from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
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

const TUTORIAL_SEEN_KEY = "imposter-hunt-tutorial-seen";

export default function Settings() {
  const router = useRouter();
  const { clearStorage } = useGameStore();
  const { 
    canShowAds, 
    canShowPersonalizedAds, 
    showConsentForm, 
    resetConsent,
    isLoading 
  } = useAdConsentContext();

  const handleViewTutorial = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    
    await AsyncStorage.removeItem(TUTORIAL_SEEN_KEY);
    router.push("/tutorial");
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
      Alert.alert("Error", "Could not open settings");
    }
  };

  const handleResetConsent = async () => {
    Alert.alert(
      "Reset Consent",
      "Reset ad preferences?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            await resetConsent();
            Alert.alert("Success", "Consent reset");
          }
        }
      ]
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Title style={styles.title}>Settings</Title>

        {/* Help Section - NEW */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help</Text>
          
          <Button 
            title="How to Play"
            onPress={handleViewTutorial}
            variant="primary"
            size="md"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Ads</Text>
          
          <Card style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ads</Text>
            <Text style={styles.infoValue}>
              {isLoading ? "..." : canShowAds ? "On" : "Off"}
            </Text>
          </Card>

          <Card style={styles.infoRow}>
            <Text style={styles.infoLabel}>Personalized</Text>
            <Text style={styles.infoValue}>
              {isLoading ? "..." : canShowPersonalizedAds ? "Yes" : "No"}
            </Text>
          </Card>

          <Button 
            title="Manage Privacy"
            onPress={handleManagePrivacy}
            variant="primary"
            size="md"
            disabled={isLoading}
          />

          {__DEV__ && (
            <Button 
              title="Reset Consent (Dev)"
              onPress={handleResetConsent}
              variant="warn"
              size="md"
              disabled={isLoading}
              style={styles.devBtn}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Data</Text>
          
          <Button 
            title="Clear All Data"
            onPress={handleClearData}
            variant="danger"
            size="md"
          />
        </View>

        <Button 
          title="Back"
          onPress={() => router.back()}
          variant="ghost"
          size="md"
          style={styles.backBtn}
        />

        <View style={styles.version}>
          <Text style={styles.versionText}>v1.0.0</Text>
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
  title: {
    marginBottom: space.xl,
  },
  section: {
    marginBottom: space.xl,
  },
  sectionTitle: {
    color: palette.textDim,
    fontSize: type.small,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: space.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.sm,
    padding: space.md,
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
  devBtn: {
    marginTop: space.sm,
  },
  backBtn: {
    marginTop: space.lg,
  },
  version: {
    alignItems: "center",
    marginTop: space.xl,
  },
  versionText: {
    color: palette.textDim,
    fontSize: type.small,
  },
});