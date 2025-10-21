import React, { useState, useMemo, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert, BackHandler, KeyboardAvoidingView, Platform, Modal, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import Input from "../src/components/ui/Input";
import Card from "../src/components/ui/Card";
import Pill from "../src/components/ui/Pill";
import { space, palette, radii, type } from "../src/constants/theme";
import { Icon } from "../src/constants/icons";

export default function Setup() {
  const router = useRouter();

  const players = useGameStore((s) => s.players);
  const topicKey = useGameStore((s) => s.topicKey);
  const setPlayers = useGameStore((s) => s.setPlayers);
  const setTopicKey = useGameStore((s) => s.setTopicKey);
  const startMatch = useGameStore((s) => s.startMatch);

  const addCustomTopic = useGameStore((s) => s.addCustomTopic);

  const predefinedTopics = useGameStore((s) => s.predefinedTopics);
  const customTopics = useGameStore((s) => s.customTopics);

  const allTopics = useMemo(() => {
    const pre = Object.entries(predefinedTopics || {}).map(([key, words]) => ({
      key,
      name: key,
      words,
      isCustom: false,
    }));
    const custom = (customTopics || []).map((t) => ({
      key: `custom:${(t.name || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}`,
      name: t.name,
      words: t.words || [],
      isCustom: true,
    }));
    return [...pre, ...custom];
  }, [predefinedTopics, customTopics]);

  const [inputName, setInputName] = useState("");
  const [playerList, setPlayerList] = useState(players || []);
  const [modalVisible, setModalVisible] = useState(false);
  const [topicName, setTopicName] = useState("");
  const [topicWordsText, setTopicWordsText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const backAction = () => {
      router.replace("/");
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [router]);

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

  const handleSelectTopic = async (key) => {
    setTopicKey(key);
    try { await Haptics.selectionAsync(); } catch {}
  };

  const handleStartGame = async () => {
    if (playerList.length < 3) {
      Alert.alert("Need 3+ Players", "Add more players to start");
      return;
    }
    if (!topicKey) {
      Alert.alert("Choose Topic", "Select a category first");
      return;
    }
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    const success = startMatch();
    if (success) router.push("/role");
    else Alert.alert("Error", "Failed to start game");
  };

  const openModal = () => {
    setError("");
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setTopicName("");
    setTopicWordsText("");
    setError("");
  };

  const handleSaveTopic = async () => {
    const name = topicName.trim();
    const words = topicWordsText.split(",").map((w) => w.trim()).filter(Boolean);
    if (!name) {
      setError("Please enter a topic name.");
      return;
    }
    const exists = allTopics.some((t) => t.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      setError("A topic with this name already exists.");
      return;
    }
    const res = await addCustomTopic?.({ name, words });
    if (res?.ok) {
      const key = `custom:${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
      setTopicKey(key);
      setModalVisible(false);
      setTopicName("");
      setTopicWordsText("");
      setError("");
    } else if (res?.error) {
      setError(res.error);
    }
  };

  const handleGoHome = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    router.replace("/");
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
          {/* Add header with back button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoHome} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color={palette.text} />
            </TouchableOpacity>
            <Title style={styles.title}>Setup</Title>
            <View style={styles.backButton} />
          </View>

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

            {allTopics.length > 0 && (
              <View style={styles.topicList}>
                {allTopics.map((t) => (
                  <Card
                    key={t.key}
                    onPress={() => handleSelectTopic(t.key)}
                    style={[
                      styles.topicCard,
                      topicKey === t.key && { borderColor: palette.primary, borderWidth: 2 },
                    ]}
                  >
                    <Text style={styles.topicName}>{t.name}</Text>
                    {t.isCustom ? <Pill label="Custom" /> : null}
                  </Card>
                ))}
              </View>
            )}

            <View style={{ marginTop: space.lg }}>
              <Button
                title="Create Custom Topic"
                onPress={openModal}
                size="md"
                variant="ghost"
                icon={<Icon name="plus-circle" size={20} color={palette.text} />}
              />
            </View>

            <Button 
              title="Generate with AI"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                router.push("/ai-topics");
              }}
              variant="primary"
              size="md"
              icon={<Icon name="magic-staff" size={20} color={palette.text} />}
              style={{ marginBottom: space.sm }}
            />
          </View>

          <Button 
            title="Start Game"
            onPress={handleStartGame}
            variant="success"
            size="lg"
            disabled={playerList.length < 3 || !topicKey}
            style={styles.startBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Custom Topic</Text>

            <Input
              placeholder="Topic Name"
              value={topicName}
              onChangeText={setTopicName}
            />

            <Input
              placeholder="Add words (comma separated)"
              value={topicWordsText}
              onChangeText={setTopicWordsText}
              multiline
              numberOfLines={3}
              style={{ height: 100, textAlignVertical: "top" }}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={closeModal}
                variant="ghost"
              />
              <Button
                title="Save"
                onPress={handleSaveTopic}
                variant="primary"
                icon={<Icon name="content-save" size={18} color={palette.text} />}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { 
    flex: 1,
    textAlign: "center",
  },
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#000A",
    alignItems: "center",
    justifyContent: "center",
    padding: space.lg,
  },
  modalCard: {
    width: "100%",
    backgroundColor: palette.panel,
    borderRadius: radii.lg,
    padding: space.lg,
  },
  modalTitle: {
    fontSize: type.h3,
    fontWeight: "900",
    marginBottom: space.md,
    color: palette.text,
  },
  modalActions: {
    marginTop: space.md,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: space.md,
  },
  errorText: {
    color: palette.danger,
    marginTop: space.sm,
    fontWeight: "700",
  },
  topicName: {
    color: palette.text,
    fontSize: type.h4,
    fontWeight: "800",
  },
  topicList: {
    marginTop: space.md,
    gap: space.sm,
  },
  topicCard: {
    padding: space.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
