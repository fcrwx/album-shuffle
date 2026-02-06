import express from 'express';
import compression from 'compression';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { serverPort, users, appTitle } from './config.js';
import { scanImages } from './services/imageService.js';
import imagesRouter from './routes/images.js';
import usersRouter from './routes/users.js';
import statsRouter from './routes/stats.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/images', imagesRouter);
app.use('/api/users', usersRouter);
app.use('/api/users', statsRouter);

// Config endpoint
app.get('/api/config', (req, res) => {
  res.json({ appTitle, users });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
const clientDist = join(__dirname, '../../client/dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(join(clientDist, 'index.html'));
  });
}

// Scan images on startup
console.log('Scanning images directory...');
const imageCount = scanImages().length;
console.log(`Found ${imageCount} images`);

// Start server
app.listen(serverPort, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${serverPort}`);
});
