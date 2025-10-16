import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { palette, radii, type } from "../../constants/theme";

export default function Button({ 
  title, 
  onPress, 
  variant = "primary", 
  size = "md", 
  disabled = false,
  style 
}) {
  const variantStyle = styles[variant] || styles.primary;
  const sizeStyle = size === "lg" ? styles.lg : styles.md;
  const textColorStyle = variant === "success" ? styles.textBlack : styles.textWhite;

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled}
      style={[
        styles.base, 
        variantStyle, 
        sizeStyle,
        disabled && styles.disabled,
        style
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, textColorStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { 
    borderRadius: radii.lg, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  md: { 
    paddingVertical: 12, 
    paddingHorizontal: 18, 
    minHeight: 48 
  },
  lg: { 
    paddingVertical: 14, 
    paddingHorizontal: 24, 
    minHeight: 52 
  },
  label: { 
    fontWeight: "900", 
    fontSize: type.body, 
    letterSpacing: 0.3 
  },
  textWhite: { 
    color: palette.text 
  },
  textBlack: { 
    color: "#000" 
  },
  primary: { 
    backgroundColor: palette.primary 
  },
  success: { 
    backgroundColor: palette.success 
  },
  danger: { 
    backgroundColor: palette.danger 
  },
  warn: { 
    backgroundColor: palette.warn 
  },
  muted: { 
    backgroundColor: palette.line 
  },
  ghost: { 
    backgroundColor: "transparent", 
    borderWidth: 1, 
    borderColor: palette.line 
  },
  disabled: {
    opacity: 0.4,
  },
});