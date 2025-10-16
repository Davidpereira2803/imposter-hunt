import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HUD({ round, aliveCount }) {
  return (
    <View style={s.hud}>
      {round && <Text style={s.hudText}>Round {round}</Text>}
      <Text style={s.hudText}>{aliveCount || 0} alive</Text>
    </View>
  );
}

const s = StyleSheet.create({
  hud: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  hudText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
