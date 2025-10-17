import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, FlatList, Dimensions, Animated } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import Card from "../src/components/ui/Card";
import { palette, space, type, radii } from "../src/constants/theme";
import { tutorialSteps } from "../src/data/tutorialSteps";

const { width } = Dimensions.get("window");
const TUTORIAL_SEEN_KEY = "imposter-hunt-tutorial-seen";

export default function Tutorial() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}

    if (currentIndex < tutorialSteps.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      await completeTutorial();
    }
  };

  const handleSkip = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    await completeTutorial();
  };

  const completeTutorial = async () => {
    await AsyncStorage.setItem(TUTORIAL_SEEN_KEY, "true");
    router.replace("/");
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item, index }) => (
    <View style={styles.slide}>
      <View style={styles.content}>
        <Text style={styles.icon}>{item.icon}</Text>
        <Title variant="h1" style={styles.title}>
          {item.title}
        </Title>
        <Text style={styles.description}>{item.description}</Text>
        {item.tip && (
          <Card style={styles.tipCard}>
            <Text style={styles.tipLabel}>💡 Pro Tip</Text>
            <Text style={styles.tipText}>{item.tip}</Text>
          </Card>
        )}
      </View>
    </View>
  );

  return (
    <Screen>
      <View style={styles.container}>
        {/* Skip Button */}
        <View style={styles.header}>
          <Button
            title="Skip"
            onPress={handleSkip}
            variant="ghost"
            size="md"
            style={styles.skipBtn}
          />
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={tutorialSteps}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEventThrottle={16}
        />

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {tutorialSteps.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Next/Get Started Button */}
        <View style={styles.footer}>
          <Button
            title={currentIndex === tutorialSteps.length - 1 ? "Get Started" : "Next"}
            onPress={handleNext}
            variant={currentIndex === tutorialSteps.length - 1 ? "success" : "primary"}
            size="lg"
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: space.lg,
    alignItems: "flex-end",
  },
  skipBtn: {
    paddingHorizontal: space.md,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: space.lg,
  },
  content: {
    alignItems: "center",
  },
  icon: {
    fontSize: 80,
    marginBottom: space.xl,
  },
  title: {
    marginBottom: space.lg,
    textAlign: "center",
  },
  description: {
    color: palette.textDim,
    fontSize: type.body,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: space.xl,
    paddingHorizontal: space.md,
  },
  tipCard: {
    backgroundColor: palette.primary + "10",
    borderColor: palette.primary + "30",
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
  },
  tipLabel: {
    color: palette.primary,
    fontSize: type.small,
    fontWeight: "700",
    marginBottom: space.xs,
    textAlign: "center",
  },
  tipText: {
    color: palette.text,
    fontSize: type.body,
    textAlign: "center",
    lineHeight: 22,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: space.xs,
    marginBottom: space.xl,
  },
  dot: {
    height: 8,
    borderRadius: radii.full,
    backgroundColor: palette.primary,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
  },
});