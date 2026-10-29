import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AdsConsent, AdsConsentStatus } from "react-native-google-mobile-ads";
import { initAds } from "../lib/rewardedAds";

const AdConsentContext = createContext(null);

export const AdConsentProvider = ({ children }) => {
  const [consentInfo, setConsentInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adsReady, setAdsReady] = useState(false);
  const [canShowPersonalizedAds, setCanShowPersonalizedAds] = useState(false);
  const initialization = useRef(null);
  const pending = useRef(null);
  const mounted = useRef(false);

  const refresh = useCallback((action) => {
    // Serialize SDK forms and refreshes so an older result cannot overwrite a new choice.
    const previous = pending.current;
    const operation = (async () => {
      if (previous) await previous.catch(() => {});
      if (mounted.current) setIsLoading(true);
      let actionError;
      let snapshotApplied = false;
      try {
        try {
          await action();
        } catch (error) {
          actionError = error;
        }
        // On a network/form error, UMP may still have valid consent from a prior session.
        const info = await AdsConsent.getConsentInfo();
        let personalized = false;
        if (info.canRequestAds) {
          if (info.status === AdsConsentStatus.NOT_REQUIRED) {
            personalized = true;
          } else {
            try {
              const choices = await AdsConsent.getUserChoices();
              personalized = Boolean(choices.storeAndAccessInformationOnDevice &&
                choices.createAPersonalisedAdsProfile && choices.selectPersonalisedAds);
            } catch {
              // A failed decode must never opt the user into personalized requests.
            }
          }
          if (!initialization.current) {
            initialization.current = initAds().catch((error) => {
              initialization.current = null;
              throw error;
            });
          }
          await initialization.current;
        }
        if (mounted.current) {
          setConsentInfo(info);
          setCanShowPersonalizedAds(personalized);
          setAdsReady(Boolean(info.canRequestAds));
        }
        snapshotApplied = true;
        if (actionError) throw actionError;
        return { ...info, canShowPersonalizedAds: personalized };
      } catch (error) {
        if (!snapshotApplied && mounted.current) {
          setConsentInfo(null);
          setAdsReady(false);
          setCanShowPersonalizedAds(false);
        }
        throw error;
      } finally {
        if (mounted.current) setIsLoading(false);
      }
    })();
    pending.current = operation;
    return operation;
  }, []);

  const checkConsent = useCallback(() => refresh(() => AdsConsent.gatherConsent()), [refresh]);
  const showConsentForm = useCallback(() => refresh(() => AdsConsent.showPrivacyOptionsForm()), [refresh]);
  const resetConsent = useCallback(() => refresh(async () => {
    await AdsConsent.reset();
    await AdsConsent.gatherConsent();
  }), [refresh]);

  useEffect(() => {
    mounted.current = true;
    checkConsent().catch((error) => console.warn("Consent gathering failed:", error));
    return () => { mounted.current = false; };
  }, [checkConsent]);

  return (
    <AdConsentContext.Provider value={{
      consentInfo,
      canShowAds: !isLoading && adsReady && Boolean(consentInfo?.canRequestAds),
      canShowPersonalizedAds,
      isLoading,
      isReady: !isLoading,
      showConsentForm,
      resetConsent,
      checkConsent,
    }}>
      {children}
    </AdConsentContext.Provider>
  );
};

export const useAdConsentContext = () => {
  const context = useContext(AdConsentContext);
  if (!context) throw new Error("useAdConsentContext must be used within AdConsentProvider");
  return context;
};
