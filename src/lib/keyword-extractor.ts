import { Keyword, KeywordCategory } from '@/types';
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

const EXTRACTION_PROMPT = `You are an expert technical recruiter. Extract relevant keywords from the job description and tag each as REQUIRED or PREFERRED based on how the JD treats it.

Job Description:
{jobDescription}

Return ONLY valid JSON in this exact format:
{
  "technical": [{"name": "React", "importance": "required"}],
  "experience": [{"name": "5+ years", "importance": "required"}],
  "education": [{"name": "BS in CS", "importance": "preferred"}],
  "softSkills": [{"name": "communication", "importance": "required"}]
}

Rules:
- Technical: programming languages, frameworks, tools, platforms, databases, cloud, methodologies
- Experience: years of experience, specific domains, project types, leadership roles
- Education: degrees, certifications, specific courses
- Soft Skills: communication, teamwork, problem-solving, leadership, adaptability
- Extract 5-15 keywords per category max
- Use standard industry terms
- No duplicates across categories
- importance: "required" when the JD demands it (e.g. "must have", "required", "5+ years of X", "proficiency in"); "preferred" when it's aspirational (e.g. "nice to have", "preferred", "a plus", "desirable", "familiarity with")`;

export async function extractKeywordsFromJD(jobDescription: string): Promise<Keyword[]> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }
  
  const prompt = EXTRACTION_PROMPT.replace('{jobDescription}', jobDescription.slice(0, 6000));
  
  try {
    const completion = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });
    
    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');
    
    const result = JSON.parse(content);
    
    const keywords: Keyword[] = [];
    const categories: KeywordCategory[] = ['technical', 'experience', 'education', 'softSkills'];
    
    categories.forEach(category => {
      const items = result[category] || [];
      items.forEach((item: string | { name: string; importance?: string }) => {
        const name = typeof item === 'string' ? item : item.name;
        const importance = typeof item === 'string' ? undefined : item.importance;
        if (!name || !name.trim()) return;
        keywords.push({
          id: `kw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          text: name.trim(),
          category,
          source: 'ai',
          importance: importance === 'preferred' ? 'preferred' : 'required',
        });
      });
    });
    
    return keywords;
  } catch (error) {
    console.error('Keyword extraction error:', error);
    throw new Error('Failed to extract keywords from job description');
  }
}

export function addManualKeywords(existing: Keyword[], manualKeywords: string[], category: KeywordCategory = 'technical'): Keyword[] {
  const existingTexts = new Set(existing.map(k => k.text.toLowerCase()));
  
  const newKeywords: Keyword[] = manualKeywords
    .map(k => k.trim())
    .filter(k => k.length > 0)
    .filter(k => !existingTexts.has(k.toLowerCase()))
    .map(text => ({
      id: `kw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      category,
      source: 'manual' as const,
    }));
  
  return [...existing, ...newKeywords];
}

export function removeKeyword(keywords: Keyword[], id: string): Keyword[] {
  return keywords.filter(k => k.id !== id);
}

export function updateKeywordCategory(keywords: Keyword[], id: string, category: KeywordCategory): Keyword[] {
  return keywords.map(k => k.id === id ? { ...k, category } : k);
}