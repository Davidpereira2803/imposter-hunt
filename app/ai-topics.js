import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import Slider from "@react-native-community/slider";
import { useAIStore } from "../src/store/aiStore";
import { useGameStore } from "../src/store/gameStore";
import { generateTopics } from "../src/lib/generateTopics";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import Input from "../src/components/ui/Input";
import Card from "../src/components/ui/Card";
import { space, palette, type } from "../src/constants/theme";
import { Icon } from "../src/constants/icons";
import { initAds, showRewarded } from "../src/lib/rewardedAds";
import { useAdConsentContext } from "../src/contexts/AdConsentContext";

const DIFFICULTIES = ["easy", "medium", "hard", "mixed"];

const slugify = (s = "") =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function AITopics() {
  const router = useRouter();
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

  useEffect(() => {
    initAds().catch(() => {});
  }, []);

  useEffect(() => {
    ensureDailyReset();
  }, [ensureDailyReset]);

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
      Alert.alert("Limit Reached", "You've watched the maximum rewarded ads for today.");
      return;
    }
    setIsShowingAd(true);
    const res = await showRewarded({ nonPersonalized: !canShowPersonalizedAds });
    setIsShowingAd(false);

    if (res.earned) {
      incrementAdsWatched();
      try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      Alert.alert("Thanks!", "You earned +1 AI generation.");
    } else {
      Alert.alert("No reward", res.error?.message || "Ad closed before completion. Try again.");
    }
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      Alert.alert("Missing Input", "Please enter a topic description");
      return;
    }

    if (!canGenerate()) {
      Alert.alert(
        "Generation Limit",
        `You've used ${generationsToday}/${maxGenerations} generations today.\n\nWatch an ad to get more!`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Watch Ad",
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

        const baseName = (result.data.topicGroup || description || "AI Topics").trim();
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
          "Success",
          `Generated ${result.data.items?.length || 0} topics.\nAdded "${finalName}" to your list.`,
          [
            { text: "Go to Setup", onPress: () => router.push("/setup") },
            { text: "Stay", style: "cancel" },
          ]
        );

        setDescription("");
      } else {
        throw new Error(result.error || "Generation failed");
      }
    } catch (error) {
      console.error("Generation error:", error);

      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
      } catch {}

      Alert.alert(
        "Generation Failed",
        error.message || "Could not generate topics. Please try again.",
        [{ text: "OK" }]
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
            <Title style={styles.title}>AI Topic Builder</Title>
            <View style={styles.backButton} />
          </View>

          {/* Usage Info */}
          <Card style={styles.usageCard}>
            <View style={styles.usageRow}>
              <Icon name="lightning-bolt" size={20} color={palette.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.usageText}>
                  {remaining} generations remaining today
                </Text>
                <Text style={styles.usageSubText}>
                  Free left: {freeRemaining} • Ads used: {watchedAdsToday}/{maxAdsPerDay}
                </Text>
              </View>
            </View>
            {watchedAdsToday < maxAdsPerDay && (
              <Button
                title="Watch Ad for +1"
                onPress={handleWatchAd}
                variant="ghost"
                size="sm"
                icon={<Icon name="video" size={16} color={palette.text} />}
                style={styles.adButton}
                disabled={isShowingAd || watchedAdsToday >= maxAdsPerDay || !canShowAds}
              />
            )}
          </Card>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Topic Description</Text>
            <Input
              placeholder="e.g., Clash Royale cards, Harry Potter spells..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={200}
              style={styles.descriptionInput}
            />
            <Text style={styles.hint}>
              {description.length}/200 characters
            </Text>
          </View>

          {/* Number of Topics Slider */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Number of Topics</Text>
              <Text style={styles.sliderValue}>{numTopics}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={10}
              maximumValue={60}
              step={1}
              value={numTopics}
              onValueChange={setNumTopics}
              minimumTrackTintColor={palette.primary}
              maximumTrackTintColor={palette.line}
              thumbTintColor={palette.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>10</Text>
              <Text style={styles.sliderLabel}>60</Text>
            </View>
          </View>

          {/* Difficulty Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Difficulty</Text>
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
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Language Input */}
          {/*
          <View style={styles.section}>
            <Text style={styles.label}>Language (optional)</Text>
            <Input
              placeholder="en, fr, pt, es..."
              value={language}
              onChangeText={(text) => setLanguage(text.toLowerCase())}
              maxLength={5}
              autoCapitalize="none"
            />
            <Text style={styles.hint}>
              Leave as "en" for English or specify your language code
            </Text>
          </View>

          */}

          {/* Generate Button */}
          <Button
            title={isLoading ? "Generating..." : "Generate Topics"}
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
              AI will generate creative topics based on your description. You
              can use them immediately in your games!
            </Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
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
  usageCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.lg,
  },
  usageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    flex: 1,
  },
  usageText: {
    fontSize: type.body,
    fontWeight: "600",
    color: palette.text,
  },
  usageSubText: {
    fontSize: type.small,
    color: palette.textDim,
    marginTop: 2,
  },
  adButton: {
    paddingHorizontal: space.sm,
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
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: space.xs,
  },
  sliderLabel: {
    fontSize: type.small,
    color: palette.textDim,
    fontWeight: "600",
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