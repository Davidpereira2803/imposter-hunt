import React, { useState, useEffect } from "react";
import { View, StyleSheet, BackHandler, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import Card from "../src/components/ui/Card";
import { space, palette, type } from "../src/constants/theme";
import { Text } from "react-native";

export default function Role() {
  const router = useRouter();
  const { players, imposterIndex, secretWord } = useGameStore();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Exit Game", "Return to setup?", [
        { text: "Cancel", style: "cancel" },
        { text: "Exit", onPress: () => router.replace("/setup") }
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (!players?.length || imposterIndex == null) {
      router.replace("/setup");
    }
  }, [players, imposterIndex]);

  const handleReveal = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    setRevealed(true);
  };

  const handleNext = async () => {
    try { await Haptics.selectionAsync(); } catch {}
    setRevealed(false);

    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      router.replace("/round");
    }
  };

  if (!players?.length) return null;

  const currentPlayer = players[currentPlayerIndex];
  const isImposter = currentPlayerIndex === imposterIndex;
  const isLastPlayer = currentPlayerIndex === players.length - 1;

  return (
    <Screen>
      <View style={styles.content}>
        {!revealed ? (
          <>
            <Title style={styles.title}>Pass to</Title>
            <Title variant="giant" style={styles.playerName}>{currentPlayer}</Title>
            <Button 
              title="Reveal Role"
              onPress={handleReveal}
              variant="primary"
              size="lg"
              style={styles.revealBtn}
            />
          </>
        ) : (
          <>
            {isImposter ? (
              <>
                <Title variant="h2" style={styles.roleLabel}>You Are</Title>
                <Title variant="giant" style={[styles.role, styles.imposterText]}>
                  IMPOSTER
                </Title>
                <Card style={styles.infoCard}>
                  <Text style={styles.infoText}>
                    Blend in. Guess the secret word to win.
                  </Text>
                </Card>
              </>
            ) : (
              <>
                <Title variant="h2" style={styles.roleLabel}>Your Word</Title>
                <Card style={styles.wordCard}>
                  <Title variant="giant" style={styles.wordText}>{secretWord}</Title>
                </Card>
                <Card style={styles.infoCard}>
                  <Text style={styles.infoText}>
                    Give hints. Find the imposter.
                  </Text>
                </Card>
              </>
            )}

            <Button 
              title={isLastPlayer ? "Start Round" : "Hide & Pass"}
              onPress={handleNext}
              variant="success"
              size="lg"
              style={styles.nextBtn}
            />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: space.lg,
  },
  title: {
    marginBottom: space.sm,
  },
  playerName: {
    marginBottom: space.xl * 2,
  },
  revealBtn: {
    minWidth: 200,
  },
  roleLabel: {
    color: palette.textDim,
    marginBottom: space.md,
  },
  role: {
    marginBottom: space.xl,
  },
  imposterText: {
    color: palette.danger,
  },
  wordCard: {
    marginBottom: space.xl,
    paddingVertical: space.xl,
    alignItems: "center",
  },
  wordText: {
    color: palette.success,
  },
  infoCard: {
    marginBottom: space.xl,
    alignItems: "center",
  },
  infoText: {
    color: palette.textDim,
    fontSize: type.body,
    textAlign: "center",
  },
  nextBtn: {
    minWidth: 200,
  },
});
