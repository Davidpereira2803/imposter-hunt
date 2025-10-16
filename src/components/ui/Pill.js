import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { palette, radii, space, type } from "../../constants/theme";

export default function Pill({ children, variant = "default", style }) {
  const variantStyle = styles[variant] || styles.default;
  
  return (
    <View style={[styles.base, variantStyle, style]}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  text: {
    color: palette.text,
    fontSize: type.small,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  default: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
  },
  primary: {
    backgroundColor: palette.primary + "20",
    borderColor: palette.primary,
  },
  success: {
    backgroundColor: palette.success + "20",
    borderColor: palette.success,
  },
  danger: {
    backgroundColor: palette.danger + "20",
    borderColor: palette.danger,
  },
});