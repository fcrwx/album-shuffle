import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'fs';
import { join, dirname } from 'path';
import { dataDir, users } from '../config.js';

// In-memory cache for user data
const userDataCache = new Map();
const pendingWrites = new Map();
const WRITE_DEBOUNCE_MS = 1000;

function getUserFilePath(userId) {
  return join(dataDir, `${userId}.json`);
}

function createDefaultUserData(userId) {
  return {
    userId,
    images: {},
    tags: [],
    tagUsage: {}  // { tagName: lastUsedTimestamp }
  };
}

export function loadUserData(userId) {
  // Check cache first
  if (userDataCache.has(userId)) {
    return userDataCache.get(userId);
  }

  const filePath = getUserFilePath(userId);
  let data;

  if (existsSync(filePath)) {
    try {
      data = JSON.parse(readFileSync(filePath, 'utf-8'));
    } catch (err) {
      console.error(`Failed to read user data for ${userId}:`, err.message);
      data = createDefaultUserData(userId);
    }
  } else {
    data = createDefaultUserData(userId);
  }

  userDataCache.set(userId, data);
  return data;
}

function scheduleSave(userId) {
  // Clear any pending write
  if (pendingWrites.has(userId)) {
    clearTimeout(pendingWrites.get(userId));
  }

  // Schedule debounced write
  const timeout = setTimeout(() => {
    saveUserDataSync(userId);
    pendingWrites.delete(userId);
  }, WRITE_DEBOUNCE_MS);

  pendingWrites.set(userId, timeout);
}

function saveUserDataSync(userId) {
  const data = userDataCache.get(userId);
  if (!data) return;

  const filePath = getUserFilePath(userId);

  // Ensure data directory exists
  if (!existsSync(dirname(filePath))) {
    mkdirSync(dirname(filePath), { recursive: true });
  }

  try {
    // Atomic write: write to temp file, then rename
    const tempPath = `${filePath}.tmp`;
    writeFileSync(tempPath, JSON.stringify(data, null, 2));
    renameSync(tempPath, filePath);
  } catch (err) {
    // Fallback to direct write
    writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
}

export function saveUserData(userId) {
  scheduleSave(userId);
}

export function getImageData(userId, filename) {
  const userData = loadUserData(userId);
  return userData.images[filename] || {
    likes: 0,
    bookmarked: false,
    tags: [],
    description: '',
    viewCount: 0
  };
}

export function updateImageData(userId, filename, updates) {
  const userData = loadUserData(userId);

  if (!userData.images[filename]) {
    userData.images[filename] = {
      likes: 0,
      bookmarked: false,
      tags: [],
      description: '',
      viewCount: 0
    };
  }

  Object.assign(userData.images[filename], updates);
  saveUserData(userId);

  return userData.images[filename];
}

export function incrementLike(userId, filename) {
  const userData = loadUserData(userId);

  if (!userData.images[filename]) {
    userData.images[filename] = {
      likes: 0,
      bookmarked: false,
      tags: [],
      description: '',
      viewCount: 0
    };
  }

  if (userData.images[filename].likes < 9) {
    userData.images[filename].likes += 1;
  }
  saveUserData(userId);

  return userData.images[filename];
}

export function decrementLike(userId, filename) {
  const userData = loadUserData(userId);

  if (!userData.images[filename]) {
    userData.images[filename] = {
      likes: 0,
      bookmarked: false,
      tags: [],
      description: '',
      viewCount: 0
    };
  }

  if (userData.images[filename].likes > 0) {
    userData.images[filename].likes -= 1;
  }
  saveUserData(userId);

  return userData.images[filename];
}

export function toggleBookmark(userId, filename) {
  const userData = loadUserData(userId);

  if (!userData.images[filename]) {
    userData.images[filename] = {
      likes: 0,
      bookmarked: false,
      tags: [],
      description: '',
      viewCount: 0
    };
  }

  userData.images[filename].bookmarked = !userData.images[filename].bookmarked;
  saveUserData(userId);

  return userData.images[filename];
}

export function setTags(userId, filename, tags) {
  const userData = loadUserData(userId);

  if (!userData.images[filename]) {
    userData.images[filename] = {
      likes: 0,
      bookmarked: false,
      tags: [],
      description: '',
      viewCount: 0
    };
  }

  userData.images[filename].tags = tags;

  // Ensure tagUsage exists (for legacy data)
  if (!userData.tagUsage) {
    userData.tagUsage = {};
  }

  // Recalculate global tags list from all images (removes unused tags)
  const usedTags = new Set();
  for (const img of Object.values(userData.images)) {
    if (img.tags) {
      img.tags.forEach(tag => usedTags.add(tag));
    }
  }

  // Update timestamps for current tags
  const now = Date.now();
  tags.forEach(tag => {
    userData.tagUsage[tag] = now;
  });

  // Clean up tagUsage for removed tags
  for (const tag of Object.keys(userData.tagUsage)) {
    if (!usedTags.has(tag)) {
      delete userData.tagUsage[tag];
    }
  }

  userData.tags = [...usedTags].sort();

  saveUserData(userId);

  return userData.images[filename];
}

export function setDescription(userId, filename, description) {
  const userData = loadUserData(userId);

  if (!userData.images[filename]) {
    userData.images[filename] = {
      likes: 0,
      bookmarked: false,
      tags: [],
      description: '',
      viewCount: 0
    };
  }

  userData.images[filename].description = description;
  saveUserData(userId);

  return userData.images[filename];
}

export function batchIncrementViews(userId, filenames) {
  const userData = loadUserData(userId);

  for (const filename of filenames) {
    if (!userData.images[filename]) {
      userData.images[filename] = {
        likes: 0,
        bookmarked: false,
        tags: [],
        description: '',
        viewCount: 0
      };
    }
    userData.images[filename].viewCount += 1;
  }

  saveUserData(userId);
}

export function getUserTags(userId) {
  const userData = loadUserData(userId);
  return userData.tags;
}

export function getUserTagsWithUsage(userId) {
  const userData = loadUserData(userId);
  const tagUsage = userData.tagUsage || {};

  // Count how many images use each tag
  const tagCounts = {};
  for (const img of Object.values(userData.images)) {
    if (img.tags) {
      img.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  }

  return userData.tags.map(tag => ({
    name: tag,
    lastUsed: tagUsage[tag] || 0,
    count: tagCounts[tag] || 0
  }));
}

export function getImagesByLikes(userId, limit = 50) {
  const userData = loadUserData(userId);
  return Object.entries(userData.images)
    .filter(([_, data]) => data.likes > 0)
    .sort((a, b) => b[1].likes - a[1].likes)
    .slice(0, limit)
    .map(([filename, data]) => ({ filename, ...data }));
}

export function getImagesByViews(userId, limit = 50) {
  const userData = loadUserData(userId);
  return Object.entries(userData.images)
    .filter(([_, data]) => data.viewCount > 0)
    .sort((a, b) => b[1].viewCount - a[1].viewCount)
    .slice(0, limit)
    .map(([filename, data]) => ({ filename, ...data }));
}

export function getBookmarkedImages(userId) {
  const userData = loadUserData(userId);
  return Object.entries(userData.images)
    .filter(([_, data]) => data.bookmarked)
    .map(([filename, data]) => ({ filename, ...data }));
}

export function getImagesByTag(userId, tagName) {
  const userData = loadUserData(userId);
  return Object.entries(userData.images)
    .filter(([_, data]) => data.tags.includes(tagName))
    .map(([filename, data]) => ({ filename, ...data }));
}

export function getAllTaggedImages(userId) {
  const userData = loadUserData(userId);
  return Object.entries(userData.images)
    .filter(([_, data]) => data.tags && data.tags.length > 0)
    .map(([filename, data]) => ({ filename, ...data }));
}

// Validate user exists
export function isValidUser(userId) {
  return users.some(u => u.id === userId);
}

// Get user summary stats
export function getUserStats(userId) {
  const userData = loadUserData(userId);
  let totalViews = 0;
  let totalLikes = 0;
  let totalBookmarks = 0;
  let taggedImages = 0;

  for (const img of Object.values(userData.images)) {
    totalViews += img.viewCount || 0;
    totalLikes += img.likes || 0;
    if (img.bookmarked) totalBookmarks++;
    if (img.tags && img.tags.length > 0) taggedImages++;
  }

  return {
    totalViews,
    totalLikes,
    totalBookmarks,
    taggedImages,
    totalTags: userData.tags?.length || 0
  };
}

// Initialize data directory
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}
