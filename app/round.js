import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Alert, BackHandler, TouchableOpacity, ScrollView, Modal } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import HUD from "../src/components/HUD";
import CircularTimer from "../src/components/ui/CircularTimer";
import Screen from "../src/components/ui/Screen";
import Button from "../src/components/ui/Button";
import Card from "../src/components/ui/Card";
import { space, palette, type, radii } from "../src/constants/theme";
import { Icon } from "../src/constants/icons";
import { useTranslation } from "../src/lib/useTranslation";

export default function Round() {
  const router = useRouter();
  const { 
    players, 
    alive, 
    round, 
    secretWord, 
    imposterIndex, 
    aliveCount: getAliveCount, 
    roles,
    sheriffUsedAbility,
    setSheriffUsedAbility
  } = useGameStore();
  
  const [seconds, setSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showSheriffModal, setShowSheriffModal] = useState(false);
  const [sheriffCheckResult, setSheriffCheckResult] = useState(null);
  
  const intervalRef = useRef(null);
  const isNavigatingRef = useRef(false);
  const { t } = useTranslation();

  const aliveNow = getAliveCount ? getAliveCount() : (players?.length || 0);

  const alivePlayers = players
    ?.map((name, index) => ({ name, index }))
    .filter((_, index) => alive?.[index] !== false) || [];

  const orderedPlayers = React.useMemo(() => {
    if (!alivePlayers.length) return [];
    
    if (round === 1 && imposterIndex !== null) {
      const imposterPlayerIndex = alivePlayers.findIndex(p => p.index === imposterIndex);
      
      if (imposterPlayerIndex === 0) {
        return [...alivePlayers.slice(1), alivePlayers[0]];
      }
    }
    
    return alivePlayers;
  }, [alivePlayers, round, imposterIndex]);

  const sheriffIndex = roles?.indexOf("sheriff");
  const isSheriff = sheriffIndex !== -1 && alive?.[sheriffIndex] !== false;

  const handleQuitRound = () => {
    Alert.alert(
      t("round.quitTitle", "Quit Game"),
      t("round.quitMessage", "Are you sure you want to quit? Progress will be lost."),
      [
        { text: t("common.cancel", "Cancel"), style: "cancel" },
        { 
          text: t("round.quit", "Quit"),
          style: "destructive",
          onPress: async () => {
            try { 
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
            } catch {}
            isNavigatingRef.current = true;
            router.replace("/");
          }
        }
      ]
    );
  };

  const handlePlayerPress = async (player) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedPlayer(player);
  };

  const handleCloseModal = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setSelectedPlayer(null);
  };

  const handleSheriffAbility = async () => {
    if (!isSheriff || sheriffUsedAbility) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setShowSheriffModal(true);
  };

  const handleSheriffCheck = async (player) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}

    const checkedRole = roles?.[player.index];
    
    setSheriffCheckResult({
      playerName: player.name,
      role: checkedRole,
    });

    setSheriffUsedAbility(true);
  };

  const handleCloseSheriffResult = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setSheriffCheckResult(null);
    setShowSheriffModal(false);
  };

  useEffect(() => {
    const backAction = () => {
      handleQuitRound();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [t]);

  useEffect(() => {
    if (isNavigatingRef.current) return;
    
    if (!players?.length || !secretWord) {
      router.replace("/setup");
    }
  }, [players, secretWord]);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setTimeout(() => {
        setSeconds(prev => prev - 1);
        
        if (seconds === 10) {
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          } catch {}
        }
        
        if (seconds <= 5) {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {}
        }
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
        t("round.timesUp", "Time's Up"),
        t("round.proceedToVoting", "Proceed to voting"),
        [{ 
          text: t("round.voteNow", "Vote Now"),
          onPress: () => {
            isNavigatingRef.current = true;
            router.push("/vote");
          }
        }]
      );
    }
  }, [seconds, isRunning, t]);

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
    
    router.push("/imposter-guess");
  };

  const handleVote = async () => {
    try { 
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
    } catch {}
    
    isNavigatingRef.current = true;
    router.push("/vote");
  };

  if (!players?.length || !secretWord) {
    return null;
  }

  const playerRole = selectedPlayer && roles?.[selectedPlayer.index];
  const isImposter = playerRole === "imposter";
  const isJester = playerRole === "jester";
  const isSheriffRole = playerRole === "sheriff";
  const isCivilian = playerRole === "civilian" || (!isImposter && !isJester && !isSheriffRole);

  const getRoleConfig = () => {
    if (isImposter) {
      return {
        color: palette.danger,
        icon: "incognito",
        label: t("role.imposter", "IMPOSTER"),
        bgStyle: styles.imposterBg,
        badgeStyle: styles.imposterBadge,
        showWord: false,
      };
    }
    if (isJester) {
      return {
        color: "#A855F7",
        icon: "emoticon-devil",
        label: t("role.jester", "JESTER"),
        bgStyle: styles.jesterBg,
        badgeStyle: styles.jesterBadge,
        showWord: true,
      };
    }
    if (isSheriffRole) {
      return {
        color: "#3B82F6",
        icon: "shield-star",
        label: t("role.sheriff", "SHERIFF"),
        bgStyle: styles.sheriffBg,
        badgeStyle: styles.sheriffBadge,
        showWord: true,
      };
    }
    return {
      color: palette.success,
      icon: "account",
      label: t("role.civilian", "CIVILIAN"),
      bgStyle: styles.civilianBg,
      badgeStyle: styles.civilianBadge,
      showWord: true,
    };
  };

  const roleConfig = getRoleConfig();

  return (
    <Screen>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleQuitRound} style={styles.quitButton}>
            <Icon name="close" size={24} color={palette.danger} />
          </TouchableOpacity>
          <HUD round={round || 1} aliveCount={aliveNow} />
        </View>

        <View style={styles.orderSection}>
          <Text style={styles.orderTitle}>{t("round.speakingOrder", "Speaking Order")}</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.playerCardsContainer}
            style={styles.playerCardsScroll}
          >
            {orderedPlayers.map((player, idx) => (
              <TouchableOpacity
                key={player.index}
                onPress={() => handlePlayerPress(player)}
                activeOpacity={0.7}
              >
                <Card style={styles.playerCard}>
                  <View style={styles.playerNumberBadge}>
                    <Text style={styles.playerNumberText}>{idx + 1}</Text>
                  </View>
                  <Text 
                    style={styles.playerCardName} 
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {player.name}
                  </Text>
                  <View style={styles.eyeIcon}>
                    <Icon name="eye" size={16} color={palette.textDim} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Timer with built-in controls */}
        <View style={styles.timerSection}>
          <CircularTimer 
            seconds={seconds} 
            totalSeconds={60}
            isRunning={isRunning}
            onStart={startTimer}
            onPause={pauseTimer}
            onReset={resetTimer}
          />
        </View>

        {/* Only Vote and Sheriff buttons remain */}
        <View style={styles.actions}>
          <View style={styles.primaryActions}>
            <Button 
              title={t("round.vote", "Vote")}
              onPress={handleVote}
              variant="primary"
              size="lg"
              style={styles.controlBtn}
              icon={<Icon name="vote" size={24} color={palette.text} />}
            />

            <Button 
              title={t("round.imposterGuess", "Imposter Guess")}
              onPress={handleImposterGuess}
              variant="danger"
              size="lg"
              style={styles.controlBtn}
              icon={<Icon name="incognito" size={24} color={palette.text} />}
            />
          </View>

          {/* Sheriff Ability Section */}
          {isSheriff && !sheriffUsedAbility && (
            <Button 
              title={t("role.sheriffAbility", "Inspect Player")}
              onPress={handleSheriffAbility}
              variant="primary"
              size="md"
              icon={<Icon name="shield-star" size={20} color={palette.text} />}
              style={styles.sheriffButton}
            />
          )}

          {isSheriff && sheriffUsedAbility && (
            <View style={styles.abilityUsedBadge}>
              <Icon name="check-circle" size={16} color={palette.success} />
              <Text style={styles.abilityUsedText}>
                {t("role.abilityUsed", "Ability Used")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Existing Role Reveal Modal */}
      <Modal
        visible={!!selectedPlayer}
        transparent
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <BlurView intensity={90} style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalTouchable}
            activeOpacity={1}
            onPress={handleCloseModal}
          >
            <Animated.View 
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              style={styles.modalBackground}
            >
              <Animated.View
                entering={ZoomIn.duration(300).springify()}
                style={styles.roleModal}
                onStartShouldSetResponder={() => true}
              >
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={handleCloseModal}
                >
                  <Icon name="close" size={24} color={palette.textDim} />
                </TouchableOpacity>

                <View style={[styles.roleIconContainer, roleConfig.bgStyle]}>
                  <Icon 
                    name={roleConfig.icon} 
                    size={64} 
                    color={roleConfig.color} 
                  />
                </View>

                <Text style={styles.modalPlayerName}>
                  {selectedPlayer?.name}
                </Text>

                <View style={[styles.roleBadge, roleConfig.badgeStyle]}>
                  <Text style={styles.roleText}>
                    {roleConfig.label}
                  </Text>
                </View>

                {roleConfig.showWord && (
                  <View style={[styles.secretWordContainer, { borderLeftColor: roleConfig.color }]}>
                    <Text style={styles.secretWordLabel}>
                      {t("game.secretWord", "Secret Word")}
                    </Text>
                    <Text style={[styles.secretWordText, { color: roleConfig.color }]}>
                      {secretWord}
                    </Text>
                  </View>
                )}

                <Text style={styles.tapHint}>
                  {t("common.tapToClose", "Tap anywhere to close")}
                </Text>
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>
        </BlurView>
      </Modal>

      {/* NEW: Sheriff Selection Modal */}
      <Modal
        visible={showSheriffModal && !sheriffCheckResult}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSheriffModal(false)}
      >
        <BlurView intensity={90} style={styles.modalOverlay}>
          <View style={styles.sheriffModalContainer}>
            <Animated.View
              entering={ZoomIn.duration(300).springify()}
              style={styles.sheriffModalContent}
            >
              <View style={styles.sheriffModalHeader}>
                <Icon name="shield-star" size={40} color="#3B82F6" />
                <Text style={styles.sheriffModalTitle}>
                  {t("role.sheriffAbility", "Inspect Player")}
                </Text>
                <Text style={styles.sheriffModalSubtitle}>
                  {t("role.sheriffInstruction", "Choose one player to reveal their role")}
                </Text>
              </View>

              <ScrollView style={styles.sheriffPlayerList}>
                {alivePlayers
                  .filter(p => p.index !== sheriffIndex)
                  .map((player) => (
                    <TouchableOpacity
                      key={player.index}
                      onPress={() => handleSheriffCheck(player)}
                      style={styles.sheriffPlayerCard}
                    >
                      <Text style={styles.sheriffPlayerName}>{player.name}</Text>
                      <Icon name="arrow-right" size={20} color={palette.textDim} />
                    </TouchableOpacity>
                  ))}
              </ScrollView>

              <Button
                title={t("common.cancel", "Cancel")}
                onPress={() => setShowSheriffModal(false)}
                variant="ghost"
                size="md"
                style={{ marginTop: space.md }}
              />
            </Animated.View>
          </View>
        </BlurView>
      </Modal>

      {/* NEW: Sheriff Result Modal */}
      <Modal
        visible={!!sheriffCheckResult}
        transparent
        animationType="none"
        onRequestClose={handleCloseSheriffResult}
      >
        <BlurView intensity={90} style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalTouchable}
            activeOpacity={1}
            onPress={handleCloseSheriffResult}
          >
            <Animated.View 
              entering={FadeIn.duration(200)}
              style={styles.modalBackground}
            >
              <Animated.View
                entering={ZoomIn.duration(400).springify()}
                style={styles.sheriffResultModal}
                onStartShouldSetResponder={() => true}
              >
                <View style={styles.sheriffResultHeader}>
                  <Icon name="shield-check" size={48} color="#3B82F6" />
                  <Text style={styles.sheriffResultTitle}>
                    {t("role.inspectionResult", "Inspection Result")}
                  </Text>
                </View>

                <Text style={styles.sheriffResultPlayerName}>
                  {sheriffCheckResult?.playerName}
                </Text>

                <View style={styles.sheriffResultDivider} />

                {(() => {
                  const checkedRole = sheriffCheckResult?.role;
                  let roleLabel = "";
                  let roleColor = palette.text;
                  let roleIcon = "account";

                  if (checkedRole === "imposter") {
                    roleLabel = t("role.imposter", "IMPOSTER");
                    roleColor = palette.danger;
                    roleIcon = "incognito";
                  } else if (checkedRole === "jester") {
                    roleLabel = t("role.jester", "JESTER");
                    roleColor = "#A855F7";
                    roleIcon = "emoticon-devil";
                  } else {
                    roleLabel = t("role.civilian", "CIVILIAN");
                    roleColor = palette.success;
                    roleIcon = "account";
                  }

                  return (
                    <>
                      <View style={[styles.sheriffResultRoleIcon, { backgroundColor: `${roleColor}20` }]}>
                        <Icon name={roleIcon} size={56} color={roleColor} />
                      </View>

                      <View style={[styles.sheriffResultRoleBadge, { backgroundColor: roleColor }]}>
                        <Text style={styles.sheriffResultRoleText}>
                          {roleLabel}
                        </Text>
                      </View>
                    </>
                  );
                })()}

                <Text style={styles.tapHint}>
                  {t("common.tapToClose", "Tap anywhere to close")}
                </Text>
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>
        </BlurView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    paddingTop: 60,
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
  },
  header: {
    marginBottom: space.lg,
    position: "relative",
  },
  quitButton: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  
  orderSection: {
    marginBottom: space.xl,
  },
  orderTitle: {
    fontSize: type.h4,
    fontWeight: "800",
    color: palette.text,
    marginBottom: space.md,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  playerCardsScroll: {
    marginHorizontal: -space.lg,
    paddingHorizontal: space.lg,
  },
  playerCardsContainer: {
    gap: space.md,
    paddingRight: space.lg,
  },
  playerCard: {
    width: 100,
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    padding: space.md,
    gap: space.sm,
    position: "relative",
  },
  playerNumberBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.xs,
  },
  playerNumberText: {
    fontSize: type.h3,
    fontWeight: "900",
    color: palette.background,
  },
  playerCardName: {
    fontSize: type.body,
    fontWeight: "700",
    color: palette.text,
    textAlign: "center",
  },
  eyeIcon: {
    position: "absolute",
    top: space.xs,
    right: space.xs,
  },
  
  timerSection: {
    alignItems: "center",
    marginVertical: space.xl,
  },
  actions: {
    gap: space.md,
  },
  primaryActions: {
    flexDirection: "row",
    gap: space.md,
  },
  controlBtn: {
    flex: 1,
  },
  sheriffButton: {
    backgroundColor: "#3B82F6",
  },
  abilityUsedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
    padding: space.md,
    backgroundColor: palette.backgroundDim,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.success,
  },
  abilityUsedText: {
    fontSize: type.body,
    fontWeight: "700",
    color: palette.success,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTouchable: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: space.lg,
  },
  roleModal: {
    backgroundColor: '#0d1117',
    borderRadius: radii.xl,
    padding: space.xl,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    borderWidth: 3,
    borderColor: palette.primary,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
  closeButton: {
    position: "absolute",
    top: space.md,
    right: space.md,
    zIndex: 10,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  roleIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.lg,
  },
  imposterBg: {
    backgroundColor: `${palette.danger}20`,
  },
  civilianBg: {
    backgroundColor: `${palette.success}20`,
  },
  jesterBg: {
    backgroundColor: `#A855F720`,
  },
  sheriffBg: {
    backgroundColor: `#3B82F620`,
  },
  modalPlayerName: {
    fontSize: type.h2,
    fontWeight: "900",
    color: palette.text,
    marginBottom: space.md,
    textAlign: "center",
  },
  roleBadge: {
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
    borderRadius: radii.lg,
    marginBottom: space.lg,
  },
  imposterBadge: {
    backgroundColor: palette.danger,
  },
  civilianBadge: {
    backgroundColor: palette.success,
  },
  jesterBadge: {
    backgroundColor: "#A855F7",
  },
  sheriffBadge: {
    backgroundColor: "#3B82F6",
  },
  roleText: {
    fontSize: type.h4,
    fontWeight: "900",
    color: palette.background,
    letterSpacing: 1,
  },
  secretWordContainer: {
    width: "100%",
    backgroundColor: palette.backgroundDim,
    padding: space.lg,
    borderRadius: radii.lg,
    alignItems: "center",
    borderLeftWidth: 4,
    marginBottom: space.md,
  },
  secretWordLabel: {
    fontSize: type.small,
    fontWeight: "700",
    color: palette.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: space.xs,
  },
  secretWordText: {
    fontSize: type.h3,
    fontWeight: "900",
  },
  tapHint: {
    fontSize: type.small,
    color: palette.textDim,
    marginTop: space.sm,
  },

  sheriffModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: space.lg,
  },
  sheriffModalContent: {
    backgroundColor: palette.panel,
    borderRadius: radii.xl,
    padding: space.xl,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  sheriffModalHeader: {
    alignItems: "center",
    marginBottom: space.lg,
  },
  sheriffModalTitle: {
    fontSize: type.h2,
    fontWeight: "900",
    color: palette.text,
    marginTop: space.md,
    marginBottom: space.xs,
  },
  sheriffModalSubtitle: {
    fontSize: type.body,
    color: palette.textDim,
    textAlign: "center",
  },
  sheriffPlayerList: {
    maxHeight: 300,
  },
  sheriffPlayerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: palette.backgroundDim,
    padding: space.md,
    borderRadius: radii.md,
    marginBottom: space.sm,
  },
  sheriffPlayerName: {
    fontSize: type.h4,
    fontWeight: "700",
    color: palette.text,
  },

  sheriffResultModal: {
    backgroundColor: '#0d1117',
    borderRadius: radii.xl,
    padding: space.xl,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  sheriffResultHeader: {
    alignItems: "center",
    marginBottom: space.lg,
  },
  sheriffResultTitle: {
    fontSize: type.h3,
    fontWeight: "900",
    color: "#3B82F6",
    marginTop: space.md,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sheriffResultPlayerName: {
    fontSize: type.h1,
    fontWeight: "900",
    color: palette.text,
    marginBottom: space.md,
    textAlign: "center",
  },
  sheriffResultDivider: {
    width: "100%",
    height: 2,
    backgroundColor: palette.line,
    marginVertical: space.lg,
  },
  sheriffResultRoleIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.lg,
  },
  sheriffResultRoleBadge: {
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
    borderRadius: radii.full,
    marginBottom: space.lg,
  },
  sheriffResultRoleText: {
    fontSize: type.h2,
    fontWeight: "900",
    color: palette.background,
    letterSpacing: 2,
  },
});
