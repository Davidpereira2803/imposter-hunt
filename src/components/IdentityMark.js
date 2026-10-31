import React from "react";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { palette } from "../constants/theme";

// A shared card-back emblem, independent of any player's assigned role.
export default function IdentityMark({ size = 112, color = palette.text }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessible={false}>
      <Rect x="18" y="18" width="84" height="84" rx="22" rotation="45 60 60"
        fill={palette.primaryDim} stroke={palette.primary} strokeWidth="1" />
      <Circle cx="60" cy="60" r="42" fill="none" stroke={palette.primary} strokeOpacity="0.35" />
      <Path d="M28 43 Q60 62 92 43 L86 73 Q60 98 34 73Z" fill={color} />
      <Path d="M37 57 L53 62 L48 68 L38 65Z M83 57 L67 62 L72 68 L82 65Z"
        fill={palette.bg} />
      <Path d="M56 78 L64 78" stroke={palette.bg} strokeWidth="3" strokeLinecap="round" />
      <Circle cx="60" cy="18" r="3" fill={palette.primary} />
    </Svg>
  );
}
