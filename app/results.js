import React, { useEffect } from "react";
import { View, Text, StyleSheet, BackHandler, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import Card from "../src/components/ui/Card";
import { space, palette, type } from "../src/constants/theme";

export default function Results() {
  const router = useRouter();
  const { outcome } = useLocalSearchParams();
  const { players, imposterIndex, secretWord, startMatch, resetMatch } = useGameStore();

  const imposterWon = outcome === "imposter";
  const imposterName = players?.[imposterIndex] || "Unknown";

  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const triggerHaptics = async () => {
      try {
        if (imposterWon) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } else {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch {}
    };
    triggerHaptics();
  }, [imposterWon]);

  const handlePlayAgain = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    
    const success = startMatch();
    if (success) {
      router.replace("/role");
    } else {
      Alert.alert("Error", "Failed to start new game");
    }
  };

  const handleNewSetup = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    resetMatch();
    router.replace("/setup");
  };

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.header}>
          <Title style={styles.emoji}>
            {imposterWon ? "😈" : "🎉"}
          </Title>
          <Title 
            variant="h1" 
            style={[styles.outcome, imposterWon ? styles.imposterWin : styles.civilianWin]}
          >
            {imposterWon ? "Imposter Wins!" : "Civilians Win!"}
          </Title>
        </View>

        <View style={styles.info}>
          <Card style={styles.infoCard}>
            <Text style={styles.label}>Secret Word</Text>
            <Text style={styles.wordText}>{secretWord}</Text>
          </Card>

          <Card style={styles.infoCard}>
            <Text style={styles.label}>The Imposter</Text>
            <Text style={[styles.imposterText]}>{imposterName}</Text>
          </Card>
        </View>

        <View style={styles.actions}>
          <Button
            title="Play Again"
            onPress={handlePlayAgain}
            variant="success"
            size="lg"
          />

          <Button
            title="New Setup"
            onPress={handleNewSetup}
            variant="ghost"
            size="md"
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: space.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: space.xl * 2,
  },
  emoji: {
    fontSize: 64,
    marginBottom: space.lg,
  },
  outcome: {
    fontSize: type.h1 * 1.2,
  },
  imposterWin: {
    color: palette.danger,
  },
  civilianWin: {
    color: palette.success,
  },
  info: {
    gap: space.lg,
    marginBottom: space.xl * 2,
  },
  infoCard: {
    alignItems: "center",
    paddingVertical: space.xl,
  },
  label: {
    color: palette.textDim,
    fontSize: type.small,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: space.sm,
  },
  wordText: {
    color: palette.text,
    fontSize: type.h1,
    fontWeight: "900",
  },
  imposterText: {
    color: palette.danger,
    fontSize: type.h1,
    fontWeight: "900",
  },
  actions: {
    gap: space.md,
  },
});
