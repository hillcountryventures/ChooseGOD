/**
 * HeroVerseCard - Tappable verse that opens Bible reader
 */

import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Share } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../lib/theme";
import { useDailyVerse } from "../../hooks/useDailyVerse";
import { BottomTabParamList, RootStackParamList } from "../../types";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  navigateToBibleVerse,
  openJournalCompose,
  openChatHub,
} from "../../lib/navigationHelpers";
import { BIBLE_DEFAULTS } from "../../constants/strings";
import { useCommunityCount } from "../../hooks/useCommunityCount";
import { logger } from "../../utils/logger";

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function HeroVerseCard() {
  const navigation = useNavigation<NavigationProp>();
  const { dailyVerse, fetchDailyVerse, isLoading } = useDailyVerse();

  // Get community count for this verse
  const verseReference = dailyVerse
    ? `${dailyVerse.verse.book} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}`
    : "";
  const communityCount = useCommunityCount(verseReference);

  useEffect(() => {
    fetchDailyVerse();
  }, [fetchDailyVerse]);

  const handleVersePress = () => {
    if (!dailyVerse) return;
    navigateToBibleVerse(
      navigation,
      dailyVerse.verse.book,
      dailyVerse.verse.chapter,
      dailyVerse.verse.verse,
    );
  };

  const handleReflect = () => {
    if (!dailyVerse) return;
    openJournalCompose(navigation, {
      verse: {
        book: dailyVerse.verse.book,
        chapter: dailyVerse.verse.chapter,
        verse: dailyVerse.verse.verse,
        text: dailyVerse.verse.text,
        translation: BIBLE_DEFAULTS.translation,
      },
      source: {
        type: "verse_reflection",
        referenceId: `${dailyVerse.verse.book} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}`,
      },
    });
  };

  const handleShare = async () => {
    if (!dailyVerse) return;
    const reference = `${dailyVerse.verse.book} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}`;
    try {
      await Share.share({
        message: `"${dailyVerse.verse.text}"\n\n— ${reference}\n\nShared from ChooseGOD`,
      });
    } catch (error) {
      logger.error("Error sharing:", error);
    }
  };

  const handleAskAboutVerse = () => {
    if (!dailyVerse) return;
    const reference = `${dailyVerse.verse.book} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}`;
    openChatHub(navigation, {
      contextVerse: {
        book: dailyVerse.verse.book,
        chapter: dailyVerse.verse.chapter,
        verse: dailyVerse.verse.verse,
        text: dailyVerse.verse.text,
        translation: BIBLE_DEFAULTS.translation,
      },
      initialMessage: `Help me understand ${reference}: "${dailyVerse.verse.text}"`,
    });
  };

  if (isLoading || !dailyVerse) {
    return (
      <View style={styles.heroCard}>
        <LinearGradient
          colors={theme.colors.gradient.dark as [string, string]}
          style={styles.heroGradient}
        >
          <View style={styles.heroLoading}>
            <Ionicons
              name="book-outline"
              size={32}
              color={theme.colors.textMuted}
            />
            <Text style={styles.heroLoadingText}>
              Loading today&apos;s verse...
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const reference = `${dailyVerse.verse.book} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}`;

  return (
    <View style={styles.heroCard}>
      <LinearGradient
        colors={theme.colors.gradient.spiritual as [string, string]}
        style={styles.heroGradient}
      >
        <View style={styles.heroHeader}>
          <View style={styles.heroTitleRow}>
            <View style={styles.heroIconBadge}>
              <Ionicons name="sunny" size={14} color={theme.colors.accent} />
            </View>
            <Text style={styles.heroTitle}>VERSE OF THE DAY</Text>
          </View>
        </View>

        {/* Tappable verse text */}
        <TouchableOpacity
          onPress={handleVersePress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Daily verse: tap to open in Bible"
        >
          <Text style={styles.heroVerseText}>
            &quot;{dailyVerse.verse.text}&quot;
          </Text>
        </TouchableOpacity>

        {/* Tappable reference - navigates to Bible */}
        <TouchableOpacity
          onPress={handleVersePress}
          style={styles.heroReferenceRow}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Open ${reference} in Bible reader`}
        >
          <Text style={styles.heroReference}>— {reference}</Text>
          <Ionicons
            name="arrow-forward"
            size={14}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        {/* Community Breadcrumb */}
        {communityCount > 0 && (
          <View style={styles.communityBreadcrumb}>
            <Ionicons
              name="people-outline"
              size={14}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.communityText}>
              Join {communityCount.toLocaleString()} others reflecting today
            </Text>
          </View>
        )}

        <View style={styles.heroActions}>
          <TouchableOpacity
            style={styles.heroActionBtn}
            onPress={handleAskAboutVerse}
            accessibilityRole="button"
            accessibilityLabel="Ask about this verse"
          >
            <Ionicons
              name="chatbubble-outline"
              size={16}
              color={theme.colors.primary}
            />
            <Text style={styles.heroActionText}>Ask</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroActionBtn}
            onPress={handleReflect}
            accessibilityRole="button"
            accessibilityLabel="Write a reflection"
          >
            <Ionicons
              name="pencil-outline"
              size={16}
              color={theme.colors.primary}
            />
            <Text style={styles.heroActionText}>Reflect</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroActionBtn}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share this verse"
          >
            <Ionicons
              name="share-outline"
              size={16}
              color={theme.colors.primary}
            />
            <Text style={styles.heroActionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
    ...theme.shadows.lg,
  },
  heroGradient: {
    padding: theme.spacing.lg,
    minHeight: 200,
  },
  heroHeader: {
    marginBottom: theme.spacing.md,
  },
  heroTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  heroIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.accentAlpha[20],
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent,
    letterSpacing: 2,
  },
  heroVerseText: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.text,
    lineHeight: theme.fontSize.xl * 1.6,
    fontStyle: "italic",
    marginBottom: theme.spacing.md,
    flexWrap: "wrap",
  },
  heroReferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  heroReference: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  communityBreadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  communityText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
    flexWrap: "wrap",
  },
  heroActions: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  heroActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primaryAlpha[15],
    borderRadius: theme.borderRadius.full,
  },
  heroActionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  heroLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  heroLoadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
});
