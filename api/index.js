import app from '../server/index.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Vercel serverless handler — wraps Express app
// Always returns JSON on error so the frontend never gets an HTML response
export default function handler(req, res) {
  // Safety net: if app failed to load, return JSON error immediately
  if (!app || typeof app !== 'function') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: 'Server failed to initialize. Check environment variables in Vercel dashboard.' });
  }

  return app(req, res);
}
