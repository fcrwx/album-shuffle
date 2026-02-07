import { useState, useEffect, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import Draggable from 'react-draggable';

function DraggablePaper(props) {
  const nodeRef = useRef(null);
  return (
    <Draggable nodeRef={nodeRef} handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper ref={nodeRef} {...props} />
    </Draggable>
  );
}

function DescriptionDialog({ userId, filename, onClose, onDescriptionUpdated }) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}/image/${encodeURIComponent(filename)}`)
      .then(r => r.json())
      .then(data => {
        setDescription(data.description || '');
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load description:', err);
        setLoading(false);
      });
  }, [userId, filename]);

  const handleSave = async () => {
    try {
      await fetch(`/api/users/${userId}/image/${encodeURIComponent(filename)}/description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });
      if (onDescriptionUpdated) onDescriptionUpdated(filename, description);
      onClose();
    } catch (err) {
      console.error('Failed to save description:', err);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperComponent={DraggablePaper}
      PaperProps={{
        sx: { bgcolor: 'background.paper' }
      }}
    >
      <DialogTitle id="draggable-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'grab', '&:active': { cursor: 'grabbing' } }}>
        Description
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TextField
            autoFocus
            multiline
            rows={6}
            fullWidth
            placeholder="Add a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DescriptionDialog;
