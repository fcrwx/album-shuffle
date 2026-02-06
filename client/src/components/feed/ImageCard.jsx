import { useState, useEffect, useRef } from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import ActionBar from './ActionBar';

function ImageCard({
  filename,
  userId,
  onImageClick,
  onTagsClick,
  onDescriptionClick,
  createObserverCallback,
  updatedTags
}) {
  const [imageData, setImageData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    fetch(`/api/users/${userId}/image/${encodeURIComponent(filename)}`)
      .then(res => res.json())
      .then(setImageData)
      .catch(err => console.error('Failed to load image data:', err));
  }, [userId, filename]);

  // Update local imageData when tags are updated externally
  useEffect(() => {
    if (updatedTags !== undefined && imageData) {
      setImageData(prev => ({ ...prev, tags: updatedTags }));
    }
  }, [updatedTags]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const callback = createObserverCallback(filename);
    const observer = new IntersectionObserver(callback, { threshold: 0.5 });
    observer.observe(img);
    return () => observer.disconnect();
  }, [filename, createObserverCallback]);

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/image/${encodeURIComponent(filename)}/like`, {
        method: 'POST'
      });
      const data = await res.json();
      setImageData(data);
    } catch (err) {
      console.error('Failed to like:', err);
    }
  };

  const handleUnlike = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/image/${encodeURIComponent(filename)}/unlike`, {
        method: 'POST'
      });
      const data = await res.json();
      setImageData(data);
    } catch (err) {
      console.error('Failed to unlike:', err);
    }
  };

  const handleBookmark = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/image/${encodeURIComponent(filename)}/bookmark`, {
        method: 'POST'
      });
      const data = await res.json();
      setImageData(data);
    } catch (err) {
      console.error('Failed to bookmark:', err);
    }
  };

  const handleImageClick = () => {
    fetch(`/api/users/${userId}/views/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filenames: [filename] })
    }).catch(err => console.error('Failed to track view:', err));

    onImageClick(filename, imageData);
  };

  return (
    <Card sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <Box
        ref={imgRef}
        onClick={handleImageClick}
        sx={{
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'black',
          minHeight: 200,
          position: 'relative',
        }}
      >
        {!loaded && (
          <Skeleton
            variant="rectangular"
            sx={{ position: 'absolute', inset: 0 }}
          />
        )}
        <CardMedia
          component="img"
          image={`/api/images/file/${encodeURIComponent(filename)}`}
          alt=""
          onLoad={() => setLoaded(true)}
          sx={{
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 250px)',
            objectFit: 'contain',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />
      </Box>

      {imageData && (
        <ActionBar
          imageData={imageData}
          onLike={handleLike}
          onUnlike={handleUnlike}
          onBookmark={handleBookmark}
          onTagsClick={() => onTagsClick(filename)}
          onDescriptionClick={() => onDescriptionClick(filename)}
        />
      )}
    </Card>
  );
}

export default ImageCard;
