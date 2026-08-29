/**
 * Pure JS Implementation of an N-gram Language Model (Trigrams).
 * Used for checking grammar and sentence sense probability.
 */

export class NGramModel {
  constructor() {
    this.unigrams = new Map();
    this.bigrams = new Map();
    this.trigrams = new Map();
    this.totalWords = 0;
  }

  tokenize(text) {
    // Simple tokenizer for Hindi/English words
    return text.replace(/[.,!?।'"“”]/g, ' ').trim().split(/\s+/).filter(Boolean);
  }

  train(sentences) {
    for (const sentence of sentences) {
      const tokens = this.tokenize(sentence);
      
      for (let i = 0; i < tokens.length; i++) {
        const w1 = tokens[i];
        
        // Unigrams
        this.unigrams.set(w1, (this.unigrams.get(w1) || 0) + 1);
        this.totalWords++;

        // Bigrams
        if (i < tokens.length - 1) {
          const w2 = tokens[i + 1];
          const bg = `${w1} ${w2}`;
          this.bigrams.set(bg, (this.bigrams.get(bg) || 0) + 1);
        }

        // Trigrams
        if (i < tokens.length - 2) {
          const w2 = tokens[i + 1];
          const w3 = tokens[i + 2];
          const tg = `${w1} ${w2} ${w3}`;
          this.trigrams.set(tg, (this.trigrams.get(tg) || 0) + 1);
        }
      }
    }
  }

  /**
   * Scores a sentence based on trigram probability.
   * Higher score means higher probability of being grammatically correct and making sense.
   */
  scoreSentence(sentence) {
    const tokens = this.tokenize(sentence);
    if (tokens.length === 0) return 0;
    if (tokens.length === 1) {
      return (this.unigrams.get(tokens[0]) || 0) / (this.totalWords || 1);
    }

    let score = 0;
    
    // Evaluate using a simple backoff model (Trigram -> Bigram -> Unigram)
    for (let i = 0; i < tokens.length - 2; i++) {
      const w1 = tokens[i];
      const w2 = tokens[i+1];
      const w3 = tokens[i+2];

      const tgCount = this.trigrams.get(`${w1} ${w2} ${w3}`) || 0;
      const bgCount = this.bigrams.get(`${w1} ${w2}`) || 0;
      
      if (tgCount > 0 && bgCount > 0) {
        score += Math.log(tgCount / bgCount);
      } else if (bgCount > 0) {
        const uCount = this.unigrams.get(w1) || 0;
        if (uCount > 0) {
          score += Math.log(bgCount / uCount) * 0.4; // backoff penalty
        }
      } else {
        const uCount = this.unigrams.get(w3) || 0;
        score += Math.log((uCount + 0.1) / (this.totalWords || 1)) * 0.1; // extreme backoff
      }
    }

    return score;
  }
}
