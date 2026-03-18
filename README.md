# zlink
Simple URL Shortener

## Overview

**zlink** is a simple, fast URL shortener built with Node.js, Express, and TypeScript. It exposes a REST API and a clean web UI.

## Features

- Shorten any `http://` or `https://` URL to a compact 7-character code
- Instant redirect when visiting a short link
- Visit stats for every short link
- Simple, responsive web UI

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
npm install
npm run build
npm start
```

The server starts on `http://localhost:3000` (override with `PORT` env var).

### Development

```bash
npm install
npm run dev   # runs with ts-node (no build step required)
```

### Test

```bash
npm test
```

## API

### `POST /api/shorten`

Shorten a URL.

**Request body**
```json
{ "url": "https://example.com/very/long/path" }
```

**Response** `201`
```json
{
  "code": "aBcD123",
  "shortUrl": "http://localhost:3000/aBcD123",
  "originalUrl": "https://example.com/very/long/path"
}
```

### `GET /:code`

Redirects (HTTP 301) to the original URL.

### `GET /api/stats/:code`

Returns visit statistics.

**Response** `200`
```json
{
  "code": "aBcD123",
  "originalUrl": "https://example.com/very/long/path",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "visits": 42
}
```

## Project Structure

```
zlink/
├── src/
│   ├── app.ts       # Express app setup
│   ├── routes.ts    # API route handlers
│   ├── server.ts    # HTTP server entry point
│   ├── store.ts     # In-memory link store
│   └── types.ts     # TypeScript interfaces
├── public/
│   ├── index.html   # Web UI
│   └── 404.html     # Not-found page
└── tests/
    └── app.test.ts  # Integration tests
```
