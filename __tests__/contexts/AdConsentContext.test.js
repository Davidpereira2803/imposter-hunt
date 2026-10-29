import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';
import { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';
import { initAds } from '../../src/lib/rewardedAds';
import { AdConsentProvider, useAdConsentContext } from '../../src/contexts/AdConsentContext';

jest.mock('react-native-google-mobile-ads', () => ({
  AdsConsentStatus: { REQUIRED: 'REQUIRED', OBTAINED: 'OBTAINED', NOT_REQUIRED: 'NOT_REQUIRED' },
  AdsConsent: {
    gatherConsent: jest.fn(), getConsentInfo: jest.fn(), getUserChoices: jest.fn(),
    showPrivacyOptionsForm: jest.fn(), reset: jest.fn(),
  },
}));
jest.mock('../../src/lib/rewardedAds', () => ({ initAds: jest.fn() }));

let context;
function Probe() {
  context = useAdConsentContext();
  return <Text>{context.isLoading ? 'loading' : 'ready'}</Text>;
}
const open = () => render(<AdConsentProvider><Probe /></AdConsentProvider>);
const ready = async () => waitFor(() => expect(context.isLoading).toBe(false));
const granted = { storeAndAccessInformationOnDevice: true, createAPersonalisedAdsProfile: true, selectPersonalisedAds: true };

beforeEach(() => {
  jest.resetAllMocks();
  AdsConsent.gatherConsent.mockResolvedValue(undefined);
  AdsConsent.getConsentInfo.mockResolvedValue({ canRequestAds: true, status: AdsConsentStatus.OBTAINED });
  AdsConsent.getUserChoices.mockResolvedValue(granted);
  initAds.mockResolvedValue(undefined);
});

test('waits for consent gathering before initializing or permitting ads', async () => {
  let finish;
  AdsConsent.gatherConsent.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  open();
  expect(context.canShowAds).toBe(false);
  expect(initAds).not.toHaveBeenCalled();
  await act(async () => finish());
  await ready();
  expect(initAds).toHaveBeenCalledTimes(1);
  expect(context.canShowAds).toBe(true);
});

test('does not initialize when UMP does not allow ads', async () => {
  AdsConsent.getConsentInfo.mockResolvedValue({ canRequestAds: false, status: AdsConsentStatus.REQUIRED });
  open(); await ready();
  expect(initAds).not.toHaveBeenCalled();
  expect(context.canShowAds).toBe(false);
});

test.each(['storeAndAccessInformationOnDevice', 'createAPersonalisedAdsProfile', 'selectPersonalisedAds'])('respects declined %s without blocking non-personalized ads', async (choice) => {
  AdsConsent.getUserChoices.mockResolvedValue({ ...granted, [choice]: false });
  open(); await ready();
  expect(context.canShowAds).toBe(true);
  expect(context.canShowPersonalizedAds).toBe(false);
});

test('uses decoded purpose choices for personalization', async () => {
  open(); await ready();
  expect(context.canShowPersonalizedAds).toBe(true);
});

test('falls back to non-personalized requests when decoding fails', async () => {
  AdsConsent.getUserChoices.mockRejectedValue(new Error('bad TCF string'));
  open(); await ready();
  expect(context.canShowAds).toBe(true);
  expect(context.canShowPersonalizedAds).toBe(false);
});

test('can use previous-session consent when consent gathering fails', async () => {
  AdsConsent.gatherConsent.mockRejectedValue(new Error('offline'));
  open(); await ready();
  expect(context.canShowAds).toBe(true);
});

test('fails closed when neither fresh nor previous consent is readable', async () => {
  AdsConsent.gatherConsent.mockRejectedValue(new Error('offline'));
  AdsConsent.getConsentInfo.mockRejectedValue(new Error('no snapshot'));
  open(); await ready();
  expect(context.canShowAds).toBe(false);
  expect(initAds).not.toHaveBeenCalled();
});

test('refreshes choices after privacy options and initializes the SDK only once', async () => {
  open(); await ready();
  AdsConsent.getUserChoices.mockResolvedValue({ ...granted, selectPersonalisedAds: false });
  let info;
  await act(async () => { info = await context.showConsentForm(); });
  expect(AdsConsent.showPrivacyOptionsForm).toHaveBeenCalledTimes(1);
  expect(info.canShowPersonalizedAds).toBe(false);
  expect(context.canShowPersonalizedAds).toBe(false);
  expect(initAds).toHaveBeenCalledTimes(1);
});

test('stops permitting ads after consent is no longer available', async () => {
  open(); await ready();
  AdsConsent.getConsentInfo.mockResolvedValue({ canRequestAds: false, status: AdsConsentStatus.REQUIRED });
  await act(async () => { await context.checkConsent(); });
  expect(context.canShowAds).toBe(false);
});

test('allows retry after initialization fails', async () => {
  initAds.mockRejectedValueOnce(new Error('SDK failed'));
  open(); await ready();
  expect(context.canShowAds).toBe(false);
  await act(async () => { await context.checkConsent(); });
  expect(context.canShowAds).toBe(true);
  expect(initAds).toHaveBeenCalledTimes(2);
});

test('serializes a privacy change requested during initial consent gathering', async () => {
  let finish;
  AdsConsent.gatherConsent.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  AdsConsent.getConsentInfo
    .mockResolvedValueOnce({ canRequestAds: true, status: AdsConsentStatus.OBTAINED })
    .mockResolvedValueOnce({ canRequestAds: false, status: AdsConsentStatus.REQUIRED });
  open();
  let privacy;
  act(() => { privacy = context.showConsentForm(); });
  expect(AdsConsent.showPrivacyOptionsForm).not.toHaveBeenCalled();
  await act(async () => { finish(); await privacy; });
  expect(AdsConsent.showPrivacyOptionsForm).toHaveBeenCalledTimes(1);
  expect(initAds).toHaveBeenCalledTimes(1);
  expect(context.canShowAds).toBe(false);
});
