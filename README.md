# Album Shuffle

A personal image gallery for browsing, organizing, and rating images from a local collection. Supports multiple users with individual metadata (likes, bookmarks, tags, descriptions, view counts).

## Features

- **Shuffled feed** - Browse images in a randomized order with infinite scroll
- **Multi-user support** - Each user maintains their own ratings and tags
- **Likes** - Rate images from 0-9
- **Bookmarks** - Save favorites for quick access
- **Tags** - Organize images with custom tags, autocomplete support
- **Descriptions** - Add notes to any image
- **View tracking** - Track which images you've seen
- **Stats** - View most liked, most viewed, bookmarked, and tagged images
- **Fullscreen viewer** - Zoom and pan with mouse/touch

## Tech Stack

- **Frontend**: React, Material UI, Vite
- **Backend**: Node.js, Express
- **Storage**: File-based JSON (no database required)
- **Deployment**: Docker

## Quick Start

### 1. Configure

```bash
cp config.example.json config.json
cp docker/.env.example docker/.env
```

Edit `config.json` to set your app title and users:

```json
{
  "appTitle": "My Gallery",
  "users": [
    { "id": "user1", "displayName": "User 1" }
  ],
  "server": { "port": 3000 },
  "feed": { "batchSize": 10 }
}
```

Edit `docker/.env` to set your paths:

```
IMAGES_PATH=/path/to/your/images
DATA_PATH=/path/to/album-shuffle/server/data
```

### 2. Run with Docker

```bash
cd docker
docker compose up --build -d
```

Access at http://localhost:3000

### 3. Run for Development

```bash
# Terminal 1 - Backend
cd server
npm install
npm run dev

# Terminal 2 - Frontend
cd client
npm install
npm run dev
```

Access at http://localhost:5173

## Project Structure

```
├── client/                 # React frontend
│   └── src/
│       ├── components/     # UI components
│       └── hooks/          # Custom React hooks
├── server/                 # Express backend
│   └── src/
│       ├── routes/         # API endpoints
│       └── services/       # Business logic
├── docker/                 # Docker configuration
├── config.example.json     # Example configuration
└── images/                 # Your image collection (gitignored)
```

## License

MIT
