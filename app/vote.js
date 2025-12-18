import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, BackHandler, TouchableOpacity, ScrollView, Animated } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import Screen from "../src/components/ui/Screen";
import Card from "../src/components/ui/Card";
import Button from "../src/components/ui/Button";
import Title from "../src/components/ui/Title";
import { space, palette, type, radii } from "../src/constants/theme";
import { Icon } from "../src/constants/icons";
import { useTranslation } from "../src/lib/useTranslation";
import EliminationModal from "../src/components/EliminationModal";

export default function Vote() {
  const router = useRouter();
  const { t } = useTranslation();
  const { 
    players, 
    alive, 
    eliminatePlayer, 
    nextRound,
    roles,
    round,
    aliveCount
  } = useGameStore();

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showEliminationModal, setShowEliminationModal] = useState(false);
  const [eliminatedPlayerData, setEliminatedPlayerData] = useState(null);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        t("vote.goBackTitle", "Go Back"),
        t("vote.goBackMessage", "Return to round?"),
        [
          { text: t("common.cancel", "Cancel"), style: "cancel" },
          { text: t("common.yes", "Yes"), onPress: () => router.back() }
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [t]);

  const handleSelectPlayer = (index) => {
    setSelectedPlayer(index);
    Animated.spring(scaleAnim, {
      toValue: 1.05,
      useNativeDriver: true
    }).start();
  };

  const handleVote = async () => {
    if (selectedPlayer === null) return;
    
    Alert.alert(
      t("vote.confirmTitle", "Confirm Vote"),
      t("vote.confirmMessage", { player: players[selectedPlayer] }),
      [
        { text: t("common.cancel"), style: "cancel" },
        { 
          text: t("vote.eliminate", "Eliminate"), 
          style: "destructive",
          onPress: executeVote 
        }
      ]
    );
  };

  const executeVote = async () => {
    if (selectedPlayer === null) {
      Alert.alert(
        t("vote.selectPlayerTitle", "Select Player"),
        t("vote.selectPlayerMessage", "Choose someone to vote out")
      );
      return;
    }

    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}

    const eliminatedRole = roles?.[selectedPlayer];
    
    const outcome = eliminatePlayer?.(selectedPlayer);
    
    if (outcome === "jester") {
      router.replace({
        pathname: "/results",
        params: {
          winner: "jester",
          eliminatedPlayer: players[selectedPlayer],
        },
      });
      return;
    }
    
    if (outcome === "civilians") {
      router.replace({
        pathname: "/results",
        params: { winner: "civilians" }
      });
      return;
    }
    
    if (outcome === "imposter") {
      router.replace({
        pathname: "/results",
        params: { winner: "imposter" }
      });
      return;
    }
    
    const eliminatedName = players[selectedPlayer];
    const remaining = aliveCount ? aliveCount() : 0;
    
    setEliminatedPlayerData({
      name: eliminatedName,
      remainingCount: remaining,
      nextRound: (round || 1) + 1
    });
    
    setShowEliminationModal(true);
    
    try { 
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); 
    } catch {}
  };

  const handleContinueToNextRound = async () => {
    try { 
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
    } catch {}
    
    setShowEliminationModal(false);
    
    setTimeout(() => {
      nextRound?.();
      router.replace("/round");
    }, 300);
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
          <Title style={styles.title}>{t("vote.title", "Vote")}</Title>
          <View style={styles.backButton} />
        </View>

        <Text style={styles.subtitle}>{t("vote.subtitle", "Who is the Munkeler?")}</Text>

        <View style={styles.roundInfo}>
          <Text style={styles.roundText}>
            Round {round} • {alivePlayers.length} Players Left
          </Text>
        </View>

        <ScrollView 
          style={styles.playerList}
          contentContainerStyle={styles.playerListContent}
          showsVerticalScrollIndicator={false}
        >
          {alivePlayers.length === 0 ? (
            <Text style={styles.emptyText}>{t("vote.noPlayers", "No players available")}</Text>
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
            title={t("vote.confirmVote", "Confirm Vote")}
            onPress={handleVote}
            variant="danger"
            size="lg"
            disabled={selectedPlayer === null}
            icon={<Icon name="vote" size={24} color={palette.text} />}
          />
        </View>
      </View>

      <EliminationModal
        visible={showEliminationModal}
        playerName={eliminatedPlayerData?.name}
        remainingCount={eliminatedPlayerData?.remainingCount}
        nextRound={eliminatedPlayerData?.nextRound}
        onContinue={handleContinueToNextRound}
      />
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
  roundInfo: {
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    borderRadius: radii.md,
    backgroundColor: palette.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.lg,
  },
  roundText: {
    fontSize: type.body,
    fontWeight: "500",
    color: palette.text,
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
