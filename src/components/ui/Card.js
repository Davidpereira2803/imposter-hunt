import React from "react";
import { View, StyleSheet } from "react-native";
import { palette, radii, space, shadow } from "../../constants/theme";

export default function Card({ children, style }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.panel,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.line,
    padding: space.lg,
    ...shadow.card,
  },
});