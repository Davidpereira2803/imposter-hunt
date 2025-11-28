import React from "react";
import { View, StyleSheet } from "react-native";
import Constants from "expo-constants";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useAdConsentContext } from "../contexts/AdConsentContext";
import ADS_CONFIG from "../config/adshelper";

const adUnitId = __DEV__
  ? TestIds.BANNER
  : (ADS_CONFIG.BANNER_UNIT_ID || "");
  
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