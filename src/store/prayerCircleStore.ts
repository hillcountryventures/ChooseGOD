/**
 * Prayer Circle Store
 * Manages prayer circles, membership, and shared prayer requests
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * Prayer circles bring believers together to bear one another's burdens
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { TABLES } from '../constants/database';
import { PrayerCircle, CircleMember, PrayerRequest, PrayerStatus } from '../types/domain/prayer';
import { logger } from '../utils/logger';

// Circles are intended to be intimate small groups, not feed-scale communities.
// See Decision #L6 in the market-capture plan.
export const CIRCLE_MAX_MEMBERS = 50;

// =====================================================
// TYPES
// =====================================================

export interface CircleWithMembers extends PrayerCircle {
  members: CircleMember[];
  activeRequestCount: number;
  isCreator: boolean;
}

export interface CirclePrayerRequest extends PrayerRequest {
  authorName?: string;
  prayingCount: number;
  userIsPraying: boolean;
}

// =====================================================
// STORE INTERFACE
// =====================================================

interface PrayerCircleState {
  // Data
  circles: CircleWithMembers[];
  currentCircle: CircleWithMembers | null;
  circleRequests: CirclePrayerRequest[];
  
  // Loading states
  loading: boolean;
  requestsLoading: boolean;
  error: string | null;

  // Actions - Circles
  fetchMyCircles: (userId: string) => Promise<void>;
  fetchCircleById: (circleId: string, userId: string) => Promise<void>;
  createCircle: (userId: string, name: string) => Promise<PrayerCircle | null>;
  deleteCircle: (circleId: string) => Promise<boolean>;
  
  // Actions - Membership
  joinCircle: (userId: string, inviteCode: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  leaveCircle: (circleId: string, userId: string) => Promise<boolean>;
  fetchCircleMembers: (circleId: string) => Promise<CircleMember[]>;
  
  // Actions - Prayers
  fetchCirclePrayers: (circleId: string, userId: string) => Promise<void>;
  sharePrayerToCircle: (prayerId: string, circleId: string) => Promise<boolean>;
  markPraying: (requestId: string, userId: string) => Promise<boolean>;

  // Actions - Moderation
  reportContent: (args: {
    targetType: 'prayer_request' | 'circle_member' | 'prayer_circle';
    targetId: string;
    reason: string;
    notes?: string;
  }) => Promise<boolean>;
  blockUser: (blockedUserId: string) => Promise<boolean>;
  unblockUser: (blockedUserId: string) => Promise<boolean>;
  fetchBlockedUsers: () => Promise<string[]>;

  // Utility
  setCurrentCircle: (circle: CircleWithMembers | null) => void;
  clearError: () => void;
  clearStore: () => void;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoiding confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface CircleRow {
  id: string;
  name: string;
  created_by: string;
  invite_code: string;
  member_count?: number;
  created_at: string;
  active_request_count?: number;
}

function mapCircleRow(row: CircleRow, userId: string): CircleWithMembers {
  return {
    id: row.id,
    name: row.name,
    createdBy: row.created_by,
    inviteCode: row.invite_code,
    memberCount: row.member_count || 0,
    createdAt: new Date(row.created_at),
    members: [],
    activeRequestCount: row.active_request_count || 0,
    isCreator: row.created_by === userId,
  };
}

interface MemberRow {
  circle_id: string;
  user_id: string;
  display_name: string;
  joined_at: string;
}

function mapMemberRow(row: MemberRow): CircleMember {
  return {
    circleId: row.circle_id,
    userId: row.user_id,
    displayName: row.display_name,
    joinedAt: new Date(row.joined_at),
  };
}

interface PrayerRequestRow {
  id: string;
  user_id: string;
  circle_id: string;
  request: string;
  scripture_anchor?: { book: string; chapter: number; verse: number; text: string };
  status?: string;
  answered_at?: string;
  answered_reflection?: string;
  created_at: string;
  author_name?: string;
  praying_count?: number;
  user_is_praying?: boolean;
}

function mapPrayerRequestRow(row: PrayerRequestRow): CirclePrayerRequest {
  return {
    id: row.id,
    userId: row.user_id,
    circleId: row.circle_id,
    request: row.request,
    scriptureAnchor: row.scripture_anchor ? {
      book: row.scripture_anchor.book,
      chapter: row.scripture_anchor.chapter,
      verse: row.scripture_anchor.verse,
      text: row.scripture_anchor.text,
    } : undefined,
    status: (row.status || 'active') as PrayerStatus,
    answeredAt: row.answered_at ? new Date(row.answered_at) : undefined,
    answeredReflection: row.answered_reflection,
    createdAt: new Date(row.created_at),
    authorName: row.author_name || 'Anonymous',
    prayingCount: row.praying_count || 0,
    userIsPraying: row.user_is_praying || false,
  };
}

// =====================================================
// STORE IMPLEMENTATION
// =====================================================

export const usePrayerCircleStore = create<PrayerCircleState>()(
  persist(
    (set, get) => ({
      // Initial state
      circles: [],
      currentCircle: null,
      circleRequests: [],
      loading: false,
      requestsLoading: false,
      error: null,

      // =====================================================
      // CIRCLE ACTIONS
      // =====================================================

      fetchMyCircles: async (userId: string) => {
        set({ loading: true, error: null });

        try {
          // Get circles where user is a member
          const { data: memberData, error: memberError } = await supabase
            .from(TABLES.circleMembers)
            .select('circle_id')
            .eq('user_id', userId);

          if (memberError) throw memberError;

          if (!memberData || memberData.length === 0) {
            set({ circles: [], loading: false });
            return;
          }

          const circleIds = memberData.map((m) => m.circle_id);

          // Fetch circle details with member count
          const { data: circlesData, error: circlesError } = await supabase
            .from(TABLES.prayerCircles)
            .select(`
              *,
              circle_members!inner(count),
              prayer_requests(count)
            `)
            .in('id', circleIds)
            .order('created_at', { ascending: false });

          if (circlesError) throw circlesError;

          // Map and get member counts
          const circles: CircleWithMembers[] = await Promise.all(
            (circlesData || []).map(async (row) => {
              // Get actual member count
              const { count: memberCount } = await supabase
                .from(TABLES.circleMembers)
                .select('*', { count: 'exact', head: true })
                .eq('circle_id', row.id);

              // Get active prayer count
              const { count: requestCount } = await supabase
                .from(TABLES.prayerRequests)
                .select('*', { count: 'exact', head: true })
                .eq('circle_id', row.id)
                .eq('status', 'active');

              return {
                ...mapCircleRow(row, userId),
                memberCount: memberCount || 0,
                activeRequestCount: requestCount || 0,
              };
            })
          );

          set({ circles, loading: false });
        } catch (error) {
          logger.error('Error fetching circles:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch circles',
            loading: false,
          });
        }
      },

      fetchCircleById: async (circleId: string, userId: string) => {
        set({ loading: true, error: null });

        try {
          const { data, error } = await supabase
            .from(TABLES.prayerCircles)
            .select('*')
            .eq('id', circleId)
            .single();

          if (error) throw error;

          // Get members
          const { data: membersData } = await supabase
            .from(TABLES.circleMembers)
            .select('*')
            .eq('circle_id', circleId);

          // Get active request count
          const { count: requestCount } = await supabase
            .from(TABLES.prayerRequests)
            .select('*', { count: 'exact', head: true })
            .eq('circle_id', circleId)
            .eq('status', 'active');

          const circle: CircleWithMembers = {
            ...mapCircleRow(data, userId),
            members: (membersData || []).map(mapMemberRow),
            memberCount: membersData?.length || 0,
            activeRequestCount: requestCount || 0,
          };

          set({ currentCircle: circle, loading: false });
        } catch (error) {
          logger.error('Error fetching circle:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch circle',
            loading: false,
          });
        }
      },

      createCircle: async (userId: string, name: string) => {
        set({ loading: true, error: null });

        try {
          const inviteCode = generateInviteCode();

          const { data, error } = await supabase
            .from(TABLES.prayerCircles)
            .insert({
              name: name.trim(),
              created_by: userId,
              invite_code: inviteCode,
            })
            .select()
            .single();

          if (error) throw error;

          // Auto-join creator as member
          await supabase.from(TABLES.circleMembers).insert({
            circle_id: data.id,
            user_id: userId,
            display_name: 'Creator',
          });

          const newCircle = mapCircleRow(data, userId);

          set((state) => ({
            circles: [
              {
                ...newCircle,
                members: [],
                memberCount: 1,
                activeRequestCount: 0,
                isCreator: true,
              },
              ...state.circles,
            ],
            loading: false,
          }));

          return newCircle;
        } catch (error) {
          logger.error('Error creating circle:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to create circle',
            loading: false,
          });
          return null;
        }
      },

      deleteCircle: async (circleId: string) => {
        set({ loading: true, error: null });

        try {
          // Only the creator can delete a circle.
          // Resolve current auth user id by asking Supabase directly.
          const { data: authData } = await supabase.auth.getUser();
          const currentUserId = authData?.user?.id;

          const { data: circle, error: fetchErr } = await supabase
            .from(TABLES.prayerCircles)
            .select('created_by')
            .eq('id', circleId)
            .single();

          if (fetchErr || !circle) {
            throw new Error('Circle not found');
          }

          if (!currentUserId || circle.created_by !== currentUserId) {
            set({ loading: false, error: 'Only the creator can delete this circle' });
            return false;
          }

          // Delete all members first (RLS will handle this)
          await supabase.from(TABLES.circleMembers).delete().eq('circle_id', circleId);

          // Delete the circle
          const { error } = await supabase
            .from(TABLES.prayerCircles)
            .delete()
            .eq('id', circleId);

          if (error) throw error;

          set((state) => ({
            circles: state.circles.filter((c) => c.id !== circleId),
            currentCircle: state.currentCircle?.id === circleId ? null : state.currentCircle,
            loading: false,
          }));

          return true;
        } catch (error) {
          logger.error('Error deleting circle:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to delete circle',
            loading: false,
          });
          return false;
        }
      },

      // =====================================================
      // MEMBERSHIP ACTIONS
      // =====================================================

      joinCircle: async (userId: string, inviteCode: string, displayName?: string) => {
        set({ loading: true, error: null });

        try {
          // Find circle by invite code
          const { data: circle, error: findError } = await supabase
            .from(TABLES.prayerCircles)
            .select('*')
            .eq('invite_code', inviteCode.toUpperCase().trim())
            .single();

          if (findError || !circle) {
            set({ loading: false });
            return { success: false, error: 'Invalid invite code' };
          }

          // Enforce member cap to keep circles intimate (see Decision #L6).
          // Growth beyond 50 members degrades the "small group" UX.
          const { count: currentMembers } = await supabase
            .from(TABLES.circleMembers)
            .select('*', { count: 'exact', head: true })
            .eq('circle_id', circle.id);

          if ((currentMembers ?? 0) >= CIRCLE_MAX_MEMBERS) {
            set({ loading: false });
            return {
              success: false,
              error: `This circle is full (${CIRCLE_MAX_MEMBERS} members).`,
            };
          }

          // Check if already a member
          const { data: existing } = await supabase
            .from(TABLES.circleMembers)
            .select('id')
            .eq('circle_id', circle.id)
            .eq('user_id', userId)
            .single();

          if (existing) {
            set({ loading: false });
            return { success: false, error: 'Already a member of this circle' };
          }

          // Join the circle
          const { error: joinError } = await supabase.from(TABLES.circleMembers).insert({
            circle_id: circle.id,
            user_id: userId,
            display_name: displayName || null,
          });

          if (joinError) throw joinError;

          // Refresh circles
          await get().fetchMyCircles(userId);

          set({ loading: false });
          return { success: true };
        } catch (error) {
          logger.error('Error joining circle:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to join circle',
            loading: false,
          });
          return { success: false, error: 'Failed to join circle' };
        }
      },

      leaveCircle: async (circleId: string, userId: string) => {
        set({ loading: true, error: null });

        try {
          const { error } = await supabase
            .from(TABLES.circleMembers)
            .delete()
            .eq('circle_id', circleId)
            .eq('user_id', userId);

          if (error) throw error;

          set((state) => ({
            circles: state.circles.filter((c) => c.id !== circleId),
            currentCircle: state.currentCircle?.id === circleId ? null : state.currentCircle,
            loading: false,
          }));

          return true;
        } catch (error) {
          logger.error('Error leaving circle:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to leave circle',
            loading: false,
          });
          return false;
        }
      },

      fetchCircleMembers: async (circleId: string) => {
        try {
          const { data, error } = await supabase
            .from(TABLES.circleMembers)
            .select('*')
            .eq('circle_id', circleId)
            .order('joined_at', { ascending: true });

          if (error) throw error;

          return (data || []).map(mapMemberRow);
        } catch (error) {
          logger.error('Error fetching members:', error);
          return [];
        }
      },

      // =====================================================
      // PRAYER ACTIONS
      // =====================================================

      fetchCirclePrayers: async (circleId: string, _userId: string) => {
        set({ requestsLoading: true });

        try {
          // Fetch prayers for this circle
          const { data, error } = await supabase
            .from(TABLES.prayerRequests)
            .select('*')
            .eq('circle_id', circleId)
            .order('created_at', { ascending: false });

          if (error) throw error;

          // Get member info for author names
          const { data: members } = await supabase
            .from(TABLES.circleMembers)
            .select('user_id, display_name')
            .eq('circle_id', circleId);

          const memberMap = new Map(
            (members || []).map((m) => [m.user_id, m.display_name || 'Circle Member'])
          );

          const requests: CirclePrayerRequest[] = (data || []).map((row) => ({
            ...mapPrayerRequestRow(row),
            authorName: memberMap.get(row.user_id) || 'Circle Member',
          }));

          set({ circleRequests: requests, requestsLoading: false });
        } catch (error) {
          logger.error('Error fetching circle prayers:', error);
          set({ requestsLoading: false });
        }
      },

      sharePrayerToCircle: async (prayerId: string, circleId: string) => {
        try {
          const { error } = await supabase
            .from(TABLES.prayerRequests)
            .update({ circle_id: circleId })
            .eq('id', prayerId);

          if (error) throw error;

          return true;
        } catch (error) {
          logger.error('Error sharing prayer:', error);
          return false;
        }
      },

      markPraying: async (requestId: string, userId: string) => {
        try {
          // Check if already praying for this request
          const { data: existing } = await supabase
            .from('prayer_responses')
            .select('id')
            .eq('prayer_request_id', requestId)
            .eq('user_id', userId)
            .maybeSingle();

          if (existing) {
            // Already praying - toggle off
            await supabase
              .from('prayer_responses')
              .delete()
              .eq('id', existing.id);

            set((state) => ({
              circleRequests: state.circleRequests.map((r) =>
                r.id === requestId
                  ? { ...r, userIsPraying: false, prayingCount: Math.max(0, r.prayingCount - 1) }
                  : r
              ),
            }));
          } else {
            // Add prayer response - the backend (via Supabase trigger/function)
            // should send a push notification to the prayer request owner
            const { error } = await supabase
              .from('prayer_responses')
              .insert({
                prayer_request_id: requestId,
                user_id: userId,
              });

            if (error) {
              // Table might not exist yet - fallback to local state only
              if (error.code === '42P01') {
                logger.warn('[PrayerCircles] prayer_responses table not created yet');
              } else {
                logger.error('[PrayerCircles] Error saving prayer response:', error);
              }
            }

            // Update local state
            set((state) => ({
              circleRequests: state.circleRequests.map((r) =>
                r.id === requestId
                  ? { ...r, userIsPraying: true, prayingCount: r.prayingCount + 1 }
                  : r
              ),
            }));
          }

          return true;
        } catch (error) {
          logger.error('[PrayerCircles] Error marking prayer:', error);
          // Still update local state even if database fails
          set((state) => ({
            circleRequests: state.circleRequests.map((r) =>
              r.id === requestId
                ? { ...r, userIsPraying: true, prayingCount: r.prayingCount + 1 }
                : r
            ),
          }));
          return true;
        }
      },

      // =====================================================
      // MODERATION ACTIONS
      // =====================================================

      reportContent: async ({ targetType, targetId, reason, notes }) => {
        try {
          const { data: authData } = await supabase.auth.getUser();
          const reporterId = authData?.user?.id;
          if (!reporterId) return false;

          const { error } = await supabase.from('reports').insert({
            reporter_user_id: reporterId,
            target_type: targetType,
            target_id: targetId,
            reason: reason.slice(0, 500),
            notes: notes ?? null,
          });
          if (error) throw error;
          return true;
        } catch (error) {
          logger.error('Error submitting report:', error);
          return false;
        }
      },

      blockUser: async (blockedUserId) => {
        try {
          const { data: authData } = await supabase.auth.getUser();
          const blockerId = authData?.user?.id;
          if (!blockerId || blockerId === blockedUserId) return false;

          const { error } = await supabase.from('user_blocks').upsert(
            { blocker_user_id: blockerId, blocked_user_id: blockedUserId },
            { onConflict: 'blocker_user_id,blocked_user_id' },
          );
          if (error) throw error;
          return true;
        } catch (error) {
          logger.error('Error blocking user:', error);
          return false;
        }
      },

      unblockUser: async (blockedUserId) => {
        try {
          const { data: authData } = await supabase.auth.getUser();
          const blockerId = authData?.user?.id;
          if (!blockerId) return false;

          const { error } = await supabase
            .from('user_blocks')
            .delete()
            .eq('blocker_user_id', blockerId)
            .eq('blocked_user_id', blockedUserId);
          if (error) throw error;
          return true;
        } catch (error) {
          logger.error('Error unblocking user:', error);
          return false;
        }
      },

      fetchBlockedUsers: async () => {
        try {
          const { data: authData } = await supabase.auth.getUser();
          const blockerId = authData?.user?.id;
          if (!blockerId) return [];
          const { data, error } = await supabase
            .from('user_blocks')
            .select('blocked_user_id')
            .eq('blocker_user_id', blockerId);
          if (error) throw error;
          return (data ?? []).map((r: { blocked_user_id: string }) => r.blocked_user_id);
        } catch (error) {
          logger.error('Error fetching blocked users:', error);
          return [];
        }
      },

      // =====================================================
      // UTILITY ACTIONS
      // =====================================================

      setCurrentCircle: (circle) => set({ currentCircle: circle }),
      clearError: () => set({ error: null }),
      clearStore: () =>
        set({
          circles: [],
          currentCircle: null,
          circleRequests: [],
          loading: false,
          requestsLoading: false,
          error: null,
        }),
    }),
    {
      name: 'prayer-circles-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist the circle list briefly
        circles: state.circles,
      }),
    }
  )
);

// =====================================================
// SELECTORS
// =====================================================

export const useCircles = () => usePrayerCircleStore((state) => state.circles);
export const useCurrentCircle = () => usePrayerCircleStore((state) => state.currentCircle);
export const useCircleRequests = () => usePrayerCircleStore((state) => state.circleRequests);
export const useCircleLoading = () => usePrayerCircleStore((state) => state.loading);
