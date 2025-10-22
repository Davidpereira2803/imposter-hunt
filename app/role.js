import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, BackHandler, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { 
  FadeIn, 
  FadeOut, 
  ZoomIn, 
  SlideInDown,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  useSharedValue,
  Easing
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useGameStore } from "../src/store/gameStore";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import Card from "../src/components/ui/Card";
import { space, palette, type, radii } from "../src/constants/theme";
import { Icon, icons } from "../src/constants/icons";

export default function Role() {
  const router = useRouter();
  const { players, imposterIndex, secretWord } = useGameStore();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [showBlur, setShowBlur] = useState(false);

  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const cardScale = useSharedValue(1);

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Exit Game", "Return to setup?", [
        { text: "Cancel", style: "cancel" },
        { text: "Exit", onPress: () => router.replace("/setup") }
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (!players?.length || imposterIndex == null) {
      router.replace("/setup");
    }
  }, [players, imposterIndex]);

  useEffect(() => {
    if (revealed) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });
      opacity.value = withTiming(1, {
        duration: 500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      scale.value = 0.5;
      opacity.value = 0;
    }
  }, [revealed]);

  const handleReveal = async () => {
    try { 
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); 
    } catch {}
    
    setShowBlur(true);
    
    setTimeout(() => {
      setRevealed(true);
    }, 300);
  };

  const handleNext = async () => {
    try { 
      await Haptics.selectionAsync(); 
    } catch {}
    
    cardScale.value = withSequence(
      withSpring(0.95, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );

    setRevealed(false);
    setShowBlur(false);

    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      router.replace("/round");
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  if (!players?.length) return null;

  const currentPlayer = players[currentPlayerIndex];
  const isImposter = currentPlayerIndex === imposterIndex;
  const isLastPlayer = currentPlayerIndex === players.length - 1;

  return (
    <Screen>
      <View style={styles.container}>
        {!revealed ? (
          <Animated.View 
            style={styles.content}
            entering={FadeIn.duration(400)}
          >
            <View style={styles.passSection}>
              <Text style={styles.passLabel}>Pass to</Text>
              <Animated.View entering={ZoomIn.delay(200).duration(500)}>
                <Title variant="giant" style={styles.playerName}>
                  {currentPlayer}
                </Title>
              </Animated.View>
            </View>

            <Animated.View 
              entering={SlideInDown.delay(400).duration(500)}
              style={styles.revealBtnContainer}
            >
              <Pressable
                onPress={handleReveal}
                style={({ pressed }) => [
                  styles.revealBtn,
                  pressed && styles.revealBtnPressed
                ]}
              >
                <View style={styles.revealBtnContent}>
                  <Icon name="eye" size={28} color={palette.text} />
                  <Text style={styles.revealBtnText}>Reveal Role</Text>
                </View>
              </Pressable>
            </Animated.View>
          </Animated.View>
        ) : (
          <>
            {showBlur && (
              <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark">
                <Animated.View 
                  style={[styles.revealContent, animatedStyle]}
                  entering={FadeIn.duration(500)}
                >
                  {isImposter ? (
                    <>
                      <Animated.View 
                        entering={ZoomIn.delay(100).springify()}
                        style={styles.roleContainer}
                      >
                        <Icon name="incognito" size={100} color={palette.danger} />
                        <View style={styles.imposterBadge}>
                          <Text style={styles.imposterText}>IMPOSTER</Text>
                        </View>
                      </Animated.View>

                      {/* FIX: Separate wrapper for layout animation */}
                      <Animated.View 
                        entering={SlideInDown.delay(400).springify()}
                      >
                        <Animated.View style={cardAnimatedStyle}>
                          <Card style={styles.infoCard}>
                            <Text style={styles.infoTitle}>Your Mission</Text>
                            <Text style={styles.infoText}>
                              • Blend in with civilians{'\n'}
                              • Listen carefully to hints{'\n'}
                              • Guess the secret word to win{'\n'}
                              • Or survive until only 2 remain
                            </Text>
                          </Card>
                        </Animated.View>
                      </Animated.View>
                    </>
                  ) : (
                    <>
                      <Animated.View 
                        entering={ZoomIn.delay(100).springify()}
                        style={styles.roleContainer}
                      >
                        <Icon name="account-group" size={100} color={palette.success} />
                        <View style={styles.civilianBadge}>
                          <Text style={styles.civilianText}>CIVILIAN</Text>
                        </View>
                      </Animated.View>

                      <Animated.View 
                        entering={SlideInDown.delay(300).springify()}
                        style={styles.wordReveal}
                      >
                        <Text style={styles.wordLabel}>Your Secret Word</Text>
                        <View style={styles.wordBox}>
                          <Text style={styles.wordText}>{secretWord}</Text>
                        </View>
                      </Animated.View>

                      {/* FIX: Separate wrapper for layout animation */}
                      <Animated.View 
                        entering={SlideInDown.delay(500).springify()}
                      >
                        <Animated.View style={cardAnimatedStyle}>
                          <Card style={styles.infoCard}>
                            <Text style={styles.infoTitle}>Your Mission</Text>
                            <Text style={styles.infoText}>
                              • Give subtle hints about the word{'\n'}
                              • Don't say the word directly{'\n'}
                              • Find and eliminate the imposter{'\n'}
                              • Be careful - they're listening!
                            </Text>
                          </Card>
                        </Animated.View>
                      </Animated.View>
                    </>
                  )}

                  <Animated.View 
                    entering={SlideInDown.delay(700).springify()}
                    style={styles.actionContainer}
                  >
                    <Button
                      title={isLastPlayer ? "Start Round" : "Hide & Pass"}
                      onPress={handleNext}
                      variant="success"
                      size="lg"
                    />
                  </Animated.View>
                </Animated.View>
              </BlurView>
            )}
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: space.lg,
  },
  passSection: {
    alignItems: "center",
    marginBottom: space.xl * 3,
  },
  passLabel: {
    color: palette.textDim,
    fontSize: type.h3,
    fontWeight: "600",
    marginBottom: space.md,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  playerName: {
    color: palette.text,
    textShadowColor: palette.primary + "80",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  revealBtnContainer: {
    width: "100%",
  },
  revealBtn: {
    backgroundColor: palette.primary,
    paddingVertical: space.lg,
    paddingHorizontal: space.xl,
    borderRadius: radii.xl,
    alignItems: "center",
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  revealBtnPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  revealBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  revealBtnText: {
    color: palette.text,
    fontSize: type.h2,
    fontWeight: "900",
    letterSpacing: 1,
  },
  revealContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: space.lg,
    paddingVertical: space.xl,
  },
  roleContainer: {
    alignItems: "center",
    marginBottom: space.xl * 2,
  },
  imposterBadge: {
    backgroundColor: palette.danger,
    paddingVertical: space.md,
    paddingHorizontal: space.xl * 2,
    borderRadius: radii.full,
    shadowColor: palette.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  imposterText: {
    color: "#000",
    fontSize: type.h1,
    fontWeight: "900",
    letterSpacing: 3,
  },
  civilianBadge: {
    backgroundColor: palette.success,
    paddingVertical: space.md,
    paddingHorizontal: space.xl * 2,
    borderRadius: radii.full,
    shadowColor: palette.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  civilianText: {
    color: "#000",
    fontSize: type.h1,
    fontWeight: "900",
    letterSpacing: 3,
  },
  wordReveal: {
    alignItems: "center",
    marginBottom: space.xl,
  },
  wordLabel: {
    color: palette.textDim,
    fontSize: type.body,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: space.md,
  },
  wordBox: {
    backgroundColor: palette.success + "20",
    borderWidth: 2,
    borderColor: palette.success,
    borderRadius: radii.lg,
    paddingVertical: space.xl,
    paddingHorizontal: space.xl * 2,
    shadowColor: palette.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  wordText: {
    color: palette.success,
    fontSize: type.giant * 0.7,
    fontWeight: "900",
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: palette.panel + "CC",
    marginBottom: space.xl,
  },
  infoTitle: {
    color: palette.text,
    fontSize: type.h3,
    fontWeight: "900",
    marginBottom: space.md,
    textAlign: "center",
  },
  infoText: {
    color: palette.textDim,
    fontSize: type.body,
    lineHeight: 24,
  },
  actionContainer: {
    marginTop: space.lg,
  },
});
