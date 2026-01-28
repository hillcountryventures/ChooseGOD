/**
 * FadeIn — Entrance animation wrapper using Reanimated
 *
 * Wraps any child with a fade + slide-up entrance animation.
 * Use on daily verse card, streak card, or any element needing polish.
 *
 * Usage:
 *   <FadeIn delay={200}>
 *     <DailyVerseCard />
 *   </FadeIn>
 */

import React from 'react';
import Animated, { FadeInDown, FadeIn as ReanimatedFadeIn } from 'react-native-reanimated';
import { ViewStyle, StyleProp } from 'react-native';

interface FadeInProps {
  children: React.ReactNode;
  /** Delay in ms before animation starts */
  delay?: number;
  /** Duration in ms (default 400) */
  duration?: number;
  /** Slide up distance in px (default 16, set 0 for pure fade) */
  slideDistance?: number;
  /** Additional container style */
  style?: StyleProp<ViewStyle>;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 400,
  slideDistance = 16,
  style,
}) => {
  const entering =
    slideDistance > 0
      ? FadeInDown.delay(delay).duration(duration).springify().damping(18)
      : ReanimatedFadeIn.delay(delay).duration(duration);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
};
