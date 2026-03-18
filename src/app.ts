import express, { Request, Response } from 'express';
import path from 'path';
import rateLimit from 'express-rate-limit';
import * as store from './store';
import apiRouter from './routes';

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// API routes
app.use('/api', limiter, apiRouter);

// Redirect short code to original URL
app.get('/:code', limiter, (req: Request, res: Response) => {
  const { code } = req.params;
  const link = store.findByCode(code);

  if (!link) {
    return res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
  }

  store.incrementVisits(code);
  return res.redirect(301, link.originalUrl);
});

export default app;
