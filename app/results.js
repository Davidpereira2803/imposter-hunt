import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGameStore } from "../src/store/gameStore";

export default function Results() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { players, imposterIndex, secretWord, startMatch, resetMatch } = useGameStore();

  if (!players?.length || imposterIndex == null || !secretWord) {
    return (
      <View style={s.wrap}>
        <Text style={s.title}>Results</Text>
        <Text style={s.msg}>No active match found.</Text>
        <TouchableOpacity style={[s.btn, s.primary]} onPress={() => router.replace("/setup")}>
          <Text style={s.btnText}>Go to Setup</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imposterName = players[imposterIndex] || "Unknown";
  const outcome = typeof params?.outcome === "string" ? params.outcome : null;

  const headline =
    outcome === "imposter"
      ? "Imposter Wins! 🎉"
      : outcome === "civilians"
      ? "Civilians Win! 🏆"
      : "Round Complete";

  const playAgain = () => {
    const ok = startMatch();
    if (ok) router.replace("/role");
    else router.replace("/setup");
  };

  const newSetup = () => {
    resetMatch();
    router.replace("/setup");
  };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>{headline}</Text>

      <View style={s.card}>
        <Text style={s.label}>Secret Word</Text>
        <Text style={s.word}>{secretWord}</Text>

        <Text style={[s.label, { marginTop: 16 }]}>Imposter</Text>
        <Text style={s.name}>{imposterName}</Text>
      </View>

      <TouchableOpacity style={[s.btnLarge, s.success]} onPress={playAgain}>
        <Text style={[s.btnText, { color: "#000" }]}>Play Again (Same Players & Topic)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.btnLarge, s.muted]} onPress={newSetup}>
        <Text style={s.btnText}>New Setup</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#000", padding: 20, paddingTop: 36 },
  title: { color: "#fff", fontSize: 24, fontWeight: "900", textAlign: "center", marginBottom: 16 },
  card: {
    backgroundColor: "#0f0f0f",
    borderWidth: 1,
    borderColor: "#1b1b1b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  label: { color: "#bbb", fontSize: 13, textAlign: "center" },
  word: { color: "#fff", fontSize: 32, fontWeight: "900", textAlign: "center", marginTop: 6 },
  name: { color: "#ff4d6d", fontSize: 22, fontWeight: "800", textAlign: "center", marginTop: 6 },
  btnLarge: {
    marginTop: 12,
    alignSelf: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    minWidth: 260,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "900" },
  success: { backgroundColor: "#06d6a0" },
  muted: { backgroundColor: "#1a1a1a" },
  primary: { backgroundColor: "#23a6f0" },
  msg: { color: "#aaa", textAlign: "center", marginVertical: 12 },
  btn: { alignSelf: "center", marginTop: 8, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
});
