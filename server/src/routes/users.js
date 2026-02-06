import { Router } from 'express';
import {
  isValidUser,
  getImageData,
  incrementLike,
  decrementLike,
  toggleBookmark,
  setTags,
  setDescription,
  batchIncrementViews,
  getUserTagsWithUsage,
  getUserStats
} from '../services/userDataService.js';

const router = Router();

// Middleware to validate user
function validateUser(req, res, next) {
  const { userId } = req.params;
  if (!isValidUser(userId)) {
    return res.status(404).json({ error: 'User not found' });
  }
  next();
}

// GET /api/users/:userId/image/:filename - Get user data for image
router.get('/:userId/image/:filename', validateUser, (req, res) => {
  const { userId, filename } = req.params;
  const data = getImageData(userId, filename);
  res.json(data);
});

// POST /api/users/:userId/image/:filename/like - Increment like
router.post('/:userId/image/:filename/like', validateUser, (req, res) => {
  const { userId, filename } = req.params;
  const data = incrementLike(userId, filename);
  res.json(data);
});

// POST /api/users/:userId/image/:filename/unlike - Decrement like
router.post('/:userId/image/:filename/unlike', validateUser, (req, res) => {
  const { userId, filename } = req.params;
  const data = decrementLike(userId, filename);
  res.json(data);
});

// POST /api/users/:userId/image/:filename/bookmark - Toggle bookmark
router.post('/:userId/image/:filename/bookmark', validateUser, (req, res) => {
  const { userId, filename } = req.params;
  const data = toggleBookmark(userId, filename);
  res.json(data);
});

// POST /api/users/:userId/image/:filename/tags - Set tags
router.post('/:userId/image/:filename/tags', validateUser, (req, res) => {
  const { userId, filename } = req.params;
  const { tags } = req.body;

  if (!Array.isArray(tags)) {
    return res.status(400).json({ error: 'Tags must be an array' });
  }

  const data = setTags(userId, filename, tags);
  res.json(data);
});

// POST /api/users/:userId/image/:filename/description - Set description
router.post('/:userId/image/:filename/description', validateUser, (req, res) => {
  const { userId, filename } = req.params;
  const { description } = req.body;

  if (typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string' });
  }

  const data = setDescription(userId, filename, description);
  res.json(data);
});

// POST /api/users/:userId/views/batch - Batch view tracking
router.post('/:userId/views/batch', validateUser, (req, res) => {
  const { userId } = req.params;
  const { filenames } = req.body;

  if (!Array.isArray(filenames)) {
    return res.status(400).json({ error: 'Filenames must be an array' });
  }

  batchIncrementViews(userId, filenames);
  res.json({ success: true });
});

// GET /api/users/:userId/tags - Get all user tags with usage timestamps
router.get('/:userId/tags', validateUser, (req, res) => {
  const { userId } = req.params;
  const tags = getUserTagsWithUsage(userId);
  res.json(tags);
});

// GET /api/users/:userId/summary - Get user summary stats
router.get('/:userId/summary', validateUser, (req, res) => {
  const { userId } = req.params;
  const stats = getUserStats(userId);
  res.json(stats);
});

export default router;
