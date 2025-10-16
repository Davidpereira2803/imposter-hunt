import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Keyboard, BackHandler } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";
import Screen from "../src/components/ui/Screen";
import Title from "../src/components/ui/Title";
import Button from "../src/components/ui/Button";
import Input from "../src/components/ui/Input";
import Card from "../src/components/ui/Card";
import { space, palette, type } from "../src/constants/theme";

export default function ImposterGuess() {
  const router = useRouter();
  const { mode } = useLocalSearchParams();
  const { players, imposterIndex, secretWord, _hydrated } = useGameStore();
  const [guess, setGuess] = useState("");

  const isOptional = mode === "optional";

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => backHandler.remove();
  }, []);

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
    
    if (isCorrect) {
      router.replace({
        pathname: "/results",
        params: { outcome: "imposter" }
      });
    } else {
      if (isOptional) {
        router.back();
      } else {
        router.replace({
          pathname: "/results",
          params: { outcome: "civilians" }
        });
      }
    }
  };

  const cancel = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    
    Keyboard.dismiss();
    
    if (isOptional) {
      router.back();
    } else {
      router.replace({
        pathname: "/results",
        params: { outcome: "civilians" }
      });
    }
  };

  const imposterName = players?.[imposterIndex] || "Imposter";

  return (
    <Screen>
      <View style={styles.content}>
        <Title style={styles.title}>
          {isOptional ? "🎯 Guess Now?" : "🎯 Final Guess"}
        </Title>
        
        <Card style={styles.infoCard}>
          <Text style={styles.imposterLabel}>Imposter</Text>
          <Text style={styles.imposterName}>{imposterName}</Text>
          <Text style={styles.instruction}>
            {isOptional 
              ? "Correct = instant win. Wrong = continue playing."
              : "One chance. Guess the secret word."
            }
          </Text>
        </Card>

        <Input
          autoFocus
          placeholder="Type your guess..."
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
            title="Submit"
            onPress={submit}
            variant="primary"
            size="lg"
            disabled={!guess.trim()}
          />

          <Button
            title={isOptional ? "Cancel" : "Pass"}
            onPress={cancel}
            variant="ghost"
            size="md"
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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