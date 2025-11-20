import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  interpolateColor,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { palette, type, space } from "../../constants/theme";
import { useTranslation } from "../../lib/useTranslation";
import { Icon } from "../../constants/icons";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CircularTimer({ 
  seconds, 
  totalSeconds = 60,
  isRunning,
  onStart,
  onPause,
  onReset
}) {
  const { t } = useTranslation();
  const progress = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(seconds / totalSeconds, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    if (seconds <= 10 && seconds > 0) {
      scale.value = withSequence(
        withSpring(1.05, { damping: 10 }),
        withSpring(1, { damping: 10 })
      );
    }
  }, [seconds]);

  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);

    return {
      strokeDashoffset,
      stroke: interpolateColor(
        progress.value,
        [0, 0.33, 0.66, 1],
        [palette.danger, palette.warn, palette.warn, palette.success]
      ),
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    const progressValue = seconds / totalSeconds;
    if (progressValue <= 0.16) return palette.danger;
    if (progressValue <= 0.33) return palette.warn;
    return palette.text;
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.timerWrapper, animatedContainerStyle]}>
        <Svg width={size} height={size}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={palette.line}
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress Circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeLinecap="round"
            animatedProps={animatedProps}
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>

        {/* Timer Content - Centered */}
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: getTimerColor() }]}>
            {formatTime(seconds)}
          </Text>
          <Text style={styles.label}>{t("timer.remaining", "remaining")}</Text>
          
          {/* Timer Controls - Below the time */}
          <View style={styles.controls}>
            {/* Play/Pause Button */}
            <TouchableOpacity
              onPress={isRunning ? onPause : onStart}
              style={[
                styles.controlButton,
                isRunning ? styles.pauseButton : styles.playButton
              ]}
              activeOpacity={0.7}
            >
              <Icon 
                name={isRunning ? "pause" : "play"} 
                size={20} 
                color={palette.background} 
              />
            </TouchableOpacity>

            {/* Reset Button */}
            <TouchableOpacity
              onPress={onReset}
              style={styles.resetButton}
              activeOpacity={0.7}
            >
              <Icon 
                name="refresh" 
                size={18} 
                color={palette.textDim} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  timerWrapper: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  timeContainer: {
    position: "absolute",
    alignItems: "center",
  },
  timeText: {
    fontSize: type.giant,
    fontWeight: "900",
    letterSpacing: 2,
  },
  label: {
    color: palette.textDim,
    fontSize: type.small,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: space.sm,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginTop: space.xs,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  playButton: {
    backgroundColor: palette.success,
  },
  pauseButton: {
    backgroundColor: palette.warn,
  },
  resetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.backgroundDim,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.line,
  },
});