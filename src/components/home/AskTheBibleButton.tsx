/**
 * AskTheBibleButton - Primary entry point for AI chat
 * Includes pulse animation when all 3 seeds are available
 */

import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../lib/theme";
import { BottomTabParamList, RootStackParamList } from "../../types";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { openChatHub } from "../../lib/navigationHelpers";
import { useChatQuota } from "../../hooks/useChatQuota";
import { useScriptureScan } from "../../hooks/useScriptureScan";

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function AskTheBibleButton() {
  const navigation = useNavigation<NavigationProp>();
  const { seedsRemaining, totalSeeds, isPremium } = useChatQuota();
  const { scanImage } = useScriptureScan();

  const pulseAnim = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    if (seedsRemaining === totalSeeds && !isPremium) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [seedsRemaining, totalSeeds, isPremium, pulseAnim]);

  const handlePress = () => {
    openChatHub(navigation);
  };

  const handleScanPress = () => {
    scanImage(navigation);
  };

  return (
    <View style={styles.askBibleContainer}>
      {/* Camera Scan Button */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={handleScanPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Scan Scripture with camera"
      >
        <Ionicons
          name="camera-outline"
          size={24}
          color={theme.colors.primary}
        />
      </TouchableOpacity>

      {/* Main Ask Button */}
      <Animated.View
        style={[styles.askBibleButton, { transform: [{ scale: pulseAnim }] }]}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Ask the Bible — open AI chat"
        >
          <LinearGradient
            colors={[theme.colors.primary, "#818CF8"] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.askBibleGradient}
          >
            <View style={styles.askBibleIconContainer}>
              <Ionicons
                name="chatbubbles"
                size={24}
                color={theme.colors.text}
              />
            </View>
            <View style={styles.askBibleContent}>
              <Text style={styles.askBibleTitle}>Ask the Bible</Text>
              <Text style={styles.askBibleSubtitle}>
                {isPremium
                  ? "Unlimited questions & guidance"
                  : seedsRemaining === totalSeeds
                    ? `${seedsRemaining} fresh seeds ready`
                    : `${seedsRemaining} seed${seedsRemaining !== 1 ? "s" : ""} remaining`}
              </Text>
            </View>
            {!isPremium && (
              <View style={styles.askBibleSeeds}>
                {Array.from({ length: totalSeeds }).map((_, i) => (
                  <Text key={i} style={styles.askBibleSeedEmoji}>
                    {i < seedsRemaining ? "🌱" : "·"}
                  </Text>
                ))}
              </View>
            )}
            <Ionicons
              name="arrow-forward"
              size={20}
              color="rgba(255,255,255,0.8)"
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  askBibleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.primary + "40",
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.sm,
  },
  askBibleButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    ...theme.shadows.md,
  },
  askBibleGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  askBibleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  askBibleContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  askBibleTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  askBibleSubtitle: {
    fontSize: theme.fontSize.sm,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  askBibleSeeds: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: theme.spacing.sm,
    gap: 2,
  },
  askBibleSeedEmoji: {
    fontSize: 14,
  },
});
