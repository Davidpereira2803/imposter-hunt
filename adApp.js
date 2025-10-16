import React, { useEffect } from 'react';
import { SafeAreaView, Text } from 'react-native';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

export default function App() {
  useEffect(() => {
    mobileAds().initialize().catch(() => {});
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ marginBottom: 16, fontSize: 18 }}>AdMob Test Banner</Text>
      <BannerAd
        unitId={TestIds.BANNER}            // "ca-app-pub-3940256099942544/6300978111"
        size={BannerAdSize.BANNER}
        onAdLoaded={() => console.log('Banner loaded')}
        onAdFailedToLoad={(e) => console.log('Banner failed', e)}
      />
    </SafeAreaView>
  );
}
