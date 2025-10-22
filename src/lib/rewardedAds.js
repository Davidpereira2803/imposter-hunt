import mobileAds, {
  AdEventType,
  MaxAdContentRating,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";
import { ca } from "zod/v4/locales";

const REWARDED_ID = __DEV__
  ? TestIds.REWARDED
  : ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy;
  //: process.env.AD_REWARDED_UNIT_ID;

export async function initAds() {
  await mobileAds().setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.T,
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false,
    testDeviceIdentifiers: __DEV__ ? ["EMULATOR"] : [],
  });
  await mobileAds().initialize();
}

export function showRewarded({ nonPersonalized = false } = {}) {
  return new Promise((resolve) => {
    const ad = RewardedAd.createForAdRequest(REWARDED_ID, {
      requestNonPersonalizedAdsOnly: nonPersonalized,
    });

    let earned = false;

    const unsubLoaded = ad.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        ad.show().catch((e) => {
          cleanup();
          resolve({ earned: false, error: e });
        });
      }
    );

    const unsubReward = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        earned = true;
      }
    );

    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      cleanup();
      resolve({ earned });
    });

    const unsubError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      cleanup();
      resolve({ earned: false, error });
    });

    const cleanup = () => {
      try {
        unsubLoaded();
        unsubReward();
        unsubClosed();
        unsubError();
      } catch {}
    };

    ad.load();
  });
}