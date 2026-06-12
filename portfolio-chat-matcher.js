const MATCH_THRESHOLD = 0.38;
const PATTERN_WEIGHT = 0.45;
const EXAMPLE_WEIGHT = 0.55;

const ALLOWED_SUBJECT_TOKENS = new Set([
  'monica',
  'cortes',
  'she',
  'her',
  'hers',
  'you',
  'your',
  'yours',
  'i',
  'me',
  'my',
  'mine',
]);

const ALLOWED_PROPER_NOUNS = new Set([
  'berkeley',
  'california',
  'southern',
  'linkedin',
  'unlocked',
  'labs',
  'scriptchain',
  'nenos',
  'trubel',
]);

const COMMON_WORDS = new Set([
  'what',
  'when',
  'where',
  'who',
  'how',
  'why',
  'which',
  'does',
  'did',
  'do',
  'is',
  'are',
  'was',
  'were',
  'can',
  'the',
  'a',
  'an',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'and',
  'or',
  'about',
  'from',
  'with',
  'have',
  'has',
  'had',
  'be',
  'been',
  'being',
  'that',
  'this',
  'it',
  'its',
  'tell',
  'show',
  'find',
  'get',
  'see',
  'go',
  'went',
  'school',
  'year',
  'work',
  'job',
  'live',
  'based',
]);

export function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(text) {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  return normalized.split(' ').filter(Boolean);
}

function tokenOverlapScore(a, b) {
  const tokensA = tokenize(a);
  const tokensB = new Set(tokenize(b));
  if (!tokensA.length || !tokensB.size) return 0;

  let matches = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) matches += 1;
  });

  return matches / Math.max(tokensA.length, tokensB.size);
}

function patternScore(input, patterns) {
  const normalized = normalizeText(input);
  if (!normalized || !patterns?.length) return 0;

  let hits = 0;
  patterns.forEach((pattern) => {
    const normalizedPattern = normalizeText(pattern);
    if (normalizedPattern && normalized.includes(normalizedPattern)) {
      hits += 1;
    }
  });

  return Math.min(1, hits / Math.max(1, Math.ceil(patterns.length * 0.4)));
}

function exampleScore(input, intent) {
  const candidates = [intent.label, ...(intent.examples || [])];
  let best = 0;
  candidates.forEach((candidate) => {
    best = Math.max(best, tokenOverlapScore(input, candidate));
  });
  return best;
}

export function detectForeignName(rawInput) {
  const matches = String(rawInput || '').match(/\b[A-Z][a-z]{2,}\b/g);
  if (!matches) return null;

  const foreign = matches.find((name) => {
    const lower = name.toLowerCase();
    return (
      !ALLOWED_SUBJECT_TOKENS.has(lower) &&
      !COMMON_WORDS.has(lower) &&
      !ALLOWED_PROPER_NOUNS.has(lower)
    );
  });

  return foreign || null;
}

export function scoreIntent(input, intent) {
  const pattern = patternScore(input, intent.patterns);
  const example = exampleScore(input, intent);
  return pattern * PATTERN_WEIGHT + example * EXAMPLE_WEIGHT;
}

export function matchQuestion(input, faqData, options = {}) {
  const threshold = options.threshold ?? MATCH_THRESHOLD;
  const intents = faqData?.intents || [];

  if (!normalizeText(input)) {
    return {
      type: 'fallback',
      message: faqData?.fallbackMessage || "I'm sorry, I don't have the answer to that.",
      suggestions: pickSuggestions(intents, options.count ?? 3),
    };
  }

  const foreignName = detectForeignName(input);
  if (foreignName) {
    return {
      type: 'fallback',
      message: faqData?.fallbackMessage || "I'm sorry, I don't have the answer to that.",
      suggestions: pickSuggestions(intents, options.count ?? 3),
      reason: 'foreign_name',
    };
  }

  let bestIntent = null;
  let bestScore = 0;

  intents.forEach((intent) => {
    const score = scoreIntent(input, intent);
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  });

  if (bestIntent && bestScore >= threshold) {
    return {
      type: 'answer',
      intentId: bestIntent.id,
      answer: bestIntent.answer,
      score: bestScore,
    };
  }

  return {
    type: 'fallback',
    message: faqData?.fallbackMessage || "I'm sorry, I don't have the answer to that.",
    suggestions: pickSuggestions(intents, options.count ?? 3),
    score: bestScore,
  };
}

export function pickSuggestions(intents, count = 3) {
  const pool = [...(intents || [])];
  const selected = [];

  while (pool.length && selected.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    selected.push(pool.splice(index, 1)[0]);
  }

  return selected.map((intent) => intent.label);
}
