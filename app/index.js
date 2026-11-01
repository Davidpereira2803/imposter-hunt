import React from "react";
import { View, StyleSheet, BackHandler, Alert, Text, TouchableOpacity, ScrollView } from "react-native";
import Animated, { ZoomIn, ReduceMotion } from "react-native-reanimated";
import { useRouter, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGameStore } from "../src/store/gameStore";
import { AdBanner } from "../src/components/AdBanner";
import Screen from "../src/components/ui/Screen";
import IdentityMark from "../src/components/IdentityMark";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../src/components/ui/Button";
import { space, palette, radii } from "../src/constants/theme";
import { Icon } from "../src/constants/icons";
import { useTranslation } from "../src/lib/useTranslation";

const TUTORIAL_SEEN_KEY = "imposter-hunt-tutorial-seen";

export default function Home() {
  const router = useRouter();
  const { players, topicKey, secretWord, imposterIndex, getTopicByKey } = useGameStore();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    React.useCallback(() => {
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
    }, [t])
  );

  const handleQuickStart = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    if (players?.length >= 3 && topicKey && secretWord && imposterIndex != null) {
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

  const canQuickStart = players?.length >= 3 && topicKey && secretWord && imposterIndex != null;

  const getTopicDisplayName = (key) => {
    if (!key) return "";
    
    const topic = getTopicByKey(key);
    
    if (!topic) return key;
    
    if (topic.isCustom) {
      return topic.name;
    }
    
    const translated = t(`topics.${key}`, topic.name);
    return translated;
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 18 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.topBar}>
            <Text style={styles.wordmark}>THE MUNKELER<Text style={{ color: palette.primary }}>.</Text></Text>
            <TouchableOpacity onPress={handleSettings} style={styles.settings}
              accessibilityRole="button" accessibilityLabel={t("common.settings", "Settings")}>
              <Icon name="cog-outline" size={23} color={palette.textDim} />
            </TouchableOpacity>
          </View>

          <View style={styles.hero}>
            <View style={styles.deck} accessible={false}>
              <View style={[styles.cardOutline, styles.cardLeft]} />
              <View style={[styles.cardOutline, styles.cardRight]} />
              <Animated.View entering={ZoomIn.duration(420).delay(100).reduceMotion(ReduceMotion.System)} style={styles.heroCard}>
                <IdentityMark size={124} />
              </Animated.View>
            </View>
            <Text style={styles.eyebrow}>{t("home.eyebrow", "ONE PHONE. MANY SUSPECTS.")}</Text>
            <Text style={styles.title}>{t("home.title", "Who's the Munkeler?")}</Text>
            <Text style={styles.subtitle}>{t("home.subtitle", "A social, pass-and-play word deduction game")}</Text>
          </View>

          <Button title={t("home.play", "Let's play")} onPress={handleNewGame} size="lg"
            icon={<Icon name="arrow-right" size={23} color={palette.text} />} iconPosition="right" />
          <View style={styles.gameFacts}>
            <Icon name="account-multiple-outline" size={16} color={palette.textDim} />
            <Text style={styles.fact}>{t("home.minimumPlayers", "3+ players")}</Text>
            <Text style={styles.fact}>·</Text>
            <Icon name="cellphone" size={16} color={palette.textDim} />
            <Text style={styles.fact}>{t("home.oneDevice", "Pass & play")}</Text>
          </View>

          {canQuickStart && (
            <TouchableOpacity style={styles.resume} onPress={handleQuickStart} accessibilityRole="button">
              <View style={styles.resumeIcon}><Icon name="play-outline" size={23} color={palette.text} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.resumeTitle}>{t("home.continueGame", "Continue Game")}</Text>
                <Text style={styles.resumeDetail}>{players.length} {t("home.players", "players")} · {getTopicDisplayName(topicKey)}</Text>
              </View>
              <Icon name="chevron-right" size={22} color={palette.textDim} />
            </TouchableOpacity>
          )}

          <View style={styles.extras}>
            {[
              { key: "aiTopics", label: t("home.aiTopics", "AI Topics"), icon: "creation", action: handleAITopics },
              { key: "howToPlay", label: t("home.howToPlay", "How to Play"), icon: "cards-outline", action: handleViewTutorial },
            ].map(item => (
              <TouchableOpacity key={item.key} style={styles.extra} onPress={item.action} accessibilityRole="button">
                <Icon name={item.icon} size={24} color={palette.textDim} />
                <Text style={styles.extraLabel}>{item.label}</Text>
                <Icon name="arrow-top-right" size={16} color={palette.textDim} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <AdBanner />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: space.lg, paddingBottom: space.xl },
  container: { width: "100%", maxWidth: 480, alignSelf: "center", flex: 1, justifyContent: "center" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 22 },
  wordmark: { color: palette.text, fontSize: 14, fontWeight: "900", letterSpacing: 2 },
  settings: { minWidth: 48, minHeight: 48, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: palette.line, borderRadius: 16 },
  hero: { alignItems: "center", paddingBottom: 28 },
  deck: { width: 220, height: 204, alignItems: "center", justifyContent: "center", marginBottom: 25 },
  cardOutline: { position: "absolute", width: 142, height: 180, backgroundColor: palette.panel, borderWidth: 1, borderColor: palette.line, borderRadius: 22 },
  cardLeft: { transform: [{ rotate: "-13deg" }, { translateX: -20 }], top: 17 },
  cardRight: { transform: [{ rotate: "12deg" }, { translateX: 20 }], top: 17 },
  heroCard: { width: 148, height: 190, backgroundColor: palette.panel, borderRadius: 22, borderWidth: 1, borderColor: palette.primary, alignItems: "center", justifyContent: "center" },
  eyebrow: { color: palette.textDim, fontSize: 10, fontWeight: "800", letterSpacing: 2.1, textAlign: "center", marginBottom: 13 },
  title: { color: palette.text, fontSize: 38, lineHeight: 44, fontWeight: "900", textAlign: "center", letterSpacing: -1.4, marginBottom: 12 },
  subtitle: { color: palette.textDim, fontSize: 15, lineHeight: 23, textAlign: "center", maxWidth: 290 },
  gameFacts: { flexDirection: "row", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8, marginTop: 14, marginBottom: 25 },
  fact: { color: palette.textDim, fontSize: 12 },
  resume: { borderWidth: 1, borderColor: palette.line, borderRadius: radii.lg, padding: 14, backgroundColor: palette.panel, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  resumeIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: palette.backgroundDim, justifyContent: "center", alignItems: "center" },
  resumeTitle: { color: palette.text, fontWeight: "800", fontSize: 14 },
  resumeDetail: { color: palette.textDim, fontSize: 12, marginTop: 4 },
  extras: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  extra: { flexGrow: 1, flexBasis: 145, flexDirection: "row", alignItems: "center", gap: 9, minHeight: 70, padding: 14, borderWidth: 1, borderColor: palette.line, borderRadius: radii.lg },
  extraLabel: { color: palette.text, flex: 1, fontSize: 13, fontWeight: "700" },
});
