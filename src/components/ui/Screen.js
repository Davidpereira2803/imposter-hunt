import React from "react";
import { StyleSheet, StatusBar } from "react-native";
import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";
import { palette } from "../../constants/theme";

export default function Screen({ children, style }) {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={palette.bg} />
      <Animated.View entering={FadeIn.duration(220).reduceMotion(ReduceMotion.System)} style={[styles.container, style]}>
        {children}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
  },
});
