import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../lib/theme";
import { useStore } from "../../store/useStore";
import { BottomTabParamList, RootStackParamList, ChatMode } from "../../types";
import { openChatHub } from "../../lib/navigationHelpers";

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function ContextualCard() {
  const navigation = useNavigation<NavigationProp>();
  const memoryVersesDue = useStore((state) => state.memoryVersesDue);
  const activePrayers = useStore((state) => state.activePrayers);
  const pendingObedienceSteps = useStore(
    (state) => state.pendingObedienceSteps,
  );

  const _openChatWithMode = (mode: ChatMode) => {
    openChatHub(navigation, { contextMode: mode });
  };

  let card: {
    icon: keyof typeof Ionicons.glyphMap;
    iconBg: string;
    title: string;
    subtitle: string;
    onPress: () => void;
  };

  if (memoryVersesDue.length > 0) {
    card = {
      icon: "bulb",
      iconBg: theme.colors.accent,
      title: "Memory Review",
      subtitle: `${memoryVersesDue.length} verse${memoryVersesDue.length > 1 ? "s" : ""} ready to review`,
      onPress: () => navigation.navigate("MemoryPractice"),
    };
  } else if (pendingObedienceSteps.length > 0) {
    card = {
      icon: "checkmark-circle",
      iconBg: theme.colors.success,
      title: "Follow Through",
      subtitle: `${pendingObedienceSteps.length} commitment${pendingObedienceSteps.length > 1 ? "s" : ""} to check on`,
      onPress: () => navigation.navigate("Journey"),
    };
  } else if (activePrayers.length > 0) {
    card = {
      icon: "heart",
      iconBg: theme.colors.error,
      title: "Continue in Prayer",
      subtitle: `${activePrayers.length} prayer${activePrayers.length > 1 ? "s" : ""} before the Lord`,
      onPress: () => navigation.navigate("Prayers"),
    };
  } else {
    card = {
      icon: "sunny",
      iconBg: theme.colors.accent,
      title: "Today's Devotional",
      subtitle: "Start your day with God",
      onPress: () =>
        navigation.navigate("Devotionals", { screen: "DevotionalHub" }),
    };
  }

  return (
    <TouchableOpacity
      style={styles.contextCard}
      onPress={card.onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${card.title}: ${card.subtitle}`}
    >
      <View style={[styles.contextIcon, { backgroundColor: card.iconBg }]}>
        <Ionicons name={card.icon} size={22} color={theme.colors.text} />
      </View>
      <View style={styles.contextContent}>
        <Text style={styles.contextTitle}>{card.title}</Text>
        <Text style={styles.contextSubtitle}>{card.subtitle}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.textMuted}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  contextCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contextIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  contextContent: { flex: 1, marginLeft: theme.spacing.md },
  contextTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  contextSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
    flexWrap: "wrap",
  },
});
