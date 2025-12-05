import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAIStore } from "../src/store/aiStore";
import { useGameStore } from "../src/store/gameStore";
import { generateTopics } from "../src/lib/generateTopics";
import { useTranslation } from "../src/lib/useTranslation";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import Input from "../src/components/ui/Input";
import Card from "../src/components/ui/Card";
import { space, palette, type } from "../src/constants/theme";
import { Icon } from "../src/constants/icons";
import { initAds, showRewarded } from "../src/lib/rewardedAds";
import { useAdConsentContext } from "../src/contexts/AdConsentContext";
import AITutorialModal from "../src/components/AITutorialModal";

const DIFFICULTIES = ["easy", "medium", "hard", "mixed"];

const slugify = (s = "") =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function AITopics() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    canGenerate,
    generationsToday,
    maxGenerations,
    watchedAdsToday,
    maxAdsPerDay,
    incrementGenerations,
    incrementAdsWatched,
    addGeneratedTopic,
    ensureDailyReset,
    getRemainingGenerations,
    getMaxAllowedToday,
  } = useAIStore();

  const { addCustomTopic, setTopicKey } = useGameStore();

  const { canShowAds, canShowPersonalizedAds, showConsentForm } = useAdConsentContext();
  const [isShowingAd, setIsShowingAd] = useState(false);

  const [description, setDescription] = useState("");
  const [numTopics, setNumTopics] = useState(24);
  const [difficulty, setDifficulty] = useState("medium");
  const [language, setLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(false);

  const [showTutorial, setShowTutorial] = useState(false);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholderExamples = [
    t("aiTutorial.example1", "Clash Royale cards"),
    t("aiTutorial.example2", "Harry Potter spells"),
    t("aiTutorial.example3", "Marvel superheroes"),
    t("aiTutorial.example4", "Programming languages"),
    t("aiTutorial.example5", "Football teams in Europe"),
  ];

  useEffect(() => {
    initAds().catch(() => {});
  }, []);

  useEffect(() => {
    ensureDailyReset();
  }, [ensureDailyReset]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderExamples.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      ensureDailyReset();
    }, [ensureDailyReset])
  );

  const remaining = getRemainingGenerations
    ? getRemainingGenerations()
    : Math.max(0, (1 + watchedAdsToday) - generationsToday);

  const freeRemaining = Math.max(0, 1 - Math.min(generationsToday, 1));

  const handleBack = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.back();
  };

  const handleWatchAd = async () => {
    if (!canShowAds) {
      try { await showConsentForm(); } catch {}
    }
    if (watchedAdsToday >= maxAdsPerDay) {
      Alert.alert(
        t("aiTopics.limitReached", "Limit Reached"),
        t("aiTopics.maxAdsMessage", "You've watched the maximum rewarded ads for today.")
      );
      return;
    }
    setIsShowingAd(true);
    const res = await showRewarded({ nonPersonalized: !canShowPersonalizedAds });
    setIsShowingAd(false);

    if (res.earned) {
      incrementAdsWatched();
      try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      Alert.alert(
        t("aiTopics.thanks", "Thanks!"),
        t("aiTopics.earnedGeneration", "You earned +1 AI generation.")
      );
    } else {
      Alert.alert(
        t("aiTopics.noReward", "No reward"),
        res.error?.message || t("aiTopics.adClosedEarly", "Ad closed before completion. Try again.")
      );
    }
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      Alert.alert(
        t("aiTopics.missingInput", "Missing Input"),
        t("aiTopics.enterDescription", "Please enter a topic description")
      );
      return;
    }

    if (!canGenerate()) {
      Alert.alert(
        t("aiTopics.generationLimit", "Generation Limit"),
        `${t("aiTopics.limitMessagePart1", "You've used")} ${generationsToday}/${maxGenerations} ${t("aiTopics.limitMessagePart2", "generations today")}.\n\n${t("aiTopics.limitMessagePart3", "Watch an ad to get more!")}`,
        [
          { text: t("common.cancel", "Cancel"), style: "cancel" },
          {
            text: t("aiTopics.watchAd", "Watch Ad"),
            onPress: handleWatchAd,
          },
        ]
      );
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setIsLoading(true);

    try {
      const result = await generateTopics({
        description: description.trim(),
        numTopics,
        difficulty,
        language: language.trim() || "en",
      });

      if (result.success && result.data) {
        incrementGenerations();
        addGeneratedTopic(result.data);

        const baseName = (result.data.topicGroup || description || t("aiTopics.aiTopicsFallback", "AI Topics")).trim();
        let finalName = `${baseName} (AI)`;
        let attempts = 0;
        let added = { ok: false };

        while (!added.ok && attempts < 5) {
          added = await addCustomTopic({ name: finalName, words: result.data.items });
          if (!added.ok) {
            attempts += 1;
            finalName = `${baseName} (AI ${attempts + 1})`;
          }
        }

        if (added.ok) {
          const key = `custom:${slugify(finalName)}`;
          setTopicKey(key);
        }

        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}

        Alert.alert(
          t("common.success", "Success"),
          `${t("aiTopics.generated", "Generated")} ${result.data.items?.length || 0} ${t("aiTopics.topicsCount", "topics")}.\n${t("aiTopics.addedToList", "Added")} "${finalName}" ${t("aiTopics.toYourList", "to your list")}.`,
          [
            { text: t("aiTopics.goToSetup", "Go to Setup"), onPress: () => router.push("/setup") },
            { text: t("aiTopics.stay", "Stay"), style: "cancel" },
          ]
        );

        setDescription("");
      } else {
        throw new Error(result.error || t("aiTopics.generationFailed", "Generation failed"));
      }
    } catch (error) {
      console.error("Generation error:", error);

      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
      } catch {}

      Alert.alert(
        t("aiTopics.generationFailedTitle", "Generation Failed"),
        error.message || t("aiTopics.generationFailedMessage", "Could not generate topics. Please try again."),
        [{ text: t("common.ok", "OK") }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color={palette.text} />
            </TouchableOpacity>
            <Title style={styles.title}>{t("aiTopics.title", "AI Topic Builder")}</Title>
            <TouchableOpacity 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setShowTutorial(true);
              }} 
              style={styles.helpButton}
            >
              <Icon name="help-circle" size={24} color={palette.primary} />
            </TouchableOpacity>
          </View>

          {/* Usage Info */}
          <Card style={styles.usageCard}>
            <View style={styles.usageHeader}>
              <View style={styles.usageTitle}>
                <Icon name="lightning-bolt" size={20} color={palette.primary} />
                <Text style={styles.usageLabel}>{t("aiTopics.dailyGenerations", "Daily Generations")}</Text>
              </View>
              {watchedAdsToday < maxAdsPerDay && (
                <TouchableOpacity 
                  style={styles.adButton}
                  onPress={handleWatchAd}
                  disabled={isShowingAd || !canShowAds}
                >
                  <Icon name="video" size={18} color={palette.text} />
                  <Text style={styles.adButtonText}>+1</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(remaining / getMaxAllowedToday()) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{remaining} / {getMaxAllowedToday()}</Text>
            </View>
          </Card>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={styles.label}>{t("aiTopics.topicDescription", "Topic Description")}</Text>
            <Input
              placeholder={placeholderExamples[placeholderIndex]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={200}
              style={styles.descriptionInput}
            />
            <Text style={styles.hint}>
              {description.length}/200 {t("aiTopics.charactersLabel", "characters")}
            </Text>
          </View>

          {/* Number of Topics Selection */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t("aiTopics.numberOfTopics", "Number of Topics")}</Text>
              <Text style={styles.sliderValue}>{numTopics}</Text>
            </View>
            <View style={styles.chipContainer}>
              {[10, 20, 30, 40, 50].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => {
                    setNumTopics(num);
                    Haptics.selectionAsync().catch(() => {});
                  }}
                  style={[
                    styles.chip,
                    numTopics === num && styles.chipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      numTopics === num && styles.chipTextSelected,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Difficulty Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>{t("aiTopics.difficulty", "Difficulty")}</Text>
            <View style={styles.chipContainer}>
              {DIFFICULTIES.map((diff) => {
                const isSelected = difficulty === diff;
                return (
                  <TouchableOpacity
                    key={diff}
                    onPress={() => {
                      setDifficulty(diff);
                      Haptics.selectionAsync().catch(() => {});
                    }}
                    style={[
                      styles.chip,
                      isSelected && styles.chipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {t(`aiTopics.difficulty${diff.charAt(0).toUpperCase() + diff.slice(1)}`, diff.charAt(0).toUpperCase() + diff.slice(1))}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Generate Button */}
          <Button
            title={isLoading ? t("aiTopics.generating", "Generating...") : t("aiTopics.generateButton", "Generate Topics")}
            onPress={handleGenerate}
            variant="primary"
            size="lg"
            disabled={isLoading || remaining <= 0}
            icon={
              isLoading ? (
                <ActivityIndicator color={palette.text} size="small" />
              ) : (
                <Icon name="magic-staff" size={24} color={palette.text} />
              )
            }
            style={styles.generateButton}
          />

          {/* Info Footer */}
          <Card style={styles.infoCard}>
            <Icon name="information" size={20} color={palette.textDim} />
            <Text style={styles.infoText}>
              {t("aiTopics.infoText", "AI will generate creative topics based on your description. You can use them immediately in your games!")}
            </Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <AITutorialModal 
        visible={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingTop: 60,
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.lg,
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
  helpButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  usageCard: {
    marginBottom: space.lg,
    padding: space.lg,
    gap: space.md,
  },
  usageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  usageTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  usageLabel: {
    fontSize: type.body,
    fontWeight: "700",
    color: palette.text,
  },
  adButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    paddingVertical: space.xs,
    paddingHorizontal: space.sm,
    borderRadius: 16,
    backgroundColor: palette.primaryDim,
    borderWidth: 1,
    borderColor: palette.primary,
  },
  adButtonText: {
    fontSize: type.small,
    fontWeight: "800",
    color: palette.primary,
  },
  progressContainer: {
    gap: space.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: palette.backgroundDim,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: palette.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: type.small,
    fontWeight: "700",
    color: palette.textDim,
    textAlign: "right",
  },
  section: {
    marginBottom: space.lg,
  },
  label: {
    fontSize: type.small,
    fontWeight: "700",
    color: palette.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: space.sm,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.sm,
  },
  sliderValue: {
    fontSize: type.h4,
    fontWeight: "900",
    color: palette.primary,
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  hint: {
    fontSize: type.small,
    color: palette.textDim,
    marginTop: space.xs,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
  chip: {
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: 20,
    backgroundColor: palette.panel,
    borderWidth: 2,
    borderColor: palette.line,
  },
  chipSelected: {
    backgroundColor: palette.primaryDim,
    borderColor: palette.primary,
  },
  chipText: {
    fontSize: type.body,
    fontWeight: "700",
    color: palette.textDim,
  },
  chipTextSelected: {
    color: palette.primary,
  },
  generateButton: {
    marginBottom: space.lg,
  },
  infoCard: {
    flexDirection: "row",
    gap: space.sm,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: type.small,
    color: palette.textDim,
    lineHeight: 18,
  },
});