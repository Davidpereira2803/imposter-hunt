import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Alert, BackHandler, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import HUD from "../src/components/HUD";
import CircularTimer from "../src/components/ui/CircularTimer";
import Screen from "../src/components/ui/Screen";
import Button from "../src/components/ui/Button";
import Card from "../src/components/ui/Card";
import { space, palette, type } from "../src/constants/theme";
import { Icon } from "../src/constants/icons";
import { useTranslation } from "../src/lib/useTranslation";

export default function Round() {
  const router = useRouter();
  const { players, alive, round, secretWord, imposterIndex, aliveCount: getAliveCount } = useGameStore();
  const [seconds, setSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const intervalRef = useRef(null);
  const isNavigatingRef = useRef(false);
  const { t } = useTranslation();

  const aliveNow = getAliveCount ? getAliveCount() : (players?.length || 0);

  const alivePlayers = players
    ?.map((name, index) => ({ name, index }))
    .filter((_, index) => alive?.[index] !== false) || [];

  const orderedPlayers = React.useMemo(() => {
    if (!alivePlayers.length) return [];
    
    if (round === 1 && imposterIndex !== null) {
      const imposterPlayerIndex = alivePlayers.findIndex(p => p.index === imposterIndex);
      
      if (imposterPlayerIndex === 0) {
        return [...alivePlayers.slice(1), alivePlayers[0]];
      }
    }
    
    return alivePlayers;
  }, [alivePlayers, round, imposterIndex]);

  const handleQuitRound = () => {
    Alert.alert(
      t("round.quitTitle", "Quit Game"),
      t("round.quitMessage", "Are you sure you want to quit? Progress will be lost."),
      [
        { text: t("common.cancel", "Cancel"), style: "cancel" },
        { 
          text: t("round.quit", "Quit"),
          style: "destructive",
          onPress: async () => {
            try { 
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
            } catch {}
            isNavigatingRef.current = true;
            router.replace("/");
          }
        }
      ]
    );
  };

  useEffect(() => {
    const backAction = () => {
      handleQuitRound();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [t]);

  useEffect(() => {
    if (isNavigatingRef.current) return;
    
    if (!players?.length || !secretWord) {
      router.replace("/setup");
    }
  }, [players, secretWord]);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setTimeout(() => {
        setSeconds(prev => prev - 1);
        
        if (seconds === 10) {
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          } catch {}
        }
        
        if (seconds <= 5) {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {}
        }
      }, 1000);
    } else {
      clearTimeout(intervalRef.current);
    }

    return () => clearTimeout(intervalRef.current);
  }, [isRunning, seconds]);

  useEffect(() => {
    if (seconds === 0 && isRunning) {
      setIsRunning(false);
      try { 
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}
      
      Alert.alert(
        t("round.timesUp", "Time's Up"),
        t("round.proceedToVoting", "Proceed to voting"),
        [{ 
          text: t("round.voteNow", "Vote Now"),
          onPress: () => {
            isNavigatingRef.current = true;
            router.push("/vote");
          }
        }]
      );
    }
  }, [seconds, isRunning, t]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  const startTimer = async () => {
    setIsRunning(true);
    try { await Haptics.selectionAsync(); } catch {}
  };

  const pauseTimer = async () => {
    setIsRunning(false);
    try { await Haptics.selectionAsync(); } catch {}
  };

  const resetTimer = async () => {
    setIsRunning(false);
    setSeconds(60);
    try { await Haptics.selectionAsync(); } catch {}
  };

  const handleNextPlayer = async () => {
    if (currentPlayerIndex < orderedPlayers.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1);
      try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    }
  };

  const handlePreviousPlayer = async () => {
    if (currentPlayerIndex > 0) {
      setCurrentPlayerIndex(prev => prev - 1);
      try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    }
  };

  const handleImposterGuess = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    
    router.push("/imposter-guess");
  };

  const handleVote = async () => {
    try { 
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
    } catch {}
    
    isNavigatingRef.current = true;
    router.push("/vote");
  };

  if (!players?.length || !secretWord) {
    return null;
  }

  return (
    <Screen>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleQuitRound} style={styles.quitButton}>
            <Icon name="close" size={24} color={palette.danger} />
          </TouchableOpacity>
          <HUD round={round || 1} aliveCount={aliveNow} />
        </View>

        {/* Player Order Section */}
        <View style={styles.orderSection}>
          <Text style={styles.orderTitle}>{t("round.speakingOrder", "Speaking Order")}</Text>
          
          <View style={styles.currentPlayerCard}>
            <View style={styles.navigationButtons}>
              <TouchableOpacity 
                onPress={handlePreviousPlayer}
                disabled={currentPlayerIndex === 0}
                style={[
                  styles.navButton,
                  currentPlayerIndex === 0 && styles.navButtonDisabled
                ]}
              >
                <Icon 
                  name="chevron-left" 
                  size={24} 
                  color={currentPlayerIndex === 0 ? palette.textDim : palette.text} 
                />
              </TouchableOpacity>

              <View style={styles.currentPlayer}>
                <Text style={styles.turnLabel}>{t("round.currentTurn", "Current Turn")}</Text>
                <Text style={styles.currentPlayerName}>
                  {orderedPlayers[currentPlayerIndex]?.name || "—"}
                </Text>
                <Text style={styles.turnNumber}>
                  {currentPlayerIndex + 1} / {orderedPlayers.length}
                </Text>
              </View>

              <TouchableOpacity 
                onPress={handleNextPlayer}
                disabled={currentPlayerIndex === orderedPlayers.length - 1}
                style={[
                  styles.navButton,
                  currentPlayerIndex === orderedPlayers.length - 1 && styles.navButtonDisabled
                ]}
              >
                <Icon 
                  name="chevron-right" 
                  size={24} 
                  color={currentPlayerIndex === orderedPlayers.length - 1 ? palette.textDim : palette.text} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Player List */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.playerListContent}
          >
            {orderedPlayers.map((player, idx) => (
              <Card
                key={player.index}
                style={[
                  styles.playerOrderCard,
                  idx === currentPlayerIndex && styles.activePlayerCard,
                  idx < currentPlayerIndex && styles.completedPlayerCard
                ]}
                onPress={() => {
                  setCurrentPlayerIndex(idx);
                  Haptics.selectionAsync().catch(() => {});
                }}
              >
                <Text style={styles.playerOrderNumber}>{idx + 1}</Text>
                <Text style={[
                  styles.playerOrderName,
                  idx === currentPlayerIndex && styles.activePlayerName,
                  idx < currentPlayerIndex && styles.completedPlayerName
                ]}>
                  {player.name}
                </Text>
                {idx === currentPlayerIndex && (
                  <Icon name="account-voice" size={16} color={palette.primary} />
                )}
                {idx < currentPlayerIndex && (
                  <Icon name="check" size={16} color={palette.success} />
                )}
              </Card>
            ))}
          </ScrollView>
        </View>

        <View style={styles.timerSection}>
          <CircularTimer seconds={seconds} totalSeconds={60} />
        </View>

        <View style={styles.actions}>
          <View style={styles.primaryActions}>
            {!isRunning ? (
              <Button 
                title={t("round.start", "Start")}
                onPress={startTimer}
                variant="success"
                size="lg"
                style={styles.controlBtn}
                icon={<Icon name="play" size={24} color="#000" />}
              />
            ) : (
              <Button 
                title={t("round.pause", "Pause")}
                onPress={pauseTimer}
                variant="warn"
                size="lg"
                style={styles.controlBtn}
                icon={<Icon name="pause" size={24} color="#000" />}
              />
            )}

            <Button 
              title={t("round.vote", "Vote")}
              onPress={handleVote}
              variant="primary"
              size="lg"
              style={styles.controlBtn}
              icon={<Icon name="vote" size={24} color={palette.text} />}
            />
          </View>

          <View style={styles.secondaryActions}>
            <Button 
              title={t("round.resetTimer", "Reset Timer")}
              onPress={resetTimer}
              variant="muted"
              size="md"
              icon={<Icon name="refresh" size={20} color={palette.text} />}
            />

            <Button 
              title={t("round.imposterGuess", "Imposter Guess")}
              onPress={handleImposterGuess}
              variant="danger"
              size="md"
              icon={<Icon name="incognito" size={20} color={palette.text} />}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    paddingTop: 60,
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
  },
  header: {
    marginBottom: space.lg,
    position: "relative",
  },
  quitButton: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  orderSection: {
    marginBottom: space.lg,
  },
  orderTitle: {
    fontSize: type.h4,
    fontWeight: "800",
    color: palette.text,
    marginBottom: space.md,
    textAlign: "center",
  },
  currentPlayerCard: {
    marginBottom: space.md,
  },
  navigationButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: palette.panel,
    borderRadius: 16,
    padding: space.md,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  currentPlayer: {
    flex: 1,
    alignItems: "center",
  },
  turnLabel: {
    fontSize: type.small,
    fontWeight: "700",
    color: palette.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  currentPlayerName: {
    fontSize: type.h3,
    fontWeight: "900",
    color: palette.primary,
    marginBottom: 4,
  },
  turnNumber: {
    fontSize: type.small,
    fontWeight: "600",
    color: palette.textDim,
  },
  playerListContent: {
    gap: space.sm,
    paddingHorizontal: 4,
  },
  playerOrderCard: {
    minWidth: 80,
    alignItems: "center",
    paddingVertical: space.sm,
    paddingHorizontal: space.xs,
  },
  activePlayerCard: {
    borderColor: palette.primary,
    borderWidth: 2,
    backgroundColor: palette.primaryDim,
  },
  completedPlayerCard: {
    opacity: 0.5,
  },
  playerOrderNumber: {
    fontSize: type.caption,
    fontWeight: "700",
    color: palette.textDim,
    marginBottom: 4,
  },
  playerOrderName: {
    fontSize: type.small,
    fontWeight: "700",
    color: palette.text,
    textAlign: "center",
    marginBottom: 4,
  },
  activePlayerName: {
    color: palette.primary,
  },
  completedPlayerName: {
    color: palette.textDim,
  },
  timerSection: {
    alignItems: "center",
    marginVertical: space.lg,
  },
  actions: {
    gap: space.md,
  },
  primaryActions: {
    flexDirection: "row",
    gap: space.md,
  },
  controlBtn: {
    flex: 1,
  },
  secondaryActions: {
    gap: space.sm,
  },
});
