/**
 * Pure JS Implementation of Levenshtein Distance for spell/pronunciation correction.
 */

export function getLevenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Finds the closest matching word from a dictionary using Levenshtein distance.
 * Returns the best match if distance is within the threshold.
 */
export function getClosestMatch(word, dictionary, maxDistance = 2) {
  let bestMatch = null;
  let minDistance = Infinity;

  for (const dictWord of dictionary) {
    const dist = getLevenshteinDistance(word.toLowerCase(), dictWord.toLowerCase());
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = dictWord;
    }
  }

  if (minDistance <= maxDistance) {
    return { match: bestMatch, distance: minDistance };
  }
  
  return { match: null, distance: minDistance };
}
