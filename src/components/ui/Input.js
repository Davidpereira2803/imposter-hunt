import React from "react";
import { TextInput, StyleSheet } from "react-native";
import { palette, radii, space, type } from "../../constants/theme";

export default function Input({ 
  value, 
  onChangeText, 
  placeholder,
  autoCapitalize = "sentences",
  autoCorrect = true,
  style,
  ...props 
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={palette.textDim}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      style={[styles.input, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radii.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    color: palette.text,
    fontSize: type.body,
    fontWeight: "600",
    minHeight: 52,
  },
});