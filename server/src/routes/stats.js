import { Router } from 'express';
import {
  isValidUser,
  getImagesByLikes,
  getImagesByViews,
  getBookmarkedImages,
  getImagesByTag,
  getAllTaggedImages
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

// GET /api/users/:userId/stats/most-liked
router.get('/:userId/stats/most-liked', validateUser, (req, res) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const images = getImagesByLikes(userId, limit);
  res.json(images);
});

// GET /api/users/:userId/stats/most-viewed
router.get('/:userId/stats/most-viewed', validateUser, (req, res) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const images = getImagesByViews(userId, limit);
  res.json(images);
});

// GET /api/users/:userId/stats/bookmarked
router.get('/:userId/stats/bookmarked', validateUser, (req, res) => {
  const { userId } = req.params;
  const images = getBookmarkedImages(userId);
  res.json(images);
});

// GET /api/users/:userId/stats/by-tag/:tagName
router.get('/:userId/stats/by-tag/:tagName', validateUser, (req, res) => {
  const { userId, tagName } = req.params;
  const images = getImagesByTag(userId, decodeURIComponent(tagName));
  res.json(images);
});

// GET /api/users/:userId/stats/tagged - Get all images with any tags
router.get('/:userId/stats/tagged', validateUser, (req, res) => {
  const { userId } = req.params;
  const images = getAllTaggedImages(userId);
  res.json(images);
});

export default router;
