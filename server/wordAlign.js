/**
 * Word alignment with pronunciation profile + neighbouring word context.
 */

import { matchWordByPronunciation } from './pronunciationMatch.js';

const PUNCT_RE = /[\u0964,.?!]/g;

function tokenize(value = '') {
  return String(value)
    .replace(PUNCT_RE, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function normalizeToken(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^\w\u0900-\u097F]/g, '');
}

export function tokensMatch(a, b) {
  const na = normalizeToken(a);
  const nb = normalizeToken(b);
  return na.length > 0 && na === nb;
}

function findCorrectionTarget(raw, corrections) {
  const key = String(raw).trim().toLowerCase();
  const hit = corrections.find((c) => c.raw.toLowerCase() === key);
  return hit?.corrected ?? null;
}

function resolveWord(hw, exp, corrections, pronunciationProfile, prevExp, nextExp) {
  if (!hw) return exp;
  if (tokensMatch(hw, exp)) return exp;

  const fromPron = matchWordByPronunciation(hw, exp, pronunciationProfile);
  if (fromPron && tokensMatch(fromPron, exp)) return exp;

  const fromCorr = findCorrectionTarget(hw, corrections);
  if (fromCorr && tokensMatch(fromCorr, exp)) return exp;

  // Context: if heard is closer to neighbour, still anchor to expected test word
  if (prevExp && tokensMatch(hw, prevExp)) return exp;
  if (nextExp && tokensMatch(hw, nextExp)) return exp;

  return exp;
}

/**
 * Align heard text to expected with pronunciation + prev/next word context.
 */
export function alignWithContext(heard, expected, corrections = [], pronunciationProfile = [], englishAlt = null) {
  const expectedWords = tokenize(expected);
  if (!expectedWords.length) return heard;

  const heardWords = tokenize(heard);
  const isSingleWord = expectedWords.length === 1;

  if (isSingleWord) {
    const target = expectedWords[0];
    const heardJoined = heardWords.join(' ') || String(heard).trim();

    if (tokensMatch(heardJoined, target)) return target;
    if (englishAlt && tokensMatch(heardJoined, englishAlt)) return target;

    const fromPron = matchWordByPronunciation(heardJoined, target, pronunciationProfile);
    if (fromPron) return target;

    const fromCorr = findCorrectionTarget(heardJoined, corrections);
    if (fromCorr && (tokensMatch(fromCorr, target) || (englishAlt && tokensMatch(fromCorr, englishAlt)))) {
      return target;
    }

    return target;
  }

  const aligned = [];
  for (let i = 0; i < expectedWords.length; i++) {
    const exp = expectedWords[i];
    const hw = heardWords[i] ?? '';
    const prevExp = expectedWords[i - 1];
    const nextExp = expectedWords[i + 1];
    aligned.push(resolveWord(hw, exp, corrections, pronunciationProfile, prevExp, nextExp));
  }

  return aligned.join(' ');
}

/** @deprecated use alignWithContext */
export function alignToExpected(heard, expected, corrections = [], englishAlt = null) {
  return alignWithContext(heard, expected, corrections, [], englishAlt);
}

export function scoreWordAlignment(expected, corrected) {
  const expWords = tokenize(expected).map(normalizeToken);
  const corrWords = tokenize(corrected).map(normalizeToken);
  const maxLen = Math.max(expWords.length, corrWords.length);
  if (maxLen === 0) return 0;

  let matched = 0;
  expWords.forEach((word, index) => {
    if (corrWords[index] === word) matched++;
  });

  return Math.round((matched / maxLen) * 100);
}
