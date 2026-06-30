/**
 * In-memory LRU cache for LLM correction results.
 *
 * Why: At 10,000 users, many will say the same common phrases
 * ("मुझे पानी चाहिए", "मुझे भूख लगी है" etc.).
 * Caching these saves Groq API calls and handles burst traffic
 * without hitting rate limits.
 *
 * Cache key: normalized input text (lowercase, trimmed)
 * TTL: 1 hour (corrections don't change often)
 * Max size: 500 entries (covers most common phrases)
 */

const MAX_SIZE = 500;
const TTL_MS   = 60 * 60 * 1000; // 1 hour

const store = new Map(); // key → { value, expiresAt, hits }

function normalizeKey(text) {
  return String(text ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function cacheGet(text) {
  const key = normalizeKey(text);
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  entry.hits++;
  return entry.value;
}

export function cacheSet(text, value) {
  const key = normalizeKey(text);

  // Evict oldest entry if at capacity
  if (store.size >= MAX_SIZE) {
    const oldest = store.keys().next().value;
    store.delete(oldest);
  }

  store.set(key, {
    value,
    expiresAt: Date.now() + TTL_MS,
    hits: 0,
  });
}

export function cacheStats() {
  let totalHits = 0;
  let expired = 0;
  const now = Date.now();

  for (const [key, entry] of store.entries()) {
    if (now > entry.expiresAt) {
      store.delete(key);
      expired++;
    } else {
      totalHits += entry.hits;
    }
  }

  return {
    size: store.size,
    totalHits,
    expired,
    maxSize: MAX_SIZE,
  };
}
