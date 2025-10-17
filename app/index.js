import React, { useEffect } from "react";
import { View, StyleSheet, BackHandler, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import { AdBanner } from "../src/components/AdBanner";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import { space, palette } from "../src/constants/theme";
import { Icon, icons } from "../src/constants/icons";

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

          <Button 
            title="Settings"
            onPress={handleSettings}
            variant="ghost"
            size="md"
            icon={<Icon name={icons.settings.name} size={20} color={palette.text} />}
          />
        </View>
      </View>

      {/* <AdBanner /> */}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: space.lg,
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
