/**
 * OfflineBanner — thin colored strip shown at the top when the device
 * has no connectivity. Animates in/out when status changes.
 *
 * Use by rendering once near the root (e.g., inside the tab navigator)
 * or directly inside any screen that wants the banner.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../lib/theme';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

const BANNER_HEIGHT = 28;

function OfflineBannerInner() {
  const { isOffline, isIndeterminate } = useOfflineStatus();
  const translateY = useRef(new Animated.Value(-BANNER_HEIGHT)).current;
  const shouldShow = isOffline && !isIndeterminate;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: shouldShow ? 0 : -BANNER_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [shouldShow, translateY]);

  if (isIndeterminate) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { transform: [{ translateY }] }]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={isOffline ? 'You are offline' : 'Back online'}
    >
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.row}>
          <Ionicons name="cloud-offline" size={14} color={theme.colors.text} />
          <Text style={styles.text}>Offline — changes will sync when you reconnect</Text>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

export const OfflineBanner = React.memo(OfflineBannerInner);
export default OfflineBanner;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: theme.colors.warning ?? '#8a6d00',
  },
  safe: {
    height: BANNER_HEIGHT,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: BANNER_HEIGHT,
  },
  text: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});
