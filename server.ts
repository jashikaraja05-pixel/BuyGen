import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/api.ts';

dotenv.config();

// Filter benign Firestore internal gRPC idle stream warnings
const originalStderrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = ((chunk: any, ...args: any[]) => {
  const str = typeof chunk === 'string' ? chunk : chunk?.toString?.() || '';
  if (
    str.includes('Disconnecting idle stream') ||
    str.includes('Timed out waiting for new targets') ||
    str.includes("GrpcConnection RPC 'Listen' stream")
  ) {
    return true;
  }
  return (originalStderrWrite as any)(chunk, ...args);
}) as any;

const originalConsoleError = console.error.bind(console);
console.error = (...args: any[]) => {
  const first = args[0];
  if (typeof first === 'string' && (
    first.includes('Disconnecting idle stream') ||
    first.includes('Timed out waiting for new targets') ||
    first.includes("GrpcConnection RPC 'Listen' stream")
  )) {
    return;
  }
  originalConsoleError(...args);
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const distPath = path.join(__dirname, 'dist');
  const distExists = fs.existsSync(path.join(distPath, 'index.html'));

  // Production detection:
  // 1. Explicit NODE_ENV === 'production'
  // 2. Cloud Run environment (K_SERVICE or K_REVISION set by Cloud Run)
  // 3. Or built static dist exists and not in explicit development mode
  const isCloudRun = Boolean(process.env.K_SERVICE || process.env.K_REVISION);
  const isProd = process.env.NODE_ENV === 'production' || isCloudRun || (process.env.NODE_ENV !== 'development' && distExists);

  app.use(express.json());

  // Mount the BUYGEN API router
  app.use('/api', apiRouter);

  if (isProd) {
    // Serve pre-built static production bundle without Vite dev server or HMR websockets
    app.use(express.static(distPath));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) {
          res.status(200).send('BUYGEN Full-Stack API & Frontend running. Start Vite with "npm run dev" or build with "npm run build".');
        }
      });
    });
  } else {
    // In local development only, dynamically mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true' ? undefined : false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`BUYGEN Server running in ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'} mode on http://0.0.0.0:${PORT}`);
  });
}

startServer();
