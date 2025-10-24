import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { palette, radii, type } from "../../constants/theme";

export default function Button({ 
  title, 
  onPress, 
  variant = "primary", 
  size = "md", 
  disabled = false,
  icon,
  iconPosition = "left",
  style,
}) {
  const variantStyle = styles[variant] || styles.primary;
  const sizeStyle = size === "lg" ? styles.lg : styles.md;
  const textColorStyle = variant === "success" ? styles.textBlack : styles.textWhite;

  const handlePress = async () => {
    onPress?.();
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
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
      <View style={styles.content}>
        {icon && iconPosition === "left" && <View style={styles.iconLeft}>{icon}</View>}
        <Text style={[styles.label, textColorStyle]}>
          {title}
        </Text>
        {icon && iconPosition === "right" && <View style={styles.iconRight}>{icon}</View>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { 
    borderRadius: radii.lg, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
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