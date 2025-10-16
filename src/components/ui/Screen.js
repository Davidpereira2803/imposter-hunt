import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { palette } from "../../constants/theme";

export default function Screen({ children, style }) {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={palette.bg} />
      <View style={[styles.container, style]}>
        {children}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
  },
});