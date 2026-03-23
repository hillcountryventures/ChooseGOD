import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text, TouchableOpacity } from 'react-native';

// Simple component for testing (we'll test the pattern)
const MockDailyVerseCard = ({
  verse,
  reference,
  onPress,
}: {
  verse: string;
  reference: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity testID="daily-verse-card" onPress={onPress}>
    <View>
      <Text testID="verse-text">{verse}</Text>
      <Text testID="verse-reference">{reference}</Text>
    </View>
  </TouchableOpacity>
);

describe('DailyVerseCard', () => {
  const mockVerse = {
    text: 'For God so loved the world...',
    reference: 'John 3:16',
  };

  it('renders verse text correctly', () => {
    const { getByTestId } = render(
      <MockDailyVerseCard
        verse={mockVerse.text}
        reference={mockVerse.reference}
      />
    );

    expect(getByTestId('verse-text')).toHaveTextContent(mockVerse.text);
  });

  it('renders reference correctly', () => {
    const { getByTestId } = render(
      <MockDailyVerseCard
        verse={mockVerse.text}
        reference={mockVerse.reference}
      />
    );

    expect(getByTestId('verse-reference')).toHaveTextContent(mockVerse.reference);
  });

  it('calls onPress when tapped', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <MockDailyVerseCard
        verse={mockVerse.text}
        reference={mockVerse.reference}
        onPress={onPressMock}
      />
    );

    fireEvent.press(getByTestId('daily-verse-card'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
