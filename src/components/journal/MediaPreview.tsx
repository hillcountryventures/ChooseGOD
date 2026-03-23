/**
 * MediaPreview - Preview thumbnails for attached media
 *
 * Supports:
 * - Photo thumbnails
 * - Voice note indicators with duration
 * - Drawing previews
 */

import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { JournalMedia } from '../../types';

interface MediaPreviewProps {
  media: JournalMedia;
  onRemove?: () => void;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function MediaPreview({
  media,
  onRemove,
  onPress,
  size = 'medium',
}: MediaPreviewProps) {
  const dimensions = {
    small: 60,
    medium: 80,
    large: 120,
  };

  const sizeValue = dimensions[size];

  const renderContent = () => {
    switch (media.type) {
      case 'photo':
        return (
          <Image
            source={{ uri: media.uri }}
            style={[styles.image, { width: sizeValue, height: sizeValue }]}
            resizeMode="cover"
          />
        );

      case 'voice':
        return (
          <View style={[styles.voiceContainer, { width: sizeValue, height: sizeValue }]}>
            <Ionicons name="mic" size={24} color={theme.colors.primary} />
            {media.duration && (
              <Text style={styles.duration}>{formatDuration(media.duration)}</Text>
            )}
          </View>
        );

      case 'drawing':
        return media.thumbnail ? (
          <Image
            source={{ uri: media.thumbnail }}
            style={[styles.image, { width: sizeValue, height: sizeValue }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.drawingPlaceholder, { width: sizeValue, height: sizeValue }]}>
            <Ionicons name="brush" size={24} color={theme.colors.primary} />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {renderContent()}

      {onRemove && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

interface MediaPreviewListProps {
  media: JournalMedia[];
  onRemove?: (id: string) => void;
  onPress?: (media: JournalMedia) => void;
  size?: 'small' | 'medium' | 'large';
}

export function MediaPreviewList({
  media,
  onRemove,
  onPress,
  size = 'medium',
}: MediaPreviewListProps) {
  if (media.length === 0) return null;

  return (
    <View style={styles.list}>
      {media.map((item) => (
        <MediaPreview
          key={item.id}
          media={item}
          onRemove={onRemove ? () => onRemove(item.id) : undefined}
          onPress={onPress ? () => onPress(item) : undefined}
          size={size}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  voiceContainer: {
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  duration: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  drawingPlaceholder: {
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: theme.colors.background,
    borderRadius: 10,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
});
