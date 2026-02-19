import React from 'react';
import { render } from '@testing-library/react-native';
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

describe('AdBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render placeholder when not ready', () => {
    useAdConsentContext.mockReturnValue({
      isReady: false,
      canShowAds: true,
      canShowPersonalizedAds: true,
    });

    const { root } = render(<AdBanner />);
    const views = root.findAllByType('View');
    const placeholder = views.find((v) => v.props.style?.height === 50);
    expect(placeholder).toBeDefined();
  });

  it('should render placeholder when ads cannot be shown', () => {
    useAdConsentContext.mockReturnValue({
      isReady: true,
      canShowAds: false,
      canShowPersonalizedAds: true,
    });

    const { root } = render(<AdBanner />);
    const views = root.findAllByType('View');
    const placeholder = views.find((v) => v.props.style?.height === 50);
    expect(placeholder).toBeDefined();
  });

  it('should show BannerAd when all conditions are met', () => {
    useAdConsentContext.mockReturnValue({
      isReady: true,
      canShowAds: true,
      canShowPersonalizedAds: true,
    });

    render(<AdBanner />);
    expect(BannerAd).toHaveBeenCalled();
  });

  it('should request personalized ads when canShowPersonalizedAds is true', () => {
    useAdConsentContext.mockReturnValue({
      isReady: true,
      canShowAds: true,
      canShowPersonalizedAds: true,
    });

    render(<AdBanner />);
    const call = BannerAd.mock.calls[0]?.[0];
    expect(call?.requestOptions?.requestNonPersonalizedAdsOnly).toBe(false);
  });

  it('should request non-personalized ads when canShowPersonalizedAds is false', () => {
    useAdConsentContext.mockReturnValue({
      isReady: true,
      canShowAds: true,
      canShowPersonalizedAds: false,
    });

    render(<AdBanner />);
    const call = BannerAd.mock.calls[0]?.[0];
    expect(call?.requestOptions?.requestNonPersonalizedAdsOnly).toBe(true);
  });

  it('should not show BannerAd when isReady is false', () => {
    useAdConsentContext.mockReturnValue({
      isReady: false,
      canShowAds: true,
      canShowPersonalizedAds: true,
    });

    render(<AdBanner />);
    expect(BannerAd).not.toHaveBeenCalled();
  });

  it('should not show BannerAd when canShowAds is false', () => {
    useAdConsentContext.mockReturnValue({
      isReady: true,
      canShowAds: false,
      canShowPersonalizedAds: true,
    });

    render(<AdBanner />);
    expect(BannerAd).not.toHaveBeenCalled();
  });
});