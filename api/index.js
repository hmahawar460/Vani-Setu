/**
 * LEGACY — Vercel Serverless Function wrapper.
 *
 * ⚠️  This file is kept for reference only.
 * The active deployment is now Railway.app / Render.com (see railway.toml / render.yaml).
 * Vercel deployment is no longer the primary target; this file is NOT used in production.
 *
 * Key: bodyParser must be false so Express can read the raw body stream.
 * The Promise wrapper ensures Vercel waits for async Express handlers.
 */

export const config = {
  api: {
    bodyParser: false,
  },
};

import app from '../server/index.js';

export default function handler(req, res) {
  return new Promise((resolve) => {
    const originalEnd = res.end.bind(res);
    res.end = (...args) => {
      originalEnd(...args);
      resolve();
    };
    app(req, res);
  });
}
