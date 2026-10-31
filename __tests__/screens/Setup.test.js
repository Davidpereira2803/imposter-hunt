import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import Setup from '../../app/setup';
import { useGameStore } from '../../src/store/gameStore';

jest.mock('../../src/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (_key, fallback) => fallback }),
}));
jest.mock('../../src/constants/icons', () => ({
  Icon: () => null,
  icons: {
    jester: { name: 'emoticon-devil', size: 20 },
    sheriff: { name: 'shield-star', size: 20 },
  },
}));

beforeEach(() => {
  Haptics.impactAsync.mockResolvedValue(undefined);
  Haptics.selectionAsync.mockResolvedValue(undefined);
  useGameStore.setState({
    players: ['Alice', 'Bob', 'Casey'],
    topicKey: 'Food',
    secretWord: '',
    imposterIndex: null,
    roles: [],
    customTopics: [],
    enableJester: false,
    enableSheriff: false,
  });
});

test('keeps special-role switches visible but unavailable until four players are listed', () => {
  const ui = render(<Setup />);
  const jester = ui.getByLabelText('Jester');
  const sheriff = ui.getByLabelText('Sheriff');

  expect(ui.getByText('Special Roles')).toBeTruthy();
  expect(ui.getByText('Need 4+ players for special roles')).toBeTruthy();
  expect(jester.props.disabled).toBe(true);
  expect(sheriff.props.disabled).toBe(true);

  fireEvent.changeText(ui.getByPlaceholderText('Player name'), 'Drew');
  fireEvent.press(ui.getByText('Add'));

  expect(ui.getByLabelText('Jester').props.disabled).toBe(false);
  expect(ui.getByLabelText('Sheriff').props.disabled).toBe(false);
});

test('updates the selected special-role settings used by the match setup', () => {
  useGameStore.setState({ players: ['Alice', 'Bob', 'Casey', 'Drew'] });
  const ui = render(<Setup />);

  fireEvent(ui.getByLabelText('Jester'), 'valueChange', true);
  fireEvent(ui.getByLabelText('Sheriff'), 'valueChange', true);

  expect(useGameStore.getState().enableJester).toBe(true);
  expect(useGameStore.getState().enableSheriff).toBe(true);
});
