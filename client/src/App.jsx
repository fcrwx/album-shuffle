import { useState, useEffect, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Header from './components/layout/Header';
import Feed from './components/feed/Feed';
import FullscreenViewer from './components/viewer/FullscreenViewer';
import TagsDialog from './components/dialogs/TagsDialog';
import DescriptionDialog from './components/dialogs/DescriptionDialog';
import StatsScreen from './components/stats/StatsScreen';

function App() {
  const [appTitle, setAppTitle] = useState('Album Shuffle');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionSeed, setSessionSeed] = useState(() => Date.now());
  const [showStats, setShowStats] = useState(false);

  const [viewerImage, setViewerImage] = useState(null);
  const [tagsDialog, setTagsDialog] = useState({ open: false, filename: null });
  const [descDialog, setDescDialog] = useState({ open: false, filename: null });
  const [tagUpdates, setTagUpdates] = useState({});
  const [likeUpdates, setLikeUpdates] = useState({});
  const [descriptionUpdates, setDescriptionUpdates] = useState({});
  const [filters, setFilters] = useState({ liked: false, bookmarked: false, tagged: false, untagged: false, described: false });
  const savedScrollPosition = useRef(0);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.appTitle) {
          setAppTitle(data.appTitle);
          document.title = data.appTitle;
        }
        setUsers(data.users);
        if (data.users.length > 0) {
          const savedUser = localStorage.getItem('pnc-user');
          const user = data.users.find(u => u.id === savedUser) || data.users[0];
          setCurrentUser(user);
        }
      })
      .catch(err => console.error('Failed to load config:', err));
  }, []);

  const handleUserChange = useCallback((user) => {
    setCurrentUser(user);
    localStorage.setItem('pnc-user', user.id);
    setSessionSeed(Date.now());
    setShowStats(false);
    setTagUpdates({});
    setLikeUpdates({});
    setDescriptionUpdates({});
    setFilters({ liked: false, bookmarked: false, tagged: false, untagged: false, described: false });
    window.scrollTo(0, 0);
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setSessionSeed(Date.now());
    window.scrollTo(0, 0);
  }, []);

  const openFullscreen = useCallback((filename, imageData) => {
    savedScrollPosition.current = window.scrollY;
    setViewerImage({ filename, ...imageData });
  }, []);

  const closeFullscreen = useCallback(() => {
    setViewerImage(null);
    requestAnimationFrame(() => {
      window.scrollTo(0, savedScrollPosition.current);
    });
  }, []);

  const openTagsDialog = useCallback((filename) => {
    setTagsDialog({ open: true, filename });
  }, []);

  const closeTagsDialog = useCallback(() => {
    setTagsDialog({ open: false, filename: null });
  }, []);

  const handleTagsUpdated = useCallback((filename, tags) => {
    // Update viewerImage if it's the same file
    if (viewerImage && viewerImage.filename === filename) {
      setViewerImage(prev => ({ ...prev, tags }));
    }
    // Track tag updates for Feed's ImageCards
    setTagUpdates(prev => ({ ...prev, [filename]: tags }));
  }, [viewerImage]);

  const handleLikesUpdated = useCallback((filename, likes) => {
    // Update viewerImage if it's the same file
    if (viewerImage && viewerImage.filename === filename) {
      setViewerImage(prev => ({ ...prev, likes }));
    }
    // Track like updates for Feed's ImageCards
    setLikeUpdates(prev => ({ ...prev, [filename]: likes }));
  }, [viewerImage]);

  const handleDescriptionUpdated = useCallback((filename, description) => {
    // Update viewerImage if it's the same file
    if (viewerImage && viewerImage.filename === filename) {
      setViewerImage(prev => ({ ...prev, description }));
    }
    // Track description updates for Feed's ImageCards
    setDescriptionUpdates(prev => ({ ...prev, [filename]: description }));
  }, [viewerImage]);

  const openDescDialog = useCallback((filename) => {
    setDescDialog({ open: true, filename });
  }, []);

  const closeDescDialog = useCallback(() => {
    setDescDialog({ open: false, filename: null });
  }, []);

  if (!currentUser) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        appTitle={appTitle}
        users={users}
        currentUser={currentUser}
        onUserChange={handleUserChange}
        onStatsClick={() => {
          savedScrollPosition.current = window.scrollY;
          setShowStats(true);
        }}
        onHomeClick={() => {
          setShowStats(false);
          setSessionSeed(Date.now());
          setTagUpdates({});
          setLikeUpdates({});
          setDescriptionUpdates({});
          setFilters({ liked: false, bookmarked: false, tagged: false, untagged: false, described: false });
          window.scrollTo(0, 0);
        }}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        showStats={showStats}
      />

      {showStats && (
        <StatsScreen
          userId={currentUser.id}
          onClose={() => {
            setShowStats(false);
            requestAnimationFrame(() => {
              window.scrollTo(0, savedScrollPosition.current);
            });
          }}
          onImageClick={openFullscreen}
          tagUpdates={tagUpdates}
        />
      )}

      <Box sx={{ display: showStats ? 'none' : 'block' }}>
        <Feed
          userId={currentUser.id}
          sessionSeed={sessionSeed}
          onImageClick={openFullscreen}
          onTagsClick={openTagsDialog}
          onDescriptionClick={openDescDialog}
          tagUpdates={tagUpdates}
          likeUpdates={likeUpdates}
          descriptionUpdates={descriptionUpdates}
          filters={filters}
        />
      </Box>

      {viewerImage && (
        <FullscreenViewer
          filename={viewerImage.filename}
          userId={currentUser.id}
          onClose={closeFullscreen}
          onTagsClick={openTagsDialog}
          onDescriptionClick={openDescDialog}
          tags={viewerImage.tags}
        />
      )}

      {tagsDialog.open && (
        <TagsDialog
          userId={currentUser.id}
          filename={tagsDialog.filename}
          onClose={closeTagsDialog}
          onTagsUpdated={handleTagsUpdated}
          onLikesUpdated={handleLikesUpdated}
        />
      )}

      {descDialog.open && (
        <DescriptionDialog
          userId={currentUser.id}
          filename={descDialog.filename}
          onClose={closeDescDialog}
          onDescriptionUpdated={handleDescriptionUpdated}
        />
      )}
    </Box>
  );
}

export default App;
