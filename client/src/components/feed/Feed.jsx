import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import useInfiniteImages from '../../hooks/useInfiniteImages';
import useViewTracking from '../../hooks/useViewTracking';
import ImageCard from './ImageCard';

function Feed({ userId, sessionSeed, onImageClick, onTagsClick, onDescriptionClick, tagUpdates, likeUpdates, descriptionUpdates, filters }) {
  const { images, loading, hasMore, error, loadMore, totalFiltered } = useInfiniteImages(sessionSeed, userId, filters);
  const { createObserverCallback } = useViewTracking(userId);
  const loaderRef = useRef(null);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  return (
    <Container maxWidth="md" sx={{ pt: 3, pb: 12 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {images.map((filename, index) => (
          <ImageCard
            key={`${filename}-${index}`}
            filename={filename}
            userId={userId}
            onImageClick={onImageClick}
            onTagsClick={onTagsClick}
            onDescriptionClick={onDescriptionClick}
            createObserverCallback={createObserverCallback}
            updatedTags={tagUpdates?.[filename]}
            updatedLikes={likeUpdates?.[filename]}
            updatedDescription={descriptionUpdates?.[filename]}
          />
        ))}

        <Box ref={loaderRef} sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          {loading && <CircularProgress />}
          {error && (
            <Typography color="error">Error: {error}</Typography>
          )}
          {!hasMore && images.length > 0 && (
            <Typography color="text.secondary" fontStyle="italic">
              You've reached the end! ({totalFiltered} images)
            </Typography>
          )}
          {!loading && !hasMore && images.length === 0 && (
            <Typography color="text.secondary" fontStyle="italic">
              No images match the current filters
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default Feed;
