import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { handleReportBug } from './api/report-bug';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  // API routes FIRST
  app.post('/api/report-bug', (req, res) => {
    handleReportBug(req, res);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LitasDark server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
