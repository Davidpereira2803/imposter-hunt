import React, { createContext, useContext, useState, useEffect } from "react";
import mobileAds, {
  AdsConsent,
  AdsConsentStatus,
} from "react-native-google-mobile-ads";

const AdConsentContext = createContext(null);

export const AdConsentProvider = ({ children }) => {
  const [consentInfo, setConsentInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tcString, setTcString] = useState(null);

  const checkConsent = async () => {
    try {
      setIsLoading(true);
      
      const info = await AdsConsent.requestInfoUpdate();
      const tcStringValue = await AdsConsent.getTCString();
      
      setConsentInfo(info);
      setTcString(tcStringValue);

      if (info.canRequestAds) {
        await mobileAds().initialize();
      }
    } catch (error) {
      console.error("Error checking consent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConsent();
  }, []);

  const showConsentForm = async () => {
    try {
      const info = await AdsConsent.requestInfoUpdate();
      
      if (!info.isConsentFormAvailable) {
        throw new Error("Consent form not available.");
      }
      
      const result = await AdsConsent.showForm();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await checkConsent();
      
      return result;
    } catch (error) {
      console.error("Error showing consent form:", error);
      throw error;
    }
  };

  const resetConsent = async () => {
    try {
      await AdsConsent.reset();
      await new Promise(resolve => setTimeout(resolve, 500));
      await checkConsent();
      return true;
    } catch (error) {
      console.error("Error resetting consent:", error);
      throw error;
    }
  };

  const canShowAds = consentInfo?.canRequestAds ?? false;
  
  // Determine personalized ads based on TC String length
  // TC String 362 chars = Full consent (personalized ads)
  // TC String 186 chars = Limited consent (non-personalized only)
  // TC String 0 chars = No consent given yet
  const canShowPersonalizedAds = (() => {
    const tcLength = tcString?.length || 0;
    const status = consentInfo?.status;
    
    if (status === AdsConsentStatus.NOT_REQUIRED) {
      return true;
    }
    
    if (status === AdsConsentStatus.OBTAINED) {
      return tcLength >= 300;
    }
    
    return false;
  })();

  return (
    <AdConsentContext.Provider
      value={{
        consentInfo,
        canShowAds,
        canShowPersonalizedAds,
        isLoading,
        isReady: !isLoading,
        showConsentForm,
        resetConsent,
        checkConsent,
        tcString,
      }}
    >
      {children}
    </AdConsentContext.Provider>
  );
};

export const useAdConsentContext = () => {
  const context = useContext(AdConsentContext);
  if (!context) {
    throw new Error("useAdConsentContext must be used within AdConsentProvider");
  }
  return context;
};