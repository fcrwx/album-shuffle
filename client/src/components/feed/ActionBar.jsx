import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NotesIcon from '@mui/icons-material/Notes';
import LikeControl from '../common/LikeControl';

function ActionBar({ imageData, onLike, onUnlike, onBookmark, onTagsClick, onDescriptionClick }) {
  const { likes, bookmarked, tags, description } = imageData;

  return (
    <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <LikeControl likes={likes} onLike={onLike} onUnlike={onUnlike} />

        <IconButton onClick={onBookmark} color={bookmarked ? 'primary' : 'default'}>
          {bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        </IconButton>

        <IconButton
          onClick={onTagsClick}
          color={tags.length > 0 ? 'primary' : 'default'}
        >
          <LocalOfferIcon />
        </IconButton>
        {tags.length > 0 && (
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
            {tags.length}
          </Typography>
        )}

        <IconButton
          onClick={onDescriptionClick}
          color={description ? 'primary' : 'default'}
        >
          <NotesIcon />
        </IconButton>
      </Box>

      {tags.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          {tags.slice(0, 3).map(tag => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
          {tags.length > 3 && (
            <Chip label={`+${tags.length - 3}`} size="small" color="primary" variant="outlined" />
          )}
        </Box>
      )}
    </Box>
  );
}

export default ActionBar;
