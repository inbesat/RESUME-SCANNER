export interface ATSCheckItem {
  id: string;
  name: string;
  category: 'contact' | 'structure' | 'impact' | 'verbs' | 'length';
  passed: boolean;
  score: number; // 0 to 100
  feedback: string;
  foundItems?: string[];
  suggestions?: string[];
}

export interface ATSAuditResult {
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  verdict: string;
  checks: ATSCheckItem[];
  metricBulletsCount: number;
  totalBulletsCount: number;
  metricDensityPercentage: number;
  strongVerbsFound: string[];
  weakPhrasesFound: string[];
  contactCompleteness: {
    hasEmail: boolean;
    hasPhone: boolean;
    hasLocation: boolean;
    hasLink: boolean;
  };
}

const STRONG_ACTION_VERBS = [
  'architected', 'engineered', 'spearheaded', 'orchestrated', 'optimized',
  'streamlined', 'accelerated', 'pioneered', 'designed', 'delivered',
  'formulated', 'scaled', 'implemented', 'refactored', 'championed',
  'executed', 'developed', 'deployed', 'modernized', 'automated',
  'directed', 'instituted', 'boosted', 'curtailed', 'maximized'
];

const WEAK_PASSIVE_PHRASES = [
  'responsible for', 'helped with', 'assisted with', 'worked on',
  'duties included', 'tasks included', 'involved in', 'participated in',
  'handled day to day', 'supported the team'
];

const STANDARD_SECTIONS = [
  { name: 'Experience / Work History', regex: /\b(experience|employment history|work history|professional experience)\b/i },
  { name: 'Technical Skills', regex: /\b(skills|technical skills|technologies|core competencies|technical proficiencies)\b/i },
  { name: 'Education', regex: /\b(education|academic background|degrees|university)\b/i },
  { name: 'Summary / Profile', regex: /\b(summary|professional summary|about me|profile|overview)\b/i },
];

export function auditResumeATS(resumeText: string): ATSAuditResult {
  const text = resumeText || '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Contact Information Check
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasLocation = /\b[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}\b|\b(Remote|San Francisco|New York|Austin|Seattle|London|Toronto|Berlin)\b/i.test(text);
  const hasLink = /(linkedin\.com|github\.com|portfolio|[a-zA-Z0-9-]+\.(dev|io|me|com))/i.test(text);

  const contactScore = [hasEmail, hasPhone, hasLocation, hasLink].filter(Boolean).length * 25;
  const contactCheck: ATSCheckItem = {
    id: 'contact-info',
    name: 'Contact & Profile Links',
    category: 'contact',
    passed: contactScore >= 75,
    score: contactScore,
    feedback: contactScore === 100
      ? 'All essential contact data (email, phone, location, links) present.'
      : 'Missing key contact elements that recruiters look for.',
    suggestions: [
      !hasEmail && 'Add a professional email address.',
      !hasPhone && 'Include a standard phone number with area code.',
      !hasLocation && 'Add your City, State or "Remote" location indicator.',
      !hasLink && 'Include a LinkedIn or GitHub/portfolio profile link.',
    ].filter(Boolean) as string[],
  };

  // 2. Standard Section Headings
  const foundSections: string[] = [];
  const missingSections: string[] = [];

  STANDARD_SECTIONS.forEach(sec => {
    if (sec.regex.test(text)) {
      foundSections.push(sec.name);
    } else {
      missingSections.push(sec.name);
    }
  });

  const structureScore = Math.round((foundSections.length / STANDARD_SECTIONS.length) * 100);
  const structureCheck: ATSCheckItem = {
    id: 'section-structure',
    name: 'Standard ATS Headings',
    category: 'structure',
    passed: structureScore >= 75,
    score: structureScore,
    feedback: structureScore === 100
      ? 'Resume uses standard headings parseable by all legacy & modern ATS systems.'
      : `Missing standard sections: ${missingSections.join(', ')}`,
    foundItems: foundSections,
    suggestions: missingSections.map(s => `Add a clear "${s}" heading.`),
  };

  // 3. Measurable Impact & Numbers
  const bulletLines = lines.filter(l => l.startsWith('-') || l.startsWith('•') || l.startsWith('*') || l.length > 25);
  const metricRegex = /\b(\d+[%kKmMbB]?|\$\d+|\d+\+|\d+x|\d+\s*(?:percent|users|hours|days|seconds|ms|ms|latency|revenue|arr))\b/i;
  const metricBullets = bulletLines.filter(l => metricRegex.test(l));
  
  const metricDensityPercentage = bulletLines.length > 0
    ? Math.round((metricBullets.length / bulletLines.length) * 100)
    : 0;

  const impactScore = Math.min(100, Math.round(metricDensityPercentage * 1.5));
  const impactCheck: ATSCheckItem = {
    id: 'measurable-metrics',
    name: 'Quantifiable Metrics & Impact',
    category: 'impact',
    passed: metricDensityPercentage >= 40,
    score: impactScore,
    feedback: metricDensityPercentage >= 40
      ? `${metricDensityPercentage}% of achievement statements contain concrete numbers or metrics.`
      : `Only ${metricDensityPercentage}% of statements contain numbers. Top resumes target 40-60%.`,
    suggestions: metricDensityPercentage < 40 ? [
      'Apply Google\'s XYZ formula: Accomplished [X], as measured by [Y], by doing [Z].',
      'Add metrics such as % latency reduced, $ saved, team size led, or user growth.',
    ] : [],
  };

  // 4. Power Action Verbs vs Passive Phrases
  const lowerText = text.toLowerCase();
  const strongVerbsFound = STRONG_ACTION_VERBS.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(lowerText));
  const weakPhrasesFound = WEAK_PASSIVE_PHRASES.filter(p => lowerText.includes(p));

  let verbScore = Math.min(100, strongVerbsFound.length * 15);
  if (weakPhrasesFound.length > 0) {
    verbScore = Math.max(0, verbScore - (weakPhrasesFound.length * 15));
  }

  const verbCheck: ATSCheckItem = {
    id: 'action-verbs',
    name: 'Action Verb Strength',
    category: 'verbs',
    passed: strongVerbsFound.length >= 4 && weakPhrasesFound.length === 0,
    score: verbScore,
    feedback: weakPhrasesFound.length === 0
      ? `Found ${strongVerbsFound.length} strong leadership and engineering power verbs.`
      : `Detected ${weakPhrasesFound.length} passive phrases that reduce recruiter impact.`,
    foundItems: strongVerbsFound,
    suggestions: weakPhrasesFound.map(w => `Replace passive "${w}" with strong verbs like "Architected", "Spearheaded", or "Engineered".`),
  };

  // 5. Length & Word Count Assessment
  const words = text.split(/\s+/).filter(Boolean).length;
  let lengthScore = 100;
  let lengthFeedback = 'Ideal length (350-800 words, optimal for a 1-2 page ATS scan).';

  if (words < 200) {
    lengthScore = 50;
    lengthFeedback = `Resume is very brief (${words} words). Aim for at least 350 words to provide sufficient skill context.`;
  } else if (words > 1200) {
    lengthScore = 70;
    lengthFeedback = `Resume is somewhat long (${words} words). Consider tightening to keep recruiter focus crisp.`;
  }

  const lengthCheck: ATSCheckItem = {
    id: 'resume-length',
    name: 'Length & Word Density',
    category: 'length',
    passed: lengthScore >= 80,
    score: lengthScore,
    feedback: lengthFeedback,
    suggestions: words < 200 ? ['Elaborate on core projects, technical challenges, and responsibilities.'] : [],
  };

  const checks = [contactCheck, structureCheck, impactCheck, verbCheck, lengthCheck];
  const overallScore = Math.round(checks.reduce((acc, c) => acc + c.score, 0) / checks.length);

  let grade: ATSAuditResult['grade'] = 'B';
  if (overallScore >= 90) grade = 'A+';
  else if (overallScore >= 80) grade = 'A';
  else if (overallScore >= 70) grade = 'B';
  else if (overallScore >= 60) grade = 'C';
  else grade = 'D';

  const verdict = overallScore >= 80
    ? 'Excellent ATS format — clean hierarchy, strong active verbs, and parseable standard sections.'
    : 'Moderate ATS compatibility — address missing metrics and passive phrasing to maximize recruiter screening pass rate.';

  return {
    overallScore,
    grade,
    verdict,
    checks,
    metricBulletsCount: metricBullets.length,
    totalBulletsCount: bulletLines.length,
    metricDensityPercentage,
    strongVerbsFound,
    weakPhrasesFound,
    contactCompleteness: {
      hasEmail,
      hasPhone,
      hasLocation,
      hasLink,
    },
  };
}
