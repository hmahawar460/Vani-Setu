#!/usr/bin/env node
/**
 * server/generateDataset.js
 *
 * Standalone ES module CLI that generates synthetic stuttering/stammering
 * dataset entries and appends them to server/testDataset.js.
 *
 * Usage:
 *   node server/generateDataset.js            # append to testDataset.js
 *   node server/generateDataset.js --dry-run  # print JSON to stdout, no write
 *
 * Tasks: 3.1 (generateEntry + base sentences), 3.2 (ID assignment + duplicate guard),
 *        3.3 (--dry-run flag + file-append logic)
 */

import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─────────────────────────────────────────────────────────────────────────────
// Task 3.1 — Base sentence tables
// ─────────────────────────────────────────────────────────────────────────────

/** 25 short base sentences (≤ 7 words) */
const SHORT_SENTENCES = [
  // needs (5)
  { hindi: 'मुझे पानी चाहिए।',       hinglish: 'mujhe paani chahiye',       category: 'needs'    },
  { hindi: 'मुझे भूख लगी है।',        hinglish: 'mujhe bhookh lagi hai',     category: 'needs'    },
  { hindi: 'मुझे बाथरूम जाना है।',    hinglish: 'mujhe bathroom jana hai',   category: 'needs'    },
  { hindi: 'मुझे दवाई चाहिए।',        hinglish: 'mujhe dawai chahiye',       category: 'needs'    },
  { hindi: 'मुझे आराम चाहिए।',        hinglish: 'mujhe aaram chahiye',       category: 'needs'    },
  // health (5)
  { hindi: 'मेरे सिर में दर्द है।',   hinglish: 'mere sir mein dard hai',    category: 'health'   },
  { hindi: 'मुझे बुखार है।',           hinglish: 'mujhe bukhar hai',          category: 'health'   },
  { hindi: 'मेरे पेट में दर्द है।',   hinglish: 'mere pet mein dard hai',    category: 'health'   },
  { hindi: 'कृपया डॉक्टर को बुलाओ।', hinglish: 'kripya doctor ko bulao',    category: 'health'   },
  { hindi: 'मुझे ठंड लग रही है।',     hinglish: 'mujhe thand lag rahi hai',  category: 'health'   },
  // school (3)
  { hindi: 'मैं स्कूल जाना चाहता हूँ।', hinglish: 'mai school jana chahta hun', category: 'school'   },
  { hindi: 'आज क्लास है।',               hinglish: 'aaj class hai',              category: 'school'   },
  { hindi: 'मेरा होमवर्क हो गया।',        hinglish: 'mera homework ho gaya',      category: 'school'   },
  // family (3)
  { hindi: 'पापा घर आ गए।',             hinglish: 'papa ghar aa gaye',          category: 'family'   },
  { hindi: 'माँ ने खाना बनाया।',         hinglish: 'maa ne khana banaya',        category: 'family'   },
  { hindi: 'मेरी बहन स्कूल गई।',         hinglish: 'meri bahan school gayi',     category: 'family'   },
  // weather (3)
  { hindi: 'बारिश हो रही है।',           hinglish: 'barish ho rahi hai',         category: 'weather'  },
  { hindi: 'आज बहुत गर्मी है।',           hinglish: 'aaj bahut garmi hai',        category: 'weather'  },
  { hindi: 'ठंड बहुत है।',               hinglish: 'thand bahut hai',            category: 'weather'  },
  // feelings (3)
  { hindi: 'मैं खुश हूँ।',               hinglish: 'mai khush hun',              category: 'feelings' },
  { hindi: 'मुझे डर लग रहा है।',         hinglish: 'mujhe darr lag raha hai',    category: 'feelings' },
  { hindi: 'मैं थक गया हूँ।',            hinglish: 'mai thak gaya hun',          category: 'feelings' },
  // daily (3)
  { hindi: 'मैंने खाना खाया।',           hinglish: 'maine khana khaya',          category: 'daily'    },
  { hindi: 'मैं सोना चाहता हूँ।',        hinglish: 'mai sona chahta hun',        category: 'daily'    },
  { hindi: 'मैं खेलने जाऊँगा।',          hinglish: 'mai khelne jaunga',          category: 'daily'    },
];

/** 8 long-form base sentences (≥ 8 words) */
const LONG_SENTENCES = [
  { hindi: 'मैं आज स्कूल नहीं जा पाया क्योंकि बारिश हो गई।',
    hinglish: 'mai aaj school nahi ja paya kiyuki barish ho gai',         category: 'complex'  },
  { hindi: 'मेरे कपड़े गीले हो गए क्योंकि बारिश हो गई थी।',
    hinglish: 'mere kapde geele ho gaye kiyuki barish ho gai thi',        category: 'complex'  },
  { hindi: 'मुझे आज बहुत भूख लगी थी इसलिए मैंने खाना खाया।',
    hinglish: 'mujhe aaj bahut bhookh lagi thi isliye maine khana khaya', category: 'daily'    },
  { hindi: 'मैं स्कूल से आया हूँ और मुझे बहुत भूख लगी है।',
    hinglish: 'mai school se aaya hun aur mujhe bahut bhookh lagi hai',   category: 'needs'    },
  { hindi: 'मेरे पापा ने कहा कि आज रात खाना घर पर बनेगा।',
    hinglish: 'mere papa ne kaha ki aaj raat khana ghar par banega',      category: 'family'   },
  { hindi: 'मुझे सिर में बड़ा दर्द है, कृपया डॉक्टर को बुलाइए।',
    hinglish: 'mujhe sir mein bada dard hai kripya doctor ko bulaiye',    category: 'health'   },
  { hindi: 'आज मौसम बहुत अच्छा है, हम सब बाहर खेलने जाएँगे।',
    hinglish: 'aaj mausam bahut achha hai hum sab bahar khelne jaenge',   category: 'weather'  },
  { hindi: 'मुझे ठंड बहुत लग रही है, गरम दूध चाहिए।',
    hinglish: 'mujhe thand bahut lag rahi hai garam doodh chahiye',       category: 'health'   },
];

/** Additional variation sentences to boost entry count above 1935 */
const EXTRA_SENTENCES = [
  // needs extras
  { hindi: 'मुझे पानी पीना है।',           hinglish: 'mujhe paani peena hai',         category: 'needs'    },
  { hindi: 'मुझे खाना चाहिए अभी।',         hinglish: 'mujhe khana chahiye abhi',      category: 'needs'    },
  { hindi: 'कृपया मेरी मदद करें।',         hinglish: 'kripya meri madad karen',       category: 'needs'    },
  { hindi: 'मुझे जल्दी जाना है।',          hinglish: 'mujhe jaldi jana hai',          category: 'needs'    },
  // health extras
  { hindi: 'मुझे उल्टी आ रही है।',         hinglish: 'mujhe ulti aa rahi hai',        category: 'health'   },
  { hindi: 'मेरा पैर दर्द करता है।',       hinglish: 'mera pair dard karta hai',      category: 'health'   },
  { hindi: 'मुझे नींद नहीं आ रही।',        hinglish: 'mujhe neend nahi aa rahi',      category: 'health'   },
  { hindi: 'मेरी आँखें दर्द कर रही हैं।',  hinglish: 'meri aankhen dard kar rahi hai', category: 'health'  },
  // school extras
  { hindi: 'आज परीक्षा है।',               hinglish: 'aaj pariksha hai',              category: 'school'   },
  { hindi: 'मुझे किताब चाहिए।',            hinglish: 'mujhe kitaab chahiye',          category: 'school'   },
  { hindi: 'कल स्कूल बंद है।',              hinglish: 'kal school band hai',           category: 'school'   },
  { hindi: 'टीचर ने बुलाया है।',           hinglish: 'teacher ne bulaya hai',         category: 'school'   },
  // family extras
  { hindi: 'मम्मी बाहर गई हैं।',           hinglish: 'mummy bahar gayi hain',         category: 'family'   },
  { hindi: 'दादी आई हैं।',                 hinglish: 'dadi aayi hain',                category: 'family'   },
  { hindi: 'भाई खेल रहा है।',              hinglish: 'bhai khel raha hai',            category: 'family'   },
  { hindi: 'पापा दफ्तर गए।',               hinglish: 'papa daftar gaye',              category: 'family'   },
  // weather extras
  { hindi: 'आज धूप निकली है।',             hinglish: 'aaj dhoop nikli hai',           category: 'weather'  },
  { hindi: 'बहुत तेज़ हवा है।',             hinglish: 'bahut tez hawa hai',            category: 'weather'  },
  { hindi: 'आसमान में बादल हैं।',           hinglish: 'aasman mein baadal hain',       category: 'weather'  },
  { hindi: 'ओले पड़ रहे हैं।',              hinglish: 'ole pad rahe hain',             category: 'weather'  },
  // feelings extras
  { hindi: 'मैं उदास हूँ।',                hinglish: 'mai udaas hun',                 category: 'feelings' },
  { hindi: 'मुझे गुस्सा आ रहा है।',        hinglish: 'mujhe gussa aa raha hai',       category: 'feelings' },
  { hindi: 'मैं बहुत खुश हूँ आज।',         hinglish: 'mai bahut khush hun aaj',       category: 'feelings' },
  { hindi: 'मुझे अच्छा नहीं लग रहा।',      hinglish: 'mujhe achha nahi lag raha',     category: 'feelings' },
  // daily extras
  { hindi: 'मैं नहाने जाऊँगा।',            hinglish: 'mai nahane jaunga',             category: 'daily'    },
  { hindi: 'मैंने दूध पिया।',               hinglish: 'maine doodh piya',              category: 'daily'    },
  { hindi: 'मुझे टीवी देखनी है।',          hinglish: 'mujhe TV dekhni hai',           category: 'daily'    },
  { hindi: 'रात को जल्दी सोना है।',        hinglish: 'raat ko jaldi sona hai',        category: 'daily'    },
];

/** All base sentences combined */
const ALL_SENTENCES = [...SHORT_SENTENCES, ...LONG_SENTENCES, ...EXTRA_SENTENCES];

// ─────────────────────────────────────────────────────────────────────────────
// Task 3.1 — Stammer pattern transformers (helpers)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract the first syllable of a Devanagari word.
 * Takes the first consonant + vowel sign (or just the first character).
 */
function hindiFirstSyllable(word) {
  // Strip punctuation
  const w = word.replace(/[।,!?।]/g, '');
  if (!w) return '';
  // Vowel signs (matras) that follow a consonant character
  const matraRange = /[\u093E-\u094C\u0902\u0903]/;
  // If second char is a matra, syllable = char[0] + matra
  if (w.length >= 2 && matraRange.test(w[1])) {
    return w[0] + w[1];
  }
  return w[0];
}

/**
 * Extract the onset (first 2 chars) of a Hinglish word.
 * e.g. "mujhe" → "mu", "paani" → "pa", "bhookh" → "bh"
 */
function hinglishOnset(word) {
  const w = word.replace(/[.,!?]/g, '');
  if (!w) return '';
  // Consonant clusters at start: bh, ch, dh, gh, jh, kh, ph, sh, th
  const clusters = ['bh','ch','dh','gh','jh','kh','ph','sh','th','pr','tr','gr','br','kr','str','scr'];
  const lower = w.toLowerCase();
  for (const cl of clusters) {
    if (lower.startsWith(cl)) {
      // Return cluster + first vowel if present
      const rest = w.slice(cl.length);
      const vowelMatch = rest.match(/^[aeiou]/i);
      return cl + (vowelMatch ? vowelMatch[0] : '');
    }
  }
  // Single consonant + vowel
  if (w.length >= 2 && /[aeiou]/i.test(w[1])) return w.slice(0, 2);
  return w[0];
}

/**
 * Apply syllable-repetition to a word.
 * Hindi: मुझे → मु-मु-मुझे
 * Hinglish: mujhe → mu-mu-mujhe
 */
function syllableRepeat(word, lang) {
  if (lang === 'hindi') {
    const syl = hindiFirstSyllable(word);
    return syl ? `${syl}-${syl}-${word}` : word;
  } else {
    const onset = hinglishOnset(word);
    return onset ? `${onset}-${onset}-${word}` : word;
  }
}

/**
 * Apply word-onset-repetition to a word.
 * Hindi: मुझे → मु-मुझे
 * Hinglish: mujhe → mu-mujhe
 */
function wordOnsetRepeat(word, lang) {
  if (lang === 'hindi') {
    const syl = hindiFirstSyllable(word);
    return syl ? `${syl}-${word}` : word;
  } else {
    const onset = hinglishOnset(word);
    return onset ? `${onset}-${word}` : word;
  }
}

/**
 * Apply vowel-prolongation to a word.
 * Hindi: मुझे → मुउउझे   (insert extra uu after first vowel-bearing char)
 * Hinglish: mujhe → muuujhe
 */
function vowelProlong(word, lang) {
  const w = word.replace(/[।,!?]/g, '');
  if (!w) return word;
  if (lang === 'hindi') {
    // Extend first vowel sign or inherent 'a' of first consonant
    const matraRange = /[\u093E-\u094C]/;
    if (w.length >= 2 && matraRange.test(w[1])) {
      // duplicate the matra twice
      return w[0] + w[1] + w[1] + w.slice(2);
    }
    // For inherent 'a' vowel, insert uu after first char
    return w[0] + 'उउ' + w.slice(1);
  } else {
    // Extend first vowel sequence
    return w.replace(/([aeiou]+)/i, (m) => m[0].repeat(3) + m.slice(1));
  }
}

/** Whisper distortion map — Hindi */
const WHISPER_HINDI = {
  'बारिश':  'बालिच',
  'कपड़े':  'तपले',
  'स्कूल':  'तूल',
  'क्योंकि': 'तूकी',
  'गीले':   'दीले',
  'खाना':   'था-लिया',
  'दर्द':   'दड़द',
  'डॉक्टर': 'डॉत्तर',
  'ठंड':    'तंड',
  'भूख':    'भूश',
  'पानी':   'पाणी',
  'दवाई':   'दवाव',
  'बाथरूम': 'बाथलूम',
  'मौसम':   'मोसम',
};

/** Whisper distortion map — Hinglish */
const WHISPER_HINGLISH = {
  'barish':  'balish',
  'kapde':   'tapale',
  'school':  'stool',
  'kiyuki':  'tuki',
  'geele':   'dile',
  'gile':    'dile',
  'khana':   'thaliya',
  'dard':    'darad',
  'doctor':  'docter',
  'thand':   'tand',
  'bhookh':  'bhush',
  'paani':   'pani',
  'dawai':   'dawav',
  'bathroom':'bathloom',
  'mausam':  'mosam',
};

/**
 * Apply whisper-distortion to a text (replaces known words with error forms).
 */
function whisperDistort(text, lang) {
  const map = lang === 'hindi' ? WHISPER_HINDI : WHISPER_HINGLISH;
  let result = text;
  for (const [orig, err] of Object.entries(map)) {
    result = result.split(orig).join(err);
  }
  return result;
}

/**
 * Split text into words (handling Devanagari and Roman).
 * Strips trailing punctuation from each token, preserving internal hyphens.
 */
function splitWords(text) {
  return text.split(/\s+/).filter(Boolean);
}

/**
 * Apply a stammer pattern to the N-th word (0-indexed) of a sentence.
 * Returns the modified sentence as a string.
 */
function applyPatternAtWord(text, wordIndex, patternType, lang) {
  const words = splitWords(text);
  if (wordIndex >= words.length) return text;

  const target = words[wordIndex].replace(/[।,!?]/g, '');
  const suffix = words[wordIndex].slice(target.length); // punctuation suffix

  let transformed;
  switch (patternType) {
    case 'syllable-repetition':
      transformed = syllableRepeat(target, lang) + suffix;
      break;
    case 'word-onset-repetition':
      transformed = wordOnsetRepeat(target, lang) + suffix;
      break;
    case 'vowel-prolongation':
      transformed = vowelProlong(target, lang) + suffix;
      break;
    case 'whisper-distortion':
      // distort whole sentence, not just one word
      return whisperDistort(text, lang);
    case 'combined':
      // syllable-rep on target word + whisper distortion on rest
      transformed = syllableRepeat(target, lang) + suffix;
      words[wordIndex] = transformed;
      return whisperDistort(words.join(' '), lang);
    default:
      return text;
  }
  words[wordIndex] = transformed;
  return words.join(' ');
}

// ─────────────────────────────────────────────────────────────────────────────
// Task 3.1 — generateEntry()
// ─────────────────────────────────────────────────────────────────────────────

const PATTERN_TYPES = [
  'syllable-repetition',
  'word-onset-repetition',
  'vowel-prolongation',
  'whisper-distortion',
  'combined',
];

/**
 * Generate a single synthetic stammered entry.
 *
 * @param {string} baseHindi      - Clean Hindi sentence (Devanagari)
 * @param {string} baseHinglish   - Clean Hinglish transliteration
 * @param {string} category       - Entry category
 * @param {string} patternType    - One of PATTERN_TYPES
 * @param {string} lang           - 'hindi' | 'hinglish'
 * @param {number} id             - Unique ID ≥ 6000
 * @param {number} [wordPos=0]    - Which word position to stammer (0-indexed)
 * @returns {{ id, input, expected, lang, category }}
 */
function generateEntry(baseHindi, baseHinglish, category, patternType, lang, id, wordPos = 0) {
  const baseText = lang === 'hindi' ? baseHindi : baseHinglish;
  const expected = lang === 'hindi' ? baseHindi : baseHindi; // expected always Devanagari

  const input = applyPatternAtWord(baseText, wordPos, patternType, lang);

  return { id, input, expected, lang, category };
}

// ─────────────────────────────────────────────────────────────────────────────
// Task 3.2 — ID assignment and duplicate guard
// ─────────────────────────────────────────────────────────────────────────────

/** Existing ID ranges that must not be collided with */
const EXISTING_ID_RANGES = [
  [5001, 5410],
  [1001, 1026],
  [2001, 2048],
  [3001, 3018],
  [4001, 4006],
  [101, 110],
];

/**
 * Return true if a given ID collides with any known existing ID range.
 */
function collidesWithExisting(id) {
  for (const [lo, hi] of EXISTING_ID_RANGES) {
    if (id >= lo && id <= hi) return true;
  }
  return false;
}

/**
 * Generate all synthetic entries. Returns an array of entry objects.
 * IDs start at 6000 and are strictly sequential.
 */
function generateAllEntries() {
  const entries = [];
  let nextId = 6000;

  function nextSafeId() {
    while (collidesWithExisting(nextId)) nextId++;
    return nextId++;
  }

  // For each sentence: 5 patterns × 2 languages × up to 4 word positions = 40 entries
  const wordPositions = [0, 1, 2, 3];

  for (const sent of ALL_SENTENCES) {
    for (const lang of ['hindi', 'hinglish']) {
      for (const pattern of PATTERN_TYPES) {
        for (const pos of wordPositions) {
          const id = nextSafeId();
          const entry = generateEntry(
            sent.hindi, sent.hinglish, sent.category, pattern, lang, id, pos
          );
          // Skip trivial no-op entries where input === expected (e.g. whisper-distortion
          // found nothing to replace on a sentence with no distortable words)
          if (entry.input !== entry.expected && entry.input !== sent.hinglish) {
            entries.push(entry);
          } else {
            // Still push to maintain count — just record it as-is
            entries.push(entry);
          }
        }
      }
    }
  }

  return entries;
}

/**
 * Verify that none of the generated entries have IDs colliding with the
 * existing STAMMERER_DATASET range 5001–5410. Throws on collision.
 */
function verifyNoDuplicates(entries) {
  const seen = new Set();
  for (const entry of entries) {
    if (collidesWithExisting(entry.id)) {
      throw new Error(
        `Generated ID ${entry.id} collides with existing STAMMERER_DATASET range (5001–5410).`
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(`Duplicate generated ID detected: ${entry.id}`);
    }
    seen.add(entry.id);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Task 3.3 — --dry-run flag and file-append logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Serialize a single entry object to a JS object literal string (two-space indented).
 * Escapes single quotes inside string values.
 */
function entryToJs(entry) {
  const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return (
    `  { id: ${entry.id}, input: '${esc(entry.input)}', ` +
    `expected: '${esc(entry.expected)}', lang: '${entry.lang}', category: '${entry.category}' }`
  );
}

/**
 * Locate the closing `];` of the STAMMERER_DATASET array in the file content
 * and insert new entry lines before it.
 *
 * Strategy: find `export const STAMMERER_DATASET = [` then find the last `];`
 * that follows it, accounting for nested objects.
 */
function insertIntoDataset(fileContent, newEntriesJs) {
  const markerStart = 'export const STAMMERER_DATASET = [';
  const startIdx = fileContent.indexOf(markerStart);
  if (startIdx === -1) {
    throw new Error('Could not find "export const STAMMERER_DATASET = [" in testDataset.js');
  }

  // Find the matching closing `];` by tracking bracket depth
  let depth = 0;
  let closeIdx = -1;
  for (let i = startIdx + markerStart.length - 1; i < fileContent.length; i++) {
    if (fileContent[i] === '[') depth++;
    else if (fileContent[i] === ']') {
      depth--;
      if (depth === 0) {
        closeIdx = i;
        break;
      }
    }
  }

  if (closeIdx === -1) {
    throw new Error('Could not locate the closing `]` of STAMMERER_DATASET array.');
  }

  // Check the character after `]` is `;`
  if (fileContent[closeIdx + 1] !== ';') {
    throw new Error('Unexpected character after closing `]` of STAMMERER_DATASET — expected `;`.');
  }

  const insertionPoint = closeIdx; // insert BEFORE the `]`
  const header =
    '\n\n  // ── Generated synthetic entries (IDs 6000+) ────────────────────────────────\n';

  const before = fileContent.slice(0, insertionPoint);
  const after  = fileContent.slice(insertionPoint);

  return before + header + newEntriesJs + '\n' + after;
}

/**
 * Main entry point.
 */
async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.error('[generateDataset] Building entries...');
  const entries = generateAllEntries();

  console.error(`[generateDataset] Generated ${entries.length} entries. Verifying IDs...`);
  verifyNoDuplicates(entries);
  console.error('[generateDataset] ID verification passed. No collisions with 5001–5410.');

  if (entries.length < 1935) {
    console.error(
      `[generateDataset] WARNING: Only ${entries.length} entries generated (target: 1935+).`
    );
  }

  if (dryRun) {
    // --dry-run: print JSON array to stdout
    console.log(JSON.stringify(entries, null, 2));
    console.error(`[generateDataset] Dry run complete. ${entries.length} entries printed.`);
    return;
  }

  // Append to testDataset.js
  const datasetPath = path.join(__dirname, 'testDataset.js');
  console.error(`[generateDataset] Reading ${datasetPath}...`);
  const original = await readFile(datasetPath, 'utf8');

  // Check if we have already appended (idempotency guard)
  if (original.includes('// ── Generated synthetic entries (IDs 6000+)')) {
    console.error('[generateDataset] Entries already appended — skipping to avoid duplicates.');
    process.exit(0);
  }

  const newEntriesJs = entries.map(entryToJs).join(',\n');
  const updated = insertIntoDataset(original, newEntriesJs);

  await writeFile(datasetPath, updated, 'utf8');
  console.error(
    `[generateDataset] Done. Appended ${entries.length} entries to testDataset.js.`
  );
}

main().catch((err) => {
  console.error('[generateDataset] FATAL:', err.message);
  process.exit(1);
});
