import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { palette, radii, space } from "../../constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Card({ children, style, onPress, disabled, ...rest }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.99, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.85, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 100 });
    }
  };

  if (onPress) {
    return (
      <AnimatedPressable
        {...rest}
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[styles.card, animatedStyle, style]}
        accessibilityRole="button"
      >
        {children}
      </AnimatedPressable>
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
});