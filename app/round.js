import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Alert, BackHandler, Animated } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import HUD from "../src/components/HUD";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import { space } from "../src/constants/theme";

export default function Round() {
  const router = useRouter();
  const { players, round, secretWord, aliveCount: getAliveCount } = useGameStore();
  const [seconds, setSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
        
        if (seconds % 10 === 0) {
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.03,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
        }
      }, 1000);
    } else {
      clearTimeout(intervalRef.current);
    }

    return () => clearTimeout(intervalRef.current);
  }, [isRunning, seconds, scaleAnim]);

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

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
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
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Title 
              variant="giant" 
              style={[styles.timer, seconds <= 10 && styles.timerUrgent]}
            >
              {formatTime(seconds)}
            </Title>
          </Animated.View>
        </View>

        <View style={styles.actions}>
          <View style={styles.primaryActions}>
            {!isRunning ? (
              <Button 
                title="Start" 
                onPress={startTimer}
                variant="warn"
                size="lg"
              />
            ) : (
              <Button 
                title="Pause" 
                onPress={pauseTimer}
                variant="primary"
                size="lg"
              />
            )}

            <Button 
              title="Vote" 
              onPress={() => router.push("/vote")}
              variant="success"
              size="lg"
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
  timer: {
    letterSpacing: 2,
  },
  timerUrgent: {
    color: "#FF5964",
  },
  actions: {
    paddingBottom: space.xl,
    gap: space.md,
  },
  primaryActions: {
    flexDirection: "row",
    gap: space.md,
  },
  secondaryActions: {
    gap: space.sm,
  },
});
