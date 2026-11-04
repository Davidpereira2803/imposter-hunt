import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useAdConsentContext } from "../contexts/AdConsentContext";
import ADS_CONFIG from "../config/adshelper";

const adUnitId = __DEV__
  ? TestIds.BANNER
  : (ADS_CONFIG.BANNER_UNIT_ID || "");
  
export const AdBanner = () => {
  const [width, setWidth] = useState(0);
  const { isReady, canShowAds, canShowPersonalizedAds } = useAdConsentContext();

  if (!isReady || !canShowAds || !adUnitId) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={(event) => setWidth(Math.floor(event.nativeEvent.layout.width))}>
      {width > 0 && <BannerAd
        key={width}
        width={width}
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: !canShowPersonalizedAds,
        }}
      />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%", alignItems: "center" },
});