import { useState, useEffect, useCallback, useRef } from 'react';
import { UserFeedback } from '../types';
import { INITIAL_COMMUNITY_FEEDBACKS, COMMUNITY_EVENTS } from '../data/mockData';

const STORAGE_KEY = 'civicbridge_feedbacks';
const LIKES_STORAGE_KEY = 'civicbridge_liked_feedbacks';
const SEEN_FEEDBACK_COUNT_KEY = 'civicbridge_seen_feedback_count';
const SEEN_EVENTS_COUNT_KEY = 'civicbridge_seen_events_count';
const NOTIFICATION_CHANNEL_NAME = 'civicbridge_notes_channel';

export interface NewNoteNotification {
  id: string;
  userName: string;
  resourceName?: string;
  message: string;
  submittedAt: string;
}

export function useFeedback() {
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Keep user-created feedbacks
          const userSubmitted = parsed.filter(
            f => !f.isSample && f.userName !== 'Sample Demonstration Note' && !f.message.startsWith('Example Note:')
          );
          if (userSubmitted.length > 0) {
            const userIds = new Set(userSubmitted.map(u => u.id));
            const baseList = INITIAL_COMMUNITY_FEEDBACKS.filter(b => !userIds.has(b.id));
            return [...userSubmitted, ...baseList];
          }
        }
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

  // Track counts the user has seen so yellow badges disappear once visited
  const [seenFeedbackCount, setSeenFeedbackCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(SEEN_FEEDBACK_COUNT_KEY);
      if (saved !== null) {
        return Number(saved);
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const [seenEventsCount, setSeenEventsCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(SEEN_EVENTS_COUNT_KEY);
      if (saved !== null) {
        return Number(saved);
      }
    } catch {
      // ignore
    }
    return 0;
  });

  // Real-time toast alert when anyone adds a note
  const [recentNotification, setRecentNotification] = useState<NewNoteNotification | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Sync feedbacks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbacks));
    } catch {
      // Storage quota or restriction
    }
  }, [feedbacks]);

  // Sync likes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likedFeedbacks));
    } catch {
      // Storage quota or restriction
    }
  }, [likedFeedbacks]);

  // Save seen counts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SEEN_FEEDBACK_COUNT_KEY, String(seenFeedbackCount));
    } catch {
      // ignore
    }
  }, [seenFeedbackCount]);

  useEffect(() => {
    try {
      localStorage.setItem(SEEN_EVENTS_COUNT_KEY, String(seenEventsCount));
    } catch {
      // ignore
    }
  }, [seenEventsCount]);

  // Real-time synchronization across all tabs and browser windows
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel(NOTIFICATION_CHANNEL_NAME);
        broadcastChannelRef.current = channel;

        channel.onmessage = (event) => {
          if (event.data && event.data.type === 'NEW_COMMUNITY_NOTE') {
            const incomingNote: UserFeedback = event.data.feedback;
            if (incomingNote && incomingNote.id) {
              setFeedbacks(prev => {
                if (prev.some(f => f.id === incomingNote.id)) return prev;
                return [incomingNote, ...prev];
              });

              // Show live toast notification to everyone
              setRecentNotification({
                id: incomingNote.id,
                userName: incomingNote.userName,
                resourceName: incomingNote.resourceName,
                message: incomingNote.message,
                submittedAt: incomingNote.submittedAt
              });
            }
          }
        };
      }
    } catch {
      // BroadcastChannel unavailable
    }

    // Also listen to storage events across tabs as a resilient fallback
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const updated: UserFeedback[] = JSON.parse(e.newValue);
          if (Array.isArray(updated)) {
            setFeedbacks(updated);
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (channel) {
        channel.close();
      }
    };
  }, []);

  // Mark tabs as seen to dismiss the yellow notification badges
  const markFeedbackAsSeen = useCallback(() => {
    setSeenFeedbackCount(feedbacks.length);
  }, [feedbacks.length]);

  const markEventsAsSeen = useCallback(() => {
    setSeenEventsCount(COMMUNITY_EVENTS.length);
  }, []);

  const dismissNotification = useCallback(() => {
    setRecentNotification(null);
  }, []);

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

    // Notify all open windows/users immediately via BroadcastChannel
    try {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: 'NEW_COMMUNITY_NOTE',
          feedback: newFeedback
        });
      }
    } catch {
      // ignore
    }

    // Trigger local notification toast for the author/user as well
    setRecentNotification({
      id: newFeedback.id,
      userName: newFeedback.userName,
      resourceName: newFeedback.resourceName,
      message: newFeedback.message,
      submittedAt: newFeedback.submittedAt
    });

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

  // Calculate unread badge counts (0 when seen)
  const unreadFeedbackCount = Math.max(0, feedbacks.length - seenFeedbackCount);
  const unreadEventsCount = Math.max(0, COMMUNITY_EVENTS.length - seenEventsCount);

  return {
    feedbacks: filteredFeedbacks,
    allFeedbacksCount: feedbacks.length,
    unreadFeedbackCount,
    unreadEventsCount,
    markFeedbackAsSeen,
    markEventsAsSeen,
    recentNotification,
    dismissNotification,
    filterType,
    setFilterType,
    addFeedback,
    toggleLike,
    likedFeedbacks
  };
}
