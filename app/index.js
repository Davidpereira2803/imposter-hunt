import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useGameStore } from "../src/store/gameStore";

export default function Home() {
  const router = useRouter();
  const { players } = useGameStore();

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Fakeout</Text>
      <Text style={s.subtitle}>Social Deduction Game</Text>

      {players.length > 0 && (
        <Text style={s.welcomeBack}>
          Welcome back! Previous players: {players.slice(0, 3).join(", ")}
          {players.length > 3 && ` +${players.length - 3} more`}
        </Text>
      )}

      <TouchableOpacity style={[s.btn, s.primary]} onPress={() => router.push("/setup")}>
        <Text style={s.btnText}>Start Game</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.btn, s.secondary]} onPress={() => router.push("/settings")}>
        <Text style={s.btnText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center", padding: 20 },
  title: { color: "#fff", fontSize: 32, fontWeight: "900", marginBottom: 8 },
  subtitle: { color: "#aaa", fontSize: 16, marginBottom: 32 },
  welcomeBack: { color: "#06d6a0", textAlign: "center", marginBottom: 24, lineHeight: 20 },
  btn: { marginBottom: 16, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, minWidth: 200, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  primary: { backgroundColor: "#23a6f0" },
  secondary: { backgroundColor: "#6c757d" },
});
