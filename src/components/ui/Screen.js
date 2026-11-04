import React from "react";
import { StyleSheet, StatusBar } from "react-native";
import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette } from "../../constants/theme";

export default function Screen({ children, style }) {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={palette.bg} />
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <Animated.View entering={FadeIn.duration(220).reduceMotion(ReduceMotion.System)} style={[styles.container, style]}>
          {children}
        </Animated.View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    backgroundColor: palette.bg,
  },
});
