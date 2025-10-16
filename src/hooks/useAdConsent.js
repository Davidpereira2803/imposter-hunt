import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import mobileAds, { 
  AdsConsent, 
  AdsConsentDebugGeography, 
  AdsConsentStatus 
} from 'react-native-google-mobile-ads';

export const useAdConsent = () => {
  const [consentStatus, setConsentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canShowAds, setCanShowAds] = useState(false);
  const [canShowPersonalizedAds, setCanShowPersonalizedAds] = useState(false);
  const [error, setError] = useState(null);

  const initializeConsent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const consentInfo = await AdsConsent.requestInfoUpdate({
        debugGeography: __DEV__ 
          ? AdsConsentDebugGeography.EEA
          : AdsConsentDebugGeography.DISABLED,
        testDeviceIdentifiers: __DEV__ ? ['TEST-DEVICE-ID'] : [],
      });

      console.log('Consent Info:', consentInfo);

      const { status, isConsentFormAvailable } = consentInfo;
      setConsentStatus(status);

      if (
        isConsentFormAvailable && 
        status === AdsConsentStatus.REQUIRED
      ) {
        console.log('Showing consent form...');
        const formResult = await AdsConsent.showForm();
        console.log('Form result:', formResult);
        setConsentStatus(formResult.status);
      }

      const updatedInfo = await AdsConsent.getConsentInfo();
      console.log('Updated Consent Info:', updatedInfo);

      const canShow = 
        updatedInfo.status === AdsConsentStatus.OBTAINED ||
        updatedInfo.status === AdsConsentStatus.NOT_REQUIRED;
      
      setCanShowAds(canShow);

      const isPersonalized = updatedInfo.status === AdsConsentStatus.OBTAINED;
      setCanShowPersonalizedAds(isPersonalized);

      if (canShow) {
        console.log('Initializing Mobile Ads SDK...');
        await mobileAds().initialize();
        console.log('Mobile Ads SDK initialized successfully');
      }

      setIsLoading(false);
      return { canShow, isPersonalized };

    } catch (err) {
      console.error('Error initializing consent:', err);
      setError(err.message);
      setIsLoading(false);
      setCanShowAds(false);
      setCanShowPersonalizedAds(false);
      return { canShow: false, isPersonalized: false };
    }
  }, []);

  const showConsentForm = useCallback(async () => {
    try {
      setError(null);
      const formResult = await AdsConsent.showForm();
      console.log('Manual form result:', formResult);
      setConsentStatus(formResult.status);

      const updatedInfo = await AdsConsent.getConsentInfo();
      const canShow = 
        updatedInfo.status === AdsConsentStatus.OBTAINED ||
        updatedInfo.status === AdsConsentStatus.NOT_REQUIRED;
      
      setCanShowAds(canShow);
      setCanShowPersonalizedAds(updatedInfo.status === AdsConsentStatus.OBTAINED);

      return formResult;
    } catch (err) {
      console.error('Error showing consent form:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const resetConsent = useCallback(async () => {
    try {
      await AdsConsent.reset();
      console.log('Consent reset successfully');
      await initializeConsent();
    } catch (err) {
      console.error('Error resetting consent:', err);
      setError(err.message);
    }
  }, [initializeConsent]);

  useEffect(() => {
    initializeConsent();
  }, [initializeConsent]);

  return {
    consentStatus,
    isLoading,
    canShowAds,
    canShowPersonalizedAds,
    error,
    showConsentForm,
    resetConsent,
    initializeConsent,
  };
};