/**
 * useGrowthInsights Hook
 *
 * Generates AI-powered insights about spiritual growth patterns
 * using the companion Edge Function.
 */

import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { SpiritualMoment } from '../types';

export interface GrowthInsight {
  summary: string;
  scriptureConnection?: string;
  growthPrediction?: string;
  encouragement?: string;
}

interface UseGrowthInsightsReturn {
  generateInsight: (moments: SpiritualMoment[]) => Promise<GrowthInsight | null>;
  isGenerating: boolean;
  error: string | null;
  clearError: () => void;
}

export function useGrowthInsights(): UseGrowthInsightsReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  const generateInsight = useCallback(
    async (moments: SpiritualMoment[]): Promise<GrowthInsight | null> => {
      if (!user?.id) {
        setError('User not authenticated');
        return null;
      }

      if (moments.length === 0) {
        setError('No spiritual moments to analyze');
        return null;
      }

      setIsGenerating(true);
      setError(null);

      try {
        // Prepare summary data for the AI
        const recentMoments = moments.slice(0, 20); // Last 20 moments
        const stats = {
          totalMoments: moments.length,
          devotionals: moments.filter((m) => m.momentType === 'devotional').length,
          prayers: moments.filter((m) => m.momentType === 'prayer').length,
          journals: moments.filter((m) => m.momentType === 'journal').length,
          memoryPractices: moments.filter((m) => m.momentType === 'memory_practice').length,
        };

        // Extract themes
        const themeFrequency: Record<string, number> = {};
        moments.forEach((m) => {
          m.themes?.forEach((theme) => {
            themeFrequency[theme] = (themeFrequency[theme] || 0) + 1;
          });
        });
        const topThemes = Object.entries(themeFrequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([theme]) => theme);

        // Craft a growth analysis prompt
        const prompt = `As a spiritual companion, analyze this person's journey and provide encouraging insights:

**Journey Statistics:**
- Total spiritual moments: ${stats.totalMoments}
- Devotionals completed: ${stats.devotionals}
- Prayers recorded: ${stats.prayers}
- Journal entries: ${stats.journals}
- Verses memorized/practiced: ${stats.memoryPractices}

**Top Themes in Their Journey:**
${topThemes.length > 0 ? topThemes.join(', ') : 'Not enough data yet'}

**Recent Spiritual Moments:**
${recentMoments.map((m, i) => `${i + 1}. [${m.momentType}] ${m.content.substring(0, 100)}...`).join('\n')}

Please provide:
1. A brief summary (2-3 sentences) of their spiritual growth pattern
2. A scripture verse that relates to their journey
3. An encouraging prediction about their growth trajectory
4. A brief word of encouragement (1-2 sentences)

Format your response as JSON:
{
  "summary": "...",
  "scriptureConnection": "...",
  "growthPrediction": "...",
  "encouragement": "..."
}`;

        // Call the companion function
        const { data, error: funcError } = await supabase.functions.invoke('companion', {
          body: {
            userId: user.id,
            message: prompt,
            conversationHistory: [],
            contextMode: 'devotional',
          },
        });

        if (funcError) {
          throw new Error(funcError.message || 'Failed to generate insight');
        }

        if (!data || !data.response) {
          throw new Error('No response from AI');
        }

        // Try to parse JSON from the response
        try {
          // Extract JSON from markdown code blocks if present
          let jsonText = data.response;
          const jsonMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
          if (jsonMatch) {
            jsonText = jsonMatch[1];
          }

          const parsed = JSON.parse(jsonText);
          return {
            summary: parsed.summary || data.response.substring(0, 200),
            scriptureConnection: parsed.scriptureConnection,
            growthPrediction: parsed.growthPrediction,
            encouragement: parsed.encouragement,
          };
        } catch (parseError) {
          // If JSON parsing fails, use the raw response
          return {
            summary: data.response.substring(0, 300),
            scriptureConnection: undefined,
            growthPrediction: undefined,
            encouragement: undefined,
          };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate insight';
        setError(errorMessage);
        console.error('[useGrowthInsights] Error:', err);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [user?.id]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generateInsight,
    isGenerating,
    error,
    clearError,
  };
}
