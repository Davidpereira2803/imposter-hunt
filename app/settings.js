import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import { useAdConsentContext } from "../src/contexts/AdConsentContext";

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

  const handleClearData = async () => {
    Alert.alert(
      "Clear All Data",
      "This will remove all saved player names and preferences. Are you sure?",
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
            Alert.alert("Success", "All data has been cleared.");
          }
        }
      ]
    );
  };

  const handleManagePrivacy = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await showConsentForm();
      Alert.alert("Privacy Settings Updated", "Your ad preferences have been saved.");
    } catch (error) {
      Alert.alert("Error", "Could not open privacy settings. Please try again.");
    }
  };

  const handleResetConsent = async () => {
    Alert.alert(
      "Reset Ad Consent",
      "This will reset all ad consent settings. The consent form will appear again.",
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
            Alert.alert("Success", "Ad consent has been reset.");
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Ads</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Ad Status:</Text>
          <Text style={styles.infoValue}>
            {isLoading ? "Loading..." : canShowAds ? "Enabled" : "Disabled"}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Personalized Ads:</Text>
          <Text style={styles.infoValue}>
            {isLoading ? "Loading..." : canShowPersonalizedAds ? "Yes" : "No"}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={handleManagePrivacy}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Manage Privacy Settings</Text>
        </TouchableOpacity>

        {__DEV__ && (
          <TouchableOpacity 
            style={[styles.button, styles.warningButton]} 
            onPress={handleResetConsent}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Reset Ad Consent (Dev Only)</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game Data</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.dangerButton]} 
          onPress={handleClearData}
        >
          <Text style={styles.buttonText}>Clear All Game Data</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]} 
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>Back to Menu</Text>
      </TouchableOpacity>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Imposter Hunt v1.0.0</Text>
        <Text style={styles.versionSubtext}>
          {__DEV__ ? "Development Mode" : "Production"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    color: "#aaa",
    fontSize: 16,
    fontWeight: "600",
  },
  infoValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#23a6f0",
  },
  secondaryButton: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
  },
  dangerButton: {
    backgroundColor: "#e63946",
  },
  warningButton: {
    backgroundColor: "#ffc107",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  versionContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  versionText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  versionSubtext: {
    color: "#444",
    fontSize: 12,
    marginTop: 4,
  },
});