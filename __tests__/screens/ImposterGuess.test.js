import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import ImposterGuess from '../../app/imposter-guess';
import { useGameStore } from '../../src/store/gameStore';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => ({ source: 'voted-out' }),
}));
jest.mock('../../src/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (_key, fallback) => fallback }),
}));
jest.mock('../../src/components/ui/Screen', () => { const React = require('react'); const { View } = require('react-native'); return ({ children }) => <View>{children}</View>; });
jest.mock('../../src/components/ui/Title', () => { const React = require('react'); const { Text } = require('react-native'); return ({ children }) => <Text>{children}</Text>; });
jest.mock('../../src/components/ui/Card', () => { const React = require('react'); const { View } = require('react-native'); return ({ children }) => <View>{children}</View>; });
jest.mock('../../src/components/ui/Input', () => { const React = require('react'); const { TextInput } = require('react-native'); return (props) => <TextInput {...props} testID="guess-input" />; });
jest.mock('../../src/components/ui/Button', () => { const React = require('react'); const { Pressable, Text } = require('react-native'); return ({ title, onPress, disabled }) => (
  <Pressable onPress={onPress} disabled={disabled}><Text>{title}</Text></Pressable>
); });

beforeEach(() => {
  jest.clearAllMocks();
  Haptics.impactAsync.mockResolvedValue(undefined);
  Haptics.notificationAsync.mockResolvedValue(undefined);
  useGameStore.setState({
    players: ['Alice', 'Bob', 'Casey'],
    imposterIndex: 0,
    secretWord: 'Moon',
    _hydrated: true,
  });
});

test('asks for confirmation before locking in the imposter guess', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const ui = render(<ImposterGuess />);
  fireEvent.changeText(ui.getByTestId('guess-input'), 'moon');
  fireEvent.press(ui.getByText('Submit Guess'));

  expect(alert).toHaveBeenCalledWith(
    'Lock in your guess?',
    expect.stringContaining('one chance'),
    expect.any(Array)
  );
  expect(mockReplace).not.toHaveBeenCalled();

  const confirm = alert.mock.calls[0][2][1];
  await act(async () => confirm.onPress());
  expect(mockReplace).toHaveBeenCalledWith({
    pathname: '/results',
    params: { winner: 'imposter' },
  });
  alert.mockRestore();
});

test('keeps the guess editable when the player chooses to think longer', () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const ui = render(<ImposterGuess />);
  fireEvent.changeText(ui.getByTestId('guess-input'), 'not sure');
  fireEvent(ui.getByTestId('guess-input'), 'submitEditing');

  expect(alert).toHaveBeenCalled();
  alert.mock.calls[0][2][0].onPress?.();
  expect(mockReplace).not.toHaveBeenCalled();
  expect(ui.getByTestId('guess-input').props.value).toBe('not sure');
  alert.mockRestore();
});
