import React from "react";
import { Text, StyleSheet } from "react-native";
import { palette, type } from "../../constants/theme";

export default function Title({ children, style, variant = "h1" }) {
  return (
    <Text style={[styles.base, styles[variant], style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: palette.text,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  h1: {
    fontSize: type.h1,
  },
  h2: {
    fontSize: type.h2,
  },
  h3: {
    fontSize: type.h3,
  },
  giant: {
    fontSize: type.giant,
  },
});