
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';

interface SiteStatsRow {
  unique_views: number;
  likes_count: number;
  has_liked: boolean;
}

export function useSiteStats() {
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const ensureSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (!data.session) {
      const { error: signInError } =
        await supabase.auth.signInAnonymously();
      if (signInError) throw signInError;
    }
  };

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        await ensureSession();

        const { data, error } =
          await supabase.rpc('register_site_view');

        if (error) throw error;

        const row = (data as SiteStatsRow[])?.[0];

        if (active && row) {
          setViewCount(Number(row.unique_views));
          setLikeCount(Number(row.likes_count));
          setHasLiked(Boolean(row.has_liked));
        }
      } catch (error) {
        console.error('Error loading site statistics:', error);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadStats();

    const channel = supabase
      .channel('site-stats-live')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'site_stats',
          filter: 'id=eq.1',
        },
        (payload) => {
          if (!active) return;

          const row = payload.new as {
            unique_views: number;
            likes_count: number;
          };

          setViewCount(Number(row.unique_views));
          setLikeCount(Number(row.likes_count));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleLike = useCallback(async () => {
    try {
      await ensureSession();

      const { data, error } =
        await supabase.rpc('toggle_site_like');

      if (error) throw error;

      const row = (data as SiteStatsRow[])?.[0];

      if (row) {
        setViewCount(Number(row.unique_views));
        setLikeCount(Number(row.likes_count));
        setHasLiked(Boolean(row.has_liked));
      }
    } catch (error) {
      console.error('Error updating site like:', error);
    }
  }, []);

  return {
  uniqueViews: viewCount,
  likesCount: likeCount,
  hasLiked,
  isUpdatingLike: isLoading,
  toggleSiteLike: toggleLike,
};
}
