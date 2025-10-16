import React, { createContext, useContext } from 'react';
import { useAdConsent } from '../hooks/useAdConsent';

const AdConsentContext = createContext(null);

export const AdConsentProvider = ({ children }) => {
  const consentData = useAdConsent();

  return (
    <AdConsentContext.Provider value={consentData}>
      {children}
    </AdConsentContext.Provider>
  );
};

export const useAdConsentContext = () => {
  const context = useContext(AdConsentContext);
  if (!context) {
    throw new Error('useAdConsentContext must be used within AdConsentProvider');
  }
  return context;
};