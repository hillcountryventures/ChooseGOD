/**
 * ShareConversationSheet - Share conversation as text or image
 *
 * Options:
 * - Share as text (native share sheet)
 * - Copy to clipboard
 * - Save as image (premium)
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';

import { theme } from '../../lib/theme';
import { ChatMessage } from '../../types';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';

interface ShareConversationSheetProps {
  messages: ChatMessage[];
  onClose: () => void;
  sheetRef: React.RefObject<BottomSheet>;
}

export function ShareConversationSheet({
  messages,
  onClose,
  sheetRef,
}: ShareConversationSheetProps) {
  const { isPremium, showPaywall } = usePremiumStatus();

  const formatConversationText = useCallback(() => {
    return messages
      .map((m) => {
        const role = m.role === 'user' ? 'You' : 'Companion';
        let text = `${role}:\n${m.content}`;
        if (m.sources && m.sources.length > 0) {
          const refs = m.sources.map((s) => `${s.book} ${s.chapter}:${s.verse}`).join(', ');
          text += `\n\nScripture: ${refs}`;
        }
        return text;
      })
      .join('\n\n─────────────\n\n');
  }, [messages]);

  const handleShareText = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const text = formatConversationText();
      await Share.share({
        message: `${text}\n\nShared from ChooseGOD\nhttps://choosegod.app`,
      });
      onClose();
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [formatConversationText, onClose]);

  const handleCopy = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const text = formatConversationText();
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied!', 'Conversation copied to clipboard');
      onClose();
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, [formatConversationText, onClose]);

  const handleShareImage = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!isPremium) {
      showPaywall();
      onClose();
      return;
    }
    
    // TODO: Implement image generation with ViewShot
    Alert.alert('Coming Soon', 'Image sharing will be available in a future update.');
    onClose();
  }, [isPremium, showPaywall, onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['35%']}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>Share Conversation</Text>
        
        <View style={styles.options}>
          <TouchableOpacity style={styles.option} onPress={handleShareText}>
            <View style={styles.iconContainer}>
              <Ionicons name="share-outline" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Share as Text</Text>
              <Text style={styles.optionSubtext}>Send via Messages, Email, etc.</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.option} onPress={handleCopy}>
            <View style={styles.iconContainer}>
              <Ionicons name="copy-outline" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Copy to Clipboard</Text>
              <Text style={styles.optionSubtext}>Paste anywhere</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.option} onPress={handleShareImage}>
            <View style={styles.iconContainer}>
              <Ionicons name="image-outline" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Save as Image</Text>
              <Text style={styles.optionSubtext}>
                {isPremium ? 'Beautiful shareable card' : 'Premium feature'}
              </Text>
            </View>
            {!isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PRO</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  indicator: {
    backgroundColor: theme.colors.border,
    width: 36,
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  options: {
    gap: theme.spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryAlpha[15],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  optionSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  premiumBadge: {
    backgroundColor: theme.colors.gold,
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
    color: '#000',
  },
});
