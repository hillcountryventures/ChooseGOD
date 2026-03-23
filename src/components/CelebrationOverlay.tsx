/**
 * CelebrationOverlay - Reusable celebration animation with confetti
 *
 * Used for:
 * - Answered prayers
 * - Memory verse milestones
 * - Devotional completions
 * - Obedience steps completed
 */

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../lib/theme";

const { width, height } = Dimensions.get("window");

// Scriptures about God's faithfulness for answered prayers
const FAITHFULNESS_SCRIPTURES = [
  {
    text: "The LORD is faithful to all his promises and loving toward all he has made.",
    ref: "Psalm 145:13",
  },
  {
    text: "Give thanks to the LORD, for he is good; his love endures forever.",
    ref: "1 Chronicles 16:34",
  },
  {
    text: "The LORD has done great things for us, and we are filled with joy.",
    ref: "Psalm 126:3",
  },
  {
    text: "This is the confidence we have in approaching God: that if we ask anything according to his will, he hears us.",
    ref: "1 John 5:14",
  },
  {
    text: "Delight yourself in the LORD, and he will give you the desires of your heart.",
    ref: "Psalm 37:4",
  },
  {
    text: "The prayer of a righteous person is powerful and effective.",
    ref: "James 5:16",
  },
];

interface CelebrationOverlayProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  subtitle?: string;
  showScripture?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  autoDismissMs?: number;
}

export function CelebrationOverlay({
  visible,
  onDismiss,
  title = "Prayer Answered!",
  subtitle = "God is faithful!",
  showScripture = true,
  icon = "trophy",
  iconColor = theme.colors.success,
  autoDismissMs = 5000,
}: CelebrationOverlayProps) {
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.8), []);
  const confettiAnims = useRef(
    [...Array(20)].map(() => ({
      translateY: new Animated.Value(-50),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    })),
  ).current;

  // Random scripture - stable for component lifetime
  const [scriptureIndex] = useState(() =>
    Math.floor(Math.random() * FAITHFULNESS_SCRIPTURES.length),
  );
  const scripture = FAITHFULNESS_SCRIPTURES[scriptureIndex];

  const handleDismiss = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  }, [fadeAnim, onDismiss]);

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate confetti with pre-computed random values
      confettiAnims.forEach((anim, i) => {
        const delay = i * 50;
        const seed = i * 0.1; // Deterministic variation per piece
        const targetX = (seed - 0.5) * width * 1.5 * (i % 2 === 0 ? 1 : -1);
        const targetY = height * 0.7 + i * 10;

        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim.translateY, {
              toValue: targetY,
              duration: 2500,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateX, {
              toValue: targetX,
              duration: 2500,
              useNativeDriver: true,
            }),
            Animated.timing(anim.rotate, {
              toValue: 360 * (i % 2 === 0 ? 1 : -1),
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.delay(1500),
              Animated.timing(anim.opacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]).start();
      });

      // Auto dismiss
      if (autoDismissMs > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoDismissMs);
        return () => clearTimeout(timer);
      }
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      confettiAnims.forEach((anim) => {
        anim.translateY.setValue(-50);
        anim.translateX.setValue(0);
        anim.rotate.setValue(0);
        anim.opacity.setValue(1);
      });
    }
  }, [
    visible,
    autoDismissMs,
    handleDismiss,
    fadeAnim,
    scaleAnim,
    confettiAnims,
  ]);

  if (!visible) return null;

  const confettiColors = [
    theme.colors.success,
    theme.colors.accent,
    theme.colors.primary,
    theme.colors.prayer,
    "#FFD700", // Gold
  ];

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <TouchableOpacity
        style={styles.touchable}
        activeOpacity={1}
        onPress={handleDismiss}
      >
        {/* Confetti */}
        {confettiAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.confetti,
              {
                left: width * 0.5 + (i % 5) * 20 - 50,
                backgroundColor: confettiColors[i % confettiColors.length],
                opacity: anim.opacity,
                transform: [
                  { translateY: anim.translateY },
                  { translateX: anim.translateX },
                  {
                    rotate: anim.rotate.interpolate({
                      inputRange: [0, 360],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}

        {/* Content Card */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${iconColor}20` },
            ]}
          >
            <Ionicons name={icon} size={48} color={iconColor} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* Scripture */}
          {showScripture && (
            <View style={styles.scriptureContainer}>
              <Text style={styles.scriptureText}>
                &quot;{scripture.text}&quot;
              </Text>
              <Text style={styles.scriptureRef}>— {scripture.ref}</Text>
            </View>
          )}

          {/* Dismiss hint */}
          <Text style={styles.dismissHint}>Tap anywhere to continue</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  touchable: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  confetti: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    maxWidth: width * 0.85,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  scriptureContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  scriptureText: {
    fontSize: 16,
    fontStyle: "italic",
    color: theme.colors.text,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
  },
  scriptureRef: {
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: "center",
    fontWeight: "600",
  },
  dismissHint: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
});
