import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useAdConsentContext } from '../contexts/AdConsentContext';

const adUnitId = __DEV__ 
  ? TestIds.BANNER 
  : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy'; // Replace with your real ad unit ID

export const AdBanner = () => {
  const { canShowAds, canShowPersonalizedAds, isLoading } = useAdConsentContext();

  if (isLoading) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Loading ads...</Text>
      </View>
    );
  }

  if (!canShowAds) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={TestIds.BANNER}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: !canShowPersonalizedAds,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.error('Banner ad failed to load:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  placeholder: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  placeholderText: {
    color: '#666',
    fontSize: 12,
  },
});