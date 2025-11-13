import React, { useEffect, useRef } from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { palette, radii, type } from "../../constants/theme";
import { useAudioPlayer } from "expo-audio";

const audioSource = require("../../../assets/sounds/button-click.wav");

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

  const player = useAudioPlayer(audioSource);
  const playerRef = useRef(player);
  playerRef.current = player;

  useEffect(() => {
    let mounted = true;
    const p = playerRef.current;
    (async () => {
      try {
        if (p?.loadAsync) await p.loadAsync().catch(() => {});
      } catch {
      }
    })();
    return () => {
      mounted = false;
      try {
        if (p?.unloadAsync) p.unloadAsync().catch(() => {});
      } catch {}
    };
  }, []);

  const safePlay = () => {
    try {
      const p = playerRef.current;
      if (!p) return;
      if (typeof p.playAsync === "function") return p.playAsync().catch(() => {});
      if (typeof p.replayAsync === "function") return p.replayAsync().catch(() => {});
      if (typeof p.play === "function") return p.play();
      if (typeof p === "function") return p();
    } catch {
    }
  };

  const handlePress = () => {
    if (disabled) return;
    safePlay();
    try {
      onPress?.();
    } catch (e) {
      console.warn("Button onPress error:", e);
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
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
        <Text style={[styles.label, textColorStyle]} adjustsFontSizeToFit numberOfLines={1}>
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