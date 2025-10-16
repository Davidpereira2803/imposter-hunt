import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useGameStore } from "../src/store/gameStore";

export default function Settings() {
  const router = useRouter();
  const { players, clearStorage } = useGameStore();

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will delete all saved players and settings. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearStorage();
            Alert.alert("Data Cleared", "All saved data has been removed.");
          },
        },
      ]
    );
  };

  const handleResetMatch = () => {
    Alert.alert(
      "Reset Current Match",
      "This will end the current game and return to setup.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            useGameStore.getState().resetMatch();
            router.replace("/setup");
          },
        },
      ]
    );
  };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Settings</Text>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Storage</Text>
        <Text style={s.info}>
          Your player names and topic preferences are automatically saved.
        </Text>
        {players.length > 0 && (
          <Text style={s.info}>
            Current players: {players.join(", ")}
          </Text>
        )}
      </View>

      <TouchableOpacity style={[s.btn, s.warning]} onPress={handleResetMatch}>
        <Text style={s.btnText}>Reset Current Match</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.btn, s.danger]} onPress={handleClearData}>
        <Text style={s.btnText}>Clear All Saved Data</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.btn, s.primary]} onPress={() => router.back()}>
        <Text style={s.btnText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#000", padding: 20, paddingTop: 36 },
  title: { color: "#fff", fontSize: 24, fontWeight: "900", textAlign: "center", marginBottom: 32 },
  section: { marginBottom: 24 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  info: { color: "#aaa", fontSize: 14, lineHeight: 20, marginBottom: 4 },
  btn: { marginBottom: 12, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  primary: { backgroundColor: "#23a6f0" },
  warning: { backgroundColor: "#ffc107" },
  danger: { backgroundColor: "#e63946" },
});