jest.mock('react-native-google-mobile-ads', () => {
  const AdEventType = { CLOSED: 'closed', ERROR: 'error' };
  const RewardedAdEventType = { LOADED: 'loaded', EARNED_REWARD: 'earned_reward' };
  const TestIds = { REWARDED: 'test-rewarded-id' };
  const MaxAdContentRating = { T: 'T' };

  const mobileAdsMock = {
    setRequestConfiguration: jest.fn(),
    initialize: jest.fn(),
  };

  let listeners = {};
  const createUnsub = (type) =>
    jest.fn(() => {
      delete listeners[type];
    });

  let mockLastAdInstance = null;

  const RewardedAd = {
    createForAdRequest: jest.fn((_id, opts) => {
      const ad = {
        addAdEventListener: (type, cb) => {
          listeners[type] = cb;
          const unsub = createUnsub(type);
          ad.__unsubs.push(unsub);
          return unsub;
        },
        load: jest.fn(),
        show: jest.fn().mockResolvedValue(undefined),
        __emit: (type, payload) => {
          const cb = listeners[type];
          if (cb) cb(payload);
        },
        __unsubs: [],
        __opts: opts,
      };
      mockLastAdInstance = ad;
      return ad;
    }),
    __getLastInstance: () => mockLastAdInstance,
  };

  const mobileAds = () => mobileAdsMock;

  return {
    __esModule: true,
    default: mobileAds,
    mobileAds,
    AdEventType,
    RewardedAdEventType,
    MaxAdContentRating,
    RewardedAd,
    TestIds,
  };
});

global.__DEV__ = true;

const { initAds, showRewarded } = require('../../src/lib/rewardedAds');

const {
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
  MaxAdContentRating,
} = jest.requireMock('react-native-google-mobile-ads');

describe('rewardedAds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initAds', () => {
    it('sets request configuration and initializes', async () => {
      await initAds();
      const mobileAdsApi = require('react-native-google-mobile-ads').default();

      expect(mobileAdsApi.setRequestConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({
          maxAdContentRating: MaxAdContentRating.T,
          tagForChildDirectedTreatment: false,
          tagForUnderAgeOfConsent: false,
          testDeviceIdentifiers: expect.arrayContaining(['EMULATOR']),
        })
      );
      expect(mobileAdsApi.initialize).toHaveBeenCalled();
    });
  });

  describe('showRewarded', () => {
    const emit = (type, payload) =>
      RewardedAd.__getLastInstance().__emit(type, payload);

    it('resolves earned: true when reward then closed', async () => {
      const promise = showRewarded();
      emit(RewardedAdEventType.LOADED);
      emit(RewardedAdEventType.EARNED_REWARD);
      emit(AdEventType.CLOSED);
      const result = await promise;

      expect(RewardedAd.__getLastInstance().show).toHaveBeenCalled();
      expect(result).toEqual({ earned: true });
      RewardedAd.__getLastInstance().__unsubs.forEach((u) => expect(u).toHaveBeenCalled());
    });

    it('resolves earned: false when closed without reward', async () => {
      const promise = showRewarded();
      emit(RewardedAdEventType.LOADED);
      emit(AdEventType.CLOSED);
      const result = await promise;

      expect(result).toEqual({ earned: false });
    });

    it('resolves with error on ad error event', async () => {
      const promise = showRewarded();
      const err = new Error('network');
      emit(AdEventType.ERROR, err);
      const result = await promise;

      expect(result.earned).toBe(false);
      expect(result.error).toBe(err);
    });

    it('resolves with error if show() rejects after loaded', async () => {
      const promise = showRewarded();
      RewardedAd.__getLastInstance().show.mockRejectedValueOnce(new Error('Display error'));
      emit(RewardedAdEventType.LOADED);
      const result = await promise;

      expect(result.earned).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toContain('Display error');
    });

    it('passes nonPersonalized flag to ad request', async () => {
      const promise = showRewarded({ nonPersonalized: true });
      emit(RewardedAdEventType.LOADED);
      emit(AdEventType.CLOSED);
      await promise;

      expect(RewardedAd.createForAdRequest).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ requestNonPersonalizedAdsOnly: true })
      );
    });
  });
});