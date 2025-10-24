import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGameStore } from "../src/store/gameStore";
import { AdConsentProvider } from "../src/contexts/AdConsentContext";
import LoadingScreen from "../src/components/LoadingScreen";

const TUTORIAL_SEEN_KEY = "imposter-hunt-tutorial-seen";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialChecked, setTutorialChecked] = useState(false);
  const hasHydrated = useGameStore((state) => state._hasHydrated);

  useEffect(() => {
    useGameStore.getState().loadCustomTopics?.();
  }, []);

  useEffect(() => {
    const checkTutorial = async () => {
      try {
        const seen = await AsyncStorage.getItem(TUTORIAL_SEEN_KEY);
        setShowTutorial(seen !== "true");
      } catch (error) {
        console.error("Error checking tutorial status:", error);
        setShowTutorial(false);
      } finally {
        setTutorialChecked(true);
      }
    };

    checkTutorial();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("Hydration timeout reached, showing app anyway");
      setIsReady(true);
    }, 3000);

    if (hasHydrated && tutorialChecked) {
      clearTimeout(timeout);
      setIsReady(true);
    }

    return () => clearTimeout(timeout);
  }, [hasHydrated, tutorialChecked]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <AdConsentProvider>
      <StatusBar style="light" backgroundColor="#000000" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
        initialRouteName={showTutorial ? "tutorial" : "index"}
      />
    </AdConsentProvider>
  );
}
