import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, BackHandler, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import Screen from "../src/components/ui/Screen";
import Card from "../src/components/ui/Card";
import Button from "../src/components/ui/Button";
import Title from "../src/components/ui/Title";
import { space, palette, type } from "../src/constants/theme";
import { Icon } from "../src/constants/icons";

export default function Vote() {
  const router = useRouter();
  const { 
    players, 
    alive,
    eliminatePlayer, 
    checkGameOver,
    nextRound 
  } = useGameStore();

  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Go Back",
        "Return to round?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Yes", onPress: () => router.back() }
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  const handleSelectPlayer = async (index) => {
    setSelectedPlayer(index);
    try { await Haptics.selectionAsync(); } catch {}
  };

  const handleVote = async () => {
    if (selectedPlayer === null) {
      Alert.alert("Select Player", "Choose someone to vote out");
      return;
    }

    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}

    const outcome = eliminatePlayer?.(selectedPlayer);
    
    if (outcome === "civilians" || outcome === "imposter") {
      router.replace({
        pathname: "/results",
        params: { outcome }
      });
    } else {
      nextRound?.();
      router.replace("/round");
    }
  };

  const handleBack = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    router.back();
  };

  if (!players?.length || !alive) {
    return null;
  }

  const alivePlayers = players
    .map((name, index) => ({ name, index }))
    .filter((_, index) => alive[index] === true);

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={palette.text} />
          </TouchableOpacity>
          <Title style={styles.title}>Vote</Title>
          <View style={styles.backButton} />
        </View>

        <Text style={styles.subtitle}>Who is the imposter?</Text>

        <ScrollView 
          style={styles.playerList}
          contentContainerStyle={styles.playerListContent}
          showsVerticalScrollIndicator={false}
        >
          {alivePlayers.length === 0 ? (
            <Text style={styles.emptyText}>No players available</Text>
          ) : (
            alivePlayers.map((player) => {
              const isSelected = selectedPlayer === player.index;
              
              return (
                <Card
                  key={player.index}
                  onPress={() => handleSelectPlayer(player.index)}
                  style={[
                    styles.playerCard,
                    isSelected && styles.selectedCard
                  ]}
                >
                  <Text style={styles.playerName}>{player.name}</Text>
                  {isSelected && (
                    <Icon name="check-circle" size={24} color={palette.success} />
                  )}
                </Card>
              );
            })
          )}
        </ScrollView>

        <View style={styles.actions}>
          <Button
            title="Confirm Vote"
            onPress={handleVote}
            variant="danger"
            size="lg"
            disabled={selectedPlayer === null}
            icon={<Icon name="vote" size={24} color={palette.text} />}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: space.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.lg,
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
  subtitle: {
    fontSize: type.h3,
    fontWeight: "700",
    color: palette.textDim,
    textAlign: "center",
    marginBottom: space.xl,
  },
  playerList: {
    flex: 1,
  },
  playerListContent: {
    gap: space.md,
    paddingBottom: space.md,
  },
  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 60,
  },
  selectedCard: {
    borderColor: palette.success,
    borderWidth: 2,
  },
  playerName: {
    fontSize: type.h4,
    fontWeight: "700",
    color: palette.text,
  },
  emptyText: {
    fontSize: type.body,
    color: palette.textDim,
    textAlign: "center",
    marginTop: space.xl,
  },
  actions: {
    paddingBottom: space.xl,
    paddingTop: space.md,
  },
});
