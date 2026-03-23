/**
 * WeeklyComparison - Compare this week vs last week
 *
 * Shows bar chart comparison with improvement percentage.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../lib/theme';
import { SpiritualMoment } from '../../types';

interface WeeklyComparisonProps {
  moments: SpiritualMoment[];
}

interface WeekStats {
  prayer: number;
  journal: number;
  devotional: number;
  chat: number;
  total: number;
}

export function WeeklyComparison({ moments }: WeeklyComparisonProps) {
  // Calculate this week and last week stats
  const { thisWeek, lastWeek, percentChange } = useMemo(() => {
    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);
    
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    
    const endOfLastWeek = new Date(startOfThisWeek);
    
    const thisWeekMoments = moments.filter((m) => {
      const d = new Date(m.createdAt);
      return d >= startOfThisWeek;
    });
    
    const lastWeekMoments = moments.filter((m) => {
      const d = new Date(m.createdAt);
      return d >= startOfLastWeek && d < endOfLastWeek;
    });
    
    const countByType = (momentList: SpiritualMoment[]): WeekStats => ({
      prayer: momentList.filter((m) => m.momentType === 'prayer').length,
      journal: momentList.filter((m) => m.momentType === 'journal').length,
      devotional: momentList.filter((m) => m.momentType === 'devotional').length,
      chat: momentList.filter((m) => m.momentType === 'chat').length,
      total: momentList.length,
    });
    
    const tw = countByType(thisWeekMoments);
    const lw = countByType(lastWeekMoments);
    
    const change = lw.total > 0 
      ? Math.round(((tw.total - lw.total) / lw.total) * 100)
      : tw.total > 0 ? 100 : 0;
    
    return { thisWeek: tw, lastWeek: lw, percentChange: change };
  }, [moments]);
  
  const maxValue = Math.max(
    thisWeek.prayer, lastWeek.prayer,
    thisWeek.journal, lastWeek.journal,
    thisWeek.devotional, lastWeek.devotional,
    thisWeek.chat, lastWeek.chat,
    1
  );
  
  const isPositive = percentChange >= 0;

  const renderBar = (
    label: string, 
    thisVal: number, 
    lastVal: number, 
    color: string
  ) => {
    const thisHeight = (thisVal / maxValue) * 60;
    const lastHeight = (lastVal / maxValue) * 60;
    
    return (
      <View style={styles.barGroup} key={label}>
        <View style={styles.barsContainer}>
          <View style={styles.barWrapper}>
            <View 
              style={[
                styles.bar, 
                styles.barLast,
                { height: Math.max(lastHeight, 4) }
              ]} 
            />
          </View>
          <View style={styles.barWrapper}>
            <View 
              style={[
                styles.bar, 
                { height: Math.max(thisHeight, 4), backgroundColor: color }
              ]} 
            />
          </View>
        </View>
        <Text style={styles.barLabel}>{label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>This Week vs Last Week</Text>
        <View style={[styles.changeBadge, isPositive ? styles.positive : styles.negative]}>
          <Ionicons 
            name={isPositive ? 'trending-up' : 'trending-down'} 
            size={14} 
            color={isPositive ? theme.colors.success : theme.colors.error} 
          />
          <Text style={[styles.changeText, { color: isPositive ? theme.colors.success : theme.colors.error }]}>
            {isPositive ? '+' : ''}{percentChange}%
          </Text>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        {renderBar('Prayer', thisWeek.prayer, lastWeek.prayer, theme.colors.prayer)}
        {renderBar('Journal', thisWeek.journal, lastWeek.journal, theme.colors.journal || theme.colors.accent)}
        {renderBar('Devotional', thisWeek.devotional, lastWeek.devotional, theme.colors.primary)}
        {renderBar('Chat', thisWeek.chat, lastWeek.chat, theme.colors.info)}
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendLast]} />
          <Text style={styles.legendText}>Last Week</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendThis]} />
          <Text style={styles.legendText}>This Week</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  positive: {
    backgroundColor: theme.colors.successAlpha?.[15] || 'rgba(16,185,129,0.15)',
  },
  negative: {
    backgroundColor: theme.colors.errorAlpha?.[15] || 'rgba(239,68,68,0.15)',
  },
  changeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
    marginBottom: theme.spacing.md,
  },
  barGroup: {
    alignItems: 'center',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: theme.spacing.xs,
  },
  barWrapper: {
    width: 16,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 16,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  barLast: {
    backgroundColor: theme.colors.border,
  },
  barLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLast: {
    backgroundColor: theme.colors.border,
  },
  legendThis: {
    backgroundColor: theme.colors.primary,
  },
  legendText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
});
