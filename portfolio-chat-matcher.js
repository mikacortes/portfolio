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
  'healthcare',
  'nonprofit',
  'python',
  'tableau',
  'figma',
  'indesign',
  'jira',
  'squarespace',
  'wordpress',
  'knitting',
  'crochet',
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
  'design',
  'marketing',
  'product',
  'data',
  'analysis',
  'visual',
  'creative',
  'social',
  'campaign',
  'usability',
  'remote',
  'hybrid',
  'freelance',
  'contract',
  'industry',
  'process',
  'tools',
  'software',
  'available',
  'availability',
  'stakeholder',
  'stakeholders',
  'engineer',
  'engineers',
  'developer',
  'developers',
  'features',
  'feature',
  'trend',
  'trends',
  'collateral',
  'analytics',
  'visualization',
  'visualisation',
  'dataset',
  'datasets',
  'great',
  'good',
  'proud',
  'learning',
  'excited',
  'culture',
  'team',
  'overlap',
  'brief',
  'identity',
  'aesthetics',
  'prioritize',
  'interviews',
  'interview',
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

export function getActiveIntents(intents) {
  return (intents || []).filter((intent) => !intent.disabled);
}

export function matchQuestion(input, faqData, options = {}) {
  const threshold = options.threshold ?? MATCH_THRESHOLD;
  const intents = getActiveIntents(faqData?.intents);

  if (!normalizeText(input)) {
    return {
      type: 'fallback',
      message: faqData?.fallbackMessage || "I'm sorry, I don't have the answer to that.",
      suggestions: pickSuggestions(intents, options.count ?? 3, options.suggestionOptions).labels,
    };
  }

  const foreignName = detectForeignName(input);
  if (foreignName) {
    return {
      type: 'fallback',
      message: faqData?.fallbackMessage || "I'm sorry, I don't have the answer to that.",
      suggestions: pickSuggestions(intents, options.count ?? 3, options.suggestionOptions).labels,
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
    suggestions: pickSuggestions(intents, options.count ?? 3, options.suggestionOptions).labels,
    score: bestScore,
  };
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function isRelatedIntent(source, candidate) {
  if (!source || source.id === candidate.id) return false;
  if (source.related?.includes(candidate.id)) return true;
  if (source.category && candidate.category && source.category === candidate.category) {
    return true;
  }
  if (source.category === 'cross' || candidate.category === 'cross') {
    const crossCategories = new Set(['cross', 'design', 'data', 'product', 'marketing']);
    return crossCategories.has(source.category) && crossCategories.has(candidate.category);
  }
  return false;
}

export function pickSuggestions(intents, count = 3, options = {}) {
  const {
    excludeIds = new Set(),
    preferIntentId = null,
    relatedToInput = null,
    diversify = false,
  } = options;

  const active = getActiveIntents(intents);
  let pool = active.filter((intent) => !excludeIds.has(intent.id));

  if (pool.length === 0) {
    pool = [...active];
  }

  const allById = new Map(intents.map((intent) => [intent.id, intent]));
  const preferIntent = preferIntentId ? allById.get(preferIntentId) : null;
  const selected = [];

  if (preferIntent) {
    const related = shuffle(pool.filter((intent) => isRelatedIntent(preferIntent, intent)));
    const unrelated = shuffle(pool.filter((intent) => !isRelatedIntent(preferIntent, intent)));
    const relatedTarget = Math.min(count, Math.max(count - 1, 2));

    while (selected.length < relatedTarget && related.length) {
      selected.push(related.shift());
    }
    while (selected.length < count && unrelated.length) {
      selected.push(unrelated.shift());
    }
    while (selected.length < count && related.length) {
      selected.push(related.shift());
    }
  } else if (relatedToInput) {
    const ranked = pool
      .map((intent) => ({ intent, score: scoreIntent(relatedToInput, intent) }))
      .sort((a, b) => b.score - a.score)
      .map(({ intent }) => intent);
    selected.push(...ranked.slice(0, count));
  } else if (diversify) {
    const byCategory = new Map();
    pool.forEach((intent) => {
      const category = intent.category || 'general';
      if (!byCategory.has(category)) byCategory.set(category, []);
      byCategory.get(category).push(intent);
    });

    const categories = shuffle([...byCategory.keys()]);
    while (selected.length < count && categories.length) {
      const category = categories.shift();
      const bucket = byCategory.get(category);
      if (bucket?.length) {
        selected.push(bucket.splice(Math.floor(Math.random() * bucket.length), 1)[0]);
      }
    }

    const remaining = shuffle(pool.filter((intent) => !selected.includes(intent)));
    while (selected.length < count && remaining.length) {
      selected.push(remaining.shift());
    }
  } else {
    selected.push(...shuffle(pool).slice(0, count));
  }

  return {
    labels: selected.map((intent) => intent.label),
    intentIds: selected.map((intent) => intent.id),
  };
}
