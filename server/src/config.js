import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, '../..', 'config.json');

let config;
try {
  config = JSON.parse(readFileSync(configPath, 'utf-8'));
} catch (err) {
  console.error('Failed to load config.json:', err.message);
  process.exit(1);
}

export const appTitle = config.appTitle || 'Album Shuffle';
export const users = config.users;
export const serverPort = config.server?.port || 3000;
export const feedBatchSize = config.feed?.batchSize || 10;
export const imagesDir = process.env.IMAGES_DIR || join(__dirname, '../../images');
export const dataDir = join(__dirname, '../data');

export default config;
