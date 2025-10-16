import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, BackHandler } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import HUD from "../src/components/HUD";

export default function Round() {
  const router = useRouter();
  const { players, round, secretWord, aliveCount: getAliveCount } = useGameStore();
  const [seconds, setSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const aliveNow = getAliveCount ? getAliveCount() : (players?.length || 0);

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Exit to Setup?", "Are you sure you want to exit the current game?", [
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
        "Time's Up!",
        "Discussion time is over. Proceed to voting.",
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
    return (
      <View style={s.wrap}>
        <Text style={s.title}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Discussion Phase</Text>
      <HUD round={round || 1} aliveCount={aliveNow} />

      <View style={s.timerContainer}>
        <Text style={[s.timer, seconds <= 10 && s.timerUrgent]}>{formatTime(seconds)}</Text>
        <View style={s.timerControls}>
          {!isRunning ? (
            <TouchableOpacity style={[s.btn, s.primary]} onPress={startTimer}>
              <Text style={s.btnText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[s.btn, s.warning]} onPress={pauseTimer}>
              <Text style={s.btnText}>Pause</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[s.btn, s.muted]} onPress={resetTimer}>
            <Text style={s.btnText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={s.instructions}>
        Discuss and give subtle hints about your role. Try to identify the imposter!
      </Text>

      <View style={s.actions}>
        <TouchableOpacity style={[s.btn, s.danger]} onPress={handleImposterGuess}>
          <Text style={s.btnText}>Imposter Guess (Optional)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.btn, s.success]} onPress={() => router.push("/vote")}>
          <Text style={s.btnText}>Proceed to Vote</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#000", padding: 20, paddingTop: 60 },
  title: { color: "#fff", fontSize: 28, fontWeight: "900", textAlign: "center", marginBottom: 20 },
  timerContainer: { alignItems: "center", marginVertical: 32 },
  timer: { color: "#fff", fontSize: 56, fontWeight: "900", marginBottom: 20 },
  timerUrgent: { color: "#e63946" },
  timerControls: { flexDirection: "row", gap: 16 },
  instructions: { color: "#aaa", textAlign: "center", marginVertical: 24, lineHeight: 22, fontSize: 16 },
  actions: { gap: 16, marginVertical: 24 },
  btn: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, alignItems: "center", minHeight: 56 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  primary: { backgroundColor: "#23a6f0" },
  success: { backgroundColor: "#06d6a0" },
  warning: { backgroundColor: "#ffc107" },
  danger: { backgroundColor: "#e63946" },
  muted: { backgroundColor: "#1a1a1a" },
});
