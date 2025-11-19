import React, { useEffect } from "react";
import { View, StyleSheet, BackHandler, Alert, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGameStore } from "../src/store/gameStore";
import { AdBanner } from "../src/components/AdBanner";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import { space, palette, type, radii } from "../src/constants/theme";
import { Icon, icons } from "../src/constants/icons";
import { useTranslation } from "../src/lib/useTranslation";

const TUTORIAL_SEEN_KEY = "imposter-hunt-tutorial-seen";

export default function Home() {
  const router = useRouter();
  const { players, topicKey } = useGameStore();
  const { t } = useTranslation();

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        t("home.exitTitle", "Exit"),
        t("home.exitMessage", "Exit game?"),
        [
          { text: t("common.cancel", "Cancel"), style: "cancel" },
          { text: t("home.exit", "Exit"), onPress: () => BackHandler.exitApp() }
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [t]);

  const handleQuickStart = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    if (players?.length >= 3 && topicKey) {
      router.push("/role");
    } else {
      router.push("/setup");
    }
  };

  const handleViewTutorial = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
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

  const handleAITopics = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    router.push("/ai-topics");
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
            <Title style={styles.title}>{t("home.title", "Imposter Hunt")}</Title>
            <Text style={styles.subtitle}>
              {t("home.subtitle", "A social, pass-and-play word deduction game")}
            </Text>
          </View>

          <View style={styles.actions}>
            {canQuickStart && (
              <>
                {/* Game Info Chip */}
                <View style={styles.gameInfoChip}>
                  <Icon name="account-multiple" size={16} color={palette.primary} />
                  <Text style={styles.gameInfoText}>
                    {players.length} {t("home.players", "players")} • {t(`topics.${topicKey}`, topicKey)}
                  </Text>
                </View>

                <Button
                  title={t("home.continueGame", "Continue Game")}
                  onPress={handleQuickStart}
                  variant="success"
                  size="lg"
                  icon={<Icon name="play-circle" size={24} color="#000" />}
                />
              </>
            )}

            <Button
              title={t("home.newGame", "New Game")}
              onPress={handleNewGame}
              variant="primary"
              size="lg"
              icon={<Icon name="plus-circle" size={24} color={palette.text} />}
            />
          </View>

          {/* Quick Action Cards */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={handleAITopics}
              activeOpacity={0.7}
            >
              <Icon name="lightning-bolt" size={20} color={palette.primary} />
              <Text style={styles.quickActionText}>{t("home.aiTopics", "AI Topics")}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={handleViewTutorial}
              activeOpacity={0.7}
            >
              <Icon name="help-circle" size={20} color={palette.text} />
              <Text style={styles.quickActionText}>{t("home.howToPlay", "How to Play")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Button - Only one at bottom */}
        <Button
          title={t("common.settings", "Settings")}
          onPress={handleSettings}
          variant="muted"
          size="md"
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
    paddingTop: space.xl * 2,
    paddingBottom: space.xl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: space.xl * 2,
  },
  title: {
    marginTop: space.md,
  },
  subtitle: {
    marginTop: 6,
    color: palette.textDim,
    textAlign: "center",
  },
  actions: {
    gap: space.md,
  },
  gameInfoChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
    paddingVertical: space.xs,
    paddingHorizontal: space.md,
    borderRadius: 16,
    backgroundColor: palette.primaryDim,
    borderWidth: 1,
    borderColor: palette.primary,
    alignSelf: "center",
  },
  gameInfoText: {
    fontSize: type.small,
    fontWeight: "700",
    color: palette.primary,
  },
  quickActions: {
    flexDirection: "row",
    gap: space.sm,
    marginTop: space.xl,
  },
  quickActionCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
    paddingVertical: space.md,
    borderRadius: radii.lg,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.line,
  },
  quickActionText: {
    fontSize: type.small,
    fontWeight: "700",
    color: palette.text,
  },
  settingsButton: {
    marginTop: space.md,
  },
});
