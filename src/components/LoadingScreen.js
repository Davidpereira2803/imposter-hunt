import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

export default function LoadingScreen() {
  return (
    <View style={s.container}>
      <ActivityIndicator size="large" color="#23a6f0" />
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