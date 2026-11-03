import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import Results from '../../app/results';
import { useGameStore } from '../../src/store/gameStore';
import { useSessionStore } from '../../src/store/sessionStore';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => ({ winner: 'civilians' }),
}));
jest.mock('../../src/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key, fallback) => key === 'results.playAgain' ? 'New Game' : fallback }),
}));
jest.mock('../../src/constants/icons', () => ({ Icon: () => null }));
jest.mock('../../src/components/ui/Screen', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children }) => <View>{children}</View>;
});
jest.mock('../../src/components/ui/Title', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ children }) => <Text>{children}</Text>;
});
jest.mock('../../src/components/ui/Card', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children }) => <View>{children}</View>;
});
jest.mock('../../src/components/ui/Button', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  return ({ title, onPress, disabled }) => (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button">
      <Text>{title}</Text>
    </Pressable>
  );
});

beforeEach(() => {
  jest.clearAllMocks();
  Haptics.impactAsync.mockResolvedValue(undefined);
  Haptics.notificationAsync.mockResolvedValue(undefined);
  useSessionStore.setState({
    _hasHydrated: true,
    activeSession: { id: 'session-1', startedAt: Date.now(), hourReminderShown: false, players: [], scores: {}, matches: [] },
    sessionHistory: [],
    allTimeScores: {},
    recordedMatchIds: [],
  });
  useGameStore.setState({
    players: ['Alice', 'Bob', 'Casey'],
    imposterIndex: 1,
    secretWord: 'Old Word',
    matchId: 'old-match',
    roles: ['civilian', 'imposter', 'civilian'],
    startMatch: jest.fn(() => {
      useGameStore.setState({ secretWord: 'New Word', matchId: 'new-match', imposterIndex: 0, roles: ['imposter', 'civilian', 'civilian'] });
      return true;
    }),
  });
});

test('keeps the completed game result visible while Play Again changes the match state', async () => {
  const ui = render(<Results />);
  expect(useSessionStore.getState().activeSession.matches.map((match) => match.id)).toEqual(['old-match']);
  expect(ui.getByText('Old Word')).toBeTruthy();
  expect(ui.getByText('Bob was the imposter')).toBeTruthy();

  await act(async () => {
    fireEvent.press(ui.getByText('New Game'));
  });
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/role'));

  expect(ui.getByText('Old Word')).toBeTruthy();
  expect(ui.queryByText('New Word')).toBeNull();
  expect(ui.getByText('Bob was the imposter')).toBeTruthy();
  expect(ui.queryByText('Alice was the imposter')).toBeNull();
  expect(useSessionStore.getState().activeSession.matches.map((match) => match.id)).toEqual(['old-match']);
});

test('ignores repeat Play Again taps while the new match is starting', async () => {
  const ui = render(<Results />);
  await act(async () => {
    fireEvent.press(ui.getByText('New Game'));
    fireEvent.press(ui.getByText('New Game'));
  });
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/role'));
  expect(useGameStore.getState().startMatch).toHaveBeenCalledTimes(1);
});
