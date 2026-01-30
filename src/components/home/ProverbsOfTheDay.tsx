/**
 * ProverbsOfTheDay - Compact tappable row for daily Proverbs chapter
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../lib/theme";
import { BottomTabParamList, RootStackParamList } from "../../types";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { navigateToProverbsOfDay } from "../../lib/navigationHelpers";
import { BIBLE_LIMITS } from "../../constants/limits";

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function ProverbsOfTheDay() {
  const navigation = useNavigation<NavigationProp>();
  const dayOfMonth = new Date().getDate();
  const proverbsChapter = Math.min(
    dayOfMonth,
    BIBLE_LIMITS.maxProverbsChapters,
  );

  const handlePress = () => {
    navigateToProverbsOfDay(navigation);
  };

  return (
    <TouchableOpacity
      style={styles.proverbsCard}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Read Proverbs ${proverbsChapter}`}
    >
      <View style={styles.proverbsIconContainer}>
        <Ionicons name="book-outline" size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.proverbsContent}>
        <Text style={styles.proverbsTitle}>Proverbs of the Day</Text>
        <Text style={styles.proverbsSubtitle}>
          Read Proverbs {proverbsChapter}
        </Text>
      </View>
      <View style={styles.proverbsChapterBadge}>
        <Text style={styles.proverbsChapterText}>{proverbsChapter}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={theme.colors.textMuted}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  proverbsCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  proverbsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  proverbsContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  proverbsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  proverbsSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  proverbsChapterBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.sm,
  },
  proverbsChapterText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
});
