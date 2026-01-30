/**
 * VerseRow - Individual verse display component
 *
 * Handles verse rendering with highlighting, notes indicator,
 * bookmark indicator, and swipe gestures.
 */

import React, { useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../lib/theme";
import {
  VerseBookmark,
  VerseHighlight,
  VerseNote,
  VerseSource,
} from "../../types";
import { getHighlightBg } from "./constants";
import { SWIPE, TAP } from "../../constants";

export interface VerseWithAnnotations extends VerseSource {
  highlight?: VerseHighlight;
  notes?: VerseNote[];
  bookmark?: VerseBookmark;
}

interface VerseRowProps {
  verse: VerseWithAnnotations;
  isSelected: boolean;
  isTargetVerse: boolean;
  fontSize: number;
  onPress: () => void;
  onLongPress: () => void;
  onDoubleTap: () => void;
  onLayout: (y: number) => void;
  onSwipeHighlight: () => void;
}

export function VerseRow({
  verse,
  isSelected,
  isTargetVerse,
  fontSize,
  onPress,
  onLongPress,
  onDoubleTap,
  onLayout,
  onSwipeHighlight,
}: VerseRowProps) {
  const swipeX = useMemo(() => new Animated.Value(0), []);
  const lastTap = useRef<number>(0);
  const isSwiping = useRef(false);

  const hasNotes = verse.notes && verse.notes.length > 0;
  const isBookmarked = !!verse.bookmark;
  const highlightColor = verse.highlight?.color;

  // Create pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderGrant: () => {
        isSwiping.current = true;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow left swipe (negative dx) for highlight
        if (gestureState.dx < 0) {
          swipeX.setValue(Math.max(gestureState.dx, -100)); // Limit to 100px
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE.threshold) {
          // Trigger highlight action
          onSwipeHighlight();
        }
        // Reset position
        Animated.spring(swipeX, {
          toValue: 0,
          useNativeDriver: true,
        }).start(() => {
          isSwiping.current = false;
        });
      },
      onPanResponderTerminate: () => {
        Animated.spring(swipeX, {
          toValue: 0,
          useNativeDriver: true,
        }).start(() => {
          isSwiping.current = false;
        });
      },
    }),
  ).current;

  const handlePress = () => {
    const now = Date.now();
    if (now - lastTap.current < TAP.doubleTapDelay) {
      onDoubleTap();
    } else {
      onPress();
    }
    lastTap.current = now;
  };

  return (
    <View
      style={styles.verseWrapper}
      onLayout={(event) => {
        const { y } = event.nativeEvent.layout;
        onLayout(y);
      }}
    >
      {/* Swipe indicator background */}
      <View style={styles.swipeIndicator}>
        <Ionicons name="color-palette" size={20} color={theme.colors.primary} />
        <Text style={styles.swipeHint}>Highlight</Text>
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.verseContainer,
          isSelected && styles.verseSelected,
          isTargetVerse && styles.verseHighlighted,
          { transform: [{ translateX: swipeX }] },
        ]}
      >
        <Pressable
          onPress={handlePress}
          onLongPress={onLongPress}
          delayLongPress={300}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Verse ${verse.verse}. ${verse.text}${isBookmarked ? ". Bookmarked" : ""}${hasNotes ? `. ${verse.notes!.length} note${verse.notes!.length > 1 ? "s" : ""}` : ""}`}
          accessibilityHint="Tap to select, double tap to bookmark, long press for options, swipe left to highlight"
        >
          <View
            style={[
              styles.verseTextContainer,
              { backgroundColor: getHighlightBg(highlightColor) },
            ]}
          >
            <Text style={styles.verseNumber}>{verse.verse}</Text>
            <Text
              style={[
                styles.verseText,
                { fontSize, lineHeight: fontSize * 1.8 },
              ]}
            >
              {verse.text}
            </Text>
            {isBookmarked && (
              <View style={styles.bookmarkIndicator}>
                <Ionicons
                  name="bookmark"
                  size={14}
                  color={theme.colors.accent}
                />
              </View>
            )}
            {hasNotes && (
              <View style={styles.noteIndicator}>
                <Ionicons
                  name="document-text"
                  size={12}
                  color={theme.colors.primary}
                />
                {verse.notes!.length > 1 && (
                  <Text style={styles.noteCount}>{verse.notes!.length}</Text>
                )}
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  verseWrapper: {
    position: "relative",
    marginBottom: theme.spacing.xs,
  },
  swipeIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 100,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  swipeHint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  verseContainer: {
    backgroundColor: theme.colors.background,
  },
  verseSelected: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  verseHighlighted: {
    backgroundColor: theme.colors.accentAlpha[20],
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  verseTextContainer: {
    flexDirection: "row",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    position: "relative",
  },
  verseNumber: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
    minWidth: 20,
  },
  verseText: {
    flex: 1,
    color: theme.colors.text,
  },
  bookmarkIndicator: {
    position: "absolute",
    top: theme.spacing.xs,
    right: theme.spacing.sm,
  },
  noteIndicator: {
    position: "absolute",
    bottom: theme.spacing.xs,
    right: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  noteCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
});
