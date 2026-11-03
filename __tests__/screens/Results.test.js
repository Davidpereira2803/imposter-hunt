import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import Results from '../../app/results';
import { useGameStore } from '../../src/store/gameStore';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => ({ winner: 'civilians' }),
}));
jest.mock('../../src/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (_key, fallback) => fallback }),
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
  useGameStore.setState({
    players: ['Alice', 'Bob', 'Casey'],
    imposterIndex: 1,
    secretWord: 'Old Word',
    startMatch: jest.fn(() => {
      useGameStore.setState({ secretWord: 'New Word', imposterIndex: 0 });
      return true;
    }),
  });
});

test('keeps the completed game result visible while Play Again changes the match state', async () => {
  const ui = render(<Results />);
  expect(ui.getByText('Old Word')).toBeTruthy();
  expect(ui.getByText('Bob was the imposter')).toBeTruthy();

  await act(async () => {
    fireEvent.press(ui.getByText('Play Again'));
  });
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/role'));

  expect(ui.getByText('Old Word')).toBeTruthy();
  expect(ui.queryByText('New Word')).toBeNull();
  expect(ui.getByText('Bob was the imposter')).toBeTruthy();
  expect(ui.queryByText('Alice was the imposter')).toBeNull();
});

test('ignores repeat Play Again taps while the new match is starting', async () => {
  const ui = render(<Results />);
  await act(async () => {
    fireEvent.press(ui.getByText('Play Again'));
    fireEvent.press(ui.getByText('Play Again'));
  });
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/role'));
  expect(useGameStore.getState().startMatch).toHaveBeenCalledTimes(1);
});
