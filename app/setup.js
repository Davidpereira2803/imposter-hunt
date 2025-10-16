import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert, BackHandler, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import topics from "../src/data/topics.json";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import Input from "../src/components/ui/Input";
import Card from "../src/components/ui/Card";
import Pill from "../src/components/ui/Pill";
import { space, palette, type } from "../src/constants/theme";
import { Text, TouchableOpacity } from "react-native";

export default function Setup() {
  const router = useRouter();
  const { players, topicKey, setPlayers, setTopicKey, startMatch } = useGameStore();
  const [inputName, setInputName] = useState("");
  const [playerList, setPlayerList] = useState(players || []);
  const [selectedTopic, setSelectedTopic] = useState(topicKey || "");

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Exit", "Exit game?", [
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
      Alert.alert("Duplicate", "Player already added");
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
      Alert.alert("Need 3+ Players", "Add more players to start");
      return;
    }

    if (!selectedTopic) {
      Alert.alert("Choose Topic", "Select a category first");
      return;
    }

    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}

    const success = startMatch();
    if (success) {
      router.push("/role");
    } else {
      Alert.alert("Error", "Failed to start game");
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Title style={styles.title}>Setup</Title>

          {/* Players Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Players ({playerList.length})</Text>
            
            <View style={styles.inputRow}>
              <Input
                value={inputName}
                onChangeText={setInputName}
                placeholder="Player name"
                maxLength={20}
                onSubmitEditing={addPlayer}
                returnKeyType="done"
                style={styles.input}
              />
              <Button title="Add" onPress={addPlayer} variant="primary" />
            </View>

            {playerList.length > 0 && (
              <View style={styles.playerList}>
                {playerList.map((name, index) => (
                  <Card key={`player-${index}`} style={styles.playerCard}>
                    <Text style={styles.playerName}>{name}</Text>
                    <TouchableOpacity onPress={() => removePlayer(index)} style={styles.removeBtn}>
                      <Text style={styles.removeText}>×</Text>
                    </TouchableOpacity>
                  </Card>
                ))}
              </View>
            )}
          </View>

          {/* Topic Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Topic</Text>
            <View style={styles.topicGrid}>
              {Object.keys(topics).map((key) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => selectTopic(key)}
                  style={styles.topicBtn}
                >
                  <Pill variant={selectedTopic === key ? "primary" : "default"}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Pill>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button 
            title="Start Game"
            onPress={handleStartGame}
            variant="success"
            size="lg"
            disabled={playerList.length < 3 || !selectedTopic}
            style={styles.startBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { 
    padding: space.lg, 
    paddingTop: 60,
    paddingBottom: 40 
  },
  title: { marginBottom: space.xl },
  section: { marginBottom: space.xl },
  sectionTitle: { 
    color: palette.textDim, 
    fontSize: type.small, 
    fontWeight: "700", 
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: space.md 
  },
  inputRow: { 
    flexDirection: "row", 
    gap: space.sm,
    marginBottom: space.md 
  },
  input: { flex: 1 },
  playerList: { gap: space.sm },
  playerCard: { 
    flexDirection: "row", 
    alignItems: "center",
    padding: space.md 
  },
  playerName: { 
    flex: 1, 
    color: palette.text, 
    fontSize: type.body, 
    fontWeight: "600" 
  },
  removeBtn: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: palette.danger,
    alignItems: "center",
    justifyContent: "center"
  },
  removeText: { 
    color: palette.text, 
    fontSize: 20, 
    fontWeight: "700" 
  },
  topicGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: space.sm 
  },
  topicBtn: {
  },
  startBtn: { 
    marginTop: space.lg 
  },
});
