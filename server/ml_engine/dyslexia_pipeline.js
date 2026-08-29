import { getClosestMatch } from './levenshtein.js';
import { NGramModel } from './ngram_model.js';
import { getContextSimilarity } from './tfidf_similarity.js';

// Global N-Gram model trained on our datasets
const globalNGram = new NGramModel();

// A simple dictionary for fallback substitutions (can be loaded from DB in production)
const fallbackDict = [
  "क्या", "कहाँ", "कैसे", "मैं", "तुम", "आप", "वह", "यह",
  "स्कूल", "खाना", "पानी", "जाना", "आना", "करना", "खेलना", "है", "था", "थी", "हूँ"
];

export function initializeDyslexiaModel(trainingSentences) {
  globalNGram.train(trainingSentences);
  console.log('[dyslexia-ml] N-Gram model trained on offline dataset.');
}

/**
 * Generates sentence candidates by attempting to fix mispronounced words.
 */
function generateCandidates(rawText, userCorrections) {
  const tokens = rawText.split(/\s+/);
  const candidates = [rawText]; // Always include the original

  // Build a custom dictionary for this patient
  const patientDict = userCorrections.map(c => c.corrected).concat(fallbackDict);

  // Try to fix 1 or 2 misspelled words using Levenshtein distance
  const modifiedTokens = [...tokens];
  let changed = false;

  for (let i = 0; i < modifiedTokens.length; i++) {
    const word = modifiedTokens[i];
    // Check if word is known to be wrong from user DB
    const dbMatch = userCorrections.find(c => c.raw === word);
    if (dbMatch) {
      modifiedTokens[i] = dbMatch.corrected;
      changed = true;
    } else {
      // If it's a completely unknown gibberish word, find closest match in patient dict
      const lev = getClosestMatch(word, patientDict, 2);
      if (lev.match) {
        modifiedTokens[i] = lev.match;
        changed = true;
      }
    }
  }

  if (changed) {
    candidates.push(modifiedTokens.join(' '));
  }

  // Generate some permutations for rethinking loop
  for (let c of userCorrections) {
    if (rawText.includes(c.raw)) {
      candidates.push(rawText.replace(new RegExp(c.raw, 'g'), c.corrected));
    }
  }

  // deduplicate
  return [...new Set(candidates)];
}

/**
 * Pure JS, offline machine learning pipeline for Dyslexia.
 */
export async function runDyslexiaMLPipeline(rawText, userCorrections, scenarioContext) {
  console.log(`[dyslexia-ml] Starting offline ML pipeline for: "${rawText}"`);
  
  // 1. Generation Phase
  const candidates = generateCandidates(rawText, userCorrections);
  
  let bestCandidate = rawText;
  let highestConfidence = -Infinity;

  // 2. The Re-Think Loop (Scoring and Evaluating)
  console.log(`[dyslexia-ml] Re-think loop evaluating ${candidates.length} candidates...`);
  
  for (const candidate of candidates) {
    // Grammatical / Sense probability using N-Grams
    const grammarScore = globalNGram.scoreSentence(candidate);
    
    // Context Validation using TF-IDF / Cosine Similarity
    const contextScore = getContextSimilarity(candidate, scenarioContext);
    
    // Total Confidence Formula
    const confidence = (contextScore * 10) + grammarScore;
    
    console.log(`[dyslexia-ml] Candidate: "${candidate}" | Grammar: ${grammarScore.toFixed(2)} | Context: ${contextScore.toFixed(2)} | Confidence: ${confidence.toFixed(2)}`);

    if (confidence > highestConfidence) {
      highestConfidence = confidence;
      bestCandidate = candidate;
    }
  }

  console.log(`[dyslexia-ml] Best result chosen: "${bestCandidate}" with confidence ${highestConfidence.toFixed(2)}`);
  
  return bestCandidate;
}
