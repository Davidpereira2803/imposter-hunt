import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, BackHandler, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import { AdBanner } from "../src/components/AdBanner";

export default function Home() {
  const router = useRouter();
  const { players, topicKey } = useGameStore();

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Exit App", "Are you sure you want to exit?", [
        { text: "Cancel", style: "cancel" },
        { text: "Exit", onPress: () => BackHandler.exitApp() }
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  const handleQuickStart = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    if (players?.length >= 3 && topicKey) {
      router.push("/role");
    } else {
      router.push("/setup");
    }
  };

  const handleNewGame = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    router.push("/setup");
  };

  const handleSettings = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push("/settings");
  };

  const canQuickStart = players?.length >= 3 && topicKey;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎭 Imposter Hunt</Text>
        <Text style={styles.subtitle}>Find the imposter among you</Text>

        <View style={styles.buttonContainer}>
          {canQuickStart && (
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={handleQuickStart}
            >
              <Text style={styles.buttonText}>Quick Start</Text>
              <Text style={styles.buttonSubtext}>
                {players?.length} players · {topicKey}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={handleNewGame}
          >
            <Text style={styles.buttonText}>New Game</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.tertiaryButton]} 
            onPress={handleSettings}
          >
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ad Banner at bottom */}
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 48,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#06d6a0",
  },
  secondaryButton: {
    backgroundColor: "#23a6f0",
  },
  tertiaryButton: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  buttonSubtext: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
    opacity: 0.8,
  },
});
