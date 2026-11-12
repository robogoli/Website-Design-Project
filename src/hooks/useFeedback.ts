// src/hooks/useFeedback.ts
import { useState, useEffect, useCallback } from 'react';
import { UserFeedback } from '../types';
import { INITIAL_COMMUNITY_FEEDBACKS, COMMUNITY_EVENTS } from '../data/mockData';
import { supabase } from '../utils/supabase';

export interface NewNoteNotification {
  id: string;
  userName: string;
  resourceName?: string;
  message: string;
  submittedAt: string;
}

export function useFeedback() {
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>(INITIAL_COMMUNITY_FEEDBACKS);
  const [likedFeedbacks, setLikedFeedbacks] = useState<Record<string, boolean>>({});
  const [filterType, setFilterType] = useState<'all' | 'public' | 'anonymous'>('all');
  const [recentNotification, setRecentNotification] = useState<NewNoteNotification | null>(null);

  // Fetch initial notes from Supabase and subscribe to real-time inserts
  useEffect(() => {
    async function fetchFeedbacks() {
      const { data, error } = await supabase
        .from('community_feedbacks')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const formatted = data.map(item => ({
          id: item.id,
          userName: item.user_name,
          resourceName: item.resource_name,
          message: item.message,
          isAnonymous: item.is_anonymous,
          submittedAt: item.submitted_at,
          status: item.status,
          likesCount: item.likes_count
        }));
        setFeedbacks([...formatted, ...INITIAL_COMMUNITY_FEEDBACKS]);
      }
    }

    fetchFeedbacks();

    // Set up Supabase Realtime channel for instant multi-user updates
    const channel = supabase
      .channel('public:community_feedbacks')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_feedbacks' },
        (payload) => {
          const newItem = payload.new;
          const incomingNote: UserFeedback = {
            id: newItem.id,
            userName: newItem.user_name,
            resourceName: newItem.resource_name,
            message: newItem.message,
            isAnonymous: newItem.is_anonymous,
            submittedAt: newItem.submitted_at,
            status: newItem.status,
            likesCount: newItem.likes_count
          };

          setFeedbacks(prev => {
            if (prev.some(f => f.id === incomingNote.id)) return prev;
            return [incomingNote, ...prev];
          });

          setRecentNotification({
            id: incomingNote.id,
            userName: incomingNote.userName,
            resourceName: incomingNote.resourceName,
            message: incomingNote.message,
            submittedAt: incomingNote.submittedAt
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addFeedback = async (item: Omit<UserFeedback, 'id' | 'submittedAt' | 'status' | 'likesCount'>) => {
    const newId = `fb-${Date.now()}`;
    const submittedAt = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const newFeedback: UserFeedback = {
      ...item,
      id: newId,
      submittedAt,
      status: 'Received & Logged',
      likesCount: 0
    };

    setFeedbacks(prev => [newFeedback, ...prev]);

    await supabase.from('community_feedbacks').insert([
      {
        id: newFeedback.id,
        user_name: newFeedback.userName,
        resource_name: newFeedback.resourceName || null,
        message: newFeedback.message,
        is_anonymous: newFeedback.isAnonymous,
        submitted_at: newFeedback.submittedAt,
        status: newFeedback.status,
        likes_count: newFeedback.likesCount
      }
    ]);

    setRecentNotification({
      id: newFeedback.id,
      userName: newFeedback.userName,
      resourceName: newFeedback.resourceName,
      message: newFeedback.message,
      submittedAt: newFeedback.submittedAt
    });

    return newFeedback;
  };

  const toggleLike = async (id: string) => {
    const isLiked = !!likedFeedbacks[id];
    const target = feedbacks.find(f => f.id === id);
    if (!target) return;

    const newLikesCount = isLiked ? Math.max(0, target.likesCount - 1) : target.likesCount + 1;

    setLikedFeedbacks(prev => ({ ...prev, [id]: !isLiked }));
    setFeedbacks(prev =>
      prev.map(f => (f.id === id ? { ...f, likesCount: newLikesCount } : f))
    );

    await supabase
      .from('community_feedbacks')
      .update({ likes_count: newLikesCount })
      .eq('id', id);
  };

  const dismissNotification = useCallback(() => {
    setRecentNotification(null);
  }, []);

  const filteredFeedbacks = feedbacks.filter(fb => {
    if (filterType === 'public') return !fb.isAnonymous;
    if (filterType === 'anonymous') return !!fb.isAnonymous;
    return true;
  });

  return {
    feedbacks: filteredFeedbacks,
    allFeedbacksCount: feedbacks.length,
    unreadFeedbackCount: 0,
    unreadEventsCount: 0,
    markFeedbackAsSeen: () => {},
    markEventsAsSeen: () => {},
    recentNotification,
    dismissNotification,
    filterType,
    setFilterType,
    addFeedback,
    toggleLike,
    likedFeedbacks
  };
}
