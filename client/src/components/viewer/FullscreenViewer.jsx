import { useState, useEffect, useRef, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LikeControl from '../common/LikeControl';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NotesIcon from '@mui/icons-material/Notes';

function FullscreenViewer({ filename, userId, onClose, onTagsClick, onDescriptionClick, tags }) {
  const [imageData, setImageData] = useState(null);
  const transformRef = useRef(null);

  const touchStartRef = useRef(null);

  const handlePointerDown = useCallback((e) => {
    touchStartRef.current = { y: e.clientY, time: Date.now() };
  }, []);

  useEffect(() => {
    const handlePointerUp = (e) => {
      if (!touchStartRef.current) return;
      const dy = e.clientY - touchStartRef.current.y;
      const dt = Date.now() - touchStartRef.current.time;
      touchStartRef.current = null;

      const ref = transformRef.current;
      if (!ref) return;
      const scale = ref.instance.transformState.scale;
      if (Math.abs(scale - 1) >= 0.01) return;

      if (dy > 100 && dt < 400) {
        onClose();
      }
    };
    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, [onClose]);

  const handleDoubleClick = useCallback(() => {
    const ref = transformRef.current;
    if (!ref) return;
    const scale = ref.instance.transformState.scale;
    if (Math.abs(scale - 1) < 0.01) {
      ref.centerView(3, 200, 'easeOut');
    } else {
      ref.resetTransform(200, 'easeOut');
    }
  }, []);

  useEffect(() => {
    fetch(`/api/users/${userId}/image/${encodeURIComponent(filename)}`)
      .then(res => res.json())
      .then(setImageData)
      .catch(err => console.error('Failed to load image data:', err));
  }, [userId, filename]);

  // Update local imageData when tags prop changes
  useEffect(() => {
    if (tags !== undefined && imageData) {
      setImageData(prev => ({ ...prev, tags }));
    }
  }, [tags]);

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

  const handleBookmark = async (e) => {
    e.stopPropagation();
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

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: { bgcolor: 'rgba(0, 0, 0, 0.95)' }
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1,
          color: '#e8e4de',
          opacity: 0.6,
          '&:hover': { opacity: 1, color: 'primary.main' }
        }}
      >
        <CloseIcon fontSize="large" />
      </IconButton>

      <Box
        onPointerDownCapture={handlePointerDown}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={0.5}
          maxScale={50}
          centerOnInit={true}
          wheel={{ step: 3, smoothStep: 0.02 }}
          pinch={{ step: 50 }}
          doubleClick={{ disabled: true }}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            contentProps={{ onDoubleClick: handleDoubleClick }}
          >
            <img
              src={`/api/images/file/${encodeURIComponent(filename)}`}
              alt=""
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </TransformComponent>
        </TransformWrapper>
      </Box>

      {imageData && (
        <Paper
          sx={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            p: 1.5,
            bgcolor: 'rgba(13, 13, 13, 0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: 0,
            border: '1px solid rgba(201, 169, 89, 0.2)',
            opacity: 0.7,
            transition: 'opacity 0.2s',
            '&:hover': { opacity: 1, bgcolor: 'rgba(13, 13, 13, 0.8)' }
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <LikeControl likes={imageData.likes} onLike={handleLike} onUnlike={handleUnlike} />

          <IconButton onClick={handleBookmark} sx={{ color: '#e8e4de' }}>
            {imageData.bookmarked ? (
              <BookmarkIcon color="primary" />
            ) : (
              <BookmarkBorderIcon />
            )}
          </IconButton>

          <IconButton
            onClick={(e) => { e.stopPropagation(); onTagsClick(filename); }}
            sx={{ color: imageData.tags?.length > 0 ? 'primary.main' : '#e8e4de' }}
          >
            <LocalOfferIcon />
          </IconButton>
          {imageData.tags?.length > 0 && (
            <Typography sx={{ display: 'flex', alignItems: 'center', color: '#e8e4de', mr: 1 }}>
              {imageData.tags.length}
            </Typography>
          )}

          <IconButton
            onClick={(e) => { e.stopPropagation(); onDescriptionClick(filename); }}
            sx={{ color: imageData.description ? 'primary.main' : '#e8e4de' }}
          >
            <NotesIcon />
          </IconButton>
        </Paper>
      )}
    </Dialog>
  );
}

export default FullscreenViewer;
