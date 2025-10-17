import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Alert, BackHandler } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import HUD from "../src/components/HUD";
import CircularTimer from "../src/components/ui/CircularTimer";
import Screen from "../src/components/ui/Screen";
import Button from "../src/components/ui/Button";
import { space } from "../src/constants/theme";

export default function Round() {
  const router = useRouter();
  const { players, round, secretWord, aliveCount: getAliveCount } = useGameStore();
  const [seconds, setSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const aliveNow = getAliveCount ? getAliveCount() : (players?.length || 0);

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
        "Time's Up",
        "Proceed to voting",
        [{ text: "Vote Now", onPress: () => router.push("/vote") }]
      );
    }
  }, [seconds, isRunning]);

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
    
    router.push({
      pathname: "/imposter-guess",
      params: { mode: "optional" }
    });
  };

  if (!players?.length || !secretWord) {
    return null;
  }

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <HUD round={round || 1} aliveCount={aliveNow} />
        </View>

        <View style={styles.timerSection}>
          <CircularTimer seconds={seconds} totalSeconds={60} />
        </View>

        <View style={styles.actions}>
          <View style={styles.primaryActions}>
            {!isRunning ? (
              <Button 
                title="▶️ Start" 
                onPress={startTimer}
                variant="success"
                size="lg"
                style={styles.controlBtn}
              />
            ) : (
              <Button 
                title="⏸️ Pause" 
                onPress={pauseTimer}
                variant="warn"
                size="lg"
                style={styles.controlBtn}
              />
            )}

            <Button 
              title="🗳️ Vote" 
              onPress={() => router.push("/vote")}
              variant="primary"
              size="lg"
              style={styles.controlBtn}
            />
          </View>

          <View style={styles.secondaryActions}>
            <Button 
              title="Reset Timer" 
              onPress={resetTimer}
              variant="muted"
              size="md"
            />

            <Button 
              title="Imposter Guess" 
              onPress={handleImposterGuess}
              variant="danger"
              size="md"
            />
          </View>
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
    marginBottom: space.xl,
  },
  timerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actions: {
    paddingBottom: space.xl,
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
