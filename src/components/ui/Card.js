import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { palette, radii, space } from "../../constants/theme";

export default function Card({ children, style, onPress, disabled, ...rest }) {
  if (onPress) {
    return (
      <Pressable
        {...rest}
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.pressed,
          style,
        ]}
        accessibilityRole="button"
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View {...rest} style={[styles.card, style]} accessibilityRole="summary">
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.panel,
    borderRadius: radii.lg,
    padding: space.md,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});