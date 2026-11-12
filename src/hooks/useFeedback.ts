
import { useState, useEffect, useCallback } from 'react';
import { UserFeedback } from '../types';
import { INITIAL_COMMUNITY_FEEDBACKS } from '../data/mockData';
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

  // Get or create an anonymous visitor account
  const ensureAnonymousSession = async () => {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) throw sessionError;

    if (sessionData.session?.user) {
      return sessionData.session.user;
    }

    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) throw error;
    if (!data.user) throw new Error('Could not create anonymous session.');

    return data.user;
  };

  // Fetch feedback and load this visitor's likes
  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const user = await ensureAnonymousSession();

        const { data: likes, error: likesError } = await supabase
          .from('community_feedback_likes')
          .select('feedback_id')
          .eq('user_id', user.id);

        if (likesError) throw likesError;

        if (active && likes) {
          const likedMap: Record<string, boolean> = {};
          likes.forEach(like => {
            likedMap[like.feedback_id] = true;
          });
          setLikedFeedbacks(likedMap);
        }
      } catch (error) {
        console.error('Anonymous sign-in or likes loading error:', error);
      }

      const { data, error } = await supabase
        .from('community_feedbacks')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && active) {
        const formatted: UserFeedback[] = data.map(item => ({
          id: item.id,
          userName: item.user_name,
          resourceName: item.resource_name,
          category: item.category,
          rating: item.rating,
          message: item.message,
          isAnonymous: item.is_anonymous,
          submittedAt: item.submitted_at,
          status: item.status,
          likesCount: item.likes_count ?? 0
        }));

        setFeedbacks([...formatted, ...INITIAL_COMMUNITY_FEEDBACKS]);
      }
    }

    initialize();

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
            category: newItem.category,
            rating: newItem.rating,
            message: newItem.message,
            isAnonymous: newItem.is_anonymous,
            submittedAt: newItem.submitted_at,
            status: newItem.status,
            likesCount: newItem.likes_count ?? 0
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
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_feedbacks' },
        (payload) => {
          const updatedItem = payload.new;

          setFeedbacks(prev =>
            prev.map(f =>
              f.id === updatedItem.id
                ? { ...f, likesCount: updatedItem.likes_count ?? 0 }
                : f
            )
          );
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const addFeedback = async (
    item: Omit<UserFeedback, 'id' | 'submittedAt' | 'status' | 'likesCount'>
  ): Promise<UserFeedback> => {
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

    const { error } = await supabase
      .from('community_feedbacks')
      .insert([{
        id: newFeedback.id,
        user_name: newFeedback.userName,
        resource_name: newFeedback.resourceName || null,
        category: newFeedback.category,
        rating: newFeedback.rating,
        message: newFeedback.message,
        is_anonymous: newFeedback.isAnonymous,
        submitted_at: newFeedback.submittedAt,
        status: newFeedback.status,
        likes_count: newFeedback.likesCount
      }]);

    if (error) {
      console.error('Supabase feedback error:', error);
      throw error;
    }

    setFeedbacks(prev => {
      if (prev.some(f => f.id === newFeedback.id)) return prev;
      return [newFeedback, ...prev];
    });

    setRecentNotification({
      id: newFeedback.id,
      userName: newFeedback.userName,
      resourceName: newFeedback.resourceName,
      message: newFeedback.message,
      submittedAt: newFeedback.submittedAt
    });

    return newFeedback;
  };

  // Secure like/unlike using the Supabase database function
  const toggleLike = async (id: string) => {
    try {
      await ensureAnonymousSession();

      const { data, error } = await supabase.rpc(
        'toggle_feedback_like',
        { p_feedback_id: id }
      );

      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;

      if (!result) {
        throw new Error('The like operation returned no result.');
      }

      setLikedFeedbacks(prev => ({
        ...prev,
        [id]: result.liked
      }));

      setFeedbacks(prev =>
        prev.map(f =>
          f.id === id
            ? { ...f, likesCount: result.likes_count }
            : f
        )
      );
    } catch (error) {
      console.error('Secure like error:', error);
    }
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
