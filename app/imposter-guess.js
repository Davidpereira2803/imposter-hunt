import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, BackHandler } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useGameStore } from "../src/store/gameStore";

export default function ImposterGuess() {
  const router = useRouter();
  const { players, imposterIndex, secretWord, _hydrated } = useGameStore();
  const [guess, setGuess] = useState("");

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
    } catch (e) {
    }

    Keyboard.dismiss();
    
    router.replace({
      pathname: "/results",
      params: { outcome: isCorrect ? "imposter" : "civilians" }
    });
  };

  const cancel = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
    }
    
    Keyboard.dismiss();
    router.replace({
      pathname: "/results",
      params: { outcome: "civilians" }
    });
  };

  const imposterName = players?.[imposterIndex]?.name || "Imposter";

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎯 Final Chance</Text>
        <Text style={styles.subtitle}>
          {imposterName}, you get one guess at the secret word.
        </Text>
        <Text style={styles.instructions}>
          Guess correctly to win the game. Wrong guess means civilians win!
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            autoFocus
            placeholder="Enter your guess..."
            placeholderTextColor="#666"
            value={guess}
            onChangeText={setGuess}
            onSubmitEditing={submit}
            style={styles.input}
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={submit}
          disabled={!guess.trim()}
        >
          <Text style={styles.buttonText}>Submit Guess</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={cancel}
        >
          <Text style={[styles.buttonText, styles.cancelText]}>Pass (Civilians Win)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  instructions: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#333",
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: "#23a6f0",
  },
  cancelButton: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  cancelText: {
    color: "#999",
  },
});