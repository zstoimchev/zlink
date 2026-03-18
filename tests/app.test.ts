import request from 'supertest';
import app from '../src/app';
import * as store from '../src/store';

beforeEach(() => {
  store.clear();
});

describe('POST /api/shorten', () => {
  it('returns 201 with a short URL for a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/some/long/path' });

    expect(res.status).toBe(201);
    expect(res.body.code).toBeDefined();
    expect(res.body.shortUrl).toMatch(/^http:\/\/127\.0\.0\.1/);
    expect(res.body.originalUrl).toBe('https://example.com/some/long/path');
  });

  it('returns 400 when url is missing', async () => {
    const res = await request(app).post('/api/shorten').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 for an invalid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 for a non-http URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'ftp://example.com/file' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('generates unique codes for different requests', async () => {
    const res1 = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/a' });
    const res2 = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/b' });

    expect(res1.body.code).not.toBe(res2.body.code);
  });
});

describe('GET /:code (redirect)', () => {
  it('redirects to the original URL', async () => {
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/redirect-target' });

    const { code } = shortenRes.body;
    const res = await request(app).get(`/${code}`);

    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('https://example.com/redirect-target');
  });

  it('returns 404 for an unknown code', async () => {
    const res = await request(app).get('/unknown-code-xyz');
    expect(res.status).toBe(404);
  });

  it('increments visit count on redirect', async () => {
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/visits' });

    const { code } = shortenRes.body;

    await request(app).get(`/${code}`);
    await request(app).get(`/${code}`);

    const statsRes = await request(app).get(`/api/stats/${code}`);
    expect(statsRes.body.visits).toBe(2);
  });
});

describe('GET /api/stats/:code', () => {
  it('returns stats for an existing short link', async () => {
    const shortenRes = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/stats-test' });

    const { code } = shortenRes.body;
    const res = await request(app).get(`/api/stats/${code}`);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(code);
    expect(res.body.originalUrl).toBe('https://example.com/stats-test');
    expect(res.body.visits).toBe(0);
    expect(res.body.createdAt).toBeDefined();
  });

  it('returns 404 for an unknown code', async () => {
    const res = await request(app).get('/api/stats/nonexistent-code');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
