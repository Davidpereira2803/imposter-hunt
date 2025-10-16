import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, BackHandler } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";

export default function Role() {
  const router = useRouter();
  const { players, secretWord, imposterIndex } = useGameStore();
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (!players?.length || !secretWord || imposterIndex == null) {
      router.replace("/setup");
    }
  }, [players, secretWord, imposterIndex]);

  const revealRole = async () => {
    setIsRevealed(true);
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
  };

  const nextPlayer = async () => {
    if (currentPlayer < players.length - 1) {
      setCurrentPlayer(currentPlayer + 1);
      setIsRevealed(false);
      try { await Haptics.selectionAsync(); } catch {}
    } else {
      router.replace("/round");
    }
  };

  if (!players?.length) {
    return (
      <View style={s.wrap}>
        <Text style={s.title}>Loading...</Text>
      </View>
    );
  }

  const isImposter = currentPlayer === imposterIndex;
  const playerName = players[currentPlayer];

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Role Assignment</Text>
      <Text style={s.progress}>Player {currentPlayer + 1} of {players.length}</Text>

      <View style={s.playerSection}>
        <Text style={s.playerName}>{playerName}</Text>
        <Text style={s.instruction}>
          {!isRevealed ? "Tap to reveal your role" : "Pass the device to the next player"}
        </Text>
      </View>

      {!isRevealed ? (
        <TouchableOpacity style={[s.btn, s.primary]} onPress={revealRole}>
          <Text style={s.btnText}>Reveal Role</Text>
        </TouchableOpacity>
      ) : (
        <View style={s.roleSection}>
          <Text style={s.roleTitle}>{isImposter ? "You are the Imposter!" : "You are a Civilian"}</Text>
          {isImposter ? (
            <Text style={s.roleDesc}>
              You don't know the secret word. Listen to others' hints and try to figure it out!
            </Text>
          ) : (
            <View style={s.wordSection}>
              <Text style={s.wordLabel}>Secret Word:</Text>
              <Text style={s.secretWord}>{secretWord}</Text>
              <Text style={s.roleDesc}>
                Give subtle hints about this word without being too obvious.
              </Text>
            </View>
          )}

          <TouchableOpacity style={[s.btn, s.success]} onPress={nextPlayer}>
            <Text style={s.btnText}>
              {currentPlayer < players.length - 1 ? "Next Player" : "Start Round"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center", padding: 20 },
  title: { color: "#fff", fontSize: 28, fontWeight: "900", textAlign: "center", marginBottom: 16 },
  progress: { color: "#666", fontSize: 16, textAlign: "center", marginBottom: 40 },
  playerSection: { alignItems: "center", marginBottom: 40 },
  playerName: { color: "#fff", fontSize: 32, fontWeight: "900", textAlign: "center", marginBottom: 16 },
  instruction: { color: "#aaa", fontSize: 16, textAlign: "center", lineHeight: 22 },
  roleSection: { alignItems: "center", maxWidth: 320 },
  roleTitle: { color: "#fff", fontSize: 24, fontWeight: "900", textAlign: "center", marginBottom: 20 },
  roleDesc: { color: "#aaa", fontSize: 16, textAlign: "center", lineHeight: 22, marginBottom: 32 },
  wordSection: { alignItems: "center", marginBottom: 32 },
  wordLabel: { color: "#666", fontSize: 16, marginBottom: 8 },
  secretWord: { color: "#06d6a0", fontSize: 28, fontWeight: "900", marginBottom: 16 },
  btn: { paddingVertical: 18, paddingHorizontal: 40, borderRadius: 16, minWidth: 200, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  primary: { backgroundColor: "#23a6f0" },
  success: { backgroundColor: "#06d6a0" },
});
