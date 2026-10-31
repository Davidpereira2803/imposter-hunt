import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, BackHandler, Alert, AppState, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FlipInEasyY, ReduceMotion } from "react-native-reanimated";
import { useGameStore } from "../src/store/gameStore";
import Screen from "../src/components/ui/Screen";
import Button from "../src/components/ui/Button";
import IdentityMark from "../src/components/IdentityMark";
import { space, palette, roleColors, radii } from "../src/constants/theme";
import { Icon } from "../src/constants/icons";
import { useTranslation } from "../src/lib/useTranslation";

const feedback = (action) => {
  try { Promise.resolve(action()).catch(() => {}); } catch {}
};

export default function Role() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { players, imposterIndex, secretWord, roles } = useGameStore();
  const { t } = useTranslation();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const advancing = useRef(false);

  const confirmExit = useCallback(() => {
    setRevealed(false);
    Alert.alert(t("role.exitTitle", "Exit Game"), t("role.exitMessage", "Return to setup?"), [
      { text: t("common.cancel", "Cancel"), style: "cancel" },
      { text: t("role.exit", "Exit"), onPress: () => router.replace("/setup") },
    ]);
    return true;
  }, [router, t]);

  useFocusEffect(useCallback(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", confirmExit);
    return () => { handler.remove(); setRevealed(false); };
  }, [confirmExit]));

  useEffect(() => {
    const listener = AppState.addEventListener("change", state => {
      if (state !== "active") setRevealed(false);
    });
    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (!players?.length || imposterIndex == null || !secretWord) router.replace("/setup");
  }, [players, imposterIndex, secretWord, router]);

  const handleReveal = () => {
    advancing.current = false;
    setRevealed(true);
    feedback(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
  };
  const handleNext = () => {
    if (advancing.current) return;
    advancing.current = true;
    // Remove the secret immediately; do not animate the previous player's card out.
    setRevealed(false);
    feedback(() => Haptics.selectionAsync());
    if (currentPlayerIndex < players.length - 1) setCurrentPlayerIndex(index => index + 1);
    else router.replace("/round");
  };

  if (!players?.length || imposterIndex == null || !secretWord) return null;
  const role = currentPlayerIndex === imposterIndex ? "imposter" : (roles?.[currentPlayerIndex] || "civilian");
  const configurations = {
    imposter: { icon: "incognito", label: t("role.imposter", "IMPOSTER"), mission: t("role.shortImposter", "Blend in. Listen to the hints. Guess the word or outlast the others.") },
    civilian: { icon: "account-group-outline", label: t("role.civilian", "CIVILIAN"), mission: t("role.shortCivilian", "Give a subtle hint. Keep the word secret. Find the Munkeler.") },
    sheriff: { icon: "shield-star-outline", label: t("role.sheriff", "SHERIFF"), mission: t("role.shortSheriff", "Help the civilians. Check one player's role, once per game.") },
    jester: { icon: "emoticon-devil-outline", label: t("role.jester", "JESTER"), mission: t("role.shortJester", "Look suspicious. Convince the others to vote you out and win alone.") },
  };
  const config = configurations[role] || configurations.civilian;
  const accent = roleColors[role] || roleColors.civilian;
  const last = currentPlayerIndex === players.length - 1;

  return (
    <Screen>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 18 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={confirmExit} style={styles.close} accessibilityRole="button" accessibilityLabel={t("role.exitTitle", "Exit Game")}>
              <Icon name="close" size={22} color={palette.textDim} />
            </TouchableOpacity>
            <Text style={styles.counter}>{currentPlayerIndex + 1} / {players.length}</Text>
            <Icon name="lock-outline" size={19} color={palette.textDim} />
          </View>
          <Text style={styles.eyebrow}>{t("role.passTo", "Pass to")}</Text>
          <Text style={styles.playerName}>{players[currentPlayerIndex]}</Text>

          <Animated.View key={`${currentPlayerIndex}-${revealed}`} entering={FlipInEasyY.duration(280).reduceMotion(ReduceMotion.System)}
            style={[styles.card, revealed && { borderColor: accent }]}>
            {revealed ? (
              <>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardCaption}>{t("role.privateCard", "YOUR EYES ONLY")}</Text>
                  <Icon name={config.icon} size={20} color={accent} />
                </View>
                <View style={[styles.roleSeal, { borderColor: accent, backgroundColor: `${accent}12` }]}>
                  <Icon name={config.icon} size={54} color={accent} />
                </View>
                <Text style={[styles.roleName, { color: accent }]}>{config.label}</Text>
                <View style={styles.wordSection}>
                  <Text style={styles.wordLabel}>{role === "imposter" ? t("role.hiddenWord", "THE WORD IS A MYSTERY") : t("role.secretWordLabel", "Your Secret Word")}</Text>
                  <Text style={styles.word}>{role === "imposter" ? "? ? ?" : secretWord}</Text>
                </View>
                <View style={styles.mission}>
                  <Text style={styles.missionTitle}>{t("role.missionTitle", "Your Mission")}</Text>
                  <Text style={styles.missionText}>{config.mission}</Text>
                </View>
              </>
            ) : (
              <View style={styles.cardBack}>
                <Text style={styles.cardCaption}>THE MUNKELER</Text>
                <View style={styles.backMark}><IdentityMark size={150} /></View>
                <Text style={styles.backTitle}>{t("role.secretIdentity", "A secret identity awaits.")}</Text>
                <Text style={styles.backHint}>{t("role.privateHint", "Make sure only you can see the screen.")}</Text>
                <Icon name="lock-outline" size={20} color={palette.textDim} />
              </View>
            )}
          </Animated.View>

          <View style={styles.action}>
            <Button title={revealed ? (last ? t("role.hideAndStart", "Hide & start round") : t("role.hideAndPass", "Hide & Pass")) : t("role.revealRole", "Reveal Role")}
              onPress={revealed ? handleNext : handleReveal} size="lg"
              icon={<Icon name={revealed ? "eye-off-outline" : "eye-outline"} size={22} color={palette.text} />} />
            <Text style={styles.footer}>{t("role.keepSecret", "Your role stays with you. Pass the phone, not the secret.")}</Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: space.lg, paddingBottom: space.xl },
  container: { width: "100%", maxWidth: 440, alignSelf: "center", flex: 1, justifyContent: "center" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  close: { minWidth: 48, minHeight: 48, justifyContent: "center", alignItems: "center", borderRadius: 16, borderWidth: 1, borderColor: palette.line },
  counter: { fontSize: 13, letterSpacing: 3, color: palette.textDim, fontWeight: "700" },
  eyebrow: { textAlign: "center", textTransform: "uppercase", color: palette.textDim, fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 8 },
  playerName: { color: palette.text, textAlign: "center", fontSize: 34, fontWeight: "900", letterSpacing: -0.8, marginBottom: 24 },
  card: { backgroundColor: palette.panel, borderWidth: 1, borderColor: palette.line, borderRadius: radii.xl, padding: 24, minHeight: 390 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", gap: 12, alignItems: "center" },
  cardCaption: { color: palette.textDim, fontSize: 10, fontWeight: "800", letterSpacing: 2, flexShrink: 1 },
  roleSeal: { width: 94, height: 94, borderRadius: 28, borderWidth: 1, justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 24, marginBottom: 18 },
  roleName: { fontSize: 22, fontWeight: "900", letterSpacing: 2, textAlign: "center" },
  wordSection: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: palette.line, marginTop: 22, paddingVertical: 20 },
  wordLabel: { color: palette.textDim, fontSize: 10, textAlign: "center", textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 10 },
  word: { fontSize: 34, fontWeight: "900", color: palette.text, textAlign: "center", letterSpacing: -0.5 },
  mission: { paddingTop: 20 },
  missionTitle: { color: palette.text, fontWeight: "700", fontSize: 12, marginBottom: 8 },
  missionText: { color: palette.textDim, fontSize: 14, lineHeight: 22 },
  cardBack: { flex: 1, alignItems: "center", justifyContent: "space-between", gap: 20 },
  backMark: { paddingVertical: 8 },
  backTitle: { color: palette.text, fontSize: 21, fontWeight: "800", textAlign: "center" },
  backHint: { color: palette.textDim, textAlign: "center", fontSize: 14, lineHeight: 21, maxWidth: 230 },
  action: { marginTop: 22 },
  footer: { color: palette.textDim, fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 14 },
});
