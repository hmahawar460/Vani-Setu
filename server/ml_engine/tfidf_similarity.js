/**
 * Pure JS Implementation of TF-IDF and Cosine Similarity for Context Validation.
 */

function tokenize(text) {
  return text.toLowerCase().replace(/[.,!?।'"“”]/g, ' ').trim().split(/\s+/).filter(Boolean);
}

function calculateTF(tokens) {
  const tf = {};
  const total = tokens.length;
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  for (const token in tf) {
    tf[token] = tf[token] / total;
  }
  return tf;
}

function calculateIDF(documents) {
  const idf = {};
  const N = documents.length;
  const df = {};

  for (const doc of documents) {
    const uniqueTokens = new Set(tokenize(doc));
    for (const token of uniqueTokens) {
      df[token] = (df[token] || 0) + 1;
    }
  }

  for (const token in df) {
    idf[token] = Math.log(N / (df[token] + 1));
  }
  return idf;
}

function computeTFIDF(text, idf) {
  const tokens = tokenize(text);
  const tf = calculateTF(tokens);
  const tfidf = {};

  for (const token in tf) {
    // If word not in IDF (unseen), assign a neutral weight
    const weight = idf[token] !== undefined ? idf[token] : 1.0;
    tfidf[token] = tf[token] * weight;
  }
  return tfidf;
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

  for (const key of allKeys) {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Checks if the answer matches the expected scenario context.
 * In production, IDF would be trained on a large corpus.
 * For instant use, we do simple term overlap weighting.
 */
export function getContextSimilarity(answer, context) {
  if (!context || !answer) return 1.0; // No context to match against
  
  const docs = [context, answer];
  const idf = calculateIDF(docs);
  
  const vecA = computeTFIDF(context, idf);
  const vecB = computeTFIDF(answer, idf);
  
  return cosineSimilarity(vecA, vecB);
}
