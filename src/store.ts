import { ShortLink } from './types';

const store = new Map<string, ShortLink>();

export function save(link: ShortLink): void {
  store.set(link.code, link);
}

export function findByCode(code: string): ShortLink | undefined {
  return store.get(code);
}

export function incrementVisits(code: string): void {
  const link = store.get(code);
  if (link) {
    link.visits += 1;
  }
}

export function clear(): void {
  store.clear();
}
