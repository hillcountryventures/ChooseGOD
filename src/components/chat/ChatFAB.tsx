import React, { useRef } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { theme } from '../../lib/theme';
import { TAB_BAR } from '../../constants/dimensions';

export function ChatFAB() {
  const insets = useSafeAreaInsets();
  const setChatSheetOpen = useStore((s) => s.setChatSheetOpen);
  const chatContext = useStore((s) => s.chatContext);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    setChatSheetOpen(true);
  };

  const bottomPosition = TAB_BAR.height + insets.bottom + 16;
  const hasContext = chatContext.screenType === 'bible' && chatContext.bibleContext;

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: bottomPosition, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.gradient}>
          <Ionicons name="chatbubbles" size={26} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Context indicator dot - shows when Bible context is available */}
      {hasContext && <View style={styles.contextDot} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    zIndex: 1000,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.accent,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
});
