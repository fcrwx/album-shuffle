import { Router } from 'express';
import { existsSync } from 'fs';
import { getShuffledImages, getImagePath, refreshImageCache } from '../services/imageService.js';
import { loadUserData } from '../services/userDataService.js';
import { feedBatchSize } from '../config.js';

const router = Router();

// GET /api/images/list - Get shuffled image list with optional filters
router.get('/list', (req, res) => {
  const seed = req.query.seed || Date.now();
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || feedBatchSize;
  const userId = req.query.userId;

  // Filter flags (all must be true if specified - AND logic)
  const filterLiked = req.query.liked === 'true';
  const filterBookmarked = req.query.bookmarked === 'true';
  const filterTagged = req.query.tagged === 'true';
  const filterUntagged = req.query.untagged === 'true';

  const hasFilters = filterLiked || filterBookmarked || filterTagged || filterUntagged;

  let allImages = getShuffledImages(seed);

  // Apply filters if any are set and userId is provided
  if (hasFilters && userId) {
    const userData = loadUserData(userId);
    allImages = allImages.filter(filename => {
      const imgData = userData.images[filename];

      // If no data exists for this image, it fails all positive filters
      if (!imgData) {
        return filterUntagged && !filterLiked && !filterBookmarked && !filterTagged;
      }

      // Check each filter condition (AND logic)
      if (filterLiked && !(imgData.likes > 0)) return false;
      if (filterBookmarked && !imgData.bookmarked) return false;
      if (filterTagged && !(imgData.tags && imgData.tags.length > 0)) return false;
      if (filterUntagged && imgData.tags && imgData.tags.length > 0) return false;

      return true;
    });
  }

  const images = allImages.slice(offset, offset + limit);

  res.json({
    images,
    offset,
    limit,
    total: allImages.length,
    hasMore: offset + limit < allImages.length
  });
});

// GET /api/images/file/:filename - Serve image file
router.get('/file/:filename', (req, res) => {
  const { filename } = req.params;
  const imagePath = getImagePath(filename);

  if (!imagePath) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  if (!existsSync(imagePath)) {
    return res.status(404).json({ error: 'Image not found' });
  }

  // Set aggressive caching headers (7 days)
  res.set({
    'Cache-Control': 'public, max-age=604800, immutable',
    'Expires': new Date(Date.now() + 604800000).toUTCString()
  });

  res.sendFile(imagePath);
});

// POST /api/images/refresh - Refresh image cache (admin)
router.post('/refresh', (req, res) => {
  const images = refreshImageCache();
  res.json({ message: 'Cache refreshed', count: images.length });
});

export default router;
