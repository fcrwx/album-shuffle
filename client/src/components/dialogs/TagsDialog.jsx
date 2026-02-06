import { useState, useEffect, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LikeControl from '../common/LikeControl';

function TagsDialog({ userId, filename, onClose, onTagsUpdated, onLikesUpdated }) {
  const [allTags, setAllTags] = useState([]);  // Array of { name, lastUsed }
  const [selectedTags, setSelectedTags] = useState([]);
  const [likes, setLikes] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState(() => {
    return localStorage.getItem('pnc-tag-sort') || 'recent';
  });
  const inputRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${userId}/tags`).then(r => r.json()),
      fetch(`/api/users/${userId}/image/${encodeURIComponent(filename)}`).then(r => r.json())
    ])
      .then(([tags, imageData]) => {
        // tags is now array of { name, lastUsed }
        setAllTags(tags);
        setSelectedTags(imageData.tags || []);
        setLikes(imageData.likes || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load tags:', err);
        setLoading(false);
      });
  }, [userId, filename]);

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/image/${encodeURIComponent(filename)}/like`, {
        method: 'POST'
      });
      const data = await res.json();
      setLikes(data.likes);
      if (onLikesUpdated) onLikesUpdated(filename, data.likes);
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
      setLikes(data.likes);
      if (onLikesUpdated) onLikesUpdated(filename, data.likes);
    } catch (err) {
      console.error('Failed to unlike:', err);
    }
  };

  const handleSortChange = (e, newSort) => {
    if (newSort) {
      setSortMode(newSort);
      localStorage.setItem('pnc-tag-sort', newSort);
    }
  };

  // Focus input when loaded
  useEffect(() => {
    if (!loading && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [loading]);

  // Save tags immediately when they change
  const initialLoadRef = useRef(true);
  useEffect(() => {
    if (loading || initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    fetch(`/api/users/${userId}/image/${encodeURIComponent(filename)}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: selectedTags })
    }).catch(err => console.error('Failed to save tags:', err));

    // Notify parent of tag changes
    if (onTagsUpdated) {
      onTagsUpdated(filename, selectedTags);
    }
  }, [selectedTags, userId, filename, loading, onTagsUpdated]);

  // Sort and filter tags
  const sortedTags = [...allTags].sort((a, b) => {
    if (sortMode === 'recent') {
      return b.lastUsed - a.lastUsed;  // Most recent first
    }
    return a.name.localeCompare(b.name);  // Alphabetical
  });

  const availableTags = sortedTags.filter(tag => !selectedTags.includes(tag.name));
  const availableTagNames = availableTags.map(t => t.name);

  // Find the best matching suggestion (highest usage count among matches)
  const suggestion = inputValue.trim()
    ? availableTags
        .filter(tag => tag.name.toLowerCase().startsWith(inputValue.toLowerCase()))
        .sort((a, b) => (b.count || 0) - (a.count || 0))[0]?.name
    : null;
  const suggestionRemainder = suggestion
    ? suggestion.slice(inputValue.length)
    : '';

  const handleAddTag = (tag) => {
    if (!tag.trim()) return;
    const normalizedTag = tag.trim();

    // Check if tag already exists in allTags
    const existingTag = allTags.find(t => t.name === normalizedTag);
    if (!existingTag) {
      // Add new tag with current timestamp
      setAllTags(prev => [...prev, { name: normalizedTag, lastUsed: Date.now() }]);
    }
    if (!selectedTags.includes(normalizedTag)) {
      setSelectedTags(prev => [...prev, normalizedTag]);
    }
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      handleAddTag(suggestion);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      } else {
        onClose();
      }
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: 'rgba(13, 13, 13, 0.95)',
          backdropFilter: 'blur(12px)',
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(201, 169, 89, 0.2)',
        }}
      >
        <Typography variant="h6">Tags</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', width: '100%', height: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Image preview */}
            <Box
              sx={{
                flex: { xs: '0 0 40%', md: '0 0 50%' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                minHeight: { xs: 200, md: 'auto' },
                position: 'relative',
              }}
            >
              <img
                src={`/api/images/file/${encodeURIComponent(filename)}`}
                alt=""
                style={{
                  maxWidth: '100%',
                  maxHeight: 'calc(100% - 50px)',
                  objectFit: 'contain',
                }}
              />
              <Box sx={{ mt: 2 }}>
                <LikeControl likes={likes} onLike={handleLike} onUnlike={handleUnlike} />
              </Box>
            </Box>

            {/* Tags panel */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                p: 3,
                overflow: 'auto',
              }}
            >
              {/* Inline autocomplete input */}
              <Box
                sx={{
                  position: 'relative',
                  mb: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 0,
                  bgcolor: 'background.default',
                  '&:focus-within': {
                    borderColor: 'primary.main',
                  }
                }}
              >
                {/* Ghost text (suggestion) */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    px: 1.5,
                    pointerEvents: 'none',
                    fontFamily: '"Lora", Georgia, serif',
                    fontSize: '1.1rem',
                    letterSpacing: '0.02em',
                  }}
                >
                  <span style={{ visibility: 'hidden' }}>{inputValue}</span>
                  <span style={{ color: 'rgba(201, 169, 89, 0.5)' }}>{suggestionRemainder}</span>
                </Box>

                {/* Actual input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a tag... (Tab to autocomplete, Enter to add)"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    background: 'transparent',
                    color: '#e8e4de',
                    fontSize: '1.1rem',
                    fontFamily: '"Lora", Georgia, serif',
                    outline: 'none',
                    letterSpacing: '0.02em',
                  }}
                />
              </Box>

              {suggestion && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: -1 }}>
                  <Chip
                    label={suggestion}
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={() => handleAddTag(suggestion)}
                    onMouseDown={(e) => e.preventDefault()}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Tap or press Tab
                  </Typography>
                </Box>
              )}

              {selectedTags.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Selected tags:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedTags.map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        deleteIcon={
                          <CancelIcon onMouseDown={(e) => e.preventDefault()} />
                        }
                        color="primary"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {availableTags.length > 0 && (
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Available tags:
                    </Typography>
                    <ToggleButtonGroup
                      value={sortMode}
                      exclusive
                      onChange={handleSortChange}
                      size="small"
                    >
                      <ToggleButton value="recent" title="Most recently used">
                        <AccessTimeIcon fontSize="small" />
                      </ToggleButton>
                      <ToggleButton value="alpha" title="Alphabetical">
                        <SortByAlphaIcon fontSize="small" />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {availableTags.map(tag => (
                      <Chip
                        key={tag.name}
                        label={tag.name}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleAddTag(tag.name)}
                        variant="outlined"
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {allTags.length === 0 && (
                <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                  No tags yet. Type above to create one!
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TagsDialog;
