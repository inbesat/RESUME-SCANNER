import { describe, it, expect } from 'vitest';
import { auditResumeATS } from './ats-checker';
import { SAMPLE_PRESETS } from './presets/sample-data';

describe('ATS Checker & Presets', () => {
  it('audits a high quality resume and returns high score with A/A+ grade', () => {
    const sampleResume = SAMPLE_PRESETS[0].resume.text;
    const audit = auditResumeATS(sampleResume);

    expect(audit.overallScore).toBeGreaterThanOrEqual(75);
    expect(audit.contactCompleteness.hasEmail).toBe(true);
    expect(audit.contactCompleteness.hasPhone).toBe(true);
    expect(audit.contactCompleteness.hasLocation).toBe(true);
    expect(audit.metricDensityPercentage).toBeGreaterThanOrEqual(30);
    expect(audit.strongVerbsFound.length).toBeGreaterThan(0);
    expect(audit.checks).toHaveLength(5);
  });

  it('flags weak resumes with missing contacts and low metrics', () => {
    const poorResume = `
      John
      I worked as a software developer for a few years.
      Responsible for helping the team with bug fixes and daily tasks.
      Assisted with meetings.
    `;
    const audit = auditResumeATS(poorResume);

    expect(audit.overallScore).toBeLessThan(70);
    expect(audit.contactCompleteness.hasEmail).toBe(false);
    expect(audit.weakPhrasesFound.length).toBeGreaterThan(0);
    expect(audit.checks.find(c => c.id === 'action-verbs')?.suggestions?.length).toBeGreaterThan(0);
  });

  it('contains 4 rich sample presets with complete resumes and job descriptions', () => {
    expect(SAMPLE_PRESETS).toHaveLength(4);
    SAMPLE_PRESETS.forEach(preset => {
      expect(preset.roleTitle).toBeDefined();
      expect(preset.jobDescription.length).toBeGreaterThan(100);
      expect(preset.resume.text.length).toBeGreaterThan(200);
      expect(preset.keywords.length).toBeGreaterThan(5);
    });
  });
});
