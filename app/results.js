import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, BackHandler, Alert } from "react-native";
import Animated, { FadeInUp, ZoomIn, ReduceMotion } from "react-native-reanimated";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import { useSessionStore } from "../src/store/sessionStore";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import Card from "../src/components/ui/Card";
import { space, palette, roleColors, type } from "../src/constants/theme";
import { Icon } from "../src/constants/icons";
import { useTranslation } from "../src/lib/useTranslation";

export default function Results() {
  const router = useRouter();
  const { t } = useTranslation();
  const { winner, eliminatedPlayer } = useLocalSearchParams();
  const { players, imposterIndex, secretWord, matchId, roles, startMatch, resetMatch } = useGameStore();
  const activeSession = useSessionStore((state) => state.activeSession);
  const recordMatchResult = useSessionStore((state) => state.recordMatchResult);
  const [completedGame] = useState(() => ({
    secretWord,
    imposterName: players?.[imposterIndex],
    matchId,
    players,
    roles,
    imposterIndex,
  }));
  const [isStartingAgain, setIsStartingAgain] = useState(false);
  const isStartingAgainRef = useRef(false);

  const winnerKey = Array.isArray(winner) ? winner[0] : winner;
  const imposterWon = winnerKey === "imposter";
  const imposterName = completedGame.imposterName || t("results.unknown", "Unknown");

  useEffect(() => {
    if (!completedGame.matchId) return;
    recordMatchResult({
      matchId: completedGame.matchId,
      winner: winnerKey,
      players: completedGame.players,
      roles: completedGame.roles,
      imposterIndex: completedGame.imposterIndex,
    });
  }, [completedGame, winnerKey, recordMatchResult]);

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
    if (isStartingAgainRef.current) return;
    isStartingAgainRef.current = true;
    setIsStartingAgain(true);

    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}

    const success = startMatch();
    if (success) {
      router.replace("/role");
    } else {
      isStartingAgainRef.current = false;
      setIsStartingAgain(false);
      Alert.alert(t("common.error", "Error"), t("results.failedToStart", "Failed to start new game"));
    }
  };

  const handleNewSetup = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    resetMatch();
    router.replace("/setup");
  };

  const getWinnerInfo = () => {
    if (winnerKey === "jester") {
      return {
        title: t("results.jesterWins", "The Jester Wins!"),
        subtitle: eliminatedPlayer 
          ? `${eliminatedPlayer} ${t("results.jesterFooled", "fooled everyone!")}`
          : t("results.jesterFooled", "The Jester fooled everyone!"),
        color: roleColors.jester,
        icon: "emoticon-devil",
      };
    }

    if (winnerKey === "imposter") {
      return {
        title: t("results.imposterWins", "Imposter Wins!"),
        subtitle: imposterName 
          ? `${imposterName} ${t("results.wasTheImposter", "was the imposter")}`
          : t("results.theImposter", "The Imposter"),
        color: palette.danger,
        icon: "incognito",
      };
    }

    return {
      title: t("results.civiliansWin", "Civilians Win!"),
      subtitle: imposterName 
        ? `${imposterName} ${t("results.wasTheImposter", "was the imposter")}`
        : t("results.theImposter", "The Imposter"),
      color: palette.success,
      icon: "account-group",
    };
  };

  const { title, subtitle, color, icon } = getWinnerInfo();

  return (
    <Screen>
      <View style={styles.content}>
        <Animated.View entering={ZoomIn.duration(360).reduceMotion(ReduceMotion.System)} style={styles.header}>
          <Icon 
            name={icon} 
            size={100} 
            color={color}
            style={styles.icon}
          />
          <Title 
            variant="h1" 
            style={[styles.outcome, imposterWon ? styles.imposterWin : styles.civilianWin]}
          >
            {title}
          </Title>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(280).reduceMotion(ReduceMotion.System)} style={styles.info}>
          <Card style={styles.infoCard}>
            <Text style={styles.label}>{t("results.secretWord", "Secret Word")}</Text>
            <Text style={styles.wordText}>{completedGame.secretWord}</Text>
          </Card>

          <Card style={styles.infoCard}>
            <Text style={styles.label}>{t("results.theImposter", "The Imposter")}</Text>
            <Text style={[styles.imposterText]}>{imposterName}</Text>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(180).duration(280).reduceMotion(ReduceMotion.System)} style={styles.actions}>
          <Button
            title={t("results.playAgain", "Play Again")}
            onPress={handlePlayAgain}
            variant="success"
            size="lg"
            disabled={isStartingAgain}
          />
          <Text style={styles.newGameHint}>{t("results.newGameHint", "Starts a fresh match with a new secret word.")}</Text>

          {activeSession && (
            <Button
              title={t("results.sessionStandings", "View Session Standings")}
              onPress={() => router.push("/leaderboard")}
              variant="ghost"
              size="md"
            />
          )}

          <Button
            title={t("results.newSetup", "New Setup")}
            onPress={handleNewSetup}
            variant="ghost"
            size="md"
          />
        </Animated.View>
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
  icon: {
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
  subtitle: {
    color: palette.textDim,
    fontSize: type.medium,
    textAlign: "center",
    marginTop: space.sm,
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
  newGameHint: {
    color: palette.textDim,
    fontSize: type.small,
    textAlign: "center",
    marginTop: -space.xs,
  },
});
