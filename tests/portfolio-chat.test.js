import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  detectForeignName,
  matchQuestion,
  normalizeText,
  pickSuggestions,
  scoreIntent,
} from '../portfolio-chat-matcher.js';

const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const faqData = JSON.parse(readFileSync(path.join(rootDir, 'faq-data.json'), 'utf8'));

describe('portfolio chat matcher', () => {
  it('normalizes punctuation and casing', () => {
    expect(normalizeText('What year did Monica graduate?')).toBe('what year did monica graduate');
  });

  it('matches paraphrased graduation questions', () => {
    const result = matchQuestion('What year did Monica graduate in?', faqData);
    expect(result.type).toBe('answer');
    expect(result.intentId).toBe('graduation_year');
  });

  it('matches first-person graduation questions', () => {
    const result = matchQuestion('What year did I graduate?', faqData);
    expect(result.type).toBe('answer');
    expect(result.intentId).toBe('graduation_year');
  });

  it('matches school questions with different phrasing', () => {
    const result = matchQuestion('Did she go to Berkeley?', faqData);
    expect(result.type).toBe('answer');
    expect(result.intentId).toBe('school');
  });

  it('rejects questions about another person', () => {
    const result = matchQuestion('What year did Nicole graduate?', faqData);
    expect(result.type).toBe('fallback');
    expect(result.reason).toBe('foreign_name');
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('rejects off-topic questions', () => {
    const result = matchQuestion("What's the weather?", faqData);
    expect(result.type).toBe('fallback');
    expect(result.suggestions.length).toBe(3);
  });

  it('detects foreign capitalized names', () => {
    expect(detectForeignName('What year did Nicole graduate?')).toBe('Nicole');
    expect(detectForeignName('What year did Monica graduate?')).toBeNull();
  });

  it('returns suggestions on fallback', () => {
    const suggestions = pickSuggestions(faqData.intents, 3);
    expect(suggestions).toHaveLength(3);
    suggestions.forEach((label) => {
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });
  });

  it('scores intents higher when patterns and examples align', () => {
    const graduation = faqData.intents.find((intent) => intent.id === 'graduation_year');
    const hobbies = faqData.intents.find((intent) => intent.id === 'hobbies');
    const graduationScore = scoreIntent('When did Monica graduate?', graduation);
    const hobbiesScore = scoreIntent('When did Monica graduate?', hobbies);
    expect(graduationScore).toBeGreaterThan(hobbiesScore);
  });
});
