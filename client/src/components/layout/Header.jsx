import { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Badge from '@mui/material/Badge';
import CloseIcon from '@mui/icons-material/Close';
import BarChartIcon from '@mui/icons-material/BarChart';
import FilterListIcon from '@mui/icons-material/FilterList';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LabelOffIcon from '@mui/icons-material/LabelOff';
import NotesIcon from '@mui/icons-material/Notes';

function Header({ appTitle, users, currentUser, onUserChange, onStatsClick, onHomeClick, filters, onFiltersChange, showStats }) {
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [userStats, setUserStats] = useState({});

  const activeFilterCount = Object.values(filters || {}).filter(Boolean).length;

  useEffect(() => {
    if (userDialogOpen) {
      // Fetch stats for all users when dialog opens
      users.forEach(user => {
        fetch(`/api/users/${user.id}/summary`)
          .then(r => r.json())
          .then(stats => {
            setUserStats(prev => ({ ...prev, [user.id]: stats }));
          })
          .catch(console.error);
      });
    }
  }, [userDialogOpen, users]);

  const handleUserSelect = (user) => {
    onUserChange(user);
    setUserDialogOpen(false);
  };

  const handleFilterChange = (key) => {
    onFiltersChange({ ...filters, [key]: !filters[key] });
  };

  const getInitial = (name) => name.charAt(0).toUpperCase();

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: 'background.paper' }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="h1"
            onClick={onHomeClick}
            sx={{
              flexGrow: 1,
              color: 'primary.main',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 }
            }}
          >
            {appTitle}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {!showStats && (
              <IconButton
                onClick={() => setFilterDialogOpen(true)}
                sx={{
                  bgcolor: activeFilterCount > 0 ? 'rgba(201, 169, 89, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: activeFilterCount > 0 ? 'primary.main' : 'text.secondary',
                  '&:hover': { bgcolor: 'rgba(201, 169, 89, 0.3)' }
                }}
              >
                <Badge badgeContent={activeFilterCount} color="primary">
                  <FilterListIcon />
                </Badge>
              </IconButton>
            )}

            <IconButton
              onClick={onStatsClick}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                color: 'text.secondary',
                '&:hover': { bgcolor: 'rgba(201, 169, 89, 0.3)', color: 'primary.main' }
              }}
            >
              <BarChartIcon />
            </IconButton>

            <Avatar
              onClick={() => setUserDialogOpen(true)}
              sx={{
                bgcolor: 'rgba(201, 169, 89, 0.2)',
                color: 'primary.main',
                cursor: 'pointer',
                fontFamily: '"Cinzel", Georgia, serif',
                fontWeight: 600,
                width: 40,
                height: 40,
                '&:hover': { bgcolor: 'rgba(201, 169, 89, 0.3)' }
              }}
            >
              {getInitial(currentUser.displayName)}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Selection Dialog */}
      <Dialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Switch User</Typography>
          <IconButton onClick={() => setUserDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List>
            {users.map(user => {
              const stats = userStats[user.id];
              const isSelected = user.id === currentUser.id;
              return (
                <ListItemButton
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  selected={isSelected}
                  sx={{
                    py: 2,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(201, 169, 89, 0.1)',
                    },
                    '&.Mui-selected:hover': {
                      bgcolor: 'rgba(201, 169, 89, 0.15)',
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: isSelected ? 'primary.main' : 'text.secondary',
                        color: 'background.default',
                        fontFamily: '"Cinzel", Georgia, serif',
                        fontWeight: 600,
                      }}
                    >
                      {getInitial(user.displayName)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.displayName}
                    secondary={
                      stats
                        ? `${stats.totalViews} viewed, ${stats.totalLikes} likes`
                        : 'Loading...'
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Filter Feed</Typography>
          <IconButton onClick={() => setFilterDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Show images matching all selected criteria:
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters?.liked || false}
                  onChange={() => handleFilterChange('liked')}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FavoriteIcon fontSize="small" color={filters?.liked ? 'primary' : 'inherit'} />
                  Liked
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters?.bookmarked || false}
                  onChange={() => handleFilterChange('bookmarked')}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BookmarkIcon fontSize="small" color={filters?.bookmarked ? 'primary' : 'inherit'} />
                  Bookmarked
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters?.tagged || false}
                  onChange={() => handleFilterChange('tagged')}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalOfferIcon fontSize="small" color={filters?.tagged ? 'primary' : 'inherit'} />
                  Tagged
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters?.untagged || false}
                  onChange={() => handleFilterChange('untagged')}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LabelOffIcon fontSize="small" color={filters?.untagged ? 'primary' : 'inherit'} />
                  Untagged
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters?.described || false}
                  onChange={() => handleFilterChange('described')}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotesIcon fontSize="small" color={filters?.described ? 'primary' : 'inherit'} />
                  Has Description
                </Box>
              }
            />
          </FormGroup>
          {activeFilterCount > 0 && (
            <Button
              onClick={() => onFiltersChange({ liked: false, bookmarked: false, tagged: false, untagged: false, described: false })}
              sx={{ mt: 2 }}
            >
              Clear all filters
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Header;
