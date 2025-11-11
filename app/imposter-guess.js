import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Keyboard, BackHandler, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import { useTranslation } from "../src/lib/useTranslation";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import Input from "../src/components/ui/Input";
import Card from "../src/components/ui/Card";
import { space, palette, type } from "../src/constants/theme";

export default function ImposterGuess() {
  const router = useRouter();
  const { t } = useTranslation();
  const { players, imposterIndex, secretWord, _hydrated } = useGameStore();
  const [guess, setGuess] = useState("");

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      Alert.alert(
        t("imposterGuess.cancelTitle", "Cancel Guess?"),
        t("imposterGuess.backWarning", "Going back counts as passing your guess. Civilians will win."),
        [
          { text: t("imposterGuess.stay", "Stay"), style: "cancel" },
          { text: t("common.cancel", "Cancel"), style: "destructive", onPress: handleCancel }
        ]
      );
      return true;
    });
    return () => backHandler.remove();
  }, [t]);

  useEffect(() => {
    if (_hydrated === false) return;
    if (!players?.length || imposterIndex == null || !secretWord) {
      router.replace("/setup");
    }
  }, [players, imposterIndex, secretWord, _hydrated, router]);

  const submit = async () => {
    const clean = (s) => (s || "").trim().toLowerCase();
    const isCorrect = clean(guess) === clean(secretWord);
    
    try {
      if (isCorrect) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (e) {}

    Keyboard.dismiss();
    
    router.replace({
      pathname: "/results",
      params: { outcome: isCorrect ? "imposter" : "civilians" }
    });
  };

  const handleCancel = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    
    Keyboard.dismiss();
    
    router.replace({
      pathname: "/results",
      params: { outcome: "civilians" }
    });
  };

  const cancel = () => {
    Alert.alert(
      t("imposterGuess.cancelTitle", "Cancel Guess?"),
      t("imposterGuess.cancelWarning", "This is your only chance. Canceling means you pass and civilians win."),
      [
        { text: t("imposterGuess.stay", "Stay"), style: "cancel" },
        { text: t("imposterGuess.passAndLose", "Pass & Lose"), style: "destructive", onPress: handleCancel }
      ]
    );
  };

  const imposterName = players?.[imposterIndex] || t("imposterGuess.imposterFallback", "Imposter");

  return (
    <Screen>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.content}>
          <Title style={styles.title}>{t("imposterGuess.title", "Final Guess")}</Title>
          
          <Card style={styles.infoCard}>
            <Text style={styles.imposterLabel}>{t("role.imposter", "Imposter")}</Text>
            <Text style={styles.imposterName}>{imposterName}</Text>
            <Text style={styles.instruction}>
              {t("imposterGuess.instruction", "One chance only. Guess the secret word.\nCorrect = you win. Wrong = civilians win.")}
            </Text>
          </Card>

          <Input
            autoFocus
            placeholder={t("imposterGuess.placeholder", "Type your guess...")}
            value={guess}
            onChangeText={setGuess}
            onSubmitEditing={submit}
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <View style={styles.actions}>
            <Button
              title={t("imposterGuess.submit", "Submit Guess")}
              onPress={submit}
              variant="primary"
              size="lg"
              disabled={!guess.trim()}
            />

            <Button
              title={t("imposterGuess.passButton", "Pass (Lose)")}
              onPress={cancel}
              variant="ghost"
              size="md"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: space.lg,
  },
  title: {
    marginBottom: space.xl,
  },
  infoCard: {
    alignItems: "center",
    marginBottom: space.xl,
    paddingVertical: space.xl,
  },
  imposterLabel: {
    color: palette.textDim,
    fontSize: type.small,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: space.xs,
  },
  imposterName: {
    color: palette.danger,
    fontSize: type.h1,
    fontWeight: "900",
    marginBottom: space.md,
  },
  instruction: {
    color: palette.textDim,
    fontSize: type.body,
    textAlign: "center",
    lineHeight: 22,
  },
  input: {
    marginBottom: space.xl,
  },
  actions: {
    gap: space.md,
  },
});