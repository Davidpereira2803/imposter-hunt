import React from 'react';
import { AppState } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import Role from '../../app/role';
import { useGameStore } from '../../src/store/gameStore';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }), useFocusEffect: jest.fn() }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 24, bottom: 0 }) }));
jest.mock('../../src/lib/useTranslation', () => ({ useTranslation: () => ({ t: (_, fallback) => fallback }) }));
jest.mock('../../src/constants/icons', () => ({ Icon: () => null }));
jest.mock('../../src/components/ui/Screen', () => {
  const { View } = require('react-native');
  return ({ children }) => <View>{children}</View>;
});
let onAppState;
let listener;
beforeEach(() => {
  jest.clearAllMocks();
  useGameStore.setState({ players: ['Alice', 'Bob', 'Chris'], imposterIndex: 1, roles: ['civilian', 'imposter', 'sheriff'], secretWord: 'Moon' });
  listener = jest.spyOn(AppState, 'addEventListener').mockImplementation((_, callback) => {
    onAppState = callback;
    return { remove: jest.fn() };
  });
});
afterEach(() => listener.mockRestore());

test('keeps role names and the word out of the unrevealed card', () => {
  const ui = render(<Role />);
  expect(ui.getByText('Alice')).toBeTruthy();
  expect(ui.queryByText('Moon')).toBeNull();
  expect(ui.queryByText('CIVILIAN')).toBeNull();
  expect(ui.queryByText('IMPOSTER')).toBeNull();
});

test('reveals a civilian, then hides the word before passing to the next player', () => {
  const ui = render(<Role />);
  fireEvent.press(ui.getByText('Reveal Role'));
  expect(ui.getByText('Moon')).toBeTruthy();
  expect(ui.getByText('CIVILIAN')).toBeTruthy();
  fireEvent.press(ui.getByText('Hide & Pass'));
  expect(ui.getByText('Bob')).toBeTruthy();
  expect(ui.queryByText('Moon')).toBeNull();
  expect(ui.queryByText('CIVILIAN')).toBeNull();
  fireEvent.press(ui.getByText('Reveal Role'));
  expect(ui.getByText('IMPOSTER')).toBeTruthy();
  expect(ui.queryByText('Moon')).toBeNull();
});

test('hides a revealed word when the app becomes inactive', () => {
  const ui = render(<Role />);
  fireEvent.press(ui.getByText('Reveal Role'));
  expect(ui.getByText('Moon')).toBeTruthy();
  act(() => onAppState('inactive'));
  expect(ui.queryByText('Moon')).toBeNull();
  expect(ui.getByText('Reveal Role')).toBeTruthy();
});

test('supports the sheriff and starts the round after the last hidden card', () => {
  const ui = render(<Role />);
  for (let i = 0; i < 2; i++) {
    fireEvent.press(ui.getByText('Reveal Role'));
    fireEvent.press(ui.getByText('Hide & Pass'));
  }
  fireEvent.press(ui.getByText('Reveal Role'));
  expect(ui.getByText('SHERIFF')).toBeTruthy();
  expect(ui.getByText('Moon')).toBeTruthy();
  fireEvent.press(ui.getByText('Hide & start round'));
  expect(mockReplace).toHaveBeenCalledWith('/round');
  expect(ui.queryByText('Moon')).toBeNull();
});

test('preserves the jester identity and secret word', () => {
  useGameStore.setState({ roles: ['jester', 'imposter', 'civilian'] });
  const ui = render(<Role />);
  fireEvent.press(ui.getByText('Reveal Role'));
  expect(ui.getByText('JESTER')).toBeTruthy();
  expect(ui.getByText('Moon')).toBeTruthy();
});

test('still reveals the role when haptics are unavailable', () => {
  const haptics = require('expo-haptics');
  haptics.impactAsync.mockRejectedValueOnce(new Error('unsupported'));
  const ui = render(<Role />);
  fireEvent.press(ui.getByText('Reveal Role'));
  expect(ui.getByText('Moon')).toBeTruthy();
});
