import React from "react";
import { View, StyleSheet } from "react-native";
import Constants from "expo-constants";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useAdConsentContext } from "../contexts/AdConsentContext";

const adUnitId = __DEV__
  ? TestIds.BANNER
  : (Constants.expoConfig?.extra?.adBannerUnitId ||
     Constants.manifest?.extra?.adBannerUnitId || "");

export const AdBanner = () => {
  const { isReady, canShowAds, canShowPersonalizedAds } = useAdConsentContext();

  if (!isReady || !canShowAds || !adUnitId) {
    return <View style={styles.placeholder} />;
  }

  return (
    <BannerAd
      unitId={adUnitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: !canShowPersonalizedAds,
      }}
    />
  );
};

const styles = StyleSheet.create({
  placeholder: { height: 50 },
});