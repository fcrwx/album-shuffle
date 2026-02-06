import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LikeControl from '../common/LikeControl';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TagIcon from '@mui/icons-material/Tag';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

function StatsScreen({ userId, onClose, onImageClick, tagUpdates }) {
  const [activeTab, setActiveTab] = useState(0);
  const [images, setImages] = useState([]);
  const [allTaggedImages, setAllTaggedImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tagSearch, setTagSearch] = useState('');
  const [totalImages, setTotalImages] = useState(0);
  const [tagSortMode, setTagSortMode] = useState(() => {
    return localStorage.getItem('pnc-bytag-sort') || 'recent';
  });
  const [tagSortAsc, setTagSortAsc] = useState(() => {
    return localStorage.getItem('pnc-bytag-sort-asc') === 'true';
  });
  const [allTagsData, setAllTagsData] = useState([]);  // Full tag objects with count/lastUsed

  const tabConfig = [
    { label: 'Most Liked', endpoint: 'most-liked', icon: <FavoriteIcon /> },
    { label: 'Most Viewed', endpoint: 'most-viewed', icon: <VisibilityIcon /> },
    { label: 'Bookmarked', endpoint: 'bookmarked', icon: <BookmarkIcon /> },
    { label: 'By Tag', endpoint: 'tags' }
  ];

  useEffect(() => {
    setLoading(true);
    setImages([]);
    setSelectedTags([]);
    setTagSearch('');

    const tab = tabConfig[activeTab];
    if (tab.endpoint === 'tags') {
      // Fetch tags, tagged images, and total count
      Promise.all([
        fetch(`/api/users/${userId}/tags`).then(r => r.json()),
        fetch(`/api/users/${userId}/stats/tagged`).then(r => r.json()),
        fetch('/api/images/list?limit=0').then(r => r.json())
      ])
        .then(([tagsData, taggedImages, imageList]) => {
          setAllTagsData(tagsData);  // Full objects with name, lastUsed, count
          setTags(tagsData.map(t => t.name));
          setAllTaggedImages(taggedImages);
          setTotalImages(imageList.total);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      fetch(`/api/users/${userId}/stats/${tab.endpoint}`)
        .then(r => r.json())
        .then(setImages)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [userId, activeTab]);

  // Filter images when selected tags change
  useEffect(() => {
    if (activeTab !== 3) return;

    if (selectedTags.length === 0) {
      setImages([]);
    } else {
      // Filter to images that have ALL selected tags
      const filtered = allTaggedImages.filter(img =>
        selectedTags.every(tag => img.tags?.includes(tag))
      );
      setImages(filtered);
    }
  }, [activeTab, selectedTags, allTaggedImages]);

  // Re-fetch tags when they're updated externally
  useEffect(() => {
    if (activeTab !== 3 || !tagUpdates || Object.keys(tagUpdates).length === 0) return;

    // Refresh tag data
    Promise.all([
      fetch(`/api/users/${userId}/tags`).then(r => r.json()),
      fetch(`/api/users/${userId}/stats/tagged`).then(r => r.json())
    ])
      .then(([tagsData, taggedImages]) => {
        setAllTagsData(tagsData);  // Full objects with name, lastUsed, count
        setTags(tagsData.map(t => t.name));
        setAllTaggedImages(taggedImages);
        // Remove any selected tags that no longer exist
        const validTags = tagsData.map(t => t.name);
        setSelectedTags(prev => prev.filter(tag => validTags.includes(tag)));
      })
      .catch(console.error);
  }, [tagUpdates, userId, activeTab]);

  // Compute available tags - from filtered images, or all tags if none selected
  const availableTags = (() => {
    if (activeTab !== 3) return [];

    // Get base tag list (either all tags or tags from filtered images)
    let tagList;
    if (selectedTags.length === 0) {
      tagList = [...allTagsData];
    } else {
      // Get unique tags from filtered images, with their metadata
      const tagNames = [...new Set(images.flatMap(img => img.tags || []))];
      tagList = tagNames.map(name => {
        const tagData = allTagsData.find(t => t.name === name);
        return tagData || { name, lastUsed: 0, count: 0 };
      });
    }

    // Sort based on tagSortMode and direction
    tagList.sort((a, b) => {
      let result;
      if (tagSortMode === 'recent') {
        result = b.lastUsed - a.lastUsed;
      } else if (tagSortMode === 'count') {
        result = b.count - a.count;
      } else {
        result = a.name.localeCompare(b.name);  // alpha
      }
      return tagSortAsc ? -result : result;
    });

    // Filter by search and return names
    return tagList
      .filter(tag => tag.name.toLowerCase().includes(tagSearch.toLowerCase()))
      .map(tag => tag.name);
  })();

  const handleTagSortClick = (sortMode) => {
    if (sortMode === tagSortMode) {
      // Clicking same sort mode toggles direction
      const newAsc = !tagSortAsc;
      setTagSortAsc(newAsc);
      localStorage.setItem('pnc-bytag-sort-asc', newAsc.toString());
    } else {
      setTagSortMode(sortMode);
      setTagSortAsc(false);  // Reset to default direction
      localStorage.setItem('pnc-bytag-sort', sortMode);
      localStorage.setItem('pnc-bytag-sort-asc', 'false');
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleLike = async (filename) => {
    try {
      const res = await fetch(`/api/users/${userId}/image/${encodeURIComponent(filename)}/like`, {
        method: 'POST'
      });
      const data = await res.json();
      setImages(prev => {
        const updated = prev.map(img =>
          img.filename === filename ? { ...img, likes: data.likes } : img
        );
        // Re-sort by likes on Most Liked tab
        return activeTab === 0 ? updated.sort((a, b) => b.likes - a.likes) : updated;
      });
      setAllTaggedImages(prev => prev.map(img =>
        img.filename === filename ? { ...img, likes: data.likes } : img
      ));
    } catch (err) {
      console.error('Failed to like:', err);
    }
  };

  const handleUnlike = async (filename) => {
    try {
      const res = await fetch(`/api/users/${userId}/image/${encodeURIComponent(filename)}/unlike`, {
        method: 'POST'
      });
      const data = await res.json();
      setImages(prev => {
        const updated = prev.map(img =>
          img.filename === filename ? { ...img, likes: data.likes } : img
        );
        // Re-sort by likes on Most Liked tab
        return activeTab === 0 ? updated.sort((a, b) => b.likes - a.likes) : updated;
      });
      setAllTaggedImages(prev => prev.map(img =>
        img.filename === filename ? { ...img, likes: data.likes } : img
      ));
    } catch (err) {
      console.error('Failed to unlike:', err);
    }
  };

  const renderLikeControl = (img) => (
    <Box
      sx={{
        position: 'absolute',
        bottom: 4,
        right: 4,
        bgcolor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 1,
        px: 0.5,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <LikeControl
        likes={img.likes}
        onLike={() => handleLike(img.filename)}
        onUnlike={() => handleUnlike(img.filename)}
        size="small"
      />
    </Box>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      );
    }

    // Tags tab - show tags at top, images below
    if (activeTab === 3) {
      return (
        <>
          {tags.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No tags yet
            </Typography>
          ) : (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {allTaggedImages.length} of {totalImages} images tagged • {tags.length} tags
                </Typography>
                <ToggleButtonGroup
                  value={tagSortMode}
                  exclusive
                  size="small"
                >
                  <ToggleButton
                    value="recent"
                    title={tagSortAsc && tagSortMode === 'recent' ? 'Oldest first' : 'Most recent first'}
                    onClick={() => handleTagSortClick('recent')}
                  >
                    <AccessTimeIcon fontSize="small" />
                    {tagSortMode === 'recent' && (
                      tagSortAsc ? <ArrowUpwardIcon sx={{ fontSize: 12, ml: 0.25 }} /> : <ArrowDownwardIcon sx={{ fontSize: 12, ml: 0.25 }} />
                    )}
                  </ToggleButton>
                  <ToggleButton
                    value="alpha"
                    title={tagSortAsc && tagSortMode === 'alpha' ? 'Z to A' : 'A to Z'}
                    onClick={() => handleTagSortClick('alpha')}
                  >
                    <SortByAlphaIcon fontSize="small" />
                    {tagSortMode === 'alpha' && (
                      tagSortAsc ? <ArrowUpwardIcon sx={{ fontSize: 12, ml: 0.25 }} /> : <ArrowDownwardIcon sx={{ fontSize: 12, ml: 0.25 }} />
                    )}
                  </ToggleButton>
                  <ToggleButton
                    value="count"
                    title={tagSortAsc && tagSortMode === 'count' ? 'Lowest count first' : 'Highest count first'}
                    onClick={() => handleTagSortClick('count')}
                  >
                    <TagIcon fontSize="small" />
                    {tagSortMode === 'count' && (
                      tagSortAsc ? <ArrowUpwardIcon sx={{ fontSize: 12, ml: 0.25 }} /> : <ArrowDownwardIcon sx={{ fontSize: 12, ml: 0.25 }} />
                    )}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <TextField
                size="small"
                placeholder="Search tags..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setTagSearch('');
                  }
                }}
                sx={{ mb: 2, width: { xs: '100%', sm: 300 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: tagSearch && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setTagSearch('')}
                        edge="end"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableTags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => toggleTag(tag)}
                    color={selectedTags.includes(tag) ? 'primary' : 'default'}
                    variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
              {availableTags.length === 0 && tagSearch && (
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  No tags match "{tagSearch}"
                </Typography>
              )}
              {selectedTags.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(201, 169, 89, 0.1)', border: '1px solid rgba(201, 169, 89, 0.2)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {images.length} image{images.length !== 1 ? 's' : ''} with {selectedTags.length} selected tag{selectedTags.length > 1 ? 's' : ''}:
                    </Typography>
                    <Button size="small" onClick={() => setSelectedTags([])}>
                      Clear all
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedTags.map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => toggleTag(tag)}
                        color="primary"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {images.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              {selectedTags.length > 0 ? 'No images match all selected tags' : 'Select a tag to view images'}
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 2,
              }}
            >
              {images.map((img) => (
                <Card
                  key={img.filename}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s' }
                  }}
                  onClick={() => onImageClick(img.filename, img)}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={`/api/images/file/${encodeURIComponent(img.filename)}`}
                      alt=""
                      sx={{ aspectRatio: '1', objectFit: 'cover' }}
                    />
                    {renderLikeControl(img)}
                  </Box>
                  <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
                    <Typography variant="body2" color="text.secondary">
                      {img.tags?.length || 0} tags
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </>
      );
    }

    // Other tabs - image grid only
    if (images.length === 0) {
      return (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          No images found
        </Typography>
      );
    }

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 2,
        }}
      >
        {images.map((img) => (
          <Card
            key={img.filename}
            sx={{
              cursor: 'pointer',
              '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s' }
            }}
            onClick={() => onImageClick(img.filename, img)}
          >
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                image={`/api/images/file/${encodeURIComponent(img.filename)}`}
                alt=""
                sx={{ aspectRatio: '1', objectFit: 'cover' }}
              />
              {renderLikeControl(img)}
            </Box>
            <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
              <Typography variant="body2" color="text.secondary">
                {activeTab === 0 && `${img.likes} likes`}
                {activeTab === 1 && `${img.viewCount} views`}
                {activeTab === 2 && <BookmarkIcon fontSize="small" color="primary" />}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={onClose}>
              Back
            </Button>
            <Typography variant="h6">Stats</Typography>
          </Box>

          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabConfig.map((tab, i) => (
              <Tab key={i} label={tab.label} />
            ))}
          </Tabs>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 3, flex: 1 }}>
        {renderContent()}
      </Container>
    </Box>
  );
}

export default StatsScreen;
