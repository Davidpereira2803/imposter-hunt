import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, Switch, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, ReduceMotion } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Input from "../src/components/ui/Input";
import Button from "../src/components/ui/Button";
import Card from "../src/components/ui/Card";
import { space, palette, roleColors, type, radii } from "../src/constants/theme";
import { Icon, icons } from "../src/constants/icons";
import { useTranslation } from "../src/lib/useTranslation";

export default function Setup() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    players: storedPlayers,
    setPlayers,
    topicKey: storedTopicKey,
    setTopicKey,
    customTopics,
    startMatch,
    addCustomTopic,
    enableJester,
    setEnableJester,
    enableSheriff,
    setEnableSheriff,
    getAllTopics,
  } = useGameStore();

  const [inputName, setInputName] = useState("");
  const [playerList, setPlayerList] = useState(storedPlayers || []);
  const [topicKey, setLocalTopicKey] = useState(storedTopicKey || null);
  const [topicExpanded, setTopicExpanded] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [topicName, setTopicName] = useState("");
  const [topicWordsText, setTopicWordsText] = useState("");
  const [error, setError] = useState("");

  const allTopics = getAllTopics();

  useEffect(() => {
    if (storedPlayers?.length) setPlayerList(storedPlayers);
    if (storedTopicKey) setLocalTopicKey(storedTopicKey);
  }, [storedPlayers, storedTopicKey]);

  const addPlayer = async () => {
    const trimmed = inputName.trim();
    if (!trimmed) return;

    if (playerList.includes(trimmed)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert(t("setup.playerExists", "Player already added"), "", [{ text: "OK" }]);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const updated = [...playerList, trimmed];
    setPlayerList(updated);
    setPlayers(updated);
    setInputName("");
  };

  const removePlayer = async (index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const updated = playerList.filter((_, i) => i !== index);
    setPlayerList(updated);
    setPlayers(updated);
  };

  const handleSelectTopic = async (key) => {
    Haptics.selectionAsync().catch(() => {});
    setLocalTopicKey(key);
    setTopicKey(key);
  };

  const handleStartGame = async () => {
    if (playerList.length < 3) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      Alert.alert(
        t("setup.needPlayers", "Need 3+ Players"),
        t("setup.needPlayersMessage", "Add more players to start"),
        [{ text: "OK" }]
      );
      return;
    }

    if (!topicKey) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      Alert.alert(
        t("setup.chooseTopic", "Choose Topic"),
        t("setup.chooseTopicMessage", "Select a category first"),
        [{ text: "OK" }]
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    
    const success = startMatch();
    if (success) {
      router.push("/role");
    } else {
      Alert.alert(t("setup.couldNotStart", "Failed to start game"), "", [{ text: "OK" }]);
    }
  };

  const handleGoHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.back();
  };

  const openModal = () => {
    setTopicName("");
    setTopicWordsText("");
    setError("");
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);

  const handleSaveTopic = async () => {
    const words = topicWordsText.split(",").map(w => w.trim()).filter(Boolean);
    if (words.length < 3) {
      setError("Please add at least 3 words");
      return;
    }
    const res = await addCustomTopic({ name: topicName, words });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    closeModal();
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoHome} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color={palette.text} />
            </TouchableOpacity>
            <Title style={styles.title}>{t("setup.title", "Setup")}</Title>
            <View style={styles.backButton} />
          </View>

          {/* Topic Section */}
          <View style={styles.section}>
            <View style={styles.topicActionsRow}>
              <View style={{ flex: 1 }}>
                <Button 
                  title={t("setup.generateAI", "Generate with AI")}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                    router.push("/ai-topics");
                  }}
                  variant="primary"
                  size="md"
                  icon={<Icon name="magic-staff" size={20} color={palette.text} />}
                  style={styles.topicActionBtn}
                />
              </View>
              <View style={{ width: space.sm }} />
              <View style={{ flex: 1 }}>
                <Button
                  title={t("setup.customTopic", "Custom Topic")}
                  onPress={openModal}
                  size="md"
                  variant="ghost"
                  icon={<Icon name="plus-circle" size={20} color={palette.text} />}
                  style={styles.topicActionBtn}
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setTopicExpanded(!topicExpanded);
              }}
              style={styles.topicHeader}
            >
              <Text style={styles.sectionTitle}>{t("setup.topic", "Topic")}</Text>
              <Icon 
                name={topicExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={palette.textDim} 
              />
            </TouchableOpacity>

            {topicExpanded && allTopics && allTopics.length > 0 && (
              <View style={styles.topicGrid}>
                {allTopics.map((tpc, topicIndex) => {
                  const wordCount = tpc.words?.length || 0;
                  return (
                    <Animated.View key={tpc.key} style={styles.topicCardWrapper} entering={FadeInDown.delay(Math.min(topicIndex * 25, 250)).duration(220).reduceMotion(ReduceMotion.System)}>
                    <Card
                      onPress={() => handleSelectTopic(tpc.key)}
                      style={[
                        styles.topicCard,
                        topicKey === tpc.key && { borderColor: palette.primary, borderWidth: 2 },
                      ]}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <Text
                          style={styles.topicName}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {tpc.name}
                        </Text>
                        {tpc.isCustom ? (
                          <View
                            style={[styles.dot, tpc.isAI ? styles.dotAI : styles.dotCustom]}
                          />
                        ) : null}
                      </View>
                      
                      <View style={styles.wordCountRow}>
                        <Icon name="text-box-multiple" size={12} color={palette.textDim} />
                        <Text style={styles.wordCountText}>
                          {wordCount} {t("setup.words", "words")}
                        </Text>
                      </View>
                    </Card>
                    </Animated.View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Players Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("setup.players", "Players")}</Text>
              <View style={[
                styles.countBadge,
                playerList.length >= 3 ? styles.countBadgeReady : styles.countBadgeNotReady
              ]}>
                <Icon 
                  name={playerList.length >= 3 ? "check-circle" : "alert-circle"} 
                  size={14} 
                  color={playerList.length >= 3 ? palette.success : palette.textDim} 
                />
                <Text style={[
                  styles.countText,
                  playerList.length >= 3 ? styles.countTextReady : styles.countTextNotReady
                ]}>
                  {playerList.length}/3
                </Text>
              </View>
            </View>

            <View style={styles.inputRow}>
              <Input
                value={inputName}
                onChangeText={setInputName}
                placeholder={t("setup.playerPlaceholder", "Player name")}
                maxLength={20}
                onSubmitEditing={addPlayer}
                returnKeyType="done"
                style={styles.input}
              />
              <Button title={t("setup.addPlayer", "Add")} onPress={addPlayer} variant="primary" />
            </View>

            {playerList.length > 0 && (
              <View style={styles.playerList}>
                {playerList.map((name, index) => (
                  <Animated.View key={`player-${index}`} entering={FadeInDown.delay(Math.min(index * 30, 180)).duration(220).reduceMotion(ReduceMotion.System)}>
                  <Card style={styles.playerCard}>
                    <Text style={styles.playerName}>{name}</Text>
                    <TouchableOpacity onPress={() => removePlayer(index)} style={styles.removeBtn}>
                      <Text style={styles.removeText}>×</Text>
                    </TouchableOpacity>
                  </Card>
                  </Animated.View>
                ))}
              </View>
            )}
          </View>

          {/* NEW: Special Roles Section - Only shows with 4+ players */}
          {(
            <View style={styles.section}>
              <View style={styles.specialRolesHeading}>
                <View style={styles.specialRolesHeadingCopy}>
                  <Text style={styles.sectionTitle}>{t("setup.specialRoles", "Special Roles")}</Text>
                  <Text style={styles.specialRolesHint}>
                    {playerList.length >= 4
                      ? t("setup.specialRolesHint", "Optional roles · choose before dealing cards")
                      : t("setup.minPlayersForRoles", "Need 4+ players for special roles")}
                  </Text>
                </View>
                <Icon name="cards-outline" size={22} color={palette.primary} />
              </View>
              
              <Card style={styles.rolesCard}>
                {/* Jester Toggle */}
                <View style={[styles.roleToggleRow, playerList.length < 4 && styles.roleToggleRowDisabled, enableJester && styles.roleToggleRowActive]}>
                  <View style={styles.roleInfo}>
                    <View style={styles.roleHeader}>
                      <Icon
                        name={icons.jester.name}
                        size={icons.jester.size}
                        color={roleColors.jester}
                      />
                      <Text style={styles.roleName}>{t("setup.jester", "Jester")}</Text>
                    </View>
                    <Text style={styles.roleDesc}>{t("setup.jesterDesc", "Wins if voted out")}</Text>
                  </View>
                  <Switch
                    value={enableJester}
                    accessibilityRole="switch"
                    accessibilityLabel={t("setup.jester", "Jester")}
                    accessibilityState={{ disabled: playerList.length < 4, checked: enableJester }}
                    disabled={playerList.length < 4}
                    onValueChange={(v) => {
                      Haptics.selectionAsync().catch(() => {});
                      setEnableJester(v);
                    }}
                    trackColor={{ false: palette.line, true: roleColors.jester }}
                    thumbColor={palette.text}
                  />
                </View>

                <View style={styles.separator} />

                {/* Sheriff Toggle */}
                <View style={[styles.roleToggleRow, playerList.length < 4 && styles.roleToggleRowDisabled, enableSheriff && styles.roleToggleRowActive]}>
                  <View style={styles.roleInfo}>
                    <View style={styles.roleHeader}>
                      <Icon
                        name={icons.sheriff.name}
                        size={icons.sheriff.size}
                        color={roleColors.sheriff}
                      />
                      <Text style={styles.roleName}>{t("setup.sheriff", "Sheriff")}</Text>
                    </View>
                    <Text style={styles.roleDesc}>{t("setup.sheriffDesc", "Can check one role")}</Text>
                  </View>
                  <Switch
                    value={enableSheriff}
                    accessibilityRole="switch"
                    accessibilityLabel={t("setup.sheriff", "Sheriff")}
                    accessibilityState={{ disabled: playerList.length < 4, checked: enableSheriff }}
                    disabled={playerList.length < 4}
                    onValueChange={(v) => {
                      Haptics.selectionAsync().catch(() => {});
                      setEnableSheriff(v);
                    }}
                    trackColor={{ false: palette.line, true: roleColors.sheriff }}
                    thumbColor={palette.text}
                  />
                </View>
              </Card>
            </View>
          )}

          <Button 
            title={t("setup.startGame", "Start Game")}
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
            <Text style={styles.modalTitle}>{t("setup.customTopic", "Custom Topic")}</Text>

            <Input
              placeholder={t("setup.topicNamePlaceholder", "Topic Name")}
              value={topicName}
              onChangeText={setTopicName}
              style={styles.modalField}
            />

            <Input
              placeholder={t("setup.wordsPlaceholder", "Add words (comma separated)")}
              value={topicWordsText}
              onChangeText={setTopicWordsText}
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.modalActions}>
              <Button
                title={t("common.cancel", "Cancel")}
                onPress={closeModal}
                variant="ghost"
              />
              <Button
                title={t("common.save", "Save")}
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
  
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.md,
  },
  sectionTitle: { 
    color: palette.textDim, 
    fontSize: type.small, 
    fontWeight: "700", 
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: space.sm,
  },

  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  countBadgeReady: {
    backgroundColor: `${palette.success}20`,
    borderColor: palette.success,
  },
  countBadgeNotReady: {
    backgroundColor: palette.backgroundDim,
    borderColor: palette.line,
  },
  countText: {
    fontSize: type.small,
    fontWeight: "800",
  },
  countTextReady: {
    color: palette.success,
  },
  countTextNotReady: {
    color: palette.textDim,
  },

  topicHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: space.sm,
    marginBottom: space.md,
  },
  topicActionsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: space.md,
  },
  topicActionBtn: {
    minHeight: 52,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  topicGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    marginTop: space.sm,
  },
  topicCard: {
    width: "100%",
    padding: space.md,
    borderRadius: radii.md,
    justifyContent: "space-between",
    minHeight: 90,
  },
  topicCardWrapper: { width: "48%" },
  topicName: {
    color: palette.text,
    fontSize: type.h4,
    fontWeight: "800",
    maxWidth: "80%",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#00000040",
  },
  dotAI: {
    backgroundColor: "#3B82F6",
  },
  dotCustom: {
    backgroundColor: "#EF4444",
  },
  wordCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: space.xs,
  },
  wordCountText: {
    fontSize: type.small,
    color: palette.textDim,
    fontWeight: "600",
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

  rolesCard: {
    padding: space.sm,
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: radii.lg,
  },
  specialRolesHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.sm,
  },
  specialRolesHeadingCopy: { flex: 1 },
  specialRolesHint: {
    color: palette.textDim,
    fontSize: type.small,
    marginTop: -space.xs,
    marginBottom: space.xs,
  },
  roleToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  roleToggleRowActive: {
    backgroundColor: palette.backgroundDim,
    borderColor: palette.line,
  },
  roleToggleRowDisabled: { opacity: 0.62 },
  roleInfo: {
    flex: 1,
    paddingRight: space.md,
  },
  roleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  roleName: {
    fontSize: type.body,
    fontWeight: "700",
    color: palette.text,
  },
  roleDesc: {
    fontSize: type.small,
    color: palette.textDim,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: palette.line,
    marginVertical: space.sm,
  },
  hintText: {
    textAlign: "center",
    color: palette.textDim,
    fontSize: type.small,
    marginBottom: space.md,
    fontStyle: "italic",
  },

  startBtn: { marginTop: space.sm },

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
  modalField: {
    marginBottom: space.md,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
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
});
