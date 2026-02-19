import React from 'react';
import { render } from '@testing-library/react-native';
import LoadingScreen from '../../src/components/LoadingScreen';
import { palette } from '../../src/constants/theme';

describe('LoadingScreen', () => {
  it('should render without crashing', () => {
    const { toJSON } = render(<LoadingScreen />);
    expect(toJSON()).not.toBeNull();
  });

  it('should display container with correct styles', () => {
    const { root } = render(<LoadingScreen />);
    const container = root.findByType('View');
    
    expect(container.props.style).toEqual({
      flex: 1,
      backgroundColor: '#000',
      justifyContent: 'center',
      alignItems: 'center',
    });
  });

  it('should render ActivityIndicator with correct props', () => {
    const { root } = render(<LoadingScreen />);
    const activityIndicator = root.findByType('ActivityIndicator');
    
    expect(activityIndicator.props.size).toBe('large');
    expect(activityIndicator.props.color).toBe(palette.primary);
  });

  it('should display loading text', () => {
    const { getByText } = render(<LoadingScreen />);
    const loadingText = getByText('Loading…');
    
    expect(loadingText).toBeDefined();
  });

  it('should apply correct text styling', () => {
    const { getByText } = render(<LoadingScreen />);
    const loadingText = getByText('Loading…');
    
    expect(loadingText.props.style).toEqual({
      color: '#fff',
      fontSize: 18,
      marginTop: 20,
      fontWeight: '600',
    });
  });

  it('should have dark background for accessibility', () => {
    const { root } = render(<LoadingScreen />);
    const container = root.findByType('View');
    
    expect(container.props.style.backgroundColor).toBe('#000');
  });

  it('should center content vertically and horizontally', () => {
    const { root } = render(<LoadingScreen />);
    const container = root.findByType('View');
    
    expect(container.props.style.justifyContent).toBe('center');
    expect(container.props.style.alignItems).toBe('center');
  });

  it('should use primary color from theme palette', () => {
    const { root } = render(<LoadingScreen />);
    const activityIndicator = root.findByType('ActivityIndicator');
    
    expect(activityIndicator.props.color).toBe(palette.primary);
  });

  it('should have proper spacing between indicator and text', () => {
    const { getByText } = render(<LoadingScreen />);
    const loadingText = getByText('Loading…');
    
    expect(loadingText.props.style.marginTop).toBe(20);
  });

  it('should render text with appropriate font weight', () => {
    const { getByText } = render(<LoadingScreen />);
    const loadingText = getByText('Loading…');
    
    expect(loadingText.props.style.fontWeight).toBe('600');
  });

  it('should have readable font size', () => {
    const { getByText } = render(<LoadingScreen />);
    const loadingText = getByText('Loading…');
    
    expect(loadingText.props.style.fontSize).toBe(18);
  });

  it('should render in correct component hierarchy', () => {
    const { root } = render(<LoadingScreen />);
    
    const view = root.findByType('View');
    expect(view).toBeDefined();
    
    const activityIndicator = root.findByType('ActivityIndicator');
    expect(activityIndicator).toBeDefined();
    
    const text = root.findByType('Text');
    expect(text).toBeDefined();
  });
});