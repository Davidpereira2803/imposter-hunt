import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, Pressable } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { tutorialSteps } from "../src/data/tutorialSteps";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import { space, palette, type } from "../src/constants/theme";
import { Icon, icons as ICONS } from "../src/constants/icons";

const TUTORIAL_SEEN_KEY = "imposter-hunt-tutorial-seen";

export default function Tutorial() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const { width: windowWidth } = useWindowDimensions();
  const [pageWidth, setPageWidth] = useState(0);
  const PAGE = pageWidth || windowWidth;
  const [currentStep, setCurrentStep] = useState(0);
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const goTo = (index) => {
    scrollRef.current?.scrollTo({ x: PAGE * index, animated: true });
  };

  const handleNext = async () => {
    try { await Haptics.selectionAsync(); } catch {}
    if (isLastStep) {
      await AsyncStorage.setItem(TUTORIAL_SEEN_KEY, "true");
      router.replace("/");
    } else {
      goTo(currentStep + 1);
    }
  };

  const handleSkip = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    await AsyncStorage.setItem(TUTORIAL_SEEN_KEY, "true");
    router.replace("/");
  };

  const handleBack = async () => {
    try { await Haptics.selectionAsync(); } catch {}
    if (currentStep > 0) goTo(currentStep - 1);
  };

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Title style={styles.title}>How to Play</Title>
          {/* Removed page count from header */}
          {!isLastStep && (
            <Pressable onPress={handleSkip} hitSlop={8}>
              <Text style={styles.skipLink}>Skip</Text>
            </Pressable>
          )}
        </View>

        {/* Slides */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / PAGE);
            setCurrentStep(i);
          }}
          contentContainerStyle={{ alignItems: "stretch" }}
        >
          {tutorialSteps.map((step) => {
            const iconDef = ICONS[step.icon] || ICONS.gameLogo;
            return (
              <View key={step.id} style={[styles.slide, { width: PAGE }]}>
                <View style={styles.iconContainer}>
                  <Icon name={iconDef.name} size={64} color={palette.primary} />
                </View>

                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>

                {step.tip && (
                  <View style={styles.tipContainer}>
                    <Icon name={ICONS.tip.name} size={ICONS.tip.size} color={palette.warn} />
                    <Text style={styles.tipText}>{step.tip}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Dots */}
        <View style={styles.dots}>
          {tutorialSteps.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentStep && styles.dotActive]} />
          ))}
        </View>

        {/* Page count moved here */}
        <View style={styles.pageCount}>
          <Text style={styles.countText}>
            {currentStep + 1} / {tutorialSteps.length}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {currentStep > 0 && (
            <Button
              title="Back"
              onPress={handleBack}
              variant="ghost"
              size="md"
              style={styles.backBtn}
            />
          )}

          <View style={styles.primaryActions}>
            <Button
              title={isLastStep ? "Get Started" : "Next"}
              onPress={handleNext}
              variant="primary"
              size="lg"
              style={styles.nextBtn}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.lg,
  },
  skipLink: {
    marginTop: 4,
    color: palette.textDim,
    fontSize: type.small,
    fontWeight: "700",
    opacity: 0.85,
  },

  slide: {
    flex: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
  },
  iconContainer: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: palette.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: space.lg,
  },
  stepTitle: {
    color: palette.text,
    fontSize: type.title,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: space.md,
  },
  stepDescription: {
    color: palette.textDim,
    fontSize: type.body,
    textAlign: "center",
    lineHeight: type.body * 1.5,
    marginBottom: space.lg,
  },
  tipContainer: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.warn + "20",
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: 12,
  },
  tipText: {
    marginLeft: space.sm,
    color: palette.warn,
    fontSize: type.small,
    fontWeight: "600",
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: space.md,
    marginBottom: space.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.line,
    marginHorizontal: space.xs,
  },
  dotActive: {
    backgroundColor: palette.primary,
    width: 24,
  },

  pageCount: {
    alignItems: "center",
    marginBottom: space.md,
  },
  countText: {
    color: palette.textDim,
    fontSize: type.small,
    fontWeight: "700",
    opacity: 0.8,
  },

  actions: { gap: space.md },
  backBtn: { marginBottom: space.sm },
  primaryActions: { flexDirection: "row" },
  nextBtn: { flex: 1 },
});