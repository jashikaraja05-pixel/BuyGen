import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/api.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Mount the BUYGEN API router
app.use('/api', apiRouter);

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

app.listen(PORT, () => {
  console.log(`BUYGEN Production/API Server running on port ${PORT}`);
});
