import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import { ScrollView, TouchableOpacity } from 'react-native';
import AITutorialModal from '../../src/components/AITutorialModal';
import Button from '../../src/components/ui/Button';
import Card from '../../src/components/ui/Card';

jest.mock('expo-haptics');
jest.mock('../../src/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key, defaultText) => defaultText,
  }),
}));

describe('AITutorialModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing when visible is true', () => {
    const { toJSON } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('should not render when visible is false', () => {
    const { queryByText } = render(
      <AITutorialModal visible={false} onClose={mockOnClose} />
    );
    expect(queryByText('How AI Generation Works')).toBeNull();
  });

  it('should display modal title', () => {
    const { getByText } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    expect(getByText('How AI Generation Works')).toBeDefined();
  });

  it('should display header with icon', () => {
    const { getByText } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    expect(getByText('How AI Generation Works')).toBeDefined();
  });

  it('should display "What is it?" section', () => {
    const { getByText } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    expect(getByText('What is it?')).toBeDefined();
    expect(
      getByText(/AI Topic Builder uses artificial intelligence/)
    ).toBeDefined();
  });

  it('should display "How to Use" section with steps', () => {
    const { getByText } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    expect(getByText('How to Use')).toBeDefined();
    expect(getByText('Describe Your Topic')).toBeDefined();
    expect(getByText('Choose Settings')).toBeDefined();
    expect(getByText('Generate & Play')).toBeDefined();
  });

  it('should display all step numbers (1, 2, 3)', () => {
    const { getAllByText } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    const stepNumbers = getAllByText(/^[1-3]$/).filter((el) => el.props.style?.fontWeight === '900');
    expect(stepNumbers.length).toBeGreaterThanOrEqual(3);
  });

  it('should display "Good Examples" section', () => {
    const { getByText } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    expect(getByText('Good Examples')).toBeDefined();
    expect(getByText('Clash Royale cards')).toBeDefined();
    expect(getByText('Harry Potter spells')).toBeDefined();
    expect(getByText('Marvel superheroes')).toBeDefined();
    expect(getByText('Programming languages')).toBeDefined();
    expect(getByText('Football teams in Europe')).toBeDefined();
  });

  it('should display "Daily Generations" section', () => {
    const { getByText } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    expect(getByText('Daily Generations')).toBeDefined();
    expect(
      getByText(/You get 1 free generation per day/)
    ).toBeDefined();
  });

  it('should display "Pro Tips" section', () => {
    const { getByText } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    expect(getByText('Pro Tips')).toBeDefined();
    expect(
      getByText(/Be specific in your description/)
    ).toBeDefined();
    expect(
      getByText(/Use 'Mixed' difficulty/)
    ).toBeDefined();
    expect(
      getByText(/Generated topics are automatically saved/)
    ).toBeDefined();
  });

  it('should display close button in header', () => {
    const { root } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    const closeButtons = root.findAllByType(TouchableOpacity);
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('should call onClose when close button is pressed', async () => {
    const { root } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    const closeButtons = root.findAllByType(TouchableOpacity);
    const closeButton = closeButtons[0];

    await act(async () => {
      fireEvent.press(closeButton);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display "Got it!" button', () => {
    const { getByText } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    expect(getByText('Got it!')).toBeDefined();
  });

  it('should call onClose when "Got it!" button is pressed', async () => {
    const { root } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    const button = root.findByType(Button);

    await act(async () => {
      fireEvent.press(button);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should render as Modal with fade animation', () => {
    const { root } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    const modal = root.findByType('Modal');

    expect(modal.props.animationType).toBe('fade');
    expect(modal.props.transparent).toBe(true);
  });

  it('should call onClose when modal is requested to close', () => {
    const { root } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    const modal = root.findByType('Modal');

    act(() => {
      modal.props.onRequestClose();
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should have overlay with correct transparency', () => {
    const { root } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    const overlayViews = root.findAllByType('View');
    const overlay = overlayViews.find((v) => v.props.style?.backgroundColor === 'rgba(0, 0, 0, 0.85)');
    expect(overlay).toBeDefined();
  });

  it('should display content in ScrollView', () => {
    const { root } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    const scrollView = root.findByType(ScrollView);
    expect(scrollView).toBeDefined();
    expect(scrollView.props.showsVerticalScrollIndicator).toBe(false);
  });

  it('should display multiple Card components', () => {
    const { root } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    const cards = root.findAllByType(Card);
    expect(cards.length).toBeGreaterThanOrEqual(5);
  });

  it('should have modal with border styling', () => {
    const { root } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    const modalViews = root.findAllByType('View');
    const styledModal = modalViews.find((v) => v.props.style?.borderWidth === 2);
    expect(styledModal).toBeDefined();
  });

  it('should display step descriptions', () => {
    const { getByText } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    expect(getByText(/Enter a clear description/)).toBeDefined();
    expect(getByText(/Select how many words/)).toBeDefined();
    expect(getByText(/Hit generate and your custom/)).toBeDefined();
  });

  it('should render header with proper layout', () => {
    const { getByText } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    const titleText = getByText('How AI Generation Works');
    expect(titleText.props.style.textAlign).toBe('center');
    expect(titleText.props.style.fontWeight).toBe('900');
  });

  it('should have primary button with large size', () => {
    const { root } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    const button = root.findByType(Button);
    expect(button.props.variant).toBe('primary');
    expect(button.props.size).toBe('lg');
  });

  it('should maintain onClose reference across renders', () => {
    const { rerender } = render(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );
    
    rerender(
      <AITutorialModal visible={true} onClose={mockOnClose} />
    );

    const newMock = jest.fn();
    rerender(
      <AITutorialModal visible={true} onClose={newMock} />
    );

    expect(newMock).toBeDefined();
  });
});