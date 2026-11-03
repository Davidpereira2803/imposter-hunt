import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import Leaderboard from '../../app/leaderboard';
import { useSessionStore } from '../../src/store/sessionStore';

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 24, bottom: 0, left: 0, right: 0 }) }));
jest.mock('../../src/lib/useTranslation', () => ({ useTranslation: () => ({ t: (_key, fallback) => fallback, locale: 'en' }) }));
jest.mock('../../src/constants/icons', () => ({ Icon: () => null }));
jest.mock('../../src/components/ui/Screen', () => { const React = require('react'); const { View } = require('react-native'); return ({ children }) => <View>{children}</View>; });
jest.mock('../../src/components/ui/Title', () => { const React = require('react'); const { Text } = require('react-native'); return ({ children }) => <Text>{children}</Text>; });
jest.mock('../../src/components/ui/Card', () => { const React = require('react'); const { View } = require('react-native'); return ({ children }) => <View>{children}</View>; });
jest.mock('../../src/components/ui/Button', () => { const React = require('react'); const { Pressable, Text } = require('react-native'); return ({ title, onPress }) => <Pressable onPress={onPress}><Text>{title}</Text></Pressable>; });

beforeEach(() => {
  jest.clearAllMocks();
  Haptics.notificationAsync.mockResolvedValue(undefined);
  useSessionStore.setState({ _hasHydrated: true, activeSession: null, sessionHistory: [], allTimeScores: {}, recordedMatchIds: [] });
});

test('starts a scoring session and opens setup', () => {
  const ui = render(<Leaderboard />);
  fireEvent.press(ui.getByText('Start scoring session'));
  expect(useSessionStore.getState().activeSession).toBeTruthy();
  expect(mockReplace).toHaveBeenCalledWith('/setup');
});

test('finishes and saves the live session ranking after confirmation', async () => {
  useSessionStore.setState({
    activeSession: {
      id: 'session-1', startedAt: Date.now(), hourReminderShown: false,
      players: ['Alice'], scores: { Alice: { name: 'Alice', points: 3, matchesPlayed: 1, wins: 1 } },
      matches: [{ id: 'match-1', winner: 'civilians', endedAt: Date.now(), participantCount: 1, winners: [{ name: 'Alice', role: 'civilian' }] }],
    },
  });
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const ui = render(<Leaderboard />);
  expect(ui.getByText('Alice')).toBeTruthy();
  fireEvent.press(ui.getByText('Finish session'));
  const finish = alert.mock.calls[0][2][1];
  await act(async () => finish.onPress());
  expect(useSessionStore.getState().activeSession).toBeNull();
  expect(useSessionStore.getState().sessionHistory[0].id).toBe('session-1');
  alert.mockRestore();
});
