/**
 * Per-IP rate limiter — prevents a single user from flooding the API.
 *
 * Limits:
 * - /api/correct:    30 requests per minute per IP
 * - /api/transcribe: 20 requests per minute per IP
 * - /api/test/*:     60 requests per minute per IP
 *
 * Uses a sliding window counter stored in memory.
 * At 10,000 users this stays well within Node.js memory limits (~2MB).
 */

const WINDOW_MS = 60 * 1000; // 1 minute

const counters = new Map(); // ip → { count, windowStart }

function cleanup() {
  const now = Date.now();
  for (const [ip, data] of counters.entries()) {
    if (now - data.windowStart > WINDOW_MS * 2) {
      counters.delete(ip);
    }
  }
}

// Clean up stale entries every 5 minutes
setInterval(cleanup, 5 * 60 * 1000);

/**
 * Returns middleware that limits requests to `limit` per minute per IP.
 */
export function rateLimit(limit) {
  return (req, res, next) => {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';

    const now = Date.now();
    const data = counters.get(ip);

    if (!data || now - data.windowStart > WINDOW_MS) {
      // New window
      counters.set(ip, { count: 1, windowStart: now });
      return next();
    }

    if (data.count >= limit) {
      return res.status(429).json({
        error: 'बहुत ज़्यादा अनुरोध। एक मिनट बाद कोशिश करें।',
        retryAfter: Math.ceil((WINDOW_MS - (now - data.windowStart)) / 1000),
      });
    }

    data.count++;
    return next();
  };
}
