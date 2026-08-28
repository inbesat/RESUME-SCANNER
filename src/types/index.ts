export type KeywordCategory = 'technical' | 'experience' | 'education' | 'softSkills';

export type KeywordImportance = 'required' | 'preferred';

export interface Keyword {
  id: string;
  text: string;
  category: KeywordCategory;
  source: 'ai' | 'manual';
  importance?: KeywordImportance;
}

export interface ParsedResume {
  text: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'png' | 'jpg';
  wordCount: number;
  pageCount?: number;
}

export interface ExtractedKeywords {
  keywords: Keyword[];
  jobDescription: string;
}

export interface CategoryScore {
  score: number;
  matched: string[];
  missing: string[];
  evidence?: string[];
}

export interface ScoreBreakdown {
  technical: CategoryScore;
  experience: CategoryScore;
  education: CategoryScore;
  softSkills: CategoryScore;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ScoreResult {
  fitPercentage: number;
  confidence: ConfidenceLevel;
  confidenceReason?: string;
  aiFallbackNote?: string;
  breakdown: ScoreBreakdown;
  suggestions: string[];
  processingTime: number;
  scorerUsed: 'local' | 'ai' | 'hybrid';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ParseResumeRequest {
  file: File;
}

export interface ExtractKeywordsRequest {
  jobDescription: string;
  manualKeywords?: string[];
}

export interface ScoreResumeRequest {
  resumeText: string;
  keywords: Keyword[];
}

// Phase 1 Superpowers Types
export interface BulletSuggestion {
  bullet: string;
  metricUsed: string;
  skillTargeted: string;
  explanation: string;
}

export interface BulletOptimizationResult {
  bullets: BulletSuggestion[];
  keyword?: string;
}

export interface StarGuide {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'technical' | 'experience' | 'behavioral' | 'gap';
  whyAsked: string;
  starGuide: StarGuide;
  sampleAnswer: string;
}

export interface InterviewPrepResult {
  questions: InterviewQuestion[];
  candidateSummary: string;
  keyStrengths: string[];
  topGaps: string[];
}

export interface OutreachResult {
  coverLetter: string;
  linkedinDm: string;
  followUpEmail: string;
  keyStrengthsUsed: string[];
}

export interface FixedResumeExperience {
  role: string;
  company: string;
  location?: string;
  period: string;
  bullets: string[];
}

export interface FixedResumeEducation {
  degree: string;
  institution: string;
  location?: string;
  year: string;
  details?: string;
}

export interface FixedResumeSkills {
  technical: string[];
  toolsAndCloud: string[];
  domainAndSoft: string[];
}

export interface FixedResumeData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  links: string[];
  summary: string;
  skills: FixedResumeSkills;
  experience: FixedResumeExperience[];
  education: FixedResumeEducation[];
  certifications?: string[];
  changesApplied: string[];
  estimatedScoreJump: {
    originalScore: number;
    projectedScore: number;
    delta: number;
  };
  modelUsed?: string;
}

export interface ResumeFixerRequest {
  resumeText: string;
  jobDescription: string;
  missingKeywords: string[];
  targetScore?: number;
  provider?: 'huggingface' | 'groq' | 'auto';
}

export interface BuzzwordCrime {
  buzzword: string;
  sentence: string;
  roast: string;
  replacement: string;
}

export interface SavageCritique {
  category: string;
  critique: string;
  roastQuote: string;
  fix: string;
}

export interface RecruiterRoastResult {
  roastMode: 'roast' | 'mentor';
  roastScore: number; // 0 - 100 Survival / Impression score
  survivalTier: 'Instant Shredder' | 'Phone Screen Gamble' | 'Strong Contender' | 'FAANG Onsite Ready';
  roastHeadline: string;
  firstImpressionIn6Seconds: string;
  redFlags: string[];
  savageTakeaways: SavageCritique[];
  buzzwordCrimes: BuzzwordCrime[];
  verdict: string;
  shareablePunchline: string;
  modelUsed?: string;
}

export interface MissingSkillRoi {
  skill: string;
  estimatedAnnualBoost: number;
  boostPercentage: number;
  demandLevel: 'Very High' | 'High' | 'Moderate';
}

export interface MatchedSkillValue {
  skill: string;
  salaryContribution: number;
  percentile: string;
}

export interface RegionalBenchmark {
  region: string;
  rangeText: string;
  flag: string;
}

export interface SkillSalaryEstimate {
  roleTitle: string;
  seniorityLevel: 'Junior' | 'Mid-Level' | 'Senior' | 'Staff / Lead' | 'Principal / Director';
  yearsOfExperienceEstimated: number;
  estimatedSalaryRange: {
    min: number;
    median: number;
    max: number;
    currency: string;
  };
  marketTier: 'Top 10% High-Scale SaaS' | 'Top 25% Enterprise' | 'Competitive Market Average';
  missingSkillRoi: MissingSkillRoi[];
  topValueSkillsMatched: MatchedSkillValue[];
  negotiationPoints: string[];
  regionalBenchmarks: RegionalBenchmark[];
  modelUsed?: string;
}