import { Keyword, ScoreResult, ConfidenceLevel } from '@/types';
import { scoreLocally } from './scoring/local-scorer';
import { scoreHybrid } from './scoring/hybrid-scorer';

const TITLE_WORDS = new Set([
  'developer', 'engineer', 'engineering', 'manager', 'specialist', 'analyst',
  'designer', 'consultant', 'intern', 'scientist', 'researcher', 'architect',
  'administrator', 'coordinator', 'associate', 'director', 'supervisor', 'lead',
]);

const NAME_LIKE_RE = /^[A-Z][a-zA-Z'.-]*(?:(?:\s+[A-Z][a-zA-Z'.-]*)|\s+[A-Z]){0,2}$/;

export type BiasCheckMode = 'local' | 'ai';

export interface BiasCheckResult {
  originalFit: number;
  anonymizedFit: number;
  delta: number;
  impact: 'negligible' | 'moderate' | 'significant';
  verdict: string;
  anonymizedPreview: string;
  flippedKeywords: { keyword: string; category: string; originalMatched: boolean; anonymizedMatched: boolean }[];
  confidence: ConfidenceLevel;
  mode: BiasCheckMode;
  processingTime: number;
}

export function anonymizeResume(text: string): string {
  let result = text;

  result = result
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[EMAIL]')
    .replace(/\+\d{1,3}[\s-]?\d{2,5}[\s-]?\d{3,5}[\s-]?\d{3,5}/g, '[PHONE]')
    .replace(/\(\d{3}\)\s?\d{3}[-.]\d{4}/g, '[PHONE]')
    .replace(/(?<!\d)(\d{3})[-.)]\s?\d{3}[-.]\d{4}(?!\d)/g, '[PHONE]')
    .replace(/https?:\/\/[^\s]+/g, '[URL]')
    .replace(/www\.[^\s]+/g, '[URL]')
    .replace(/linkedin\.com\/[^\s]+/gi, '[URL]')
    .replace(/github\.com\/[^\s]+/gi, '[URL]')
    .replace(/\b\d{1,3}\s+[A-Z][\w.\s]*(Street|Avenue|Road|Lane|Drive|Blvd|Boulevard|Court|Place)\b/gi, '[ADDRESS]');

  const lines = result.split('\n');
  for (let i = 0; i < Math.min(4, lines.length); i++) {
    const line = lines[i].trim().replace(/\s+/g, ' ');
    if (!line) continue;
    const hasNoDigits = !/\d/.test(line);
    const words = line.split(' ');
    const fewWords = words.length <= 3;
    const notATitle = !words.some(w => TITLE_WORDS.has(w.toLowerCase().replace(/[^a-z]/g, '')));
    if (hasNoDigits && fewWords && notATitle && NAME_LIKE_RE.test(line) && /[a-z]/.test(line)) {
      lines[i] = '[NAME]';
      break;
    }
  }
  result = lines.join('\n');

  result = result
    .replace(/\b(?:the\s+)?[A-Z][A-Za-z.&'-]*(?:\s+[A-Z][A-Za-z.&'-]*){0,3}\s+(?:University|College|Institute|Academy)(?:\s+of\s+[A-Z][A-Za-z&-]*)?\b/g, '[SCHOOL]')
    .replace(/\bUniversity of [A-Z][A-Za-z&-]*(?:\s+[A-Z][A-Za-z&-]*){0,2}\b/g, '[SCHOOL]')
    .replace(/\b(?:[A-Z][A-Za-z.-]*\s*)\b/gi, m => /^(MIT|CMU|UCLA|USC|NYU|IIT|NIT|IIIT|BITS|IISC|AIT|NUS|NTU|TUCS|HKUST|KAIST)$/i.test(m) ? '[SCHOOL]' : m)
    .replace(/\b(?:Harvard|Stanford|Oxford|Cambridge|Yale|Princeton|Columbia|Berkeley|Caltech|MIT|Georgia Tech)\s+(?:Business\s+)?School\b/gi, '[SCHOOL]')
    .replace(/\b(?:Harvard|Stanford|Oxford|Cambridge|Yale|Princeton|Columbia|Berkeley|Caltech|MIT|Georgia Tech)\b/gi, '[SCHOOL]');

  return result;
}

export async function checkBias(resumeText: string, keywords: Keyword[], options?: { mode?: BiasCheckMode }): Promise<BiasCheckResult> {
  const startTime = Date.now();
  const mode: BiasCheckMode = options?.mode ?? 'local';
  const score = mode === 'ai' ? scoreHybrid : (async (text: string, kws: Keyword[]) => scoreLocally(text, kws));

  const original: ScoreResult = await score(resumeText, keywords);
  const anonymizedText = anonymizeResume(resumeText);

  if (anonymizedText === resumeText) {
    return {
      originalFit: original.fitPercentage,
      anonymizedFit: original.fitPercentage,
      delta: 0,
      impact: 'negligible',
      verdict: 'No personal identifiers (name, contact, school) detected, so bias couldn\'t be assessed.',
      anonymizedPreview: anonymizedText.slice(0, 400),
      flippedKeywords: [],
      confidence: 'medium',
      mode,
      processingTime: Date.now() - startTime,
    };
  }

  const anonymizedResult: ScoreResult = await score(anonymizedText, keywords);

  const delta = Math.abs(original.fitPercentage - anonymizedResult.fitPercentage);
  const impact: BiasCheckResult['impact'] = delta <= 5 ? 'negligible' : delta <= 15 ? 'moderate' : 'significant';

  const flippedKeywords: BiasCheckResult['flippedKeywords'] = [];
  (Object.keys(original.breakdown) as (keyof typeof original.breakdown)[]).forEach(category => {
    const origCat = original.breakdown[category];
    const anonCat = anonymizedResult.breakdown[category];
    const allKws = new Set([...origCat.matched, ...origCat.missing, ...anonCat.matched, ...anonCat.missing]);
    allKws.forEach(kw => {
      const originalMatched = origCat.matched.includes(kw);
      const anonymizedMatched = anonCat.matched.includes(kw);
      const originalMissing = origCat.missing.includes(kw);
      const anonymizedMissing = anonCat.missing.includes(kw);
      if ((originalMatched && (anonymizedMissing || !anonymizedMatched)) ||
          (anonymizedMatched && (originalMissing || !originalMatched))) {
        flippedKeywords.push({ keyword: kw, category: String(category), originalMatched, anonymizedMatched });
      }
    });
  });

  let verdict: string;
  const scoredBy = mode === 'ai' ? 'AI-assisted scoring' : 'keyword-only scoring';
  if (delta <= 5) {
    verdict = `Removing personal identifiers changed the fit score by only a small amount (${scoredBy}), suggesting scoring is largely merit-based.`;
  } else if (delta <= 15) {
    verdict = `Re-scoring the anonymized resume moved the fit by ${delta} points (${scoredBy}). This usually reflects protected info overlapping with job-relevant content, but a quick look is worthwhile.`;
  } else {
    verdict = `The fit score changed by ${delta} points after anonymization (${scoredBy}) — a significant signal worth investigating. Check whether skills were only mentioned inside anonymized sections (e.g., the school name contains a tech word).`;
  }

  return {
    originalFit: original.fitPercentage,
    anonymizedFit: anonymizedResult.fitPercentage,
    delta,
    impact,
    verdict,
    anonymizedPreview: anonymizedText.slice(0, 400),
    flippedKeywords,
    confidence: original.confidence,
    mode,
    processingTime: Date.now() - startTime,
  };
}