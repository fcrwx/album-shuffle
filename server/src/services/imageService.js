import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import seedrandom from 'seedrandom';
import { imagesDir } from '../config.js';

const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

let cachedImageList = null;

export function scanImages() {
  if (cachedImageList) {
    return cachedImageList;
  }

  try {
    const files = readdirSync(imagesDir);
    cachedImageList = files.filter(file => {
      const ext = extname(file).toLowerCase();
      if (!SUPPORTED_EXTENSIONS.has(ext)) return false;

      try {
        const stat = statSync(join(imagesDir, file));
        return stat.isFile();
      } catch {
        return false;
      }
    });

    console.log(`Scanned ${cachedImageList.length} images from ${imagesDir}`);
    return cachedImageList;
  } catch (err) {
    console.error('Failed to scan images directory:', err.message);
    return [];
  }
}

export function getShuffledImages(seed) {
  const images = [...scanImages()];
  const rng = seedrandom(String(seed));

  // Fisher-Yates shuffle with seeded RNG
  for (let i = images.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [images[i], images[j]] = [images[j], images[i]];
  }

  return images;
}

export function getImagePath(filename) {
  // Sanitize filename to prevent directory traversal
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '');
  if (sanitized !== filename) {
    return null;
  }
  return join(imagesDir, filename);
}

export function refreshImageCache() {
  cachedImageList = null;
  return scanImages();
}
