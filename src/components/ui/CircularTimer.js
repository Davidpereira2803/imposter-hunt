import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
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
import { palette, type } from "../../constants/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CircularTimer({ seconds, totalSeconds = 60 }) {
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

  const size = 280;
  const strokeWidth = 16;
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
    if (progressValue <= 0.16) return palette.danger; // 0-10s
    if (progressValue <= 0.33) return palette.warn;   // 11-20s
    return palette.text;                               // 21-60s
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

        {/* Timer Text - Absolutely positioned in center */}
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: getTimerColor() }]}>
            {formatTime(seconds)}
          </Text>
          <Text style={styles.label}>remaining</Text>
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
    width: 280,
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  timeContainer: {
    position: "absolute",
    alignItems: "center",
  },
  timeText: {
    fontSize: type.giant * 1.2,
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
  },
});