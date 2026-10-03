import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
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
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Mount the BUYGEN API router
  app.use('/api', apiRouter);

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static assets from production build if available
    const distPath = path.join(__dirname, 'dist');
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
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`BUYGEN Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

