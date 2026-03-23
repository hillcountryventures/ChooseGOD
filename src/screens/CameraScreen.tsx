/**
 * CameraScreen - OCR-powered Scripture text scanner
 *
 * Captures images and extracts text using the scripture-scan Edge Function.
 * Enables users to scan real-world text and find biblical insights.
 *
 * Use case: "What does the Bible say about [scanned text]?"
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../lib/theme';
import { supabase } from '../lib/supabase';
import type { RootStackParamList } from '../types';
import { logger } from '../utils/logger';
import { useTrackScreen } from '../hooks/useAnalytics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CameraScreen() {
  useTrackScreen('camera');
  const navigation = useNavigation<NavigationProp>();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('back');

  // Handle permission states
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={theme.colors.textMuted} />
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            ChooseGOD needs camera access to scan text and discover biblical insights.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);

      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      if (!photo || !photo.uri) {
        throw new Error('Failed to capture image');
      }

      // Call scripture-scan Edge Function for OCR
      const { data, error } = await supabase.functions.invoke('scripture-scan', {
        body: { imageBase64: photo.base64 },
      });

      if (error) {
        throw error;
      }

      const { text, success } = data;

      if (!success || !text || text.trim().length === 0) {
        Alert.alert(
          'No Text Found',
          'Could not detect readable text in the image. Try again with clearer text.',
          [{ text: 'OK' }]
        );
        setIsProcessing(false);
        return;
      }

      // Navigate to ChatHub with scanned text as initial message
      navigation.replace('ChatHub', {
        initialMessage: `I scanned this text: "${text.substring(0, 300)}${text.length > 300 ? '...' : ''}"\n\nWhat does the Bible say about this?`,
        contextMode: 'auto',
      });

    } catch (error) {
      logger.error('[CameraScreen] Capture error:', error);
      Alert.alert(
        'Scan Error',
        'Could not process the image. Please try again.',
        [{ text: 'OK' }]
      );
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClose}
            disabled={isProcessing}
          >
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scripture Scan</Text>
          <View style={styles.headerButton} />
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Ionicons name="scan-outline" size={32} color={theme.colors.text} style={styles.scanIcon} />
          <Text style={styles.instructionsText}>
            Point camera at any text
          </Text>
          <Text style={styles.instructionsSubtext}>
            Books, signs, quotes — discover what the Bible says
          </Text>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraFacing}
            disabled={isProcessing}
          >
            <Ionicons name="camera-reverse" size={32} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
            onPress={handleCapture}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>

          <View style={styles.flipButton} />
        </View>

        {/* Processing overlay */}
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.text} />
            <Text style={styles.processingText}>Reading text...</Text>
            <Text style={styles.processingSubtext}>Finding biblical insights</Text>
          </View>
        )}
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  instructions: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
  },
  scanIcon: {
    marginBottom: theme.spacing.sm,
    opacity: 0.9,
  },
  instructionsText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  instructionsSubtext: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  flipButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.primary,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  processingText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  processingSubtext: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  // Permission screen styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  permissionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  permissionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: 12,
    marginBottom: theme.spacing.md,
  },
  permissionButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  backButton: {
    paddingVertical: theme.spacing.sm,
  },
  backButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
});
