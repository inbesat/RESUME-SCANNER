import Groq from 'groq-sdk';
import { BulletOptimizationResult, BulletSuggestion } from '@/types';

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

const BULLET_PROMPT = `You are an elite Silicon Valley executive resume coach. 
Your job is to write 3 high-impact, ATS-optimized resume bullet points that integrate the target skill or improve an existing bullet point.

Target Skill / Gap to address: "{skill}"
Current Bullet (if any): "{currentBullet}"
Resume Background Context:
{resumeContext}

Job Description Context:
{jobDescription}

Formula Rules:
1. Follow Google's XYZ Formula: "Accomplished [X], as measured by [Y], by doing [Z]"
2. Start with a powerful active verb (Engineered, Architected, Spearheaded, Optimized, Scaled, Streamlined)
3. Include realistic, concrete quantifiable metrics (%, latency, revenue, hours saved, throughput)
4. Weave in the target skill naturally without keyword stuffing
5. Keep each bullet between 18-28 words for maximum recruiter readability

Return ONLY valid JSON in this exact structure:
{
  "bullets": [
    {
      "bullet": "Architected distributed event-driven microservices using React and TypeScript, reducing client load times by 42% across 250k daily active users.",
      "metricUsed": "42% latency reduction, 250k DAU",
      "skillTargeted": "React / TypeScript",
      "explanation": "Demonstrates high-scale frontend architecture and tangible user impact."
    },
    {
      "bullet": "Spearheaded frontend migration to Next.js and Tailwind, boosting Lighthouse performance score from 68 to 96 and decreasing page drop-off by 18%.",
      "metricUsed": "Lighthouse 68 -> 96, 18% less drop-off",
      "skillTargeted": "Next.js",
      "explanation": "Highlights modernization leadership and business conversion metrics."
    },
    {
      "bullet": "Engineered automated CI/CD deployment pipelines integrating Docker and Jest, accelerating deployment frequency from weekly to daily with zero downtime.",
      "metricUsed": "Weekly to daily releases, 0 downtime",
      "skillTargeted": "Docker / Testing",
      "explanation": "Proves DevOps competence and software reliability practices."
    }
  ]
}`;

export function generateBulletsLocally(skill: string, currentBullet?: string): BulletOptimizationResult {
  const cleanSkill = skill.trim() || 'Software Engineering';
  const bullets: BulletSuggestion[] = [
    {
      bullet: currentBullet
        ? `Architected and scaled core features using ${cleanSkill}, accelerating system performance by 35% and supporting over 100k+ active users.`
        : `Architected and deployed high-availability solutions leveraging ${cleanSkill}, optimizing execution latency by 35% across production environments.`,
      metricUsed: '35% performance improvement',
      skillTargeted: cleanSkill,
      explanation: `Emphasizes architecture leadership and quantifiable throughput gains using ${cleanSkill}.`,
    },
    {
      bullet: currentBullet
        ? `Spearheaded cross-functional initiative integrating ${cleanSkill}, reducing error rates by 28% and streamlining developer release cycles.`
        : `Spearheaded development of scalable modules with ${cleanSkill}, reducing downtime by 28% and improving team delivery velocity.`,
      metricUsed: '28% error reduction',
      skillTargeted: cleanSkill,
      explanation: `Demonstrates engineering rigor, reliability enhancements, and collaboration with ${cleanSkill}.`,
    },
    {
      bullet: `Engineered automated workflows and robust pipelines incorporating ${cleanSkill}, cutting manual overhead by 40 hours monthly for team.`,
      metricUsed: '40 hours/month saved',
      skillTargeted: cleanSkill,
      explanation: `Highlights automation, operational efficiency, and tangible business ROI with ${cleanSkill}.`,
    },
  ];

  return {
    bullets,
    keyword: cleanSkill,
  };
}

export async function optimizeBullet(options: {
  skill: string;
  currentBullet?: string;
  resumeContext?: string;
  jobDescription?: string;
}): Promise<BulletOptimizationResult> {
  const { skill, currentBullet = '', resumeContext = '', jobDescription = '' } = options;

  if (!process.env.GROQ_API_KEY) {
    return generateBulletsLocally(skill, currentBullet);
  }

  const prompt = BULLET_PROMPT
    .replace('{skill}', skill)
    .replace('{currentBullet}', currentBullet || 'None provided')
    .replace('{resumeContext}', (resumeContext || '').slice(0, 3000))
    .replace('{jobDescription}', (jobDescription || '').slice(0, 3000));

  try {
    const groqClient = getGroq();
    const completion = await groqClient.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');

    const parsed = JSON.parse(content);
    if (parsed.bullets && Array.isArray(parsed.bullets) && parsed.bullets.length > 0) {
      return {
        bullets: parsed.bullets,
        keyword: skill,
      };
    }
    return generateBulletsLocally(skill, currentBullet);
  } catch (err) {
    console.warn('AI bullet optimization failed, using local generator:', err);
    return generateBulletsLocally(skill, currentBullet);
  }
}
