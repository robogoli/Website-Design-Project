// Import React hooks for state, mount effects, and memoized API handlers
import { useState, useEffect, useCallback, useRef } from 'react';

// Shape of aggregate site statistics returned by the backend API
interface SiteStatsPayload {
  uniqueViews: number;
  likesCount: number;
  hasLiked?: boolean;
}

// LocalStorage keys preserving unique browser identity and static-fallback like status
const BROWSER_ID_KEY = 'civicbridge_browser_id';
const LOCAL_LIKED_KEY = 'civicbridge_site_liked';

// Retrieve or generate a stable unique identifier per browser profile
function getOrCreateBrowserId(): string {
  try {
    const existing = localStorage.getItem(BROWSER_ID_KEY);
    if (existing && /^[a-zA-Z0-9_-]{8,128}$/.test(existing)) {
      return existing;
    }

    const generated =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `br-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

    localStorage.setItem(BROWSER_ID_KEY, generated);
    return generated;
  } catch {
    // Ephemeral fallback ID when storage is blocked in strict private browsing
    return `ephemeral-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

// Read cached local like boolean when running without a live backend or while loading
function readLocalLikedFallback(): boolean {
  try {
    return localStorage.getItem(LOCAL_LIKED_KEY) === 'true';
  } catch {
    return false;
  }
}

// Persist local like flag cleanly in browser storage
function writeLocalLikedFallback(liked: boolean): void {
  try {
    localStorage.setItem(LOCAL_LIKED_KEY, liked ? 'true' : 'false');
  } catch {
    // Ignore storage quota or privacy-mode restrictions
  }
}

// Build normalized base API prefix respecting Vite's configured base URL
function getApiBase(): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base.endsWith('/') ? base : `${base}/`}api/site-stats`;
}

// Custom hook tracking unique browser viewers and site-wide likes synced across browsers
export function useSiteStats() {
  // Stable unique identifier representing this browser
  const browserIdRef = useRef<string>(getOrCreateBrowserId());
  // Tracks whether the backend stats API is reachable in this hosting environment
  const backendAvailableRef = useRef<boolean>(true);

  // Total unique browsers that have viewed the site (minimum 1 for the active viewer)
  const [uniqueViews, setUniqueViews] = useState<number>(1);
  // Total site-wide likes across all browsers
  const [likesCount, setLikesCount] = useState<number>(() => (readLocalLikedFallback() ? 1 : 0));
  // Whether this specific browser has liked the directory
  const [hasLiked, setHasLiked] = useState<boolean>(() => readLocalLikedFallback());
  // Prevents rapid double-clicks while a like toggle request is in flight
  const [isUpdatingLike, setIsUpdatingLike] = useState<boolean>(false);

  // Register this browser view on mount and subscribe to real-time updates from other browsers
  useEffect(() => {
    let active = true;
    const apiBase = getApiBase();
    const browserId = browserIdRef.current;

    const recordView = async () => {
      try {
        const res = await fetch(`${apiBase}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ browserId })
        });
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) {
          backendAvailableRef.current = false;
          return;
        }
        const data = (await res.json()) as SiteStatsPayload;
        if (!active) return;

        backendAvailableRef.current = true;
        setUniqueViews(Math.max(1, data.uniqueViews));
        setLikesCount(Math.max(0, data.likesCount));
        if (typeof data.hasLiked === 'boolean') {
          setHasLiked(data.hasLiked);
          writeLocalLikedFallback(data.hasLiked);
        }
      } catch {
        backendAvailableRef.current = false;
      }
    };

    recordView();

    // Open live SSE stream so views and likes from other browsers appear immediately
    let eventSource: EventSource | null = null;
    if (typeof EventSource !== 'undefined') {
      try {
        eventSource = new EventSource(`${apiBase}/stream`);
        eventSource.onmessage = (event) => {
          if (!active) return;
          try {
            const data = JSON.parse(event.data) as SiteStatsPayload;
            if (typeof data.uniqueViews === 'number') {
              setUniqueViews(Math.max(1, data.uniqueViews));
            }
            if (typeof data.likesCount === 'number') {
              setLikesCount(Math.max(0, data.likesCount));
            }
          } catch {
            // Ignore malformed keepalive or non-JSON messages
          }
        };
        eventSource.onerror = () => {
          // Close quietly if hosting environment does not serve SSE streams
          if (!backendAvailableRef.current) {
            eventSource?.close();
          }
        };
      } catch {
        // Ignore EventSource initialization failures in restricted environments
      }
    }

    // Re-sync counts when returning to this browser tab
    const handleFocus = () => {
      if (!backendAvailableRef.current) return;
      fetch(`${apiBase}?browserId=${encodeURIComponent(browserId)}`)
        .then(async (res) => {
          const contentType = res.headers.get('content-type') || '';
          if (!res.ok || !contentType.includes('application/json')) return null;
          return (await res.json()) as SiteStatsPayload;
        })
        .then((data) => {
          if (!active || !data) return;
          setUniqueViews(Math.max(1, data.uniqueViews));
          setLikesCount(Math.max(0, data.likesCount));
          if (typeof data.hasLiked === 'boolean') {
            setHasLiked(data.hasLiked);
            writeLocalLikedFallback(data.hasLiked);
          }
        })
        .catch(() => {});
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      active = false;
      window.removeEventListener('focus', handleFocus);
      eventSource?.close();
    };
  }, []);

  // Toggle this browser's site-wide like vote with optimistic UI feedback
  const toggleSiteLike = useCallback(async () => {
    if (isUpdatingLike) return;

    const nextLiked = !hasLiked;
    setHasLiked(nextLiked);
    setLikesCount(prev => Math.max(0, prev + (nextLiked ? 1 : -1)));
    writeLocalLikedFallback(nextLiked);

    if (!backendAvailableRef.current) {
      return;
    }

    setIsUpdatingLike(true);
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ browserId: browserIdRef.current })
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        backendAvailableRef.current = false;
        return;
      }
      const data = (await res.json()) as SiteStatsPayload;
      setUniqueViews(Math.max(1, data.uniqueViews));
      setLikesCount(Math.max(0, data.likesCount));
      if (typeof data.hasLiked === 'boolean') {
        setHasLiked(data.hasLiked);
        writeLocalLikedFallback(data.hasLiked);
      }
    } catch {
      backendAvailableRef.current = false;
    } finally {
      setIsUpdatingLike(false);
    }
  }, [hasLiked, isUpdatingLike]);

  return {
    uniqueViews,
    likesCount,
    hasLiked,
    isUpdatingLike,
    toggleSiteLike
  };
}
