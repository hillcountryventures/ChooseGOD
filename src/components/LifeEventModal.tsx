/**
 * LifeEventModal \u2014 periodic "what's going on in your life?" check-in.
 *
 * Triggered every ~60 days via the Home screen. Per Decision #17, this
 * is the anti-churn mechanic. Users who tell us "a big change happened"
 * get the app's tone softened; users who say "thriving" get more challenge.
 *
 * 4 options so it's one-tap and never feels like a survey.
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

type LifeState = 'thriving' | 'struggling' | 'big_change' | 'same';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAnswered?: (state: LifeState) => void;
}

const OPTIONS: Array<{
  id: LifeState;
  label: string;
  emoji: string;
  caption: string;
}> = [
  { id: 'thriving', label: 'Thriving', emoji: '\u2728', caption: 'This season is good.' },
  { id: 'struggling', label: 'Struggling', emoji: '\u{1F614}', caption: 'It\u2019s heavy right now.' },
  { id: 'big_change', label: 'A big change happened', emoji: '\u{1F341}', caption: 'Something shifted.' },
  { id: 'same', label: 'About the same', emoji: '\u{1F6E4}', caption: 'Walking on.' },
];

export const LifeEventModal: React.FC<Props> = ({ visible, onClose, onAnswered }) => {
  const [selected, setSelected] = useState<LifeState | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = useAuthStore((s) => s.user);

  const handleSubmit = async () => {
    if (!selected || !user?.id) return;
    setSubmitting(true);
    try {
      await supabase.from('life_events').insert({
        user_id: user.id,
        state: selected,
        context_note: note.trim() || null,
      });
      onAnswered?.(selected);
      onClose();
      setSelected(null);
      setNote('');
    } catch {
      Alert.alert('Couldn\u2019t save', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.backdrop}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>How\u2019s life right now?</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Skip">
              <Ionicons name="close" size={22} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            Your answer shapes how we show up for you over the next couple months.
          </Text>

          <View style={styles.options}>
            {OPTIONS.map((opt) => {
              const isSel = selected === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.option, isSel && styles.optionSelected]}
                  onPress={() => setSelected(opt.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSel }}
                >
                  <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionLabel}>{opt.label}</Text>
                    <Text style={styles.optionCaption}>{opt.caption}</Text>
                  </View>
                  {isSel && (
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {selected === 'big_change' && (
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="If you want to share (optional)..."
              placeholderTextColor={theme.colors.textMuted}
              style={styles.noteInput}
              maxLength={200}
              multiline
            />
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!selected || submitting}
            style={[styles.submit, (!selected || submitting) && styles.submitDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Save"
          >
            <Text style={styles.submitText}>{submitting ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 20, lineHeight: 20 },
  options: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  optionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(201,169,98,0.08)',
  },
  optionEmoji: { fontSize: 22 },
  optionLabel: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  optionCaption: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  noteInput: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 12,
    color: theme.colors.text,
    minHeight: 60,
  },
  submit: {
    marginTop: 18,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: theme.colors.background, fontSize: 16, fontWeight: '700' },
});

export default LifeEventModal;
