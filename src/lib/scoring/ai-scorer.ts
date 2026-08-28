import { Keyword, KeywordCategory, ScoreBreakdown, ScoreResult, ConfidenceLevel } from '@/types';
import Groq from 'groq-sdk';

let groq: Groq | null = null;

function getGroq(): Groq {
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
}

const MODEL = 'openai/gpt-oss-120b';

const SCORING_PROMPT = `You are an expert technical recruiter. Analyze the resume against the provided keywords and score each category 0-100.

Keywords by category:
{keywords}

Resume:
{resume}

Return ONLY valid JSON in this exact format:
{
  "technical": {"score": number, "matched": ["keyword1"], "missing": ["keyword2"], "evidence": ["quote from resume"]},
  "experience": {"score": number, "matched": [], "missing": [], "evidence": []},
  "education": {"score": number, "matched": [], "missing": [], "evidence": []},
  "softSkills": {"score": number, "matched": [], "missing": [], "evidence": []},
  "suggestions": ["specific actionable suggestion 1", "specific actionable suggestion 2"],
  "confidence": "high" | "medium" | "low",
  "confidenceReason": "one sentence explaining confidence"
}

Rules:
- Score based on semantic match, not just exact keywords
- Treat synonyms and abbreviations as matches (e.g. "JS" ~ "JavaScript", "React" ~ "React.js", "AWS" ~ "Amazon Web Services", "2 years" ~ "2 yrs")
- Consider implied experience only when clearly supported by context
- Matched: keyword clearly demonstrated in resume. For each matched keyword, include a short verbatim quote from the resume as evidence.
- Missing: keywords not found or insufficient evidence
- Suggestions: 2-3 specific, actionable improvements
- Confidence: "high" when resume and keywords are both detailed and unambiguous; "low" when resume is short, vague, or the JD keywords are broad
- "experience" scoring: favor ability to do the job (years, scope, leadership) over literal phrase match
- "education" scoring: treat "BS", "Bachelor's", "B.S." as equivalent; if a degree is required but absent, missing should list it
- Score 0 for a category if its keywords list is empty in the input
- Keywords marked "(preferred)" should be treated as nice-to-have: they matter less for the score and should not zero out a category on their own
- A candidate missing a "(required)" keyword should see that explicitly in the missing list`;

export async function scoreWithAI(resumeText: string, keywords: Keyword[]): Promise<ScoreResult> {
  const startTime = Date.now();
  
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }
  
  const keywordsByCategory: Record<KeywordCategory, string[]> = {
    technical: [],
    experience: [],
    education: [],
    softSkills: [],
  };
  
  keywords.forEach(kw => {
    const marker = kw.importance === 'preferred' ? ' (preferred)' : '';
    keywordsByCategory[kw.category].push(`${kw.text}${marker}`);
  });
  
  const keywordsFormatted = Object.entries(keywordsByCategory)
    .filter(([, v]) => v.length > 0)
    .map(([cat, kws]) => `${cat}: ${kws.join(', ')}`)
    .join('\n');
  
  const prompt = SCORING_PROMPT
    .replace('{keywords}', keywordsFormatted)
    .replace('{resume}', resumeText.slice(0, 8000));
  
  try {
    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });
    
    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');
    
    const result = JSON.parse(content);
    
    const categoryScores: ScoreBreakdown = {
      technical: result.technical || { score: 0, matched: [], missing: [], evidence: [] },
      experience: result.experience || { score: 0, matched: [], missing: [], evidence: [] },
      education: result.education || { score: 0, matched: [], missing: [], evidence: [] },
      softSkills: result.softSkills || { score: 0, matched: [], missing: [], evidence: [] },
    };
    
    const categoryWeights: Record<KeywordCategory, number> = {
      technical: 0.4,
      experience: 0.3,
      education: 0.2,
      softSkills: 0.1,
    };
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    (Object.keys(categoryScores) as KeywordCategory[]).forEach(category => {
      const weight = categoryWeights[category];
      if (keywordsByCategory[category].length > 0) {
        totalWeightedScore += categoryScores[category].score * weight;
        totalWeight += weight;
      }
    });
    
    const fitPercentage = totalWeight > 0 
      ? Math.round(totalWeightedScore / totalWeight) 
      : 0;
    
    const confidence: ConfidenceLevel = 
      (result.confidence === 'high' || result.confidence === 'medium' || result.confidence === 'low')
        ? result.confidence
        : (resumeText.trim().length < 300 ? 'low' : 'medium');
    
    return {
      fitPercentage,
      confidence,
      confidenceReason: result.confidenceReason || undefined,
      breakdown: categoryScores,
      suggestions: result.suggestions || [],
      processingTime: Date.now() - startTime,
      scorerUsed: 'ai',
    };
  } catch (error) {
    console.error('AI scoring error:', error);
    throw new Error('AI scoring failed. Falling back to local scoring.');
  }
}