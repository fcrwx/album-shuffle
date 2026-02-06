import { useState, useEffect, useCallback, useRef } from 'react';

export function useInfiniteImages(sessionSeed, userId, filters = {}, batchSize = 10) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);

  // Extract filter values for stable dependencies
  const { liked = false, bookmarked = false, tagged = false, untagged = false, described = false } = filters;

  const buildParams = useCallback((offset) => {
    const params = new URLSearchParams({
      seed: sessionSeed,
      offset: offset,
      limit: batchSize
    });
    if (userId) params.set('userId', userId);
    if (liked) params.set('liked', 'true');
    if (bookmarked) params.set('bookmarked', 'true');
    if (tagged) params.set('tagged', 'true');
    if (untagged) params.set('untagged', 'true');
    if (described) params.set('described', 'true');
    return params;
  }, [sessionSeed, userId, liked, bookmarked, tagged, untagged, described, batchSize]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = buildParams(offsetRef.current);
      const res = await fetch(`/api/images/list?${params}`);
      if (!res.ok) throw new Error('Failed to fetch images');

      const data = await res.json();

      setImages(prev => [...prev, ...data.images]);
      offsetRef.current += data.images.length;
      setHasMore(data.hasMore);
      setTotalFiltered(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [buildParams, hasMore]);

  // Reset and load initial batch when seed or filters change
  useEffect(() => {
    setImages([]);
    setHasMore(true);
    setError(null);
    offsetRef.current = 0;
    loadingRef.current = false;

    // Load first batch
    const loadInitial = async () => {
      loadingRef.current = true;
      setLoading(true);
      try {
        const params = buildParams(0);
        const res = await fetch(`/api/images/list?${params}`);
        if (!res.ok) throw new Error('Failed to fetch images');
        const data = await res.json();
        setImages(data.images);
        offsetRef.current = data.images.length;
        setHasMore(data.hasMore);
        setTotalFiltered(data.total);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };
    loadInitial();
  }, [sessionSeed, buildParams]);

  return { images, loading, hasMore, error, loadMore, totalFiltered };
}

export default useInfiniteImages;
