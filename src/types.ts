export interface ShortLink {
  code: string;
  originalUrl: string;
  createdAt: Date;
  visits: number;
}

export interface ShortenRequest {
  url: string;
}

export interface ShortenResponse {
  code: string;
  shortUrl: string;
  originalUrl: string;
}

export interface StatsResponse {
  code: string;
  originalUrl: string;
  createdAt: Date;
  visits: number;
}
