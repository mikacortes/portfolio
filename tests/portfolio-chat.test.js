import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  detectForeignName,
  isRelatedIntent,
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
    const suggestions = pickSuggestions(faqData.intents, 3).labels;
    expect(suggestions).toHaveLength(3);
    suggestions.forEach((label) => {
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });
  });

  it('avoids repeating suggestions already seen in the session', () => {
    const first = pickSuggestions(faqData.intents, 3);
    const excludeIds = new Set(first.intentIds);
    const second = pickSuggestions(faqData.intents, 3, { excludeIds });

    second.intentIds.forEach((intentId) => {
      expect(excludeIds.has(intentId)).toBe(false);
    });
  });

  it('prefers related suggestions after an answered intent', () => {
    const source = faqData.intents.find((intent) => intent.id === 'data_analysis_tools');
    const result = pickSuggestions(faqData.intents, 3, {
      preferIntentId: 'data_analysis_tools',
    });
    const relatedCount = result.intentIds.filter((intentId) => {
      const intent = faqData.intents.find((item) => item.id === intentId);
      return intent && isRelatedIntent(source, intent);
    }).length;

    expect(relatedCount).toBeGreaterThanOrEqual(2);
  });

  it('scores intents higher when patterns and examples align', () => {
    const graduation = faqData.intents.find((intent) => intent.id === 'graduation_year');
    const hobbies = faqData.intents.find((intent) => intent.id === 'hobbies');
    const graduationScore = scoreIntent('When did Monica graduate?', graduation);
    const hobbiesScore = scoreIntent('When did Monica graduate?', hobbies);
    expect(graduationScore).toBeGreaterThan(hobbiesScore);
  });

  it('matches freelance availability questions', () => {
    const result = matchQuestion('Are you available for freelance or contract work?', faqData);
    expect(result.type).toBe('answer');
    expect(result.intentId).toBe('freelance');
  });

  it('matches industry experience without rejecting healthcare', () => {
    const result = matchQuestion(
      'Do you have experience working in healthcare?',
      faqData,
    );
    expect(result.type).toBe('answer');
    expect(result.intentId).toBe('industry_experience');
  });

  it('matches design process questions', () => {
    const result = matchQuestion('What does your design process typically look like?', faqData);
    expect(result.type).toBe('answer');
    expect(result.intentId).toBe('design_process');
  });

  it('matches crochet vs knitting', () => {
    const result = matchQuestion('Crochet or knitting — which wins?', faqData);
    expect(result.type).toBe('answer');
    expect(result.intentId).toBe('crochet_vs_knitting');
  });

  it('matches data analysis tool questions', () => {
    const result = matchQuestion('What tools do you use for data analysis — SQL, Python, Tableau?', faqData);
    expect(result.type).toBe('answer');
    expect(result.intentId).toBe('data_analysis_tools');
  });

  it('excludes disabled intents from matching and suggestions', () => {
    const disabled = faqData.intents.find((intent) => intent.id === 'project_changed_thinking');
    expect(disabled?.disabled).toBe(true);

    const result = matchQuestion(
      'Have you worked on a project that changed how you think about design?',
      faqData,
    );
    expect(result.intentId).not.toBe('project_changed_thinking');

    const suggestions = pickSuggestions(faqData.intents, 50).labels;
    expect(suggestions).not.toContain(disabled.label);
  });
});
