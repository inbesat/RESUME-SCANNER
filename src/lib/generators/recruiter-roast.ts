import { RecruiterRoastResult, BuzzwordCrime, SavageCritique } from '@/types';
import Groq from 'groq-sdk';

/**
 * Main Recruiter Roast / Mentor Engine
 */
export async function generateRecruiterRoast(
  resumeText: string,
  jobDescription: string,
  mode: 'roast' | 'mentor' = 'roast'
): Promise<RecruiterRoastResult> {
  const hfKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
  const groqKey = process.env.GROQ_API_KEY;

  // 1. Try Hugging Face if key is present
  if (hfKey) {
    try {
      const hfResult = await callHFRoaster(resumeText, jobDescription, mode, hfKey);
      if (hfResult) return hfResult;
    } catch (err) {
      console.warn('Hugging Face roaster failed, falling back to Groq/Local:', err);
    }
  }

  // 2. Try Groq
  if (groqKey) {
    try {
      const groqResult = await callGroqRoaster(resumeText, jobDescription, mode, groqKey);
      if (groqResult) return groqResult;
    } catch (err) {
      console.warn('Groq roaster failed, falling back to local roaster:', err);
    }
  }

  // 3. Guaranteed Local Rule-Based Engine
  return generateLocalRecruiterRoast(resumeText, jobDescription, mode);
}

async function callHFRoaster(
  resumeText: string,
  jobDescription: string,
  mode: 'roast' | 'mentor',
  apiKey: string
): Promise<RecruiterRoastResult | null> {
  const prompt = buildRoastPrompt(resumeText, jobDescription, mode);
  const model = 'meta-llama/Llama-3.3-70B-Instruct';

  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n${ROAST_SYSTEM_PROMPT}<|eot_id|><|start_header_id|>user<|end_header_id|>\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n`,
      parameters: {
        max_new_tokens: 2500,
        temperature: mode === 'roast' ? 0.7 : 0.3,
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
      roastMode: mode,
      modelUsed: `Hugging Face (${model.split('/')[1]})`,
    };
  }
  return null;
}

async function callGroqRoaster(
  resumeText: string,
  jobDescription: string,
  mode: 'roast' | 'mentor',
  apiKey: string
): Promise<RecruiterRoastResult | null> {
  const groq = new Groq({ apiKey });
  const prompt = buildRoastPrompt(resumeText, jobDescription, mode);

  const models = ['openai/gpt-oss-120b', 'llama-3.3-70b-versatile'];

  for (const model of models) {
    try {
      const completion = await Promise.race([
        groq.chat.completions.create({
          messages: [
            { role: 'system', content: ROAST_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          model,
          temperature: mode === 'roast' ? 0.7 : 0.3,
          max_tokens: 2500,
          response_format: { type: 'json_object' },
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Groq timeout')), 4000)),
      ]);

      const content = completion.choices[0]?.message?.content;
      if (!content) continue;

      const parsed = JSON.parse(content) as RecruiterRoastResult;
      return {
        ...parsed,
        roastMode: mode,
        modelUsed: `Groq (${model})`,
      };
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Pure Local Deterministic Roaster & Mentor
 */
export function generateLocalRecruiterRoast(
  resumeText: string,
  jobDescription: string,
  mode: 'roast' | 'mentor' = 'roast'
): RecruiterRoastResult {
  const lowerResume = resumeText.toLowerCase();
  const lines = resumeText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Detect Buzzwords & Cringe Phrases
  const buzzwordRules = [
    {
      regex: /\b(responsible for|duties included)\b/i,
      buzzword: 'Responsible for',
      roast: 'Sounds like a job description you copied from HR rather than what you actually achieved.',
      mentor: 'Passive duty phrasing obscures your direct personal accomplishments and ownership.',
      replacement: 'Spearheaded / Architected / Drove',
    },
    {
      regex: /\b(team player|hard worker|go-getter|motivated)\b/i,
      buzzword: 'Team player / Go-getter',
      roast: 'The ultimate zero-calorie filler word. Have you ever seen a resume that claims to be a lone-wolf slacker?',
      mentor: 'Subjective self-descriptors are best replaced with verifiable leadership and collaboration outcomes.',
      replacement: 'Collaborated cross-functionally across 4 teams / Mentored 5 engineers',
    },
    {
      regex: /\b(worked on|helped with|assisted)\b/i,
      buzzword: 'Worked on / Helped',
      roast: 'Did you build it, test it, or just stare at the Jira board while someone else merged the PR?',
      mentor: 'Soft verbs downplay your impact. Use strong action verbs that claim clear project ownership.',
      replacement: 'Engineered / Shipped / Deployed',
    },
    {
      regex: /\b(passionate|results-oriented|detail-oriented)\b/i,
      buzzword: 'Passionate / Results-oriented',
      roast: 'Saying you are passionate without numbers is like a chef claiming their food is delicious without serving it.',
      mentor: 'Show, don’t tell. Let your quantified metrics prove your results-driven mindset.',
      replacement: 'Delivered +35% ARR growth / Slashed p99 latency by 40%',
    },
  ];

  const buzzwordCrimes: BuzzwordCrime[] = [];
  buzzwordRules.forEach((rule) => {
    const match = resumeText.match(rule.regex);
    if (match) {
      const sentence = lines.find((l) => rule.regex.test(l)) || match[0];
      buzzwordCrimes.push({
        buzzword: rule.buzzword,
        sentence: sentence.slice(0, 120),
        roast: rule.roast,
        replacement: rule.replacement,
      });
    }
  });

  // Calculate Metric Density & Score
  const numberCount = (resumeText.match(/\b\d+([.,]\d+)?%?|\$\d+|\d+\+/g) || []).length;
  const hasNumbers = numberCount >= 4;

  let roastScore = 45;
  if (hasNumbers) roastScore += 25;
  if (buzzwordCrimes.length === 0) roastScore += 20;
  else roastScore -= buzzwordCrimes.length * 6;
  roastScore = Math.max(15, Math.min(95, roastScore));

  let survivalTier: RecruiterRoastResult['survivalTier'] = 'Phone Screen Gamble';
  if (roastScore < 35) survivalTier = 'Instant Shredder';
  else if (roastScore >= 75) survivalTier = 'FAANG Onsite Ready';
  else if (roastScore >= 55) survivalTier = 'Strong Contender';

  const isRoast = mode === 'roast';

  const roastHeadline = isRoast
    ? (hasNumbers
        ? 'A decent foundation ruined by recruiter-repelling buzzwords and vague impact.'
        : 'Reads like a LinkedIn profile generator had a stroke in 2019. Where are the numbers?')
    : (hasNumbers
        ? 'Solid technical core with strong foundation—ready for executive metric polish.'
        : 'Clear technical capabilities that need quantified achievements to stand out to hiring directors.');

  const firstImpressionIn6Seconds = isRoast
    ? `"I skimmed this in 5 seconds: saw lots of tech names thrown at a wall, zero proof of business impact, and 3 passive bullet points. Next candidate!"`
    : `"The candidate clearly has hands-on technical competence, but hiring managers will struggle to assess the scale of their past projects without explicit metrics."`;

  const redFlags = isRoast
    ? [
        hasNumbers ? 'Understated impact metrics' : '🚨 Zero concrete numbers: No $, %, latency, or user counts found',
        buzzwordCrimes.length > 0 ? `🚨 ${buzzwordCrimes.length} generic buzzword crimes detected` : 'Minor section density imbalance',
        '🚨 Bullet points describe routine duties instead of Google XYZ business outcomes',
      ]
    : [
        hasNumbers ? 'Metrics could be more prominently placed' : 'Opportunity to quantify project scale (e.g. users, volume, savings)',
        'Strengthen action verbs at the start of each bullet point',
        'Tailor technical skills section to mirror the primary job requirements directly',
      ];

  const savageTakeaways: SavageCritique[] = [
    {
      category: 'Metric Density & Google XYZ Formula',
      critique: hasNumbers
        ? 'You included some numbers, but they are buried at the end of paragraphs.'
        : 'Not a single quantified metric in sight. What did the company actually gain by paying your salary?',
      roastQuote: isRoast
        ? '"If you don’t measure your work, recruiters assume it didn’t matter."'
        : '"Hiring managers look for verifiable evidence of scale to justify high-bracket compensation."',
      fix: 'Use the Google XYZ Formula: "Accomplished [X], as measured by [Y], by doing [Z]".',
    },
    {
      category: 'Action Verbs & Ownership',
      critique: 'Passive wording like "worked on" and "assisted with" makes you sound like an intern.',
      roastQuote: isRoast
        ? '"Did you architect the system or just watch the deploy script run?"'
        : '"Lead with high-impact power verbs like Architected, Spearheaded, and Engineered."',
      fix: 'Replace every weak opening verb with an authoritative action verb.',
    },
    {
      category: 'ATS Keyword Alignment',
      critique: 'The resume lists technologies in a disorganized wall of text rather than prioritized domain clusters.',
      roastQuote: isRoast
        ? '"ATS parsers don’t read minds. Categorize your skills or get filtered out before human eyes see it."'
        : '"Group skills into Core Technical, Cloud & DevOps, and Methodologies for instant recruiter scanning."',
      fix: 'Group skills into 3 clean buckets matching the job description.',
    },
  ];

  const verdict = isRoast
    ? (roastScore < 50
        ? 'Verdict: Instant trash-bin candidate unless rewritten with XYZ formula bullets and actual numbers.'
        : 'Verdict: 50/50 coin flip. Fix the buzzwords and bold your metrics to guarantee a phone screen.')
    : 'Verdict: High potential profile that will achieve top-tier callback rates once metrics and active verbs are integrated.';

  const shareablePunchline = isRoast
    ? `My resume got roasted with a ${roastScore}% Survival Rate ("${roastHeadline}"). Testing the AI Resume Screener! 🔥`
    : `Scored ${roastScore}% Candidate Readiness on the AI Resume Career Coach! 🚀`;

  return {
    roastMode: mode,
    roastScore,
    survivalTier,
    roastHeadline,
    firstImpressionIn6Seconds,
    redFlags,
    savageTakeaways,
    buzzwordCrimes,
    verdict,
    shareablePunchline,
    modelUsed: 'Local FAANG Recruiter Audit Engine',
  };
}

const ROAST_SYSTEM_PROMPT = `You are a World-Class, Brutally Honest FAANG Senior Technical Recruiter & Career Coach.
You have reviewed over 50,000 resumes at Google, Meta, and Netflix.

When mode is "roast":
- Deliver witty, savage, hilarious, and brutally honest critiques that call out cliché buzzwords, lack of numbers, and passive phrasing.
- Be entertaining like an internet roast, but provide real, highly actionable fixes.

When mode is "mentor":
- Be encouraging, warm, highly strategic, and supportive while giving sharp, constructive improvements.

Return ONLY a valid JSON object matching the RecruiterRoastResult schema without extra markdown text.`;

function buildRoastPrompt(resumeText: string, jobDescription: string, mode: 'roast' | 'mentor'): string {
  return `Review this resume ${mode === 'roast' ? 'with a hilarious, brutal FAANG recruiter roast' : 'as an expert encouraging career mentor'}.

RESUME TEXT:
${resumeText.slice(0, 3500)}

TARGET JOB:
${jobDescription.slice(0, 2500)}

Return JSON with this schema:
{
  "roastScore": number (0-100 survival score),
  "survivalTier": "Instant Shredder" | "Phone Screen Gamble" | "Strong Contender" | "FAANG Onsite Ready",
  "roastHeadline": "Short punchy summary headline",
  "firstImpressionIn6Seconds": "What a recruiter thinks in 6 seconds",
  "redFlags": ["Flag 1", "Flag 2", "Flag 3"],
  "savageTakeaways": [
    {
      "category": "Area",
      "critique": "Critique explanation",
      "roastQuote": "Punchy memorable quote",
      "fix": "Actionable fix"
    }
  ],
  "buzzwordCrimes": [
    {
      "buzzword": "Flagged phrase",
      "sentence": "Found sentence",
      "roast": "Why it's cringe/weak",
      "replacement": "Strong alternative"
    }
  ],
  "verdict": "Final overall verdict",
  "shareablePunchline": "Viral short tweet/share punchline"
}`;
}

function extractJson(text: string): RecruiterRoastResult | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]) as RecruiterRoastResult;
  } catch {
    return null;
  }
}
