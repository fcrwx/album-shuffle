import { useRef, useEffect, useCallback } from 'react';

export function useViewTracking(userId) {
  const viewedSet = useRef(new Set());
  const pendingViews = useRef(new Set());
  const flushTimeoutRef = useRef(null);

  const flushViews = useCallback(async () => {
    if (pendingViews.current.size === 0) return;

    const filenames = [...pendingViews.current];
    pendingViews.current.clear();

    try {
      await fetch(`/api/users/${userId}/views/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filenames })
      });
    } catch (err) {
      console.error('Failed to track views:', err);
      // Re-add to pending on failure
      filenames.forEach(f => pendingViews.current.add(f));
    }
  }, [userId]);

  const scheduleFlush = useCallback(() => {
    if (flushTimeoutRef.current) return;

    flushTimeoutRef.current = setTimeout(() => {
      flushTimeoutRef.current = null;
      flushViews();
    }, 2000);
  }, [flushViews]);

  const trackView = useCallback((filename) => {
    // Only track once per session
    if (viewedSet.current.has(filename)) return;

    viewedSet.current.add(filename);
    pendingViews.current.add(filename);
    scheduleFlush();
  }, [scheduleFlush]);

  // Create intersection observer callback
  const createObserverCallback = useCallback((filename) => {
    return (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          trackView(filename);
        }
      });
    };
  }, [trackView]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      flushViews();
    };
  }, [flushViews]);

  // Reset when user changes
  useEffect(() => {
    viewedSet.current.clear();
    pendingViews.current.clear();
  }, [userId]);

  return { trackView, createObserverCallback };
}

export default useViewTracking;
