import { describe, it, expect } from 'vitest';
import { generateBulletsLocally } from './bullet-optimizer';
import { generateInterviewPrepLocally } from './interview-predictor';
import { generateOutreachLocally } from './outreach-generator';
import { generateLocalFixedResume } from './resume-fixer';
import { generateLocalRecruiterRoast } from './recruiter-roast';
import { generateLocalSalaryEstimate } from './salary-estimator';

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

  describe('Resume Auto-Fixer Engine (Local Fallback)', () => {
    it('generates fully optimized, structured resume with injected missing skills and XYZ bullets', () => {
      const result = generateLocalFixedResume(
        'John Doe\njohn@example.com\nSoftware Engineer with experience in JavaScript',
        'Looking for Senior Frontend Engineer with Next.js, Docker, Kubernetes, AWS',
        ['Next.js', 'Docker', 'Kubernetes', 'AWS'],
        62
      );

      expect(result.fullName).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.title).toContain('Frontend Engineer');
      expect(result.summary).toContain('Next.js');
      expect(result.skills.technical).toContain('Next.js');
      expect(result.skills.toolsAndCloud).toContain('Docker');
      expect(result.experience.length).toBeGreaterThanOrEqual(2);
      expect(result.experience[0].bullets[0]).toContain('Google XYZ Formula');
      expect(result.changesApplied.length).toBeGreaterThanOrEqual(4);
      expect(result.estimatedScoreJump.projectedScore).toBeGreaterThanOrEqual(90);
      expect(result.estimatedScoreJump.delta).toBeGreaterThanOrEqual(20);
    });
  });

  describe('Recruiter Roast & Mentor Engine (Local Fallback)', () => {
    it('generates brutal roast, buzzword crime detection, and survival score in roast mode', () => {
      const result = generateLocalRecruiterRoast(
        'John Doe\nResponsible for various tasks. Team player who worked on React apps with passionate dedication.',
        'Senior Software Engineer at high scale',
        'roast'
      );

      expect(result.roastMode).toBe('roast');
      expect(result.roastScore).toBeGreaterThan(0);
      expect(result.survivalTier).toBeDefined();
      expect(result.buzzwordCrimes.length).toBeGreaterThanOrEqual(2);
      expect(result.buzzwordCrimes[0].roast).toBeDefined();
      expect(result.buzzwordCrimes[0].replacement).toBeDefined();
      expect(result.firstImpressionIn6Seconds).toContain('5 seconds');
      expect(result.shareablePunchline).toContain('Survival Rate');
    });

    it('generates constructive coaching in mentor mode', () => {
      const result = generateLocalRecruiterRoast(
        'Jane Smith\nSpearheaded platform migration reducing latency by 45%. Collaborated across 3 pods.',
        'Lead Engineer',
        'mentor'
      );

      expect(result.roastMode).toBe('mentor');
      expect(result.roastScore).toBeGreaterThanOrEqual(50);
      expect(result.verdict).toContain('High potential');
    });
  });

  describe('Skill Salary & Compensation Estimator (Local Fallback)', () => {
    it('estimates compensation range, missing skill ROI, and negotiation talking points', () => {
      const result = generateLocalSalaryEstimate(
        'Alex Chen\nSoftware Engineer (2019 - 2026)\nBuilt web services with TypeScript and React.',
        'Senior Frontend Engineer with Docker, AWS, and Kubernetes',
        ['TypeScript', 'React'],
        ['AWS', 'Kubernetes', 'Docker']
      );

      expect(result.roleTitle).toContain('Frontend Engineer');
      expect(result.seniorityLevel).toBe('Senior');
      expect(result.estimatedSalaryRange.median).toBeGreaterThan(120000);
      expect(result.missingSkillRoi.length).toBe(3);
      expect(result.missingSkillRoi[0].estimatedAnnualBoost).toBeGreaterThan(5000);
      expect(result.regionalBenchmarks.length).toBe(4);
      expect(result.negotiationPoints.length).toBe(3);
    });
  });
});
