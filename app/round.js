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
import { space, palette, type, radii } from "../src/constants/theme";
import { Icon } from "../src/constants/icons";
import { useTranslation } from "../src/lib/useTranslation";

export default function Round() {
  const router = useRouter();
  const { players, alive, round, secretWord, imposterIndex, aliveCount: getAliveCount } = useGameStore();
  const [seconds, setSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
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

        {/* Clean Horizontal Player Cards */}
        <View style={styles.orderSection}>
          <Text style={styles.orderTitle}>{t("round.speakingOrder", "Speaking Order")}</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.playerCardsContainer}
            style={styles.playerCardsScroll}
          >
            {orderedPlayers.map((player, idx) => (
              <Card
                key={player.index}
                style={styles.playerCard}
              >
                <View style={styles.playerNumberBadge}>
                  <Text style={styles.playerNumberText}>{idx + 1}</Text>
                </View>
                <Text style={styles.playerCardName} numberOfLines={2}>
                  {player.name}
                </Text>
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
  
  // Player Order Section
  orderSection: {
    marginBottom: space.xl,
  },
  orderTitle: {
    fontSize: type.h4,
    fontWeight: "800",
    color: palette.text,
    marginBottom: space.md,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  playerCardsScroll: {
    marginHorizontal: -space.lg, // Extend to screen edges
    paddingHorizontal: space.lg,
  },
  playerCardsContainer: {
    gap: space.md,
    paddingRight: space.lg,
  },
  playerCard: {
    width: 100,
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    padding: space.md,
    gap: space.sm,
  },
  playerNumberBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.xs,
  },
  playerNumberText: {
    fontSize: type.h3,
    fontWeight: "900",
    color: palette.background,
  },
  playerCardName: {
    fontSize: type.body,
    fontWeight: "700",
    color: palette.text,
    textAlign: "center",
  },
  
  timerSection: {
    alignItems: "center",
    marginVertical: space.xl,
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
