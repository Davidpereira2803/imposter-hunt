import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { palette } from "../constants/theme";

export default function LoadingScreen() {
  return (
    <View style={s.container}>
      <ActivityIndicator size="large" color={palette.primary} />
      <Text style={s.text}>Loading…</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 18,
    marginTop: 20,
    fontWeight: "600",
  },
});