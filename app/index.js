import React, { useEffect } from "react";
import { View, StyleSheet, BackHandler, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGameStore } from "../src/store/gameStore";
import { AdBanner } from "../src/components/AdBanner";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import { space, palette } from "../src/constants/theme";
import { Icon, icons } from "../src/constants/icons";

const TUTORIAL_SEEN_KEY = "imposter-hunt-tutorial-seen";

export default function Home() {
  const router = useRouter();
  const { players, topicKey } = useGameStore();

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Exit", "Exit game?", [
        { text: "Cancel", style: "cancel" },
        { text: "Exit", onPress: () => BackHandler.exitApp() }
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  const handleQuickStart = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    if (players?.length >= 3 && topicKey) {
      router.push("/role");
    } else {
      router.push("/setup");
    }
  };

  const handleViewTutorial = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    
    await AsyncStorage.removeItem(TUTORIAL_SEEN_KEY);
    router.push("/tutorial");
  };

  const handleNewGame = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    router.push("/setup");
  };

  const handleSettings = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    router.push("/settings");
  };

  const canQuickStart = players?.length >= 3 && topicKey;

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Icon 
              name={icons.gameLogo.name} 
              size={icons.gameLogo.size} 
              color={palette.primary}
            />
            <Title style={styles.title}>Imposter Hunt</Title>
          </View>

          <View style={styles.actions}>
            {canQuickStart && (
              <Button 
                title="Continue Game"
                onPress={handleQuickStart}
                variant="success"
                size="lg"
                icon={<Icon name="play-circle" size={24} color="#000" />}
              />
            )}

            <Button 
              title="New Game"
              onPress={handleNewGame}
              variant="primary"
              size="lg"
              icon={<Icon name="plus-circle" size={24} color={palette.text} />}
            />
          </View>
        </View>

        {/* How to Play Button */}
        <Button 
          title="How to Play"
          onPress={handleViewTutorial}
          variant="primary" 
          size="lg"
          icon={<Icon name="help-circle" size={20} color={palette.text} />}
          style={styles.howToPlayButton}
        />

        {/* Settings Button */}
        <Button 
          title="Settings"
          onPress={handleSettings}
          variant="primary"
          size="lg"
          icon={<Icon name={icons.settings.name} size={20} color={palette.text} />}
          style={styles.settingsButton}
        />

      </View>

      <AdBanner />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: space.lg,
  },
  howToPlayButton: {
    position: 'absolute',
    bottom: space.md,
    left: space.md,
    width: '40%',
    height: 50,
    zIndex: 1,
  },
  settingsButton: {
    position: 'absolute',
    bottom: space.md,
    right: space.md,
    width: '40%',
    height: 50,
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingTop: space.xl * 2,
  },
  header: {
    alignItems: "center",
    marginBottom: space.xl * 2,
  },
  title: {
    marginTop: space.md,
  },
  actions: {
    gap: space.md,
  },
});
