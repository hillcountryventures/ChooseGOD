/**
 * MemoryPracticeScreen - Flashcard-style verse memorization
 *
 * Features:
 * - Show verse reference, tap to reveal text
 * - First-letter hints for partial recall
 * - Rate difficulty (Again, Hard, Good, Easy)
 * - Progress through due verses
 * - Celebration on completion
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../lib/theme";
import { useMemoryVerses, ReviewRating } from "../hooks/useMemoryVerses";
import { CelebrationOverlay } from "../components/CelebrationOverlay";
import { useTrackScreen } from "../hooks/useAnalytics";

const { width: _width } = Dimensions.get("window");

// Generate first-letter hints: "For God so loved" → "F___ G__ s_ l____"
function generateHint(text: string): string {
  return text
    .split(" ")
    .map((word) => {
      if (word.length <= 2) return word;
      return word[0] + "_".repeat(word.length - 1);
    })
    .join(" ");
}

export default function MemoryPracticeScreen() {
  useTrackScreen("memory_practice");
  const navigation = useNavigation();
  const { dueVerses, reviewVerse, isLoading } = useMemoryVerses();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const flipAnim = useMemo(() => new Animated.Value(0), []);
  const progressAnim = useMemo(() => new Animated.Value(0), []);

  const currentVerse = dueVerses[currentIndex];
  const totalDue = dueVerses.length;
  const isComplete = currentIndex >= totalDue;

  // Update progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: totalDue > 0 ? reviewedCount / totalDue : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [reviewedCount, totalDue]);

  const handleReveal = () => {
    setIsRevealed(true);
    Animated.spring(flipAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleRate = async (rating: ReviewRating) => {
    if (!currentVerse) return;

    await reviewVerse(currentVerse.id, rating);
    setReviewedCount((prev) => prev + 1);

    // Reset for next card
    setIsRevealed(false);
    setShowHint(false);
    flipAnim.setValue(0);

    // Move to next or complete
    if (currentIndex + 1 >= totalDue) {
      setShowCelebration(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleCelebrationDismiss = () => {
    setShowCelebration(false);
    navigation.goBack();
  };

  // Empty state - no verses due
  if (!isLoading && totalDue === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Memory Practice</Text>
          <View style={styles.closeButton} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons
            name="checkmark-circle"
            size={80}
            color={theme.colors.success}
          />
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptyText}>
            No verses are due for review right now.{"\n"}
            Add verses from the Bible screen to start memorizing.
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleClose}>
            <Text style={styles.emptyButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Completion state
  if (isComplete && !showCelebration) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completionContainer}>
          <Ionicons name="trophy" size={80} color={theme.colors.accent} />
          <Text style={styles.completionTitle}>Session Complete!</Text>
          <Text style={styles.completionText}>
            You reviewed {reviewedCount} verse{reviewedCount !== 1 ? "s" : ""}{" "}
            today.
          </Text>
          <TouchableOpacity
            style={styles.completionButton}
            onPress={handleClose}
          >
            <Text style={styles.completionButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentVerse) return null;

  const reference = currentVerse.verseEnd
    ? `${currentVerse.book} ${currentVerse.chapter}:${currentVerse.verseStart}-${currentVerse.verseEnd}`
    : `${currentVerse.book} ${currentVerse.chapter}:${currentVerse.verseStart}`;

  const cardScale = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.95, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Memory Practice</Text>
        <Text style={styles.headerCount}>
          {currentIndex + 1}/{totalDue}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <Animated.View
          style={[styles.card, { transform: [{ scale: cardScale }] }]}
        >
          <LinearGradient
            colors={[theme.colors.card, theme.colors.surface]}
            style={styles.cardGradient}
          >
            {/* Reference */}
            <View style={styles.referenceContainer}>
              <Ionicons name="book" size={20} color={theme.colors.primary} />
              <Text style={styles.referenceText}>{reference}</Text>
            </View>

            {/* Translation badge */}
            <View style={styles.translationBadge}>
              <Text style={styles.translationText}>
                {currentVerse.translation.toUpperCase()}
              </Text>
            </View>

            {/* Content Area */}
            <ScrollView
              style={styles.contentScroll}
              showsVerticalScrollIndicator={false}
            >
              {!isRevealed ? (
                // Question side
                <View style={styles.questionContainer}>
                  {showHint ? (
                    <>
                      <Text style={styles.hintLabel}>First-letter hint:</Text>
                      <Text style={styles.hintText}>
                        {generateHint(currentVerse.text)}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons
                        name="help-circle"
                        size={48}
                        color={theme.colors.textMuted}
                      />
                      <Text style={styles.questionText}>
                        Can you recall this verse?
                      </Text>
                    </>
                  )}

                  {/* Hint toggle */}
                  {!showHint && (
                    <TouchableOpacity
                      style={styles.hintButton}
                      onPress={() => setShowHint(true)}
                    >
                      <Ionicons
                        name="bulb-outline"
                        size={18}
                        color={theme.colors.accent}
                      />
                      <Text style={styles.hintButtonText}>Show hint</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                // Answer side
                <View style={styles.answerContainer}>
                  <Text style={styles.verseText}>{currentVerse.text}</Text>

                  {currentVerse.mnemonic && (
                    <View style={styles.mnemonicContainer}>
                      <Text style={styles.mnemonicLabel}>Memory aid:</Text>
                      <Text style={styles.mnemonicText}>
                        {currentVerse.mnemonic}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Review count */}
            <View style={styles.reviewInfo}>
              <Ionicons
                name="refresh"
                size={14}
                color={theme.colors.textMuted}
              />
              <Text style={styles.reviewInfoText}>
                Reviewed {currentVerse.reviewCount} time
                {currentVerse.reviewCount !== 1 ? "s" : ""}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {!isRevealed ? (
          <TouchableOpacity style={styles.revealButton} onPress={handleReveal}>
            <Text style={styles.revealButtonText}>Reveal Answer</Text>
            <Ionicons name="eye" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>How well did you remember?</Text>
            <View style={styles.ratingButtons}>
              <TouchableOpacity
                style={[styles.ratingButton, styles.ratingAgain]}
                onPress={() => handleRate("again")}
              >
                <Ionicons
                  name="close-circle"
                  size={24}
                  color={theme.colors.error}
                />
                <Text
                  style={[styles.ratingText, { color: theme.colors.error }]}
                >
                  Again
                </Text>
                <Text style={styles.ratingHint}>1 day</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ratingButton, styles.ratingHard]}
                onPress={() => handleRate("hard")}
              >
                <Ionicons
                  name="alert-circle"
                  size={24}
                  color={theme.colors.warning}
                />
                <Text
                  style={[styles.ratingText, { color: theme.colors.warning }]}
                >
                  Hard
                </Text>
                <Text style={styles.ratingHint}>
                  {Math.round(currentVerse.intervalDays * 1.2)}d
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ratingButton, styles.ratingGood]}
                onPress={() => handleRate("good")}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme.colors.success}
                />
                <Text
                  style={[styles.ratingText, { color: theme.colors.success }]}
                >
                  Good
                </Text>
                <Text style={styles.ratingHint}>
                  {Math.round(
                    currentVerse.intervalDays * currentVerse.easeFactor,
                  )}
                  d
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ratingButton, styles.ratingEasy]}
                onPress={() => handleRate("easy")}
              >
                <Ionicons name="star" size={24} color={theme.colors.primary} />
                <Text
                  style={[styles.ratingText, { color: theme.colors.primary }]}
                >
                  Easy
                </Text>
                <Text style={styles.ratingHint}>
                  {Math.round(currentVerse.intervalDays * 2.5)}d
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Celebration */}
      <CelebrationOverlay
        visible={showCelebration}
        onDismiss={handleCelebrationDismiss}
        title="Well Done!"
        subtitle={`${reviewedCount} verse${reviewedCount !== 1 ? "s" : ""} reviewed`}
        showScripture={false}
        icon="school"
        iconColor={theme.colors.primary}
        autoDismissMs={4000}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
  },
  headerCount: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.textSecondary,
    minWidth: 44,
    textAlign: "right",
  },
  progressContainer: {
    height: 4,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  cardContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: theme.colors.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardGradient: {
    padding: 24,
    minHeight: 300,
  },
  referenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  referenceText: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  translationBadge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.primaryAlpha[20],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  translationText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  contentScroll: {
    flex: 1,
    minHeight: 150,
  },
  questionContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  questionText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginTop: 12,
    textAlign: "center",
  },
  hintLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 12,
  },
  hintText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 28,
    fontFamily: "monospace",
  },
  hintButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
  },
  hintButtonText: {
    fontSize: 14,
    color: theme.colors.accent,
    fontWeight: "500",
  },
  answerContainer: {
    paddingVertical: 10,
  },
  verseText: {
    fontSize: 20,
    color: theme.colors.text,
    lineHeight: 32,
    textAlign: "center",
  },
  mnemonicContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  mnemonicLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  mnemonicText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
  },
  reviewInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  reviewInfoText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  actionsContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  revealButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
  },
  revealButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
  },
  ratingContainer: {
    alignItems: "center",
  },
  ratingLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  ratingButtons: {
    flexDirection: "row",
    gap: 12,
  },
  ratingButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  ratingAgain: {},
  ratingHard: {},
  ratingGood: {},
  ratingEasy: {},
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  ratingHint: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  // Completion state
  completionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  completionText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  completionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  completionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
});
