import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AdBanner } from '../../src/components/AdBanner';

jest.mock('react-native-google-mobile-ads', () => ({
  BannerAd: jest.fn(() => null),
  BannerAdSize: {
    ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
  },
  TestIds: {
    BANNER: 'ca-app-pub-xxxxxxxxxxxxxxxx/6300978111',
  },
}));

jest.mock('../../src/contexts/AdConsentContext', () => ({
  useAdConsentContext: jest.fn(),
}));

jest.mock('../../src/config/adshelper', () => ({
  BANNER_UNIT_ID: 'test-unit-id',
}));

const { useAdConsentContext } = require('../../src/contexts/AdConsentContext');
const { BannerAd } = require('react-native-google-mobile-ads');

const renderBanner = () => {
  const ui = render(<AdBanner />);
  const wrapper = ui.root?.findAllByType('View')[0];
  if (wrapper) fireEvent(wrapper, 'layout', { nativeEvent: { layout: { width: 320 } } });
  return ui;
};

describe('AdBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should leave no empty space when not ready', () => {
    useAdConsentContext.mockReturnValue({
      isReady: false,
      canShowAds: true,
      canShowPersonalizedAds: true,
    });

    const { toJSON } = renderBanner();
    expect(toJSON()).toBeNull();
  });

  it('should leave no empty space when ads cannot be shown', () => {
    useAdConsentContext.mockReturnValue({
      isReady: true,
      canShowAds: false,
      canShowPersonalizedAds: true,
    });

    const { toJSON } = renderBanner();
    expect(toJSON()).toBeNull();
  });

  it('should show BannerAd when all conditions are met', () => {
    useAdConsentContext.mockReturnValue({
      isReady: true,
      canShowAds: true,
      canShowPersonalizedAds: true,
    });

    renderBanner();
    expect(BannerAd).toHaveBeenCalled();
    expect(BannerAd.mock.calls[0][0].width).toBe(320);
  });

  it('should request personalized ads when canShowPersonalizedAds is true', () => {
    useAdConsentContext.mockReturnValue({
      isReady: true,
      canShowAds: true,
      canShowPersonalizedAds: true,
    });

    renderBanner();
    const call = BannerAd.mock.calls[0]?.[0];
    expect(call?.requestOptions?.requestNonPersonalizedAdsOnly).toBe(false);
  });

  it('should request non-personalized ads when canShowPersonalizedAds is false', () => {
    useAdConsentContext.mockReturnValue({
      isReady: true,
      canShowAds: true,
      canShowPersonalizedAds: false,
    });

    renderBanner();
    const call = BannerAd.mock.calls[0]?.[0];
    expect(call?.requestOptions?.requestNonPersonalizedAdsOnly).toBe(true);
  });

  it('should not show BannerAd when isReady is false', () => {
    useAdConsentContext.mockReturnValue({
      isReady: false,
      canShowAds: true,
      canShowPersonalizedAds: true,
    });

    renderBanner();
    expect(BannerAd).not.toHaveBeenCalled();
  });

  it('should not show BannerAd when canShowAds is false', () => {
    useAdConsentContext.mockReturnValue({
      isReady: true,
      canShowAds: false,
      canShowPersonalizedAds: true,
    });

    renderBanner();
    expect(BannerAd).not.toHaveBeenCalled();
  });
});