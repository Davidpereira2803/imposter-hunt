import React from 'react';
import { render } from '@testing-library/react-native';
import HUD from '../../src/components/HUD';
import Pill from '../../src/components/ui/Pill';
import { space } from '../../src/constants/theme';

describe('HUD', () => {
  it('should render without crashing', () => {
    const { toJSON } = render(<HUD round={1} aliveCount={5} />);
    expect(toJSON()).not.toBeNull();
  });

  it('should display correct round number', () => {
    const { getByText } = render(<HUD round={3} aliveCount={5} />);
    expect(getByText('Round 3')).toBeDefined();
  });

  it('should display correct alive count', () => {
    const { getByText } = render(<HUD round={1} aliveCount={4} />);
    expect(getByText('4 Alive')).toBeDefined();
  });

  it('should render two Pill components', () => {
    const { root } = render(<HUD round={1} aliveCount={5} />);
    const pills = root.findAllByType(Pill);
    expect(pills).toHaveLength(2);
  });

  it('should have container with correct flexDirection', () => {
    const { root } = render(<HUD round={1} aliveCount={5} />);
    const container = root.findByType('View');
    expect(container.props.style.flexDirection).toBe('row');
  });

  it('should center content horizontally', () => {
    const { root } = render(<HUD round={1} aliveCount={5} />);
    const container = root.findByType('View');
    expect(container.props.style.justifyContent).toBe('center');
  });

  it('should have correct gap between pills', () => {
    const { root } = render(<HUD round={1} aliveCount={5} />);
    const container = root.findByType('View');
    expect(container.props.style.gap).toBe(space.sm);
  });

  it('should have correct bottom margin', () => {
    const { root } = render(<HUD round={1} aliveCount={5} />);
    const container = root.findByType('View');
    expect(container.props.style.marginBottom).toBe(space.lg);
  });

  it('should handle single digit round numbers', () => {
    const { getByText } = render(<HUD round={1} aliveCount={5} />);
    expect(getByText('Round 1')).toBeDefined();
  });

  it('should handle double digit round numbers', () => {
    const { getByText } = render(<HUD round={10} aliveCount={5} />);
    expect(getByText('Round 10')).toBeDefined();
  });

  it('should handle single alive player', () => {
    const { getByText } = render(<HUD round={1} aliveCount={1} />);
    expect(getByText('1 Alive')).toBeDefined();
  });

  it('should handle maximum player count', () => {
    const { getByText } = render(<HUD round={1} aliveCount={8} />);
    expect(getByText('8 Alive')).toBeDefined();
  });

  it('should update when round prop changes', () => {
    const { rerender, getByText } = render(<HUD round={1} aliveCount={5} />);
    expect(getByText('Round 1')).toBeDefined();

    rerender(<HUD round={2} aliveCount={5} />);
    expect(getByText('Round 2')).toBeDefined();
  });

  it('should update when aliveCount prop changes', () => {
    const { rerender, getByText } = render(<HUD round={1} aliveCount={5} />);
    expect(getByText('5 Alive')).toBeDefined();

    rerender(<HUD round={1} aliveCount={3} />);
    expect(getByText('3 Alive')).toBeDefined();
  });

  it('should render pills in correct order (round first, alive second)', () => {
    const { getByText } = render(<HUD round={1} aliveCount={5} />);
    
    expect(getByText('Round 1')).toBeDefined();
    expect(getByText('5 Alive')).toBeDefined();
  });

  it('should apply theme spacing constants', () => {
    const { root } = render(<HUD round={1} aliveCount={5} />);
    const container = root.findByType('View');
    
    expect(container.props.style.gap).toBe(space.sm);
    expect(container.props.style.marginBottom).toBe(space.lg);
  });
});