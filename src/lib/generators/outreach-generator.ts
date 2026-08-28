import Groq from 'groq-sdk';
import { OutreachResult } from '@/types';

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

const OUTREACH_PROMPT = `You are an elite career strategist. 
Write a high-converting, personalized job application outreach package based on this candidate's resume and target job description.

Candidate Resume Background:
{resumeText}

Target Job Description:
{jobDescription}

Key Matched Strengths: {matchedSkills}

Requirements:
1. Cover Letter: 3 concise, impactful paragraphs (Intro & Hook, Core Relevant Achievements with metrics, Enthusiasm & Value Add). Avoid generic fluff.
2. LinkedIn Recruiter DM: Max 100-120 words. Crisp, high-signal, respectful of time, directly mentions 1-2 core technical alignments.
3. Follow-Up Email: 80 words max for following up 5-7 days post-application.

Return ONLY valid JSON in this exact structure:
{
  "coverLetter": "Dear Hiring Team,\\n\\nI am writing to express my strong interest in the [Role] position at [Company]...",
  "linkedinDm": "Hi [Name], I noticed you're building out the team for [Role] at [Company]...",
  "followUpEmail": "Hi [Name],\\n\\nI wanted to briefly follow up on my application for the [Role] role submitted last week...",
  "keyStrengthsUsed": ["Strength 1", "Strength 2", "Strength 3"]
}`;

export function generateOutreachLocally(options: {
  matchedKeywords: string[];
  jobTitle?: string;
  companyName?: string;
}): OutreachResult {
  const { matchedKeywords, jobTitle = 'the role', companyName = 'your team' } = options;
  const topStrengths = matchedKeywords.slice(0, 4);
  const skillsList = topStrengths.join(', ') || 'modern software engineering and scalable systems';

  const coverLetter = `Dear Hiring Team,

I am writing to express my strong enthusiasm for ${jobTitle} at ${companyName}. With deep hands-on experience in ${skillsList}, I have consistently delivered high-impact software solutions that drive measurable business outcomes.

In my recent projects, I specialized in architecting resilient systems, optimizing runtime performance, and collaborating closely with cross-functional teams to accelerate product delivery. My background directly aligns with your requirements for ${skillsList}, enabling me to contribute to your core engineering objectives from day one.

I would love the opportunity to discuss how my experience and technical skill set can help scale ${companyName}'s engineering roadmap. Thank you for your time and consideration.

Sincerely,
Candidate`;

  const linkedinDm = `Hi [Name],

I noticed you're leading talent for ${jobTitle} at ${companyName} and wanted to reach out directly. 

With deep experience in ${skillsList}, I've recently delivered high-scale systems that improved performance and release velocity. Given your focus on these technologies, I believe I could bring immediate value to the team.

I've submitted an application and would love to share a quick 2-minute overview if you have a moment. Thanks!`;

  const followUpEmail = `Hi [Name],

I hope you're having a great week. I wanted to follow up on my application for the ${jobTitle} position at ${companyName} submitted last week.

I remain very excited about the opportunity to contribute with my background in ${skillsList}. Please let me know if there are any additional materials or details I can provide.

Best regards,
Candidate`;

  return {
    coverLetter,
    linkedinDm,
    followUpEmail,
    keyStrengthsUsed: topStrengths.length > 0 ? topStrengths : ['Software Architecture', 'System Optimization', 'Agile Delivery'],
  };
}

export async function generateOutreach(options: {
  resumeText: string;
  jobDescription: string;
  matchedKeywords: string[];
}): Promise<OutreachResult> {
  const { resumeText, jobDescription, matchedKeywords } = options;

  if (!process.env.GROQ_API_KEY) {
    return generateOutreachLocally({ matchedKeywords });
  }

  const prompt = OUTREACH_PROMPT
    .replace('{resumeText}', resumeText.slice(0, 3500))
    .replace('{jobDescription}', jobDescription.slice(0, 3500))
    .replace('{matchedSkills}', matchedKeywords.slice(0, 8).join(', ') || 'Engineering excellence');

  try {
    const groqClient = getGroq();
    const completion = await groqClient.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1800,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');

    const parsed = JSON.parse(content);
    if (parsed.coverLetter && parsed.linkedinDm) {
      return {
        coverLetter: parsed.coverLetter,
        linkedinDm: parsed.linkedinDm,
        followUpEmail: parsed.followUpEmail || 'Hi [Name], following up on my application...',
        keyStrengthsUsed: parsed.keyStrengthsUsed || matchedKeywords.slice(0, 3),
      };
    }
    return generateOutreachLocally({ matchedKeywords });
  } catch (err) {
    console.warn('AI outreach generation failed, using local generator:', err);
    return generateOutreachLocally({ matchedKeywords });
  }
}
