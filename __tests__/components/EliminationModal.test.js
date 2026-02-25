import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import EliminationModal from '../../src/components/EliminationModal';
import Button from '../../src/components/ui/Button';
import { palette, space } from '../../src/constants/theme';
import * as Haptics from 'expo-haptics';

jest.mock('expo-haptics');
jest.mock('expo-blur', () => ({
  BlurView: ({ children }) => children,
}));
jest.mock('react-native-reanimated', () => ({
  ...require('react-native-reanimated/mock'),
  FadeIn: { duration: jest.fn(() => ({})) },
  FadeOut: { duration: jest.fn(() => ({})) },
  ZoomIn: { duration: jest.fn(() => ({ delay: jest.fn(() => ({ springify: jest.fn(() => ({})) })) })) },
}));

describe('EliminationModal', () => {
  const mockOnContinue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { toJSON } = render(
      <EliminationModal
        visible={true}
        playerName="Alice"
        remainingCount={4}
        nextRound={2}
        onContinue={mockOnContinue}
      />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('should not render when visible is false', () => {
    const { queryByText } = render(
      <EliminationModal
        visible={false}
        playerName="Alice"
        remainingCount={4}
        nextRound={2}
        onContinue={mockOnContinue}
      />
    );
    expect(queryByText('Player Eliminated')).toBeNull();
  });

  it('should display eliminated player name', () => {
    const { getByText } = render(
      <EliminationModal
        visible={true}
        playerName="Bob"
        remainingCount={3}
        nextRound={2}
        onContinue={mockOnContinue}
      />
    );
    expect(getByText('Bob')).toBeDefined();
  });

  it('should display modal title', () => {
    const { getByText } = render(
      <EliminationModal
        visible={true}
        playerName="Charlie"
        remainingCount={2}
        nextRound={3}
        onContinue={mockOnContinue}
      />
    );
    expect(getByText('Player Eliminated')).toBeDefined();
  });

  it('should display remaining player count', () => {
    const { getByText } = render(
      <EliminationModal
        visible={true}
        playerName="Diana"
        remainingCount={5}
        nextRound={1}
        onContinue={mockOnContinue}
      />
    );
    expect(getByText(/5 players remain/i)).toBeDefined();
  });

  it('should display next round number in button', () => {
    const { getByText } = render(
      <EliminationModal
        visible={true}
        playerName="Eve"
        remainingCount={4}
        nextRound={3}
        onContinue={mockOnContinue}
      />
    );
    expect(getByText(/Continue to Round 3/i)).toBeDefined();
  });

  it('should display imposter message', () => {
    const { getByText } = render(
      <EliminationModal
        visible={true}
        playerName="Frank"
        remainingCount={4}
        nextRound={2}
        onContinue={mockOnContinue}
      />
    );
    expect(getByText(/Not the Munkeler/i)).toBeDefined();
  });

  it('should call onContinue when button is pressed', async () => {
    const { root } = render(
      <EliminationModal
        visible={true}
        playerName="Grace"
        remainingCount={4}
        nextRound={2}
        onContinue={mockOnContinue}
      />
    );
    const button = root.findByType(Button);
    
    await act(async () => {
      fireEvent.press(button);
    });
    
    expect(mockOnContinue).toHaveBeenCalled();
  });

  it('should trigger haptic feedback on continue', async () => {
    const { root } = render(
      <EliminationModal
        visible={true}
        playerName="Henry"
        remainingCount={4}
        nextRound={2}
        onContinue={mockOnContinue}
      />
    );
    const button = root.findByType(Button);
    
    await act(async () => {
      fireEvent.press(button);
    });
    
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it('should render modal with correct transparency', () => {
    const { root } = render(
      <EliminationModal
        visible={true}
        playerName="Iris"
        remainingCount={4}
        nextRound={2}
        onContinue={mockOnContinue}
      />
    );
    const modal = root.findByType('Modal');
    expect(modal.props.transparent).toBe(true);
    expect(modal.props.animationType).toBe('none');
  });

  it('should handle modal close on request', () => {
    const { root } = render(
      <EliminationModal
        visible={true}
        playerName="Jack"
        remainingCount={4}
        nextRound={2}
        onContinue={mockOnContinue}
      />
    );
    const modal = root.findByType('Modal');
    
    // Modal's onRequestClose is defined and callable
    expect(modal.props.onRequestClose).toBeDefined();
    expect(typeof modal.props.onRequestClose).toBe('function');
  });

  it('should display info cards container', () => {
    const { root } = render(
      <EliminationModal
        visible={true}
        playerName="Kate"
        remainingCount={4}
        nextRound={2}
        onContinue={mockOnContinue}
      />
    );
    const infoCards = root.findAllByType('View').filter(
      (view) => view.props.style?.gap === space.md
    );
    expect(infoCards.length).toBeGreaterThan(0);
  });

  it('should display danger variant button', () => {
    const { root } = render(
      <EliminationModal
        visible={true}
        playerName="Leo"
        remainingCount={4}
        nextRound={2}
        onContinue={mockOnContinue}
      />
    );
    const button = root.findByType(Button);
    expect(button.props.variant).toBe('danger');
  });

  it('should have correct player name styling', () => {
    const { getByText } = render(
      <EliminationModal
        visible={true}
        playerName="Mia"
        remainingCount={4}
        nextRound={2}
        onContinue={mockOnContinue}
      />
    );
    const playerText = getByText('Mia');
    expect(playerText.props.style.color).toBe(palette.danger);
    expect(playerText.props.style.fontWeight).toBe('900');
  });

  it('should update player name when prop changes', () => {
    const { rerender, getByText, queryByText } = render(
      <EliminationModal
        visible={true}
        playerName="Noah"
        remainingCount={4}
        nextRound={2}
        onContinue={mockOnContinue}
      />
    );
    expect(getByText('Noah')).toBeDefined();

    rerender(
      <EliminationModal
        visible={true}
        playerName="Olivia"
        remainingCount={3}
        nextRound={3}
        onContinue={mockOnContinue}
      />
    );
    expect(queryByText('Noah')).toBeNull();
    expect(getByText('Olivia')).toBeDefined();
  });

  it('should update remaining count when prop changes', () => {
    const { rerender, getByText } = render(
      <EliminationModal
        visible={true}
        playerName="Paul"
        remainingCount={5}
        nextRound={2}
        onContinue={mockOnContinue}
      />
    );
    expect(getByText(/5 players remain/i)).toBeDefined();

    rerender(
      <EliminationModal
        visible={true}
        playerName="Paul"
        remainingCount={2}
        nextRound={2}
        onContinue={mockOnContinue}
      />
    );
    expect(getByText(/2 players remain/i)).toBeDefined();
  });

  it('should have danger color border on modal content', () => {
    const { root } = render(
      <EliminationModal
        visible={true}
        playerName="Quinn"
        remainingCount={4}
        nextRound={2}
        onContinue={mockOnContinue}
      />
    );
    const views = root.findAllByType('View');
    const modalContent = views.find((v) => v.props.style?.borderColor === palette.danger);
    expect(modalContent).toBeDefined();
  });

  it('should render large button with full width', () => {
    const { root } = render(
      <EliminationModal
        visible={true}
        playerName="Ruby"
        remainingCount={4}
        nextRound={2}
        onContinue={mockOnContinue}
      />
    );
    const button = root.findByType(Button);
    expect(button.props.size).toBe('lg');
  });
});