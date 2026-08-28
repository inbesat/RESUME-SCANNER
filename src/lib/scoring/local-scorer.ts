import { Keyword, KeywordCategory, ScoreBreakdown, ScoreResult, ConfidenceLevel, KeywordImportance } from '@/types';
import { normalizeText, stemWord } from '@/lib/utils/helpers';

const REQUIRED_WEIGHT = 1;
const PREFERRED_WEIGHT = 0.5;

const ALIASES: Record<string, string[]> = {
  'js': ['javascript', 'nodejs', 'typescript'],
  'javascript': ['js'],
  'node.js': ['node', 'nodejs'],
  'nodejs': ['node', 'node.js'],
  'react.js': ['react'],
  'react': ['react.js'],
  'aws': ['amazon web services'],
  'amazon web services': ['aws'],
  'sql': ['mysql', 'postgresql', 'postgres', 'sqlite'],
  'us': ['usa', 'united states'],
  'ui': ['user interface'],
  'ux': ['user experience'],
  'oops': ['object oriented'],
  'oop': ['object oriented', 'object-oriented'],
  'github': ['git'],
  'agile': ['scrum', 'kanban'],
  'scrum': ['agile', 'kanban'],
  'frontend': ['front-end', 'front end'],
  'backend': ['back-end', 'back end'],
  'ai': ['artificial intelligence', 'machine learning'],
  'ml': ['machine learning'],
  'bachelor': ['b.s.', 'bsc', 'bachelor degree', 'bachelor of science', 'bs'],
  'degree': ['bachelor', 'master', 'phd'],
};

function aliasCandidates(keyword: string): string[] {
  const normalized = normalizeText(keyword);
  const candidates = [normalized];
  Object.entries(ALIASES).forEach(([key, values]) => {
    if (normalized === key) {
      candidates.push(...values);
    } else if (values.includes(normalized)) {
      candidates.push(key);
    }
  });
  return candidates;
}

interface TFIDFVector {
  [term: string]: number;
}

function tokenize(text: string): string[] {
  return normalizeText(text).split(' ').filter(Boolean).map(stemWord);
}

function computeTF(tokens: string[]): TFIDFVector {
  const tf: TFIDFVector = {};
  tokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1;
  });
  const total = tokens.length;
  Object.keys(tf).forEach(key => {
    tf[key] = tf[key] / total;
  });
  return tf;
}

function computeIDF(documents: string[][]): TFIDFVector {
  const idf: TFIDFVector = {};
  const docCount = documents.length;
  
  documents.forEach(doc => {
    const uniqueTerms = new Set(doc);
    uniqueTerms.forEach(term => {
      idf[term] = (idf[term] || 0) + 1;
    });
  });
  
  Object.keys(idf).forEach(key => {
    idf[key] = Math.log(docCount / idf[key]);
  });
  
  return idf;
}

function computeTFIDF(tf: TFIDFVector, idf: TFIDFVector): TFIDFVector {
  const tfidf: TFIDFVector = {};
  Object.keys(tf).forEach(key => {
    if (idf[key]) {
      tfidf[key] = tf[key] * idf[key];
    }
  });
  return tfidf;
}

function cosineSimilarity(vecA: TFIDFVector, vecB: TFIDFVector): number {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  keys.forEach(key => {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  });
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function exactKeywordMatch(resumeText: string, keywords: string[]): { matched: string[]; missing: string[]; evidence: Record<string, string[]> } {
  const normalizedResume = normalizeText(resumeText);
  const resumeWords = new Set(normalizedResume.split(' '));
  const sentences = resumeText.split(/\n|(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const normalizedSentences = sentences.map(s => normalizeText(s));
  
  const matched: string[] = [];
  const missing: string[] = [];
  const evidence: Record<string, string[]> = {};
  
  keywords.forEach(keyword => {
    const candidates = aliasCandidates(keyword);
    
    let isMatched = false;
    let matchedEvidence: string[] = [];
    
    for (const candidate of candidates) {
      if (!candidate) continue;
      const candidateWords = candidate.split(' ');
      
      const wordsPresent = candidateWords.every(word => 
        resumeWords.has(word) || 
        resumeWords.has(stemWord(word))
      );
      
      if (wordsPresent || normalizedResume.includes(candidate)) {
        isMatched = true;
        // Find evidence sentences
        matchedEvidence = sentences.filter((_, i) => 
          normalizedSentences[i].includes(candidate) ||
          candidateWords.some(w => normalizedSentences[i].includes(w))
        ).slice(0, 2).map(s => s.trim().slice(0, 200));
        break;
      }
    }
    
    if (isMatched) {
      matched.push(keyword);
      if (matchedEvidence.length > 0) {
        evidence[keyword] = matchedEvidence;
      }
    } else {
      missing.push(keyword);
    }
  });
  
  return { matched, missing, evidence };
}

export function scoreLocally(resumeText: string, keywords: Keyword[]): ScoreResult {
  const startTime = Date.now();
  
  const resumeTokens = tokenize(resumeText);
  const resumeTF = computeTF(resumeTokens);
  
  const categoryKeywords: Record<KeywordCategory, Keyword[]> = {
    technical: [],
    experience: [],
    education: [],
    softSkills: [],
  };
  
  keywords.forEach(kw => {
    categoryKeywords[kw.category].push(kw);
  });
  
  const categoryScores: ScoreBreakdown = {
    technical: { score: 0, matched: [], missing: [] },
    experience: { score: 0, matched: [], missing: [] },
    education: { score: 0, matched: [], missing: [] },
    softSkills: { score: 0, matched: [], missing: [] },
  };
  
  const categoryWeights: Record<KeywordCategory, number> = {
    technical: 0.4,
    experience: 0.3,
    education: 0.2,
    softSkills: 0.1,
  };
  
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  (Object.keys(categoryKeywords) as KeywordCategory[]).forEach(category => {
    const kws = categoryKeywords[category];
    if (kws.length === 0) {
      categoryScores[category] = { score: 100, matched: [], missing: [], evidence: [] };
      totalWeightedScore += 100 * categoryWeights[category];
      totalWeight += categoryWeights[category];
      return;
    }
    
    const keywordTexts = kws.map(k => k.text);
    const { matched, missing, evidence } = exactKeywordMatch(resumeText, keywordTexts);
    
    const keywordImportance: Record<string, KeywordImportance> = {};
    kws.forEach(kw => { keywordImportance[kw.text] = kw.importance || 'required'; });
    
    const importanceOf = (list: string[]) => list.reduce((acc, kw) => acc + (keywordImportance[kw] === 'preferred' ? PREFERRED_WEIGHT : REQUIRED_WEIGHT), 0);
    const totalImportance = importanceOf(keywordTexts);
    const matchedImportance = importanceOf(matched);
    const matchRatio = totalImportance > 0 ? matchedImportance / totalImportance : 0;
    
    const keywordText = keywordTexts.join(' ');
    const keywordTokens = tokenize(keywordText);
    const keywordTF = computeTF(keywordTokens);
    
    const documents = [resumeTokens, keywordTokens];
    const idf = computeIDF(documents);
    const resumeTFIDF = computeTFIDF(resumeTF, idf);
    const keywordTFIDF = computeTFIDF(keywordTF, idf);
    
    const tfidfScore = cosineSimilarity(resumeTFIDF, keywordTFIDF);
    
    const combinedScore = (matchRatio * 0.7 + tfidfScore * 0.3) * 100;
    const finalScore = Math.round(Math.min(100, Math.max(0, combinedScore)));
    
    const categoryEvidence = matched
      .filter(kw => evidence[kw])
      .flatMap(kw => evidence[kw]);
    
    categoryScores[category] = { score: finalScore, matched, missing, evidence: categoryEvidence };
    
    totalWeightedScore += finalScore * categoryWeights[category];
    totalWeight += categoryWeights[category];
  });
  
  const fitPercentage = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  
  const suggestions = generateSuggestions(categoryScores);
  
  return {
    fitPercentage,
    confidence: computeConfidence(resumeText, keywords),
    breakdown: categoryScores,
    suggestions,
    processingTime: Date.now() - startTime,
    scorerUsed: 'local',
  };
}

function computeConfidence(resumeText: string, keywords: Keyword[]): ConfidenceLevel {
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  const keywordCount = keywords.length;
  
  if (wordCount < 50) return 'low';
  if (keywordCount === 0) return 'low';
  if (wordCount < 150 || keywordCount < 3) return 'medium';
  return 'high';
}

function generateSuggestions(breakdown: ScoreBreakdown): string[] {
  const suggestions: string[] = [];
  
  (Object.keys(breakdown) as KeywordCategory[]).forEach(category => {
    const { score, missing } = breakdown[category];
    if (score < 70 && missing.length > 0) {
      const topMissing = missing.slice(0, 3).join(', ');
      suggestions.push(`Add ${category} keywords: ${topMissing}`);
    }
  });
  
  if (suggestions.length === 0) {
    suggestions.push('Strong match across all categories!');
  }
  
  return suggestions;
}