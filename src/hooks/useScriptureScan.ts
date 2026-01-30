/**
 * useScriptureScan - OCR-powered Scripture scanning
 *
 * Enables users to scan text from the world (signs, books, social media)
 * and ask "What does the Bible say about this?"
 *
 * Inspired by 2 Timothy 3:16 - "useful for teaching, rebuking, correcting"
 * Brings real-world application of Scripture.
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { logger } from '../utils/logger';

export function useScriptureScan() {
  const [isScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

    const scanImage = async (navigation: { navigate: (screen: string, params?: Record<string, unknown>) => void }) => {
    try {
      // Check/request camera permissions
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert(
            'Camera Permission Needed',
            'ChooseGOD needs camera access to scan text and find biblical insights.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      // Navigate to camera screen
      // CameraScreen handles capture, OCR, and navigation to ChatHub
      navigation.navigate('CameraScreen', {
        mode: 'scripture-scan',
      });
    } catch (error) {
      logger.error('[useScriptureScan] Error:', error);
      Alert.alert(
        'Error',
        'Could not access camera. Please check your device settings.',
        [{ text: 'OK' }]
      );
    }
  };

  return { scanImage, isScanning };
}
