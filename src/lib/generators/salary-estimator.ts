import { SkillSalaryEstimate, MissingSkillRoi, MatchedSkillValue, RegionalBenchmark } from '@/types';
import Groq from 'groq-sdk';

/**
 * Main Skill Salary & Market Value Estimator Engine.
 * Supports Hugging Face Inference API, Groq SDK, and guaranteed local deterministic market model.
 */
export async function generateSalaryEstimate(
  resumeText: string,
  jobDescription: string,
  matchedKeywords: string[] = [],
  missingKeywords: string[] = []
): Promise<SkillSalaryEstimate> {
  const hfKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
  const groqKey = process.env.GROQ_API_KEY;

  // 1. Try Hugging Face
  if (hfKey) {
    try {
      const hfResult = await callHFSalaryEstimator(resumeText, jobDescription, matchedKeywords, missingKeywords, hfKey);
      if (hfResult) return hfResult;
    } catch (err) {
      console.warn('Hugging Face salary estimator failed, falling back to Groq/Local:', err);
    }
  }

  // 2. Try Groq
  if (groqKey) {
    try {
      const groqResult = await callGroqSalaryEstimator(resumeText, jobDescription, matchedKeywords, missingKeywords, groqKey);
      if (groqResult) return groqResult;
    } catch (err) {
      console.warn('Groq salary estimator failed, falling back to local estimator:', err);
    }
  }

  // 3. Guaranteed Local Market Model
  return generateLocalSalaryEstimate(resumeText, jobDescription, matchedKeywords, missingKeywords);
}

async function callHFSalaryEstimator(
  resumeText: string,
  jobDescription: string,
  matchedKeywords: string[],
  missingKeywords: string[],
  apiKey: string
): Promise<SkillSalaryEstimate | null> {
  const prompt = buildSalaryPrompt(resumeText, jobDescription, matchedKeywords, missingKeywords);
  const model = 'meta-llama/Llama-3.3-70B-Instruct';

  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n${SALARY_SYSTEM_PROMPT}<|eot_id|><|start_header_id|>user<|end_header_id|>\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n`,
      parameters: {
        max_new_tokens: 2500,
        temperature: 0.2,
        return_full_text: false,
      },
    }),
  });

  if (!response.ok) return null;
  const result = await response.json();
  const text = Array.isArray(result) ? result[0]?.generated_text : result.generated_text;
  const parsed = extractJson(text);
  if (parsed) {
    return {
      ...parsed,
      modelUsed: `Hugging Face (${model.split('/')[1]})`,
    };
  }
  return null;
}

async function callGroqSalaryEstimator(
  resumeText: string,
  jobDescription: string,
  matchedKeywords: string[],
  missingKeywords: string[],
  apiKey: string
): Promise<SkillSalaryEstimate | null> {
  const groq = new Groq({ apiKey });
  const prompt = buildSalaryPrompt(resumeText, jobDescription, matchedKeywords, missingKeywords);

  const models = ['openai/gpt-oss-120b', 'llama-3.3-70b-versatile'];

  for (const model of models) {
    try {
      const completion = await Promise.race([
        groq.chat.completions.create({
          messages: [
            { role: 'system', content: SALARY_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          model,
          temperature: 0.2,
          max_tokens: 2500,
          response_format: { type: 'json_object' },
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Groq timeout')), 4000)),
      ]);

      const content = completion.choices[0]?.message?.content;
      if (!content) continue;

      const parsed = JSON.parse(content) as SkillSalaryEstimate;
      return {
        ...parsed,
        modelUsed: `Groq (${model})`,
      };
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Local Deterministic Compensation Model
 */
export function generateLocalSalaryEstimate(
  resumeText: string,
  jobDescription: string,
  matchedKeywords: string[] = [],
  missingKeywords: string[] = []
): SkillSalaryEstimate {
  // 1. Determine Role Title
  let roleTitle = 'Senior Software Engineer';
  if (/machine learning|ai engineer|deep learning/i.test(jobDescription)) {
    roleTitle = 'Senior AI / Machine Learning Engineer';
  } else if (/product manager|tech pm/i.test(jobDescription)) {
    roleTitle = 'Senior Technical Product Manager';
  } else if (/data analyst|bi engineer|analytics/i.test(jobDescription)) {
    roleTitle = 'Senior Data & BI Engineer';
  } else if (/frontend|react|ui engineer/i.test(jobDescription)) {
    roleTitle = 'Senior Frontend Engineer';
  } else if (/devops|platform|sre|cloud/i.test(jobDescription)) {
    roleTitle = 'Senior Platform & DevOps Engineer';
  }

  // 2. Estimate Years of Experience
  const years = Array.from(resumeText.matchAll(/\b(20\d{2}|19\d{2})\b/g)).map((m) => parseInt(m[0], 10));
  let yoe = 5;
  if (years.length >= 2) {
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years, new Date().getFullYear());
    yoe = Math.max(1, Math.min(18, maxYear - minYear));
  }

  // 3. Seniority Tier & Base Range
  let seniorityLevel: SkillSalaryEstimate['seniorityLevel'] = 'Senior';
  let baseMin = 145000;
  let baseMedian = 168000;
  let baseMax = 195000;

  if (yoe <= 2) {
    seniorityLevel = 'Junior';
    baseMin = 85000;
    baseMedian = 105000;
    baseMax = 125000;
  } else if (yoe <= 4) {
    seniorityLevel = 'Mid-Level';
    baseMin = 118000;
    baseMedian = 138000;
    baseMax = 158000;
  } else if (yoe <= 8) {
    seniorityLevel = 'Senior';
    baseMin = 148000;
    baseMedian = 172000;
    baseMax = 205000;
  } else if (yoe <= 12) {
    seniorityLevel = 'Staff / Lead';
    baseMin = 190000;
    baseMedian = 225000;
    baseMax = 265000;
  } else {
    seniorityLevel = 'Principal / Director';
    baseMin = 245000;
    baseMedian = 285000;
    baseMax = 340000;
  }

  // Tech Stack Multipliers
  let multiplier = 1.0;
  if (/ai|machine learning|llm/i.test(roleTitle)) multiplier += 0.15;
  if (/devops|platform|cloud/i.test(roleTitle)) multiplier += 0.1;
  if (matchedKeywords.length >= 6) multiplier += 0.08;

  const min = Math.round((baseMin * multiplier) / 1000) * 1000;
  const median = Math.round((baseMedian * multiplier) / 1000) * 1000;
  const max = Math.round((baseMax * multiplier) / 1000) * 1000;

  // 4. Missing Skill ROI Leaderboard
  const skillValues: Record<string, { boost: number; demand: MissingSkillRoi['demandLevel'] }> = {
    AWS: { boost: 14500, demand: 'Very High' },
    Kubernetes: { boost: 13800, demand: 'Very High' },
    Docker: { boost: 9800, demand: 'High' },
    TypeScript: { boost: 8500, demand: 'High' },
    'System Design': { boost: 12500, demand: 'Very High' },
    'GraphQL / REST': { boost: 7200, demand: 'Moderate' },
    'CI/CD Pipelines': { boost: 8900, demand: 'High' },
    Python: { boost: 9500, demand: 'High' },
    React: { boost: 8200, demand: 'High' },
    'SQL / PostgreSQL': { boost: 7500, demand: 'Moderate' },
  };

  const missingSkillRoi: MissingSkillRoi[] = (missingKeywords.length > 0 ? missingKeywords : ['AWS', 'Docker', 'Kubernetes', 'CI/CD'])
    .slice(0, 5)
    .map((skill) => {
      const match = skillValues[skill] || {
        boost: Math.floor(Math.random() * 5000) + 6500,
        demand: 'High' as const,
      };
      return {
        skill,
        estimatedAnnualBoost: match.boost,
        boostPercentage: Math.round((match.boost / median) * 100 * 10) / 10,
        demandLevel: match.demand,
      };
    })
    .sort((a, b) => b.estimatedAnnualBoost - a.estimatedAnnualBoost);

  // 5. Matched Skills Value Contribution
  const topValueSkillsMatched: MatchedSkillValue[] = (matchedKeywords.length > 0 ? matchedKeywords : ['TypeScript', 'React', 'Node.js', 'Next.js'])
    .slice(0, 4)
    .map((skill) => ({
      skill,
      salaryContribution: Math.floor(median * 0.12),
      percentile: 'Top 15% Demand',
    }));

  // 6. Regional Benchmarks
  const regionalBenchmarks: RegionalBenchmark[] = [
    { region: 'US Remote / Nationwide', rangeText: `$${Math.round(min / 1000)}k – $${Math.round(max / 1000)}k`, flag: '🇺🇸' },
    { region: 'San Francisco Bay Area / NYC (High COL)', rangeText: `$${Math.round((min * 1.18) / 1000)}k – $${Math.round((max * 1.2) / 1000)}k`, flag: '🌉' },
    { region: 'London & Western Europe', rangeText: `£${Math.round((min * 0.72) / 1000)}k – £${Math.round((max * 0.75) / 1000)}k`, flag: '🇬🇧' },
    { region: 'Bangalore & Tier-1 India', rangeText: `₹${Math.round((min * 0.22) / 1000)}L – ₹${Math.round((max * 0.24) / 1000)}L`, flag: '🇮🇳' },
  ];

  // 7. Salary Negotiation Talking Points
  const negotiationPoints = [
    `"Based on my proven track record in ${topValueSkillsMatched[0]?.skill || 'core architecture'} and verified performance metrics, market data places this profile in the $${Math.round(median / 1000)}k tier."`,
    `"My experience delivering measurable latency and scaling improvements directly aligns with your high-impact deliverables, supporting compensation at the upper quartile."`,
    `"Adding competencies in ${missingSkillRoi[0]?.skill || 'cloud architecture'} will further unlock full-stack ownership across platform and telemetry pipelines."`,
  ];

  return {
    roleTitle,
    seniorityLevel,
    yearsOfExperienceEstimated: yoe,
    estimatedSalaryRange: {
      min,
      median,
      max,
      currency: 'USD',
    },
    marketTier: 'Top 10% High-Scale SaaS',
    missingSkillRoi,
    topValueSkillsMatched,
    negotiationPoints,
    regionalBenchmarks,
    modelUsed: 'Local 2026 Tech Compensation Index',
  };
}

const SALARY_SYSTEM_PROMPT = `You are a Principal Tech Compensation & Executive Talent Partner specializing in 2026 tech compensation benchmarks (Levels.fyi, Radford, Comprehensive.io).
Analyze the candidate's resume, matched skills, missing skills, and target job description to compute realistic salary estimates, missing skill dollar ROI, and negotiation talking points.

Return ONLY a valid JSON object matching the SkillSalaryEstimate schema without extra markdown.`;

function buildSalaryPrompt(
  resumeText: string,
  jobDescription: string,
  matchedKeywords: string[],
  missingKeywords: string[]
): string {
  return `Estimate market salary, missing skill ROI, and negotiation points for this profile.

RESUME TEXT:
${resumeText.slice(0, 3000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 2500)}

MATCHED SKILLS: ${matchedKeywords.join(', ') || 'General Engineering'}
MISSING SKILLS: ${missingKeywords.join(', ') || 'Cloud, DevOps, Scaling'}

Return JSON matching this schema:
{
  "roleTitle": "Role Title",
  "seniorityLevel": "Junior" | "Mid-Level" | "Senior" | "Staff / Lead" | "Principal / Director",
  "yearsOfExperienceEstimated": number,
  "estimatedSalaryRange": {
    "min": number,
    "median": number,
    "max": number,
    "currency": "USD"
  },
  "marketTier": "Top 10% High-Scale SaaS" | "Top 25% Enterprise" | "Competitive Market Average",
  "missingSkillRoi": [
    {
      "skill": "Skill Name",
      "estimatedAnnualBoost": number,
      "boostPercentage": number,
      "demandLevel": "Very High" | "High" | "Moderate"
    }
  ],
  "topValueSkillsMatched": [
    {
      "skill": "Skill",
      "salaryContribution": number,
      "percentile": "Top 15% Demand"
    }
  ],
  "negotiationPoints": ["Point 1", "Point 2", "Point 3"],
  "regionalBenchmarks": [
    { "region": "US Remote", "rangeText": "$145k - $185k", "flag": "🇺🇸" },
    { "region": "SF / NYC", "rangeText": "$170k - $215k", "flag": "🌉" },
    { "region": "London", "rangeText": "£90k - £125k", "flag": "🇬🇧" },
    { "region": "India (Bangalore)", "rangeText": "₹32L - ₹48L", "flag": "🇮🇳" }
  ]
}`;
}

function extractJson(text: string): SkillSalaryEstimate | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]) as SkillSalaryEstimate;
  } catch {
    return null;
  }
}
