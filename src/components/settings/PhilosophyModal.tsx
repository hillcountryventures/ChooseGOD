/**
 * PhilosophyModal - "We are not God, only helping others find HIM"
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../lib/theme";

interface PhilosophyModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PhilosophyModal({ visible, onClose }: PhilosophyModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Our Philosophy</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalClose}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.philosophySection}>
            <View style={styles.philosophyIconContainer}>
              <Ionicons name="book" size={48} color={theme.colors.primary} />
            </View>
            <Text style={styles.philosophyTitle}>
              We are not God, only helping others find HIM
            </Text>
          </View>

          <View style={styles.philosophyPoint}>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={theme.colors.accent}
            />
            <Text style={styles.philosophyText}>
              ChooseGOD is a tool, not a replacement for Scripture, church, or
              community.
            </Text>
          </View>

          <View style={styles.philosophyPoint}>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={theme.colors.accent}
            />
            <Text style={styles.philosophyText}>
              The Scripture companion is designed to point you back to
              God&apos;s Word, never to replace it.
            </Text>
          </View>

          <View style={styles.philosophyPoint}>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={theme.colors.accent}
            />
            <Text style={styles.philosophyText}>
              Every feature, every response, every interaction should lead you
              closer to Jesus.
            </Text>
          </View>

          <View style={styles.philosophyPoint}>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={theme.colors.accent}
            />
            <Text style={styles.philosophyText}>
              We believe the Bible is the inspired Word of God and the ultimate
              authority for faith and life.
            </Text>
          </View>

          <View style={styles.philosophyVerse}>
            <Text style={styles.philosophyVerseText}>
              &quot;All Scripture is God-breathed and is useful for teaching,
              rebuking, correcting and training in righteousness.&quot;
            </Text>
            <Text style={styles.philosophyVerseRef}>— 2 Timothy 3:16</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  modalClose: {
    padding: theme.spacing.xs,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  philosophySection: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  philosophyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  philosophyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: "center",
    lineHeight: theme.fontSize.xl * 1.4,
  },
  philosophyPoint: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    paddingRight: theme.spacing.md,
  },
  philosophyText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.md * 1.5,
  },
  philosophyVerse: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  philosophyVerseText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontStyle: "italic",
    lineHeight: theme.fontSize.md * 1.5,
    textAlign: "center",
  },
  philosophyVerseRef: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
    textAlign: "center",
    marginTop: theme.spacing.sm,
  },
});
