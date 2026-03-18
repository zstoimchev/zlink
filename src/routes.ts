import { Router, Request, Response } from 'express';
import { customAlphabet } from 'nanoid';
import * as store from './store';
import { ShortenRequest, ShortenResponse, StatsResponse } from './types';

const router = Router();
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 7);

function isValidUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// POST /api/shorten
router.post('/shorten', (req: Request, res: Response) => {
  const { url } = req.body as ShortenRequest;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL. Must start with http:// or https://' });
  }

  const code = nanoid();
  store.save({ code, originalUrl: url, createdAt: new Date(), visits: 0 });

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const response: ShortenResponse = {
    code,
    shortUrl: `${baseUrl}/${code}`,
    originalUrl: url,
  };

  return res.status(201).json(response);
});

// GET /api/stats/:code
router.get('/stats/:code', (req: Request, res: Response) => {
  const { code } = req.params;
  const link = store.findByCode(code);

  if (!link) {
    return res.status(404).json({ error: 'Short link not found' });
  }

  const response: StatsResponse = {
    code: link.code,
    originalUrl: link.originalUrl,
    createdAt: link.createdAt,
    visits: link.visits,
  };

  return res.json(response);
});

export default router;
