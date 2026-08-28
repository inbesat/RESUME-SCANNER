import { Keyword, KeywordCategory } from '@/types';
import Groq from 'groq-sdk';
import { generateId } from '@/lib/utils/helpers';

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

const TECH_DICTIONARY = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'SQL',
  'React', 'Next.js', 'Vue.js', 'Vue', 'Angular', 'Svelte', 'Tailwind CSS', 'Tailwind', 'HTML', 'CSS', 'HTML5', 'CSS3', 'Redux', 'Webpack', 'Vite',
  'Node.js', 'NodeJS', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'GraphQL', 'REST', 'RESTful API', 'gRPC',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'DynamoDB', 'Elasticsearch', 'Prisma', 'TypeORM',
  'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'GitHub Actions', 'Git', 'Linux', 'Nginx',
  'PyTorch', 'TensorFlow', 'Machine Learning', 'Deep Learning', 'NLP', 'LLM', 'AI',
  'Jest', 'Vitest', 'Cypress', 'Playwright', 'Mocha', 'Microservices', 'System Design'
];

const SOFT_SKILLS_DICTIONARY = [
  'Communication', 'Teamwork', 'Collaboration', 'Problem Solving', 'Leadership', 'Mentorship',
  'Critical Thinking', 'Adaptability', 'Time Management', 'Agile', 'Scrum', 'Cross-functional',
  'Analytical Skills', 'Attention to Detail', 'Ownership'
];

const EDUCATION_DICTIONARY = [
  'Bachelor of Science', 'Bachelor\'s Degree', 'Master\'s Degree', 'Master of Science',
  'PhD', 'Computer Science', 'Software Engineering', 'Information Technology', 'B.S.', 'M.S.', 'BS in CS'
];

export function extractKeywordsLocally(jobDescription: string): Keyword[] {
  const jdLower = jobDescription.toLowerCase();
  const keywords: Keyword[] = [];
  const addedTexts = new Set<string>();

  // Extract Technical keywords
  for (const tech of TECH_DICTIONARY) {
    const escaped = tech.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(jobDescription) && !addedTexts.has(tech.toLowerCase())) {
      addedTexts.add(tech.toLowerCase());
      const isPreferred = /nice to have|preferred|plus|optional/i.test(jobDescription.slice(Math.max(0, jobDescription.toLowerCase().indexOf(tech.toLowerCase()) - 50), jobDescription.toLowerCase().indexOf(tech.toLowerCase()) + 50));
      keywords.push({
        id: `kw-${Date.now()}-${generateId().slice(0, 6)}`,
        text: tech,
        category: 'technical',
        source: 'manual',
        importance: isPreferred ? 'preferred' : 'required',
      });
      if (keywords.filter(k => k.category === 'technical').length >= 12) break;
    }
  }

  // Extract Experience keywords
  const expMatch = jobDescription.match(/\b(\d+\+?\s*(?:years?|yrs?)(?:\s+of\s+experience)?)\b/i);
  if (expMatch && !addedTexts.has(expMatch[1].toLowerCase())) {
    addedTexts.add(expMatch[1].toLowerCase());
    keywords.push({
      id: `kw-${Date.now()}-${generateId().slice(0, 6)}`,
      text: expMatch[1].trim(),
      category: 'experience',
      source: 'manual',
      importance: 'required',
    });
  }

  const roleTypes = ['Senior', 'Lead', 'Architect', 'Full Stack', 'Frontend', 'Backend', 'DevOps', 'Mobile'];
  for (const role of roleTypes) {
    if (new RegExp(`\\b${role}\\b`, 'i').test(jobDescription) && !addedTexts.has(role.toLowerCase())) {
      addedTexts.add(role.toLowerCase());
      keywords.push({
        id: `kw-${Date.now()}-${generateId().slice(0, 6)}`,
        text: `${role} Experience`,
        category: 'experience',
        source: 'manual',
        importance: 'required',
      });
      break;
    }
  }

  // Extract Education keywords
  for (const edu of EDUCATION_DICTIONARY) {
    const regex = new RegExp(`\\b${edu.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    if (regex.test(jobDescription) && !addedTexts.has(edu.toLowerCase())) {
      addedTexts.add(edu.toLowerCase());
      keywords.push({
        id: `kw-${Date.now()}-${generateId().slice(0, 6)}`,
        text: edu,
        category: 'education',
        source: 'manual',
        importance: 'preferred',
      });
      if (keywords.filter(k => k.category === 'education').length >= 3) break;
    }
  }

  // Extract Soft Skills keywords
  for (const soft of SOFT_SKILLS_DICTIONARY) {
    const regex = new RegExp(`\\b${soft.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    if (regex.test(jobDescription) && !addedTexts.has(soft.toLowerCase())) {
      addedTexts.add(soft.toLowerCase());
      keywords.push({
        id: `kw-${Date.now()}-${generateId().slice(0, 6)}`,
        text: soft,
        category: 'softSkills',
        source: 'manual',
        importance: 'preferred',
      });
      if (keywords.filter(k => k.category === 'softSkills').length >= 4) break;
    }
  }

  return keywords;
}

export async function extractKeywordsFromJD(jobDescription: string): Promise<Keyword[]> {
  if (!process.env.GROQ_API_KEY) {
    return extractKeywordsLocally(jobDescription);
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
          id: `kw-${Date.now()}-${generateId().slice(0, 6)}`,
          text: name.trim(),
          category,
          source: 'ai',
          importance: importance === 'preferred' ? 'preferred' : 'required',
        });
      });
    });
    
    if (keywords.length === 0) {
      return extractKeywordsLocally(jobDescription);
    }

    return keywords;
  } catch (error) {
    console.warn('AI keyword extraction failed, falling back to local extractor:', error);
    const local = extractKeywordsLocally(jobDescription);
    if (local.length > 0) return local;
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
      id: `kw-${Date.now()}-${generateId().slice(0, 6)}`,
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