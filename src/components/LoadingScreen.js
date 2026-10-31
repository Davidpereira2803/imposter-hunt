import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";
import IdentityMark from "./IdentityMark";
import { palette } from "../constants/theme";

export default function LoadingScreen() {
  return (
    <View style={s.container}>
      <Animated.View entering={FadeIn.duration(320).reduceMotion(ReduceMotion.System)} style={s.mark}>
        <IdentityMark size={120} />
      </Animated.View>
      <ActivityIndicator size="large" color={palette.primary} />
      <Text style={s.text}>Loading…</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: palette.textDim,
    fontSize: 18,
    marginTop: 20,
    fontWeight: "600",
  },
  mark: { marginBottom: 28 },
});
