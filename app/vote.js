import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, BackHandler, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import HUD from "../src/components/HUD";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import Card from "../src/components/ui/Card";
import { space, palette, type } from "../src/constants/theme";

export default function Vote() {
  const router = useRouter();
  const { players, alive, round, eliminatePlayer, aliveCount: getAliveCount } = useGameStore();
  const [voter, setVoter] = useState(0);
  const [selected, setSelected] = useState(null);

  const aliveNow = getAliveCount ? getAliveCount() : (players?.length || 0);
  const aliveIndexes = players
    ?.map((_, i) => i)
    .filter((i) => alive?.[i]) || [];

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Back to Round", "Cancel voting?", [
        { text: "No", style: "cancel" },
        { text: "Yes", onPress: () => router.back() }
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (!players?.length || !alive?.length) {
      router.replace("/setup");
    }
  }, [players, alive]);

  const confirmVote = async () => {
    if (selected == null) {
      Alert.alert("No Selection", "Choose a player first");
      return;
    }

    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}

    if (voter < aliveIndexes.length - 1) {
      setVoter(voter + 1);
      setSelected(null);
    } else {
      const outcome = eliminatePlayer(selected);

      if (outcome === "civilians") {
        router.replace({ pathname: "/results", params: { outcome: "civilians" } });
        return;
      }

      if (outcome === "imposter") {
        router.replace({ pathname: "/results", params: { outcome: "imposter" } });
        return;
      }

      const alivePlayers = players.filter((_, i) => alive[i]);
      if (alivePlayers.length === 2) {
        router.replace({ pathname: "/results", params: { outcome: "imposter" } });
        return;
      }

      console.log("Navigating to imposter-guess");
      router.replace("/imposter-guess");
    }
  };

  if (!players?.length) return null;

  const currentVoter = players[aliveIndexes[voter]];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <HUD round={round || 1} aliveCount={aliveNow} />
          <Title style={styles.title}>Vote</Title>
          <Card style={styles.voterCard}>
            <Text style={styles.voterLabel}>Voting Now</Text>
            <Text style={styles.voterName}>{currentVoter}</Text>
          </Card>
        </View>

        <View style={styles.playerGrid}>
          {aliveIndexes
            .filter((i) => i !== aliveIndexes[voter])
            .map((idx) => (
              <Button
                key={idx}
                title={players[idx]}
                onPress={() => {
                  setSelected(idx);
                  Haptics.selectionAsync().catch(() => {});
                }}
                variant={selected === idx ? "primary" : "ghost"}
                size="lg"
              />
            ))}
        </View>

        <View style={styles.actions}>
          <Button
            title={selected != null ? `Eject ${players[selected]}` : "Select Player"}
            onPress={confirmVote}
            variant="danger"
            size="lg"
            disabled={selected == null}
          />

          <Button
            title="Back to Round"
            onPress={() => router.back()}
            variant="ghost"
            size="md"
          />
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
    marginBottom: space.xl,
  },
  title: {
    marginVertical: space.lg,
  },
  voterCard: {
    alignItems: "center",
    paddingVertical: space.lg,
  },
  voterLabel: {
    color: palette.textDim,
    fontSize: type.small,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: space.xs,
  },
  voterName: {
    color: palette.text,
    fontSize: type.h2,
    fontWeight: "900",
  },
  playerGrid: {
    gap: space.md,
    marginBottom: space.xl,
  },
  actions: {
    gap: space.md,
  },
});
