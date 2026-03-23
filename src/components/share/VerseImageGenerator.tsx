/**
 * VerseImageGenerator - Generate shareable verse images with classical art
 * 
 * Uses public domain art from museum APIs (Met, Rijksmuseum, Chicago)
 * with full attribution (artist, year, location, etc.)
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

import { theme } from '../../lib/theme';
import type { 
  VerseForImage, 
  ArtPiece, 
  ImageFormat,
  GeneratedVerseImage,
  ArtAttribution,
} from '../../types/verseImage';
import { 
  fetchArtOptions, 
  formatAttribution,
  detectTopicFromVerse,
} from '../../services/museumArtService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Aspect ratios for preview
const PREVIEW_RATIOS: Record<ImageFormat, number> = {
  story: 9 / 16,    // Tall
  square: 1,        // Square
  twitter: 16 / 9,  // Wide
};

interface VerseImageGeneratorProps {
  visible: boolean;
  onClose: () => void;
  verse: VerseForImage;
}

export function VerseImageGenerator({ visible, onClose, verse }: VerseImageGeneratorProps) {
  const insets = useSafeAreaInsets();
  const viewShotRef = useRef<ViewShot>(null);
  
  const [loading, setLoading] = useState(true);
  const [artOptions, setArtOptions] = useState<ArtPiece[]>([]);
  const [selectedArt, setSelectedArt] = useState<ArtPiece | null>(null);
  const [format, setFormat] = useState<ImageFormat>('story');
  const [saving, setSaving] = useState(false);
  
  // Fetch art options when modal opens
  useEffect(() => {
    if (visible && verse) {
      loadArtOptions();
    }
  }, [visible, verse]);
  
  const loadArtOptions = async () => {
    setLoading(true);
    try {
      const options = await fetchArtOptions(verse.text, 3);
      setArtOptions(options);
      if (options.length > 0) {
        setSelectedArt(options[0]);
      }
    } catch (err) {
      console.error('Failed to fetch art:', err);
      Alert.alert('Error', 'Unable to load artwork. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveToPhotos = useCallback(async () => {
    if (!viewShotRef.current) return;
    
    setSaving(true);
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save images.');
        return;
      }
      
      // Capture the view
      const uri = await viewShotRef.current.capture?.();
      if (!uri) throw new Error('Failed to capture image');
      
      // Save to camera roll
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Saved', 'Image saved to your photo library.');
    } catch (err) {
      console.error('Save failed:', err);
      Alert.alert('Error', 'Failed to save image.');
    } finally {
      setSaving(false);
    }
  }, []);
  
  const handleShare = useCallback(async () => {
    if (!viewShotRef.current) return;
    
    setSaving(true);
    try {
      const uri = await viewShotRef.current.capture?.();
      if (!uri) throw new Error('Failed to capture image');
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share Verse Image',
        });
      }
    } catch (err) {
      console.error('Share failed:', err);
      Alert.alert('Error', 'Failed to share image.');
    } finally {
      setSaving(false);
    }
  }, []);
  
  const attribution = selectedArt ? formatAttribution(selectedArt) : null;
  
  // Calculate preview dimensions
  const previewWidth = SCREEN_WIDTH - 48;
  const aspectRatio = PREVIEW_RATIOS[format];
  const previewHeight = format === 'story' 
    ? previewWidth / aspectRatio 
    : previewWidth * (format === 'twitter' ? 9/16 : 1);
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Image</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.accent} />
              <Text style={styles.loadingText}>Finding beautiful artwork...</Text>
            </View>
          ) : (
            <>
              {/* Image Preview */}
              <View style={[styles.previewContainer, { height: previewHeight + 40 }]}>
                <ViewShot
                  ref={viewShotRef}
                  options={{ format: 'png', quality: 1.0 }}
                  style={[
                    styles.previewWrapper,
                    { 
                      width: previewWidth,
                      height: previewHeight,
                    }
                  ]}
                >
                  {selectedArt && (
                    <View style={styles.imageContainer}>
                      {/* Background Art */}
                      <Image
                        source={{ uri: selectedArt.imageUrl }}
                        style={StyleSheet.absoluteFill}
                        resizeMode="cover"
                      />
                      
                      {/* Gradient Overlay */}
                      <LinearGradient
                        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                        style={StyleSheet.absoluteFill}
                      />
                      
                      {/* Verse Content */}
                      <View style={styles.verseContainer}>
                        <Text style={styles.verseText}>"{verse.text}"</Text>
                        <Text style={styles.verseReference}>
                          — {verse.reference} ({verse.translation})
                        </Text>
                      </View>
                      
                      {/* Art Attribution */}
                      <View style={styles.attributionContainer}>
                        <Text style={styles.attributionText} numberOfLines={2}>
                          {attribution?.primary}
                        </Text>
                        <Text style={styles.attributionLocation} numberOfLines={1}>
                          {selectedArt.currentLocation}
                        </Text>
                      </View>
                      
                      {/* ChooseGOD Watermark */}
                      <View style={styles.watermark}>
                        <Text style={styles.watermarkText}>ChooseGOD</Text>
                      </View>
                    </View>
                  )}
                </ViewShot>
              </View>
              
              {/* Format Selector */}
              <View style={styles.formatSection}>
                <Text style={styles.sectionTitle}>Format</Text>
                <View style={styles.formatButtons}>
                  {(['story', 'square', 'twitter'] as ImageFormat[]).map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[
                        styles.formatButton,
                        format === f && styles.formatButtonActive,
                      ]}
                      onPress={() => setFormat(f)}
                    >
                      <Ionicons
                        name={f === 'story' ? 'phone-portrait' : f === 'square' ? 'square' : 'tablet-landscape'}
                        size={20}
                        color={format === f ? theme.colors.accent : theme.colors.textMuted}
                      />
                      <Text style={[
                        styles.formatButtonText,
                        format === f && styles.formatButtonTextActive,
                      ]}>
                        {f === 'story' ? 'Story' : f === 'square' ? 'Square' : 'Twitter'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Art Selection */}
              <View style={styles.artSection}>
                <Text style={styles.sectionTitle}>Artwork</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.artScroll}
                >
                  {artOptions.map((art) => (
                    <TouchableOpacity
                      key={art.id}
                      style={[
                        styles.artOption,
                        selectedArt?.id === art.id && styles.artOptionActive,
                      ]}
                      onPress={() => setSelectedArt(art)}
                    >
                      <Image
                        source={{ uri: art.imageUrl }}
                        style={styles.artThumbnail}
                        resizeMode="cover"
                      />
                      <View style={styles.artInfo}>
                        <Text style={styles.artTitle} numberOfLines={1}>
                          {art.title}
                        </Text>
                        <Text style={styles.artArtist} numberOfLines={1}>
                          {art.artistDisplayName}
                          {art.year ? ` (${art.year})` : ''}
                        </Text>
                        <Text style={styles.artSource} numberOfLines={1}>
                          {art.source === 'met' ? 'The Met' : 
                           art.source === 'rijksmuseum' ? 'Rijksmuseum' : 
                           'Art Institute Chicago'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                  
                  {/* Refresh button */}
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={loadArtOptions}
                  >
                    <Ionicons name="refresh" size={24} color={theme.colors.textMuted} />
                    <Text style={styles.refreshText}>More Art</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
              
              {/* Full Attribution */}
              {selectedArt && attribution && (
                <View style={styles.fullAttribution}>
                  <Text style={styles.sectionTitle}>Artwork Details</Text>
                  <View style={styles.attributionCard}>
                    <Text style={styles.attrLabel}>Title</Text>
                    <Text style={styles.attrValue}>{selectedArt.title}</Text>
                    
                    <Text style={styles.attrLabel}>Artist</Text>
                    <Text style={styles.attrValue}>{selectedArt.artistDisplayName}</Text>
                    
                    {selectedArt.year && (
                      <>
                        <Text style={styles.attrLabel}>Date</Text>
                        <Text style={styles.attrValue}>{selectedArt.year}</Text>
                      </>
                    )}
                    
                    {selectedArt.medium && (
                      <>
                        <Text style={styles.attrLabel}>Medium</Text>
                        <Text style={styles.attrValue}>{selectedArt.medium}</Text>
                      </>
                    )}
                    
                    {selectedArt.locationPainted && (
                      <>
                        <Text style={styles.attrLabel}>Created In</Text>
                        <Text style={styles.attrValue}>{selectedArt.locationPainted}</Text>
                      </>
                    )}
                    
                    <Text style={styles.attrLabel}>Current Location</Text>
                    <Text style={styles.attrValue}>{selectedArt.currentLocation}</Text>
                    
                    {selectedArt.galleryNumber && (
                      <Text style={styles.attrValueSmall}>{selectedArt.galleryNumber}</Text>
                    )}
                    
                    {selectedArt.objectUrl && (
                      <TouchableOpacity style={styles.viewOnlineButton}>
                        <Ionicons name="open-outline" size={16} color={theme.colors.accent} />
                        <Text style={styles.viewOnlineText}>View on Museum Website</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
        
        {/* Action Buttons */}
        {!loading && selectedArt && (
          <View style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveToPhotos}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={theme.colors.text} />
              ) : (
                <>
                  <Ionicons name="download-outline" size={20} color={theme.colors.text} />
                  <Text style={styles.saveButtonText}>Save</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={theme.colors.background} />
              ) : (
                <>
                  <Ionicons name="share-outline" size={20} color={theme.colors.background} />
                  <Text style={styles.shareButtonText}>Share</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  previewWrapper: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  verseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  verseText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 30,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  verseReference: {
    marginTop: 16,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  attributionContainer: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
  },
  attributionText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  attributionLocation: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  watermark: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  watermarkText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },
  formatSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  formatButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  formatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  formatButtonActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentAlpha[10],
  },
  formatButtonText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  formatButtonTextActive: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  artSection: {
    marginBottom: 24,
  },
  artScroll: {
    paddingRight: 24,
  },
  artOption: {
    width: 140,
    marginRight: 12,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  artOptionActive: {
    borderColor: theme.colors.accent,
  },
  artThumbnail: {
    width: '100%',
    height: 100,
  },
  artInfo: {
    padding: 8,
  },
  artTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  artArtist: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  artSource: {
    fontSize: 9,
    color: theme.colors.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  refreshButton: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  refreshText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  fullAttribution: {
    marginBottom: 24,
  },
  attributionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 16,
  },
  attrLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
  },
  attrValue: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 4,
  },
  attrValueSmall: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  viewOnlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  viewOnlineText: {
    fontSize: 14,
    color: theme.colors.accent,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.accent,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
  },
});

export default VerseImageGenerator;
