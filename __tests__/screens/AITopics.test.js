import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, TextInput } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AITopics from '../../app/ai-topics';
import { useAIStore } from '../../src/store/aiStore';
import { useGameStore } from '../../src/store/gameStore';
import { generateTopics } from '../../src/lib/generateTopics';
import { showRewarded } from '../../src/lib/rewardedAds';
import { useAdConsentContext } from '../../src/contexts/AdConsentContext';

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn(), push: jest.fn() }), useFocusEffect: jest.fn() }));
jest.mock('../../src/lib/generateTopics', () => ({ generateTopics: jest.fn() }));
jest.mock('../../src/lib/rewardedAds', () => ({ showRewarded: jest.fn() }));
jest.mock('../../src/contexts/AdConsentContext', () => ({ useAdConsentContext: jest.fn() }));
jest.mock('../../src/lib/useTranslation', () => ({ useTranslation: () => ({ t: (_, text) => text, locale: 'fr' }) }));
jest.mock('../../src/components/AITutorialModal', () => () => null);
jest.mock('../../src/constants/icons', () => ({ Icon: () => null }));
jest.mock('../../src/components/ui/Screen', () => {
  const { View } = require('react-native');
  return ({ children }) => <View>{children}</View>;
});

const data = { topicGroup: 'Space', items: ['Moon', 'Mars'], source: 'api', language: 'fr' };
let alert;
const originalAdd = useGameStore.getState().addCustomTopic;
const prepare = () => {
  const ui = render(<AITopics />);
  fireEvent.changeText(ui.UNSAFE_getByType(TextInput), 'Space');
  return ui;
};
const pressGenerate = (ui) => fireEvent.press(ui.getByText('Generate Topics'));

beforeEach(() => {
  jest.clearAllMocks();
  alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  useAIStore.setState({ generationsToday: 0, watchedAdsToday: 0, lastGenerationDate: new Date().toISOString(), generatedTopics: [] });
  useGameStore.setState({ customTopics: [], addCustomTopic: originalAdd });
  useAdConsentContext.mockReturnValue({ isReady: true, canShowAds: true, canShowPersonalizedAds: false, checkConsent: jest.fn() });
  generateTopics.mockResolvedValue({ success: true, data });
  showRewarded.mockResolvedValue({ earned: false });
});
afterEach(() => alert.mockRestore());

test('saves real topics, consumes one allowance, and sends the selected app language', async () => {
  const ui = prepare(); pressGenerate(ui);
  await waitFor(() => expect(useAIStore.getState().generationsToday).toBe(1));
  expect(generateTopics).toHaveBeenCalledWith(expect.objectContaining({ language: 'fr' }));
  expect(useGameStore.getState().customTopics[0].words).toEqual(['Moon', 'Mars']);
  expect(alert).toHaveBeenCalledWith('Success', expect.any(String), expect.any(Array));
});

test.each(['offline', 'timeout', 'authentication', 'rate-limit', 'invalid-response'])('does not save or charge a %s failure', async (code) => {
  generateTopics.mockResolvedValue({ success: false, code });
  const ui = prepare(); pressGenerate(ui);
  await waitFor(() => expect(alert).toHaveBeenCalledWith('Generation Failed', expect.stringContaining('not been used'), expect.any(Array)));
  expect(useAIStore.getState().generationsToday).toBe(0);
  expect(useAIStore.getState().generatedTopics).toEqual([]);
  expect(useGameStore.getState().customTopics).toEqual([]);
});

test('does not consume another allowance for a cached result', async () => {
  generateTopics.mockResolvedValue({ success: true, data: { ...data, source: 'cache' } });
  const ui = prepare(); pressGenerate(ui);
  await waitFor(() => expect(useGameStore.getState().customTopics).toHaveLength(1));
  expect(useAIStore.getState().generationsToday).toBe(0);
});

test('does not show success or consume an allowance when saving fails', async () => {
  useGameStore.setState({ addCustomTopic: jest.fn().mockResolvedValue({ ok: false }) });
  const ui = prepare(); pressGenerate(ui);
  await waitFor(() => expect(alert).toHaveBeenCalledWith('Generation Failed', expect.stringContaining('Could not save'), expect.any(Array)));
  expect(useAIStore.getState().generationsToday).toBe(0);
  expect(useAIStore.getState().generatedTopics).toEqual([]);
});

test('guards rapid duplicate generation taps', async () => {
  let finish;
  generateTopics.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const ui = prepare();
  const button = ui.getByText('Generate Topics');
  fireEvent.press(button);
  fireEvent.press(button);
  await waitFor(() => expect(generateTopics).toHaveBeenCalledTimes(1));
  await act(async () => finish({ success: true, data }));
  expect(useAIStore.getState().generationsToday).toBe(1);
});

test('does not request an ad if refreshed consent still forbids it', async () => {
  const checkConsent = jest.fn().mockResolvedValue({ canRequestAds: false, canShowPersonalizedAds: false });
  useAdConsentContext.mockReturnValue({ isReady: true, canShowAds: false, canShowPersonalizedAds: false, checkConsent });
  useAIStore.setState({ generationsToday: 1 });
  const ui = prepare();
  fireEvent.press(ui.getByText('+1'));
  await waitFor(() => expect(alert).toHaveBeenCalledWith('No reward', expect.any(String)));
  expect(checkConsent).toHaveBeenCalled();
  expect(showRewarded).not.toHaveBeenCalled();
});

test('uses refreshed personalization choices rather than stale context', async () => {
  const checkConsent = jest.fn().mockResolvedValue({ canRequestAds: true, canShowPersonalizedAds: false });
  useAdConsentContext.mockReturnValue({ isReady: true, canShowAds: false, canShowPersonalizedAds: true, checkConsent });
  const ui = prepare();
  fireEvent.press(ui.getByText('+1'));
  await waitFor(() => expect(showRewarded).toHaveBeenCalledWith({ nonPersonalized: true }));
});

test('restores the ad button after a rejected ad request', async () => {
  showRewarded.mockRejectedValueOnce(new Error('ad failed'));
  const ui = prepare();
  fireEvent.press(ui.getByText('+1'));
  await waitFor(() => expect(alert).toHaveBeenCalledWith('No reward', expect.any(String)));
  fireEvent.press(ui.getByText('+1'));
  await waitFor(() => expect(showRewarded).toHaveBeenCalledTimes(2));
  expect(useAIStore.getState().watchedAdsToday).toBe(0);
});


test('preserves the allowance when the real topic storage write fails', async () => {
  AsyncStorage.setItem.mockRejectedValueOnce(new Error('Disk full'));
  const ui = prepare(); pressGenerate(ui);
  await waitFor(() => expect(alert).toHaveBeenCalledWith('Generation Failed', expect.stringContaining('Could not save'), expect.any(Array)));
  expect(useAIStore.getState().generationsToday).toBe(0);
  expect(useAIStore.getState().generatedTopics).toEqual([]);
  expect(useGameStore.getState().customTopics).toEqual([]);
});
