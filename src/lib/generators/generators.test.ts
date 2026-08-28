import { describe, it, expect } from 'vitest';
import { generateBulletsLocally } from './bullet-optimizer';
import { generateInterviewPrepLocally } from './interview-predictor';
import { generateOutreachLocally } from './outreach-generator';

describe('Phase 1 Superpower Generators', () => {
  describe('Bullet Optimizer (Local Fallback)', () => {
    it('generates 3 high-impact XYZ formula bullets for a target skill', () => {
      const result = generateBulletsLocally('Kubernetes');
      expect(result.bullets).toHaveLength(3);
      expect(result.keyword).toBe('Kubernetes');
      expect(result.bullets[0].bullet).toContain('Kubernetes');
      expect(result.bullets[0].metricUsed).toBeDefined();
    });

    it('improves existing bullet point when provided', () => {
      const result = generateBulletsLocally('TypeScript', 'Worked on frontend codebase');
      expect(result.bullets).toHaveLength(3);
      expect(result.bullets[0].bullet).toContain('TypeScript');
    });
  });

  describe('Interview Predictor (Local Fallback)', () => {
    it('generates structured STAR interview questions based on matched & missing skills', () => {
      const result = generateInterviewPrepLocally({
        matchedKeywords: ['React', 'Next.js'],
        missingKeywords: ['Docker', 'AWS'],
      });

      expect(result.questions.length).toBeGreaterThanOrEqual(4);
      expect(result.keyStrengths).toContain('React');
      expect(result.topGaps).toContain('Docker');

      const techQ = result.questions.find((q) => q.category === 'technical');
      expect(techQ).toBeDefined();
      expect(techQ?.starGuide.situation).toBeDefined();
      expect(techQ?.starGuide.action).toBeDefined();
      expect(techQ?.starGuide.result).toBeDefined();
      expect(techQ?.sampleAnswer).toBeDefined();

      const gapQ = result.questions.find((q) => q.category === 'gap');
      expect(gapQ).toBeDefined();
      expect(gapQ?.question).toContain('Docker');
    });
  });

  describe('Outreach Generator (Local Fallback)', () => {
    it('generates personalized Cover Letter, LinkedIn DM, and follow-up email', () => {
      const result = generateOutreachLocally({
        matchedKeywords: ['React', 'TypeScript', 'Node.js'],
        jobTitle: 'Senior Frontend Engineer',
        companyName: 'Acme Corp',
      });

      expect(result.coverLetter).toContain('Senior Frontend Engineer');
      expect(result.coverLetter).toContain('Acme Corp');
      expect(result.coverLetter).toContain('React, TypeScript, Node.js');

      expect(result.linkedinDm).toContain('Senior Frontend Engineer');
      expect(result.linkedinDm).toContain('Acme Corp');

      expect(result.followUpEmail).toContain('Senior Frontend Engineer');
      expect(result.keyStrengthsUsed).toHaveLength(3);
    });
  });
});
