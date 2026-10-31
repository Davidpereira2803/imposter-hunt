import React from "react";
import { Image } from "react-native";

const lionMark = require("../../assets/lion-mark.png");

// Shared brand mark used on the home screen and hidden role-card backs.
export default function IdentityMark({ size = 112, style }) {
  return (
    <Image
      source={lionMark}
      accessible={false}
      resizeMode="contain"
      style={[{ width: size, height: size }, style]}
    />
  );
}
