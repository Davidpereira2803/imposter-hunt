import React from "react";
import { View, StyleSheet } from "react-native";
import Pill from "./ui/Pill";
import { space } from "../constants/theme";

export default function HUD({ round, aliveCount }) {
  return (
    <View style={styles.container}>
      <Pill>Round {round}</Pill>
      <Pill>{aliveCount} Alive</Pill>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: space.sm,
    marginBottom: space.lg,
  },
});
