import { useState, useEffect } from 'react';
import { UserFeedback } from '../types';
import { INITIAL_COMMUNITY_FEEDBACKS } from '../data/mockData';

const STORAGE_KEY = 'civicbridge_feedbacks';
const LIKES_STORAGE_KEY = 'civicbridge_liked_feedbacks';

export function useFeedback() {
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback to static list on storage access errors
    }
    return INITIAL_COMMUNITY_FEEDBACKS;
  });

  const [likedFeedbacks, setLikedFeedbacks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(LIKES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return {};
  });

  const [filterType, setFilterType] = useState<'all' | 'public' | 'anonymous'>('all');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbacks));
    } catch {
      // Storage quota or restriction
    }
  }, [feedbacks]);

  useEffect(() => {
    try {
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likedFeedbacks));
    } catch {
      // Storage quota or restriction
    }
  }, [likedFeedbacks]);

  const addFeedback = (item: Omit<UserFeedback, 'id' | 'submittedAt' | 'status' | 'likesCount'>) => {
    const newFeedback: UserFeedback = {
      ...item,
      id: `fb-${Date.now()}`,
      submittedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      status: 'Received & Logged',
      likesCount: 0
    };

    setFeedbacks(prev => [newFeedback, ...prev]);
    return newFeedback;
  };

  const toggleLike = (id: string) => {
    const isLiked = !!likedFeedbacks[id];

    setLikedFeedbacks(prev => ({
      ...prev,
      [id]: !isLiked
    }));

    setFeedbacks(prev =>
      prev.map(f => {
        if (f.id === id) {
          const currentCount = f.likesCount || 0;
          return {
            ...f,
            likesCount: isLiked ? Math.max(0, currentCount - 1) : currentCount + 1
          };
        }
        return f;
      })
    );
  };

  const filteredFeedbacks = feedbacks.filter(fb => {
    if (filterType === 'public') return !fb.isAnonymous;
    if (filterType === 'anonymous') return !!fb.isAnonymous;
    return true;
  });

  return {
    feedbacks: filteredFeedbacks,
    allFeedbacksCount: feedbacks.length,
    filterType,
    setFilterType,
    addFeedback,
    toggleLike,
    likedFeedbacks
  };
}
