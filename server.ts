// Import Express web framework and TypeScript-only request/response types for Node 22 compatibility
import express from 'express';
import type { Request, Response } from 'express';
// Import Node filesystem and path helpers for persistent cross-browser stats storage
import fs from 'node:fs/promises';
import path from 'node:path';

// Define the directory and file path where unique browser view and like records persist
const DATA_DIR = path.resolve(process.cwd(), '.data');
const STATS_FILE = path.join(DATA_DIR, 'site-stats.json');
// Read server port from environment or default to required preview port 3000
const PORT = Number(process.env.PORT || 3000);
// Prefix matching Vite's configured base URL path
const BASE_PATH = '/Website-Design-Project';

// Persistent JSON structure saved to disk
interface PersistedStats {
  viewerIds: string[];
  likedIds: string[];
}

// In-memory deduplicated sets holding unique browser identifiers for views and likes
const viewerIds = new Set<string>();
const likedIds = new Set<string>();
// Connected Server-Sent Events clients subscribed to real-time counter updates
const sseClients = new Set<Response>();
// Sequential write promise chain preventing concurrent file-write race conditions
let writeQueue: Promise<void> = Promise.resolve();

// Validate that incoming browser identifiers are safe alphanumeric/UUID strings
function isValidBrowserId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{8,128}$/.test(value);
}

// Load saved browser view and like sets from disk on server startup
async function loadPersistedStats(): Promise<void> {
  try {
    const raw = await fs.readFile(STATS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<PersistedStats>;
    if (Array.isArray(parsed.viewerIds)) {
      for (const id of parsed.viewerIds) {
        if (isValidBrowserId(id)) viewerIds.add(id);
      }
    }
    if (Array.isArray(parsed.likedIds)) {
      for (const id of parsed.likedIds) {
        if (isValidBrowserId(id)) likedIds.add(id);
      }
    }
  } catch {
    // Initialize cleanly with empty sets if the stats file does not exist yet
  }
}

// Queue an atomic disk write so stats survive server restarts without corruption
function persistStats(): Promise<void> {
  const snapshot: PersistedStats = {
    viewerIds: Array.from(viewerIds),
    likedIds: Array.from(likedIds)
  };

  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tempFile = `${STATS_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(snapshot, null, 2), 'utf8');
    await fs.rename(tempFile, STATS_FILE);
  }).catch((error) => {
    console.error('Failed to persist site stats:', error);
  });

  return writeQueue;
}

// Broadcast updated aggregate counts to every connected browser tab via SSE
function broadcastStats(): void {
  const payload = JSON.stringify({
    uniqueViews: viewerIds.size,
    likesCount: likedIds.size
  });

  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Build an Express router exposing stats read, view tracking, like toggling, and SSE streaming
function createApiRouter() {
  const router = express.Router();
  router.use(express.json({ limit: '16kb' }));

  // Return current unique browser view count, site like count, and caller's like state
  router.get('/site-stats', (req: Request, res: Response) => {
    const browserId = req.query.browserId;
    res.json({
      uniqueViews: viewerIds.size,
      likesCount: likedIds.size,
      hasLiked: isValidBrowserId(browserId) ? likedIds.has(browserId) : false
    });
  });

  // Stream live updates to open browsers whenever another browser views or likes the site
  router.get('/site-stats/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.add(res);
    res.write(
      `data: ${JSON.stringify({ uniqueViews: viewerIds.size, likesCount: likedIds.size })}\n\n`
    );

    const keepAlive = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch {
        clearInterval(keepAlive);
        sseClients.delete(res);
      }
    }, 25000);

    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients.delete(res);
    });
  });

  // Record a unique browser visitor ID once without double-counting page refreshes
  router.post('/site-stats/view', async (req: Request, res: Response) => {
    const browserId = req.body?.browserId;
    if (!isValidBrowserId(browserId)) {
      res.status(400).json({ error: 'Invalid browserId' });
      return;
    }

    const isNewBrowser = !viewerIds.has(browserId);
    if (isNewBrowser) {
      viewerIds.add(browserId);
      await persistStats();
      broadcastStats();
    }

    res.json({
      uniqueViews: viewerIds.size,
      likesCount: likedIds.size,
      hasLiked: likedIds.has(browserId)
    });
  });

  // Toggle the site-wide like status for a unique browser visitor ID
  router.post('/site-stats/like', async (req: Request, res: Response) => {
    const browserId = req.body?.browserId;
    if (!isValidBrowserId(browserId)) {
      res.status(400).json({ error: 'Invalid browserId' });
      return;
    }

    viewerIds.add(browserId);
    if (likedIds.has(browserId)) {
      likedIds.delete(browserId);
    } else {
      likedIds.add(browserId);
    }

    await persistStats();
    broadcastStats();

    res.json({
      uniqueViews: viewerIds.size,
      likesCount: likedIds.size,
      hasLiked: likedIds.has(browserId)
    });
  });

  return router;
}

// Initialize persistence, mount API and frontend handlers, and listen on port 3000
async function startServer(): Promise<void> {
  await loadPersistedStats();

  const app = express();
  const apiRouter = createApiRouter();

  // Mount API routes on both root /api and Vite's configured base path /Website-Design-Project/api
  app.use('/api', apiRouter);
  app.use(`${BASE_PATH}/api`, apiRouter);

  if (process.env.NODE_ENV !== 'production') {
    // Attach Vite dev middlewares dynamically during local development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve compiled static production bundle from dist under Vite's configured base path
    const distPath = path.resolve(process.cwd(), 'dist');
    app.get('/', (_req: Request, res: Response) => {
      res.redirect(`${BASE_PATH}/`);
    });
    app.use(BASE_PATH, express.static(distPath));
    app.get(`${BASE_PATH}/*`, (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicBridge server listening on http://0.0.0.0:${PORT}${BASE_PATH}/`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start CivicBridge server:', error);
  process.exit(1);
});
