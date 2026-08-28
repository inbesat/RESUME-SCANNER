import { describe, it, expect } from 'vitest';
import { scoreLocally } from './local-scorer';
import { scoreHybrid } from './hybrid-scorer';
import { anonymizeResume } from '../bias-check';
import { Keyword } from '@/types';

const makeKw = (text: string, category: Keyword['category'], importance?: Keyword['importance']): Keyword => ({
  id: `kw-${text}`,
  text,
  category,
  source: 'ai',
  importance,
});

describe('scoreLocally', () => {
  it('scores a matching resume higher than a non-matching resume', () => {
    const keywords = [
      makeKw('React', 'technical', 'required'),
      makeKw('TypeScript', 'technical', 'required'),
      makeKw('Node.js', 'technical', 'preferred'),
      makeKw('communication', 'softSkills', 'required'),
    ];

    const goodResume = `
      Jane Smith
      Frontend Developer with strong communication skills.
      Skills: React, TypeScript, Node.js.
      Built scalable web applications using React and TypeScript.
    `;

    const poorResume = `
      Bob Jones
      Accountant with attention to detail.
      Worked in finance and accounting for 10 years.
    `;

    const good = scoreLocally(goodResume, keywords);
    const poor = scoreLocally(poorResume, keywords);

    expect(good.fitPercentage).toBeGreaterThan(poor.fitPercentage);
    expect(good.breakdown.technical.matched).toContain('React');
    expect(good.breakdown.technical.missing).not.toContain('React');
    expect(poor.breakdown.technical.missing).toContain('React');
  });

  it('treats required keywords as more important than preferred ones', () => {
    const keywords = [
      makeKw('React', 'technical', 'required'),
      makeKw('Vue', 'technical', 'preferred'),
    ];

    // Resume matches ONLY the preferred keyword (Vue) — low score expected.
    const vueOnly = scoreLocally('I love Vue.js and have built apps with it for years.', keywords);
    // Resume matches ONLY the required keyword (React) — higher score expected.
    const reactOnly = scoreLocally('I love React and have built apps with it for years.', keywords);
    // Resume matches both.
    const both = scoreLocally('I love React and Vue and have built apps with both.', keywords);

    expect(both.fitPercentage).toBeGreaterThan(reactOnly.fitPercentage);
    expect(reactOnly.fitPercentage).toBeGreaterThan(vueOnly.fitPercentage);
  });

  it('returns 100 for an empty keyword list in a category', () => {
    const keywords = [makeKw('React', 'technical', 'required')];
    const result = scoreLocally('React developer.', keywords);
    expect(result.breakdown.education.score).toBe(100);
    expect(result.breakdown.softSkills.score).toBe(100);
  });

  it('handles aliases', () => {
    const keywords = [makeKw('JavaScript', 'technical', 'required')];
    const result = scoreLocally('I write JS every day at work.', keywords);
    expect(result.breakdown.technical.matched).toContain('JavaScript');
  });
});

describe('scoreHybrid', () => {
  it('falls back to local scoring with a visible note when AI fails', async () => {
    const originalKey = process.env.GROQ_API_KEY;
    process.env.GROQ_API_KEY = '';

    try {
      const keywords = [
        makeKw('React', 'technical', 'required'),
        makeKw('communication', 'softSkills', 'required'),
      ];
      const result = await scoreHybrid('Frontend developer with 5 years of React experience. Excellent communication skills.', keywords);
      expect(result.scorerUsed).toBe('local');
      expect(result.aiFallbackNote).toContain('AI scoring unavailable');
    } finally {
      process.env.GROQ_API_KEY = originalKey;
    }
  });
});

describe('anonymizeResume', () => {
  it('redacts name, email, phone, and URL', () => {
    const text = `
      Jane Smith
      +91 98765 43210
      janedoe@example.com
      555-123-4567
      https://github.com/janesmith
      Senior developer with 8 years of experience.
      Skills: React, TypeScript.
    `;

    const anonymized = anonymizeResume(text);

    expect(anonymized).toContain('[EMAIL]');
    expect(anonymized).toContain('[PHONE]');
    expect(anonymized).toContain('[URL]');
    expect(anonymized).not.toContain('janedoe@example.com');
    expect(anonymized).not.toContain('555-123-4567');
    expect(anonymized).not.toContain('github.com/janesmith');
    expect(anonymized).not.toContain('Jane Smith');
  });

  it('redacts the name on the first line when it looks like a name', () => {
    const text = 'Jane Smith\nSenior developer with 8 years of experience.';
    const anonymized = anonymizeResume(text);
    const lines = anonymized.split('\n');
    expect(lines[0].trim()).toBe('[NAME]');
  });

  it('does not falsely redact titles on the first line', () => {
    const text = 'Frontend Developer\nJane Smith\nSenior developer with 8 years of experience.';
    const anonymized = anonymizeResume(text);
    const lines = anonymized.split('\n');
    expect(lines[0]).toBe('Frontend Developer');
  });

  it('redacts parenthesized US phone numbers completely', () => {
    const text = 'jane.smith@example.com\n(555) 123-4567\nSenior developer.';
    const anonymized = anonymizeResume(text);
    expect(anonymized).toContain('[PHONE]');
    expect(anonymized).not.toContain('(555) 123-4567');
    expect(anonymized).not.toContain('(');
  });

  it('leaves text untouched when there is nothing to redact', () => {
    const text = 'Built scalable web applications with React and TypeScript for 8 years.';
    expect(anonymizeResume(text)).toBe(text);
  });
});