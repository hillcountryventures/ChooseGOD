/**
 * ObedienceCompletionModal - Celebration when a faith step is completed
 *
 * Philosophy: Celebrate obedience! When believers follow through on
 * what God has asked, it's worth celebrating with joy and encouragement.
 *
 * "Well done, good and faithful servant!" - Matthew 25:21
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { theme } from "../lib/theme";
import { ObedienceStep } from "../types";

const { width, height } = Dimensions.get("window");

// Encouraging scriptures for obedience
const OBEDIENCE_SCRIPTURES = [
  {
    text: "Well done, good and faithful servant! You have been faithful with a few things; I will put you in charge of many things.",
    ref: "Matthew 25:21",
  },
  {
    text: "If you love me, keep my commands.",
    ref: "John 14:15",
  },
  {
    text: "But be doers of the word, and not hearers only, deceiving yourselves.",
    ref: "James 1:22",
  },
  {
    text: "Blessed rather are those who hear the word of God and obey it.",
    ref: "Luke 11:28",
  },
  {
    text: "And whatever you do, whether in word or deed, do it all in the name of the Lord Jesus, giving thanks to God the Father through him.",
    ref: "Colossians 3:17",
  },
  {
    text: "Therefore everyone who hears these words of mine and puts them into practice is like a wise man who built his house on the rock.",
    ref: "Matthew 7:24",
  },
];

interface ObedienceCompletionModalProps {
  visible: boolean;
  step: ObedienceStep | null;
  onDismiss: () => void;
  onSaveReflection: (stepId: string, reflection: string) => void;
}

export function ObedienceCompletionModal({
  visible,
  step,
  onDismiss,
  onSaveReflection,
}: ObedienceCompletionModalProps) {
  const [reflection, setReflection] = useState("");
  const [showInput, setShowInput] = useState(false);

  // Animation refs
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

  // Random scripture
  const [scriptureIndex] = useState(() =>
    Math.floor(Math.random() * OBEDIENCE_SCRIPTURES.length),
  );
  const scripture = OBEDIENCE_SCRIPTURES[scriptureIndex];

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setReflection("");
      setShowInput(false);
    }
  }, [visible]);

  const handleDismiss = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  }, [fadeAnim, onDismiss]);

  const handleSaveReflection = useCallback(() => {
    if (step && reflection.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSaveReflection(step.id, reflection.trim());
    }
    handleDismiss();
  }, [step, reflection, onSaveReflection, handleDismiss]);

  const handleAddReflection = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowInput(true);
  }, []);

  // Animation effect
  useEffect(() => {
    if (visible) {
      // Haptic celebration
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

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

      // Animate confetti
      confettiAnims.forEach((anim, i) => {
        const delay = i * 50;
        const targetX = ((i % 5) - 2) * (width * 0.3);
        const targetY = height * 0.6 + (i % 3) * 50;

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
  }, [visible, fadeAnim, scaleAnim, confettiAnims]);

  if (!visible || !step) return null;

  const confettiColors = [
    theme.colors.success,
    theme.colors.accent,
    theme.colors.primary,
    "#FFD700", // Gold
    "#22D3EE", // Cyan
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
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

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Content Card */}
            <Animated.View
              style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
            >
              {/* Success Icon */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={64}
                  color={theme.colors.success}
                />
              </View>

              {/* Title */}
              <Text style={styles.title}>Step Completed!</Text>
              <Text style={styles.subtitle}>Faithful in action 🙌</Text>

              {/* What was completed */}
              <View style={styles.completedBox}>
                <Text style={styles.completedLabel}>
                  You followed through on:
                </Text>
                <Text style={styles.completedText}>{step.commitment}</Text>
              </View>

              {/* Scripture */}
              <View style={styles.scriptureContainer}>
                <Text style={styles.scriptureText}>
                  &ldquo;{scripture.text}&rdquo;
                </Text>
                <Text style={styles.scriptureRef}>— {scripture.ref}</Text>
              </View>

              {/* Reflection Input */}
              {showInput ? (
                <View style={styles.reflectionSection}>
                  <Text style={styles.reflectionLabel}>
                    What did God show you through this?
                  </Text>
                  <TextInput
                    style={styles.reflectionInput}
                    placeholder="Share your reflection..."
                    placeholderTextColor={theme.colors.textMuted}
                    value={reflection}
                    onChangeText={setReflection}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    autoFocus
                  />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addReflectionButton}
                  onPress={handleAddReflection}
                >
                  <Ionicons
                    name="pencil-outline"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.addReflectionText}>
                    Add a reflection note
                  </Text>
                </TouchableOpacity>
              )}

              {/* Action Buttons */}
              <View style={styles.actions}>
                {showInput ? (
                  <>
                    <TouchableOpacity
                      style={styles.skipButton}
                      onPress={handleDismiss}
                    >
                      <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.saveButton,
                        !reflection.trim() && styles.saveButtonDisabled,
                      ]}
                      onPress={handleSaveReflection}
                      disabled={!reflection.trim()}
                    >
                      <Text style={styles.saveText}>Save Reflection</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleDismiss}
                  >
                    <Text style={styles.continueText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  confetti: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 28,
    padding: theme.spacing.xl,
    alignItems: "center",
    maxWidth: width * 0.9,
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  completedBox: {
    backgroundColor: theme.colors.successAlpha[15],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    width: "100%",
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.success + "30",
  },
  completedLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    fontWeight: theme.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  completedText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: theme.fontSize.md * 1.4,
  },
  scriptureContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: "100%",
    marginBottom: theme.spacing.lg,
  },
  scriptureText: {
    fontSize: theme.fontSize.md,
    fontStyle: "italic",
    color: theme.colors.text,
    textAlign: "center",
    lineHeight: theme.fontSize.md * 1.6,
    marginBottom: theme.spacing.sm,
  },
  scriptureRef: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    textAlign: "center",
    fontWeight: "600",
  },
  addReflectionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  addReflectionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  reflectionSection: {
    width: "100%",
    marginBottom: theme.spacing.md,
  },
  reflectionLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  reflectionInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    minHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.md,
    width: "100%",
  },
  continueButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  continueText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: "#fff",
  },
  skipButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skipText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  saveButton: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.primary + "50",
  },
  saveText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: "#fff",
  },
});

export default ObedienceCompletionModal;
