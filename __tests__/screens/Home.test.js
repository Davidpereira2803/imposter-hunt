import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Home from '../../app/index';
import { useGameStore } from '../../src/store/gameStore';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }), useFocusEffect: jest.fn() }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 24, bottom: 0 }) }));
jest.mock('../../src/lib/useTranslation', () => ({ useTranslation: () => ({ t: (_, fallback) => fallback }) }));
jest.mock('../../src/constants/icons', () => ({ Icon: () => null }));
jest.mock('../../src/components/AdBanner', () => ({ AdBanner: () => null }));
jest.mock('../../src/components/ui/Screen', () => {
  const { View } = require('react-native');
  return ({ children }) => <View>{children}</View>;
});
beforeEach(() => {
  jest.clearAllMocks();
  useGameStore.setState({ players: [], topicKey: '', secretWord: '', imposterIndex: null });
});
test('the primary play action opens setup', async () => {
  const ui = render(<Home />);
  fireEvent.press(ui.getByText("Let's play"));
  await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/setup'));
});
test('does not offer continuation for player names without a started match', () => {
  useGameStore.setState({ players: ['A', 'B', 'C'], topicKey: 'Food' });
  const ui = render(<Home />);
  expect(ui.queryByText('Continue Game')).toBeNull();
});
test('keeps the existing continuation route available for a started match', async () => {
  useGameStore.setState({ players: ['A', 'B', 'C'], topicKey: 'Food', secretWord: 'Apple', imposterIndex: 0 });
  const ui = render(<Home />);
  fireEvent.press(ui.getByText('Continue Game'));
  await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/role'));
});
