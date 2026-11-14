// Import core React hooks for local state, side-effects, and memoized callbacks
import { useState, useEffect, useCallback } from 'react';
// Import domain interface definition for public community feedback submissions
import { UserFeedback } from '../types';
// Import static verified baseline community notes
import { INITIAL_COMMUNITY_FEEDBACKS } from '../data/mockData';
// Import the shared Supabase client for cloud storage and live subscription updates
import { supabase } from '../utils/supabase';

// TypeScript interface defining the payload structure for real-time community note toast alerts
export interface NewNoteNotification {
  id: string;
  userName: string;
  resourceName?: string;
  message: string;
  submittedAt: string;
}

// Set of legacy test submission IDs filtered out from display
const TEST_NOTE_IDS = new Set([
  'fb-1794518855456',
  'fb-1794519132887',
  'fb-1794519259135',
  'fb-1794518713218'
]);

// Shape of a row stored in the Supabase community_feedbacks PostgreSQL table
interface FeedbackRow {
  // Primary unique feedback record ID
  id: string;
  // Display name stored in PostgreSQL
  user_name: string;
  // Optional organization name referenced by the note
  resource_name?: string | null;
  // Selected feedback topic category
  category: UserFeedback['category'];
  // Experience rating tag
  rating: UserFeedback['rating'];
  // Submitted neighbor note text
  message: string;
  // True when author chose anonymous attribution
  is_anonymous?: boolean;
  // Human-readable date label recorded at submit time
  submitted_at: string;
  // Moderation workflow badge
  status: UserFeedback['status'];
  // Aggregate helpful vote count
  likes_count?: number | null;
}

// Convert a snake_case Supabase table row into a camelCase UserFeedback object
function mapFeedbackRow(item: FeedbackRow): UserFeedback {
  return {
    id: item.id,
    userName: item.user_name,
    // Omit null resource names so optional checks behave consistently
    resourceName: item.resource_name || undefined,
    category: item.category,
    rating: item.rating,
    message: item.message,
    isAnonymous: item.is_anonymous,
    submittedAt: item.submitted_at,
    status: item.status,
    // Default null like counts cleanly to zero
    likesCount: item.likes_count ?? 0
  };
}

// Helper function to detect and filter test submissions from being shown on the live community board
function isTestFeedback(item: { id?: string; message?: string }): boolean {
  // If the ID matches a known test entry, exclude it
  if (item.id && TEST_NOTE_IDS.has(item.id)) return true;
  // If there is no message content, do not classify as test
  if (!item.message) return false;
  // Convert message text to lowercase for case-insensitive keyword filtering
  const m = item.message.toLowerCase();
  // Filter out known placeholder text from earlier development rounds
  return (
    m.includes('chipotle') ||
    m === 'very good!' ||
    m === 'very nice and very good'
  );
}

// Custom hook managing community notes, Supabase cloud synchronization, and live alerts
export function useFeedback() {
  // State storing the list of community notes, initialized with verified baseline feedback
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>(INITIAL_COMMUNITY_FEEDBACKS);
  
  // State dictionary tracking which notes the current visitor has upvoted
  const [likedFeedbacks, setLikedFeedbacks] = useState<Record<string, boolean>>({});
  
  // State for filtering notes by author visibility: 'all', 'public', or 'anonymous'
  const [filterType, setFilterType] = useState<'all' | 'public' | 'anonymous'>('all');
  
  // State storing the most recent incoming community note for displaying a real-time toast banner
  const [recentNotification, setRecentNotification] = useState<NewNoteNotification | null>(null);

  // Authenticate visitor with a persistent anonymous session so likes are uniquely recorded per browser
  const ensureAnonymousSession = async () => {
    // Check if an existing Supabase authentication session is already active in local storage
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    // Throw error if session retrieval failed unexpectedly
    if (sessionError) throw sessionError;

    // Return the active user object if already authenticated
    if (sessionData.session?.user) {
      return sessionData.session.user;
    }

    // Sign in anonymously to create a secure, distinct user ID without asking for personal credentials
    const { data, error } = await supabase.auth.signInAnonymously();

    // Handle authentication failures gracefully
    if (error) throw error;
    if (!data.user) throw new Error('Could not create anonymous session.');

    // Return the authenticated anonymous user object
    return data.user;
  };

  // Primary effect fetching community feedback from Supabase and subscribing to live database changes
  useEffect(() => {
    // Flag preventing state updates if component unmounts while request is in-flight
    let active = true;

    // Asynchronous loader initializing the session, user likes, and feedback records
    async function initialize() {
      try {
        // Ensure the current visitor has an authenticated anonymous user ID
        const user = await ensureAnonymousSession();

        // Query the database for likes previously submitted by this specific user
        const { data: likes, error: likesError } = await supabase
          .from('community_feedback_likes')
          .select('feedback_id')
          .eq('user_id', user.id);

        // Check for query errors when fetching user likes
        if (likesError) throw likesError;

        // Populate local liked map if component is still mounted
        if (active && likes) {
          const likedMap: Record<string, boolean> = {};
          // Mark each feedback ID as liked in the lookup dictionary
          likes.forEach(like => {
            likedMap[like.feedback_id] = true;
          });
          // Update the liked state in React
          setLikedFeedbacks(likedMap);
        }
      } catch (error) {
        // Log authentication or likes fetch failures to console without breaking the page
        console.error('Anonymous sign-in or likes loading error:', error);
      }

      // Fetch all community feedback records ordered with newest submissions first
      const { data, error } = await supabase
        .from('community_feedbacks')
        .select('*')
        .order('created_at', { ascending: false });

      // Process and format the database rows if query was successful
      if (!error && data && active) {
        // Filter out any historical test submissions
        const liveFeedbacks = (data as FeedbackRow[]).filter(
          item => !isTestFeedback({ id: item.id, message: item.message })
        );
        // Map database column names (snake_case) to application types (camelCase)
        const formatted: UserFeedback[] = liveFeedbacks.map(mapFeedbackRow);

        // Combine live cloud notes with verified baseline community notes
        setFeedbacks([...formatted, ...INITIAL_COMMUNITY_FEEDBACKS]);
      }
    }

    // Execute the initial data loading
    initialize();

    // Open a persistent WebSocket subscription channel to PostgreSQL changes on community_feedbacks table
    const channel = supabase
      .channel('public:community_feedbacks')
      // Listen for newly inserted feedback rows across all connected clients
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_feedbacks' },
        (payload) => {
          // Extract the new row data from the database event payload
          const newItem = payload.new as FeedbackRow;
          // Ignore if payload matches test criteria
          if (isTestFeedback({ id: newItem.id, message: newItem.message })) return;

          // Format new database record into standard frontend UserFeedback structure
          const incomingNote = mapFeedbackRow(newItem);

          // Prepend the new note to local feedback state avoiding duplicates
          setFeedbacks(prev => {
            if (prev.some(f => f.id === incomingNote.id)) return prev;
            return [incomingNote, ...prev];
          });

          // Trigger live toast alert on user's screen notifying them of the new note
          setRecentNotification({
            id: incomingNote.id,
            userName: incomingNote.userName,
            resourceName: incomingNote.resourceName,
            message: incomingNote.message,
            submittedAt: incomingNote.submittedAt
          });
        }
      )
      // Listen for update events (such as real-time upvote counter increments)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_feedbacks' },
        (payload) => {
          // Extract updated row data from payload
          const updatedItem = payload.new;

          // Update matching feedback item's like counter in React state
          setFeedbacks(prev =>
            prev.map(f =>
              f.id === updatedItem.id
                ? { ...f, likesCount: updatedItem.likes_count ?? 0 }
                : f
            )
          );
        }
      )
      // Subscribe to the real-time event channel
      .subscribe();

    // Teardown function removing WebSocket listener when hook unmounts
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Function allowing a user to submit a new community note to Supabase
  const addFeedback = async (
    item: Omit<UserFeedback, 'id' | 'submittedAt' | 'status' | 'likesCount'>
  ): Promise<UserFeedback> => {
    // Generate a unique client identifier timestamp
    const newId = `fb-${Date.now()}`;

    // Format submission date into human-readable format (e.g., 'Nov 12, 2026')
    const submittedAt = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Create the full feedback object with default status and 0 initial likes
    const newFeedback: UserFeedback = {
      ...item,
      id: newId,
      submittedAt,
      status: 'Received & Logged',
      likesCount: 0
    };

    // Insert the record into the Supabase PostgreSQL database
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

    // Throw error if database insertion failed
    if (error) {
      console.error('Supabase feedback error:', error);
      throw error;
    }

    // Immediately update local UI so user sees their submission without delay
    setFeedbacks(prev => {
      if (prev.some(f => f.id === newFeedback.id)) return prev;
      return [newFeedback, ...prev];
    });

    // Trigger confirmation notification for the author
    setRecentNotification({
      id: newFeedback.id,
      userName: newFeedback.userName,
      resourceName: newFeedback.resourceName,
      message: newFeedback.message,
      submittedAt: newFeedback.submittedAt
    });

    // Return the newly created feedback object
    return newFeedback;
  };

  // Securely toggle like status using a stored PostgreSQL RPC database function
  const toggleLike = async (id: string) => {
    try {
      // Ensure visitor has an anonymous authentication session
      await ensureAnonymousSession();

      // Invoke server-side RPC function that handles atomic like/unlike transactions
      const { data, error } = await supabase.rpc(
        'toggle_feedback_like',
        { p_feedback_id: id }
      );

      // Handle RPC execution errors
      if (error) throw error;

      // Extract result from array or single object response
      const result = Array.isArray(data) ? data[0] : data;

      // Ensure response contains valid like status
      if (!result) {
        throw new Error('The like operation returned no result.');
      }

      // Update visitor's local liked state
      setLikedFeedbacks(prev => ({
        ...prev,
        [id]: result.liked
      }));

      // Update like count in local feedback list
      setFeedbacks(prev =>
        prev.map(f =>
          f.id === id
            ? { ...f, likesCount: result.likes_count }
            : f
        )
      );
    } catch (error) {
      // Log errors without interrupting user browsing experience
      console.error('Secure like error:', error);
    }
  };

  // Dismiss the floating notification toast banner
  const dismissNotification = useCallback(() => {
    setRecentNotification(null);
  }, []);

  // Filter feedbacks according to active filter tab (all, public, or anonymous)
  const filteredFeedbacks = feedbacks.filter(fb => {
    if (filterType === 'public') return !fb.isAnonymous;
    if (filterType === 'anonymous') return !!fb.isAnonymous;
    return true;
  });

  // Expose state variables and interaction methods to consuming components
  return {
    // Filtered list of community feedback items
    feedbacks: filteredFeedbacks,
    // Total count of all loaded feedbacks
    allFeedbacksCount: feedbacks.length,
    // Real-time toast notification payload
    recentNotification,
    // Action to close toast banner
    dismissNotification,
    // Active filter selection ('all', 'public', 'anonymous')
    filterType,
    // Action to change the active filter
    setFilterType,
    // Action to submit a new note
    addFeedback,
    // Action to upvote/like a note
    toggleLike,
    // Lookup dictionary of notes upvoted by the current user
    likedFeedbacks
  };
}
