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