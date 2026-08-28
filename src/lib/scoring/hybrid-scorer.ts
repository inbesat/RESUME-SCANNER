import { Keyword, ScoreResult, ConfidenceLevel } from '@/types';
import { scoreLocally } from './local-scorer';
import { scoreWithAI } from './ai-scorer';

const LOCAL_WEIGHT = parseFloat(process.env.LOCAL_WEIGHT || '0.4');
const AI_WEIGHT = parseFloat(process.env.AI_WEIGHT || '0.6');

export async function scoreHybrid(resumeText: string, keywords: Keyword[]): Promise<ScoreResult> {
  const startTime = Date.now();
  
  let localResult: ScoreResult;
  let aiResult: ScoreResult | null = null;
  let aiFailureNote: string | null = null;
  
  try {
    localResult = scoreLocally(resumeText, keywords);
  } catch (error) {
    console.error('Local scoring failed:', error);
    localResult = {
      fitPercentage: 0,
      confidence: 'low',
      breakdown: {
        technical: { score: 0, matched: [], missing: [], evidence: [] },
        experience: { score: 0, matched: [], missing: [], evidence: [] },
        education: { score: 0, matched: [], missing: [], evidence: [] },
        softSkills: { score: 0, matched: [], missing: [], evidence: [] },
      },
      suggestions: ['Local scoring unavailable'],
      aiFallbackNote: 'Both AI and local scoring failed. Check the server logs.',
      processingTime: 0,
      scorerUsed: 'local',
    };
  }

  try {
    aiResult = await scoreWithAI(resumeText, keywords);
  } catch (error) {
    console.warn('AI scoring failed, using local only:', error);
    aiFailureNote = 'AI scoring unavailable — showing keyword-based score only.';
  }

  if (!aiResult) {
    return {
      ...localResult,
      scorerUsed: 'local',
      aiFallbackNote: aiFailureNote || undefined,
      processingTime: Date.now() - startTime,
    };
  }
  
  const combinedBreakdown = combineBreakdowns(localResult.breakdown, aiResult.breakdown);
  const fitPercentage = Math.round(
    localResult.fitPercentage * LOCAL_WEIGHT + aiResult.fitPercentage * AI_WEIGHT
  );
  
  const confidenceOrder: ConfidenceLevel[] = ['high', 'medium', 'low'];
  const confidence: ConfidenceLevel = confidenceOrder[
    Math.min(
      confidenceOrder.indexOf(localResult.confidence),
      confidenceOrder.indexOf(aiResult.confidence)
    )
  ];
  
  const suggestions = [...new Set([...localResult.suggestions, ...aiResult.suggestions])].slice(0, 5);
  
  return {
    fitPercentage,
    confidence,
    confidenceReason: aiResult.confidenceReason,
    breakdown: combinedBreakdown,
    suggestions,
    processingTime: Date.now() - startTime,
    scorerUsed: 'hybrid',
  };
}

function combineBreakdowns(local: ScoreResult['breakdown'], ai: ScoreResult['breakdown']): ScoreResult['breakdown'] {
  const categories = ['technical', 'experience', 'education', 'softSkills'] as const;
  
  const combined = {} as ScoreResult['breakdown'];
  
  categories.forEach(category => {
    const localCat = local[category];
    const aiCat = ai[category];
    
    const matched = [...new Set([...localCat.matched, ...aiCat.matched])];
    const allMissing = [...new Set([...localCat.missing, ...aiCat.missing])];
    const missing = allMissing.filter(m => !matched.includes(m));
    
    const evidence = [...new Set([...(localCat.evidence || []), ...(aiCat.evidence || [])])];
    
    combined[category] = {
      score: Math.round(localCat.score * LOCAL_WEIGHT + aiCat.score * AI_WEIGHT),
      matched,
      missing,
      evidence,
    };
  });
  
  return combined;
}