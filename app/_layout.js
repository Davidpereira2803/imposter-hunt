import React, { useEffect, useState } from "react";
import { Alert, AppState } from "react-native";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useKeepAwake } from "expo-keep-awake";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGameStore } from "../src/store/gameStore";
import { useSessionStore } from "../src/store/sessionStore";
import { AdConsentProvider } from "../src/contexts/AdConsentContext";
import LoadingScreen from "../src/components/LoadingScreen";
import { useLanguageStore } from "../src/store/languageStore";
import { useTranslation } from "../src/lib/useTranslation";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-audio";

import { palette } from "../src/constants/theme";

const TUTORIAL_SEEN_KEY = "imposter-hunt-tutorial-seen";
const GAMEPLAY_PATHS = new Set(["/role", "/round", "/vote", "/imposter-guess", "/results"]);

function KeepScreenAwake() {
  useKeepAwake("munkeler-gameplay");
  return null;
}

function SessionReminder() {
  const router = useRouter();
  const { t } = useTranslation();
  const session = useSessionStore((state) => state.activeSession);
  const markReminderShown = useSessionStore((state) => state.markHourReminderShown);
  const finishSession = useSessionStore((state) => state.finishSession);

  useEffect(() => {
    if (!session || session.hourReminderShown) return undefined;
    const sessionId = session.id;
    const reminderAt = session.startedAt + 60 * 60 * 1000;
    let prompted = false;
    const maybePrompt = () => {
      if (prompted || AppState.currentState !== "active" || Date.now() < reminderAt) return;
      prompted = true;
      markReminderShown(sessionId);
      Alert.alert(
        t("leaderboard.hourReminderTitle", "Been playing for an hour?"),
        t("leaderboard.hourReminderMessage", "You can finish this session and see the rankings, or keep playing."),
        [
          { text: t("leaderboard.keepPlaying", "Keep playing"), style: "cancel" },
          {
            text: t("leaderboard.finishAndRank", "Finish & view ranking"),
            onPress: () => {
              finishSession(sessionId);
              router.push("/leaderboard");
            },
          },
        ]
      );
    };

    const timer = setTimeout(maybePrompt, Math.max(0, reminderAt - Date.now()));
    const appStateListener = AppState.addEventListener("change", (state) => {
      if (state === "active") maybePrompt();
    });
    return () => {
      clearTimeout(timer);
      appStateListener.remove();
    };
  }, [session?.id, session?.startedAt, session?.hourReminderShown, markReminderShown, finishSession, router, t]);

  return null;
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialChecked, setTutorialChecked] = useState(false);
  const hasHydrated = useGameStore((state) => state._hasHydrated);
  const sessionsHydrated = useSessionStore((state) => state._hasHydrated);
  const locale = useLanguageStore((s) => s.locale);
  const pathname = usePathname();

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

    if (hasHydrated && sessionsHydrated && tutorialChecked) {
      clearTimeout(timeout);
      setIsReady(true);
    }

    return () => clearTimeout(timeout);
  }, [hasHydrated, sessionsHydrated, tutorialChecked]);

  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
          shouldDuckAndroid: true,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });
      } catch {}
    })();
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <AdConsentProvider>
        <SessionReminder />
        <StatusBar style="light" backgroundColor={palette.bg} />
        <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={["bottom"]}>
          {GAMEPLAY_PATHS.has(pathname) && <KeepScreenAwake />}
          <Stack
            key={`stack-${locale}`}
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
              gestureEnabled: true, 
              gestureDirection: "horizontal",
              fullScreenGestureEnabled: true,
            }}
            initialRouteName={showTutorial ? "tutorial" : "index"}
          />
        </SafeAreaView>
      </AdConsentProvider>
    </SafeAreaProvider>
  );
}
