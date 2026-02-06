import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

function LikeControl({ likes, onLike, onUnlike, size = 'medium' }) {
  const sizes = {
    small: { icon: 18, button: 12, font: 9, box: 18 },
    medium: { icon: 28, button: 16, font: 12, box: 28 },
  };
  const s = sizes[size] || sizes.medium;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton size="small" onClick={onUnlike} disabled={likes === 0} sx={{ p: 0.5 }}>
        <RemoveIcon sx={{ fontSize: s.button }} />
      </IconButton>
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 0.5, width: s.box, height: s.box }}>
        <FavoriteIcon color={likes > 0 ? 'primary' : 'disabled'} sx={{ fontSize: s.icon }} />
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            color: likes > 0 ? 'background.default' : 'text.disabled',
            fontWeight: 'bold',
            fontSize: s.font,
            lineHeight: 1,
          }}
        >
          {likes}
        </Typography>
      </Box>
      <IconButton size="small" onClick={onLike} disabled={likes >= 9} sx={{ p: 0.5 }}>
        <AddIcon sx={{ fontSize: s.button }} />
      </IconButton>
    </Box>
  );
}

export default LikeControl;
