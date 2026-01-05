import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../lib/theme';
import {
  DevotionalStackParamList,
  DevotionalSeries,
  getSeriesGradient,
} from '../../types';
import { useDevotionalStore, useAllSeries, useEnrollments } from '../../store/devotionalStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - theme.spacing.lg * 2 - theme.spacing.md) / 2;

type NavigationProp = NativeStackNavigationProp<DevotionalStackParamList, 'SeriesLibrary'>;

type FilterType = 'all' | 'enrolled' | 'seasonal' | 'beginner' | 'intermediate' | 'advanced';

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'enrolled', label: 'Enrolled' },
  { id: 'seasonal', label: 'Seasonal' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

export default function SeriesLibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { fetchAllSeries, seriesLoading } = useDevotionalStore();
  const allSeries = useAllSeries();
  const enrollments = useEnrollments();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (allSeries.length === 0) {
      fetchAllSeries();
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllSeries();
    setRefreshing(false);
  };

  const enrolledSeriesIds = new Set(enrollments.map((e) => e.seriesId));

  const filteredSeries = allSeries.filter((series) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !series.title.toLowerCase().includes(query) &&
        !series.description.toLowerCase().includes(query) &&
        !series.topics.some((t) => t.toLowerCase().includes(query))
      ) {
        return false;
      }
    }

    // Category filter
    switch (activeFilter) {
      case 'enrolled':
        return enrolledSeriesIds.has(series.id);
      case 'seasonal':
        return series.isSeasonal;
      case 'beginner':
      case 'intermediate':
      case 'advanced':
        return series.difficultyLevel === activeFilter;
      default:
        return true;
    }
  });

  const handleSeriesPress = (series: DevotionalSeries) => {
    navigation.navigate('SeriesDetail', { seriesId: series.id, series });
  };

  const renderSeriesCard = ({ item }: { item: DevotionalSeries }) => {
    const isEnrolled = enrolledSeriesIds.has(item.id);
    const gradient = getSeriesGradient(item.slug);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSeriesPress(item)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradient as [string, string]}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isEnrolled && (
            <View style={styles.enrolledBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#fff" />
              <Text style={styles.enrolledBadgeText}>Enrolled</Text>
            </View>
          )}

          {item.isSeasonal && (
            <View style={styles.seasonalBadge}>
              <Ionicons name="calendar" size={12} color="#fff" />
            </View>
          )}

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.cardMeta}>
              <Text style={styles.cardDays}>{item.totalDays} days</Text>
              <View style={styles.cardDot} />
              <Text style={styles.cardLevel}>{item.difficultyLevel}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Devotional Library</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={theme.colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search devotionals..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <FlatList
            data={FILTERS}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  activeFilter === item.id && styles.filterChipActive,
                ]}
                onPress={() => setActiveFilter(item.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === item.id && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Series Grid */}
        <FlatList
          data={filteredSeries}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          renderItem={renderSeriesCard}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyStateText}>No devotionals found</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  filtersContainer: {
    marginBottom: theme.spacing.md,
  },
  filtersList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.card,
    marginRight: theme.spacing.sm,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  gridContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: theme.spacing.md,
    minHeight: 160,
  },
  enrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    gap: 4,
    marginBottom: theme.spacing.sm,
  },
  enrolledBadgeText: {
    fontSize: 10,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  seasonalBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
    marginBottom: theme.spacing.xs,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDays: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  cardDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: theme.spacing.xs,
  },
  cardLevel: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
});
