/**
 * TopicsExplored
 *
 * Displays categorized chat topics with animated progress bars.
 * Shows what spiritual themes the user has been exploring.
 */

import React, { useEffect, useRef, useMemo } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../lib/theme";

// Map topic labels to icons
const TOPIC_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Anxiety & Peace': 'leaf-outline',
  'Love & Relationships': 'heart-outline',
  'Purpose & Calling': 'compass-outline',
  'Prayer Life': 'hand-left-outline',
  'Faith & Doubt': 'help-circle-outline',
  'Healing': 'medkit-outline',
  'Forgiveness': 'refresh-outline',
  'Gratitude': 'happy-outline',
  'Scripture Study': 'book-outline',
  'default': 'chatbubble-outline',
};
import type { TopicEngagement } from "../../hooks/useJourneyInsights";

interface TopicsExploredProps {
  data: TopicEngagement[];
}

export function TopicsExplored({ data }: TopicsExploredProps) {
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Topics You&apos;ve Explored</Text>
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={40} color={theme.colors.textMuted} />
          <Text style={styles.emptyText}>
            Start chatting to discover your spiritual interests
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Topics You&apos;ve Explored</Text>
      <View style={styles.topicList}>
        {data.map((topic, index) => (
          <TopicRow key={topic.id} topic={topic} index={index} />
        ))}
      </View>
    </View>
  );
}

interface TopicRowProps {
  topic: TopicEngagement;
  index: number;
}

function TopicRow({ topic, index }: TopicRowProps) {
  const widthAnim = useMemo(() => new Animated.Value(0), []);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    // Stagger animation
    const delay = index * 100;

    Animated.sequence([
      Animated.delay(delay + 200), // Wait for container to appear
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(widthAnim, {
          toValue: topic.percentage,
          tension: 40,
          friction: 7,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }, [topic.percentage, index]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  // Create gradient colors based on topic color
  const getGradientColors = (color: string): [string, string] => {
    // Return color with different opacities for gradient effect
    return [color, `${color}CC`];
  };

  return (
    <Animated.View style={[styles.topicRow, { opacity: fadeAnim }]}>
      <View
        style={[styles.iconContainer, { backgroundColor: `${topic.color}20` }]}
      >
        <Ionicons 
          name={TOPIC_ICONS[topic.label] || TOPIC_ICONS.default} 
          size={20} 
          color={topic.color} 
        />
      </View>
      <View style={styles.topicContent}>
        <View style={styles.topicHeader}>
          <Text style={styles.topicLabel}>{topic.label}</Text>
          <Text style={styles.chatCount}>{topic.chatCount} chats</Text>
        </View>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[styles.progressBarWrapper, { width: animatedWidth }]}
          >
            <LinearGradient
              colors={getGradientColors(topic.color)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressBar}
            />
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.accentAlpha[10],
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  topicList: {
    gap: theme.spacing.md,
  },
  topicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 18,
  },
  topicContent: {
    flex: 1,
  },
  topicHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  topicLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: "500",
    color: theme.colors.text,
  },
  chatCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  progressBackground: {
    height: 8,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.full,
    overflow: "hidden",
  },
  progressBarWrapper: {
    height: "100%",
    borderRadius: theme.borderRadius.full,
    overflow: "hidden",
  },
  progressBar: {
    flex: 1,
    borderRadius: theme.borderRadius.full,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
});

export default TopicsExplored;
