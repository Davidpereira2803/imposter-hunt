import { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, BackHandler } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import HUD from "../src/components/HUD";

export default function Vote() {
  const router = useRouter();
  const { players, alive, eliminatePlayer, nextRound, aliveCount } = useGameStore();
  const [voter, setVoter] = useState(0);
  const [votes, setVotes] = useState(() => Array(players?.length || 0).fill(null));
  const [picked, setPicked] = useState(null);

  const aliveNow = aliveCount ? aliveCount() : (alive?.filter(Boolean).length || 0);

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Return to Discussion?", "Votes will be lost if you go back.", [
        { text: "Cancel", style: "cancel" },
        { text: "Go Back", onPress: () => router.replace("/round") }
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

  const aliveIndexes = useMemo(() => {
    if (!players?.length || !alive?.length) return [];
    return players.map((_, i) => i).filter(i => alive[i]);
  }, [players, alive]);

  const candidates = useMemo(() => {
    return aliveIndexes.map(idx => ({ name: players[idx], idx }));
  }, [players, aliveIndexes]);

  if (!players?.length || !alive?.length) {
    return (
      <View style={s.wrap}>
        <Text style={s.title}>Vote</Text>
        <Text style={s.msg}>No active match found.</Text>
        <TouchableOpacity style={[s.btn, s.primary]} onPress={() => router.replace("/setup")}>
          <Text style={s.btnText}>Go to Setup</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentVoterIndex = aliveIndexes[voter] || 0;
  const name = players[currentVoterIndex];

  const selectCandidate = async (idx) => {
    if (idx === currentVoterIndex) return;
    setPicked(idx);
    try { await Haptics.selectionAsync(); } catch {}
  };

  const confirmVote = async () => {
    if (picked == null) return;
    
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}

    const next = [...votes];
    next[currentVoterIndex] = picked;
    setVotes(next);
    setPicked(null);

    if (voter < aliveIndexes.length - 1) {
      setVoter(voter + 1);
    } else {
      const counts = new Map();
      aliveIndexes.forEach((voterIdx) => {
        const target = next[voterIdx];
        if (target != null) {
          counts.set(target, (counts.get(target) || 0) + 1);
        }
      });

      let max = -1;
      let leaders = [];
      counts.forEach((c, idx) => {
        if (c > max) {
          max = c;
          leaders = [idx];
        } else if (c === max) {
          leaders.push(idx);
        }
      });

      if (leaders.length === 0) {
        Alert.alert("No votes?", "No valid votes were cast. Returning to round.", [
          { text: "OK", onPress: () => router.replace("/round") },
        ]);
        return;
      }

      if (leaders.length > 1) {
        Alert.alert(
          "Tie detected",
          "Multiple players tied. Please revote.",
          [{ text: "OK", onPress: () => resetForRevote() }]
        );
        return;
      }

      const eliminated = leaders[0];
      const outcome = eliminatePlayer(eliminated);
      const remaining = aliveCount();

      if (outcome === "civilians") {
        router.push({
          pathname: "/results",
          params: { outcome: "civilians", eliminated: String(eliminated) }
        });
        return;
      }

      if (remaining <= 2) {
        Alert.alert("Imposter Wins!", "Only two players remain.", [
          { text: "Continue", onPress: () => router.push({
            pathname: "/results", 
            params: { outcome: "imposter", eliminated: String(eliminated) }
          }) }
        ]);
        return;
      }

      nextRound();
      router.replace("/round");
    }
  };

  const resetForRevote = () => {
    setVoter(0);
    setVotes(Array(players.length).fill(null));
    setPicked(null);
  };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Voting Phase</Text>
      <HUD round={undefined} aliveCount={aliveNow} />
      
      <View style={s.voterSection}>
        <Text style={s.subtitle}>Pass the phone to</Text>
        <Text style={s.player}>{name}</Text>
        <Text style={s.instructions}>Pick a player you suspect is the Imposter</Text>
      </View>

      <View style={s.list}>
        {candidates.map(({ name, idx }) => {
          const disabled = idx === currentVoterIndex;
          const active = picked === idx;
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => !disabled && selectCandidate(idx)}
              style={[
                s.choice,
                disabled && s.choiceDisabled,
                active && s.choiceActive
              ]}
              disabled={disabled}
            >
              <Text style={[s.choiceText, active && s.choiceTextActive]}>
                {name} {disabled ? "(you)" : ""}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={confirmVote}
        disabled={picked == null}
        style={[s.confirmBtn, picked == null && s.disabled]}
      >
        <Text style={s.confirmText}>
          {voter < aliveIndexes.length - 1 ? "Confirm & Pass" : "Confirm & Tally"}
        </Text>
      </TouchableOpacity>

      <Text style={s.progress}>Voter {voter + 1} of {aliveIndexes.length}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#000", padding: 20, paddingTop: 60 },
  title: { color: "#fff", fontSize: 28, fontWeight: "900", textAlign: "center", marginBottom: 20 },
  voterSection: { alignItems: "center", marginBottom: 24 },
  subtitle: { color: "#666", fontSize: 16, marginBottom: 8 },
  player: { color: "#fff", fontSize: 24, fontWeight: "900", marginBottom: 16 },
  instructions: { color: "#aaa", fontSize: 16, textAlign: "center" },
  list: { gap: 12, marginVertical: 24 },
  choice: { backgroundColor: "#1a1a1a", borderRadius: 12, padding: 18, borderWidth: 2, borderColor: "transparent" },
  choiceActive: { borderColor: "#23a6f0", backgroundColor: "#0a1a2a" },
  choiceDisabled: { opacity: 0.4 },
  choiceText: { color: "#fff", fontWeight: "600", fontSize: 16, textAlign: "center" },
  choiceTextActive: { color: "#23a6f0", fontWeight: "700" },
  confirmBtn: { backgroundColor: "#06d6a0", paddingVertical: 18, borderRadius: 12, alignItems: "center", marginTop: 16 },
  confirmText: { color: "#000", fontSize: 18, fontWeight: "900" },
  progress: { color: "#666", textAlign: "center", marginTop: 16, fontSize: 14 },
  disabled: { backgroundColor: "#333", opacity: 0.6 },
  btn: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  primary: { backgroundColor: "#23a6f0" },
});
