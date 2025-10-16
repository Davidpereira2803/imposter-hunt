import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, BackHandler, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import topics from "../src/data/topics.json";

export default function Setup() {
  const router = useRouter();
  const { players, topicKey, setPlayers, setTopicKey, startMatch } = useGameStore();
  const [inputName, setInputName] = useState("");
  const [playerList, setPlayerList] = useState(players || []);
  const [selectedTopic, setSelectedTopic] = useState(topicKey || "");

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Exit Game", "Are you sure you want to exit?", [
        { text: "Cancel", style: "cancel" },
        { text: "Exit", onPress: () => BackHandler.exitApp() }
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  const addPlayer = async () => {
    const name = inputName.trim();
    if (!name) return;
    
    if (playerList.includes(name)) {
      Alert.alert("Duplicate Name", "This player name already exists.");
      return;
    }

    const newList = [...playerList, name];
    setPlayerList(newList);
    setPlayers(newList);
    setInputName("");
    
    try { await Haptics.selectionAsync(); } catch {}
  };

  const removePlayer = async (index) => {
    const newList = playerList.filter((_, i) => i !== index);
    setPlayerList(newList);
    setPlayers(newList);
    
    try { await Haptics.selectionAsync(); } catch {}
  };

  const selectTopic = async (key) => {
    setSelectedTopic(key);
    setTopicKey(key);
    
    try { await Haptics.selectionAsync(); } catch {}
  };

  const handleStartGame = async () => {
    if (playerList.length < 3) {
      Alert.alert("Not Enough Players", "You need at least 3 players to start.");
      return;
    }

    if (!selectedTopic) {
      Alert.alert("No Topic Selected", "Please choose a topic first.");
      return;
    }

    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}

    const success = startMatch();
    if (success) {
      router.push("/role");
    } else {
      Alert.alert("Error", "Failed to start the game. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView 
      style={s.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView 
        style={s.scrollView}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.title}>Game Setup</Text>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Players ({playerList.length})</Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              value={inputName}
              onChangeText={setInputName}
              placeholder="Enter player name"
              placeholderTextColor="#666"
              maxLength={20}
              onSubmitEditing={addPlayer}
              returnKeyType="done"
            />
            <TouchableOpacity style={[s.btn, s.primary]} onPress={addPlayer}>
              <Text style={s.btnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {playerList.length > 0 && (
            <View style={s.playerListContainer}>
              {playerList.map((item, index) => (
                <View key={`player-${index}`} style={s.playerItem}>
                  <Text style={s.playerName}>{item}</Text>
                  <TouchableOpacity onPress={() => removePlayer(index)} style={s.removeBtn}>
                    <Text style={s.removeText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Choose Topic</Text>
          <View style={s.topicGrid}>
            {Object.keys(topics).map((key) => (
              <TouchableOpacity
                key={key}
                style={[s.topicBtn, selectedTopic === key && s.topicSelected]}
                onPress={() => selectTopic(key)}
              >
                <Text style={[s.topicText, selectedTopic === key && s.topicTextSelected]}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[s.startBtn, (playerList.length < 3 || !selectedTopic) && s.disabled]} 
          onPress={handleStartGame}
          disabled={playerList.length < 3 || !selectedTopic}
        >
          <Text style={s.startText}>Start Game</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#000" 
  },
  scrollView: { 
    flex: 1 
  },
  scrollContent: { 
    padding: 20, 
    paddingTop: 60,
    paddingBottom: 40
  },
  title: { 
    color: "#fff", 
    fontSize: 28, 
    fontWeight: "900", 
    textAlign: "center", 
    marginBottom: 32 
  },
  section: { 
    marginBottom: 32 
  },
  sectionTitle: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "700", 
    marginBottom: 16 
  },
  inputRow: { 
    flexDirection: "row", 
    gap: 12, 
    marginBottom: 16 
  },
  input: { 
    flex: 1, 
    backgroundColor: "#1a1a1a", 
    color: "#fff", 
    padding: 16, 
    borderRadius: 12, 
    fontSize: 16 
  },
  btn: { 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    borderRadius: 12, 
    justifyContent: "center" 
  },
  btnText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 16 
  },
  primary: { 
    backgroundColor: "#23a6f0" 
  },
  playerListContainer: { 
    gap: 8 
  },
  playerItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#1a1a1a", 
    padding: 16, 
    borderRadius: 12 
  },
  playerName: { 
    flex: 1, 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  removeBtn: { 
    backgroundColor: "#e63946", 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  removeText: { 
    color: "#fff", 
    fontSize: 20, 
    fontWeight: "700" 
  },
  topicGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 12 
  },
  topicBtn: { 
    backgroundColor: "#1a1a1a", 
    paddingVertical: 16, 
    paddingHorizontal: 20, 
    borderRadius: 12, 
    minWidth: 100, 
    alignItems: "center" 
  },
  topicSelected: { 
    backgroundColor: "#23a6f0" 
  },
  topicText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  topicTextSelected: { 
    color: "#fff", 
    fontWeight: "700" 
  },
  startBtn: { 
    backgroundColor: "#06d6a0", 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: "center", 
    marginTop: 20,
    marginBottom: 20
  },
  startText: { 
    color: "#000", 
    fontSize: 18, 
    fontWeight: "900" 
  },
  disabled: { 
    backgroundColor: "#333", 
    opacity: 0.6 
  },
});
