import Groq from 'groq-sdk';
import { InterviewPrepResult, InterviewQuestion, Keyword } from '@/types';
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

const INTERVIEW_PROMPT = `You are a Principal Hiring Manager and Bar Raiser at a top tier technology company.
Analyze this resume against the target job description and predict the Top 5 most critical interview questions that will be asked.

Cover these specific dimensions:
1. Technical Depth (probing core matched stack)
2. Skill Gap Probe (investigating missing skills or areas with light evidence)
3. Architecture / Problem Solving (scaling and system decisions)
4. Leadership & Ambiguity (driving results under constraints)
5. Behavioral / STAR scenario

Resume:
{resumeText}

Job Description:
{jobDescription}

Matched Skills: {matchedSkills}
Missing Skills / Gaps: {missingSkills}

Return ONLY valid JSON in this exact structure:
{
  "candidateSummary": "2-sentence executive summary of the candidate's fit, main strength, and primary risk area to prepare for.",
  "keyStrengths": ["Strength 1", "Strength 2", "Strength 3"],
  "topGaps": ["Gap 1", "Gap 2"],
  "questions": [
    {
      "id": "q1",
      "question": "Can you walk me through how you architected state management and performance optimization in your React applications?",
      "category": "technical",
      "whyAsked": "The role requires high-scale frontend responsiveness; interviewers want to test if you understand rendering lifecycles beyond surface APIs.",
      "starGuide": {
        "situation": "High-traffic dashboard with sluggish 3-second render times under heavy data streams.",
        "task": "Refactor component rendering and state synchronization without disrupting live customer traffic.",
        "action": "Implemented selective memoization, split global contexts into atomic Zustand stores, and virtualized tables.",
        "result": "Cut re-renders by 70%, reduced initial load time to 450ms, and scaled to 50k concurrent users seamlessly."
      },
      "sampleAnswer": "In my previous role, our core real-time analytics dashboard suffered from heavy re-renders as data streams grew. I isolated state into atomic stores, memoized expensive calculation pipelines, and introduced windowed rendering for large tables. This dropped render latency by 70% and supported 50k concurrent users."
    }
  ]
}`;

export function generateInterviewPrepLocally(options: {
  matchedKeywords: string[];
  missingKeywords: string[];
}): InterviewPrepResult {
  const { matchedKeywords, missingKeywords } = options;
  const topMatched = matchedKeywords.slice(0, 3);
  const topMissing = missingKeywords.slice(0, 3);

  const mainTech = topMatched[0] || 'your core technical stack';
  const missingTech = topMissing[0] || 'new technologies';

  const questions: InterviewQuestion[] = [
    {
      id: generateId(),
      question: `How have you leveraged ${mainTech} to solve complex engineering bottlenecks in high-scale production?`,
      category: 'technical',
      whyAsked: `Interviewers want to test your hands-on mastery of ${mainTech} beyond basic usage.`,
      starGuide: {
        situation: `Encountered performance or scalability bottlenecks when deploying ${mainTech} in production.`,
        task: `Identify root causes and optimize the architecture to sustain peak user loads.`,
        action: `Profiled performance bottlenecks, refactored data flows, and instituted best-practice patterns with ${mainTech}.`,
        result: `Improved system throughput by 40% and reduced latency while ensuring zero downtime.`,
      },
      sampleAnswer: `When scaling our production systems using ${mainTech}, we noticed execution overhead during peak hours. I profiled data access paths, eliminated redundant computations, and restructured our core pipeline. This led to a 40% improvement in throughput and stabilized our response times.`,
    },
    {
      id: generateId(),
      question: `This role emphasizes ${missingTech}, which is not prominent on your resume. How do you plan to ramp up, and what related experience bridges this gap?`,
      category: 'gap',
      whyAsked: `Hiring managers want to test your self-awareness, rapid learning ability, and transferable engineering principles.`,
      starGuide: {
        situation: `Had to deliver a critical project using an unfamiliar framework or paradigm under tight deadlines.`,
        task: `Quickly master the fundamental paradigms and deliver production-ready code.`,
        action: `Mapped architectural similarities from ${mainTech}, built rapid prototypes, and consulted domain documentation.`,
        result: `Shipped on schedule with 100% test coverage and established internal team documentation.`,
      },
      sampleAnswer: `While my deep background has focused on ${mainTech}, the foundational paradigms of scalability, reliability, and clean architecture translate directly to ${missingTech}. In past projects where I adopted new tools, I immersed in the ecosystem, built proof-of-concepts, and shipped production milestones within weeks.`,
    },
    {
      id: generateId(),
      question: `Tell me about a time you made a difficult trade-off between shipping speed and technical debt.`,
      category: 'experience',
      whyAsked: `Evaluates engineering maturity, business acumen, and pragmatic decision-making.`,
      starGuide: {
        situation: `Tight commercial deadline required launching a major feature with limited engineering runway.`,
        task: `Balance rapid time-to-market with maintainable system architecture.`,
        action: `Delivered a decoupled MVP with strict interfaces, documented intentional debt, and scheduled a dedicated hardening sprint.`,
        result: `Hit the launch deadline capturing 15% new user growth, then refactored the subsystem cleanly with zero customer disruption.`,
      },
      sampleAnswer: `We had a tight market deadline for a high-priority integration. I architected the MVP with clean interface boundaries so we could ship quickly while isolating temporary workarounds. Post-launch, we used telemetry data to refactor the hot paths during a scheduled hardening cycle, ensuring zero long-term degradation.`,
    },
    {
      id: generateId(),
      question: `Describe a scenario where you had to persuade cross-functional stakeholders or disagree and commit on an architectural direction.`,
      category: 'behavioral',
      whyAsked: `Assesses communication, influence without authority, and alignment with organizational goals.`,
      starGuide: {
        situation: `Disagreement between engineering and product teams regarding technical refactoring vs. immediate feature additions.`,
        task: `Align the team on a unified roadmap that protected platform stability while delivering product value.`,
        action: `Presented objective data on error rates and customer impact, proposing a phased hybrid delivery plan.`,
        result: `Reached consensus, delivered both critical features and 30% reliability improvement on the platform.`,
      },
      sampleAnswer: `When our engineering team needed a database migration that product feared would delay feature delivery, I framed the proposal in terms of customer downtime and business impact. By presenting data on failure rates and proposing an incremental migration alongside feature work, we achieved full stakeholder alignment and shipped both on time.`,
    },
  ];

  return {
    candidateSummary: `Candidate presents strong demonstrable experience in ${topMatched.join(', ') || 'software engineering'}, with key preparation focus on addressing ${topMissing.join(', ') || 'unfamiliar tools'}.`,
    keyStrengths: topMatched.length > 0 ? topMatched : ['Core Software Engineering', 'Production Reliability', 'Problem Solving'],
    topGaps: topMissing.length > 0 ? topMissing : ['Domain Specific Tools'],
    questions,
  };
}

export async function predictInterviewQuestions(options: {
  resumeText: string;
  jobDescription: string;
  keywords: Keyword[];
  matchedKeywords: string[];
  missingKeywords: string[];
}): Promise<InterviewPrepResult> {
  const { resumeText, jobDescription, matchedKeywords, missingKeywords } = options;

  if (!process.env.GROQ_API_KEY) {
    return generateInterviewPrepLocally({ matchedKeywords, missingKeywords });
  }

  const prompt = INTERVIEW_PROMPT
    .replace('{resumeText}', resumeText.slice(0, 4000))
    .replace('{jobDescription}', jobDescription.slice(0, 4000))
    .replace('{matchedSkills}', matchedKeywords.slice(0, 10).join(', ') || 'None')
    .replace('{missingSkills}', missingKeywords.slice(0, 10).join(', ') || 'None');

  try {
    const groqClient = getGroq();
    const completion = await groqClient.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');

    const parsed = JSON.parse(content);
    if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return {
        candidateSummary: parsed.candidateSummary || 'Candidate review generated based on resume and job alignment.',
        keyStrengths: parsed.keyStrengths || matchedKeywords.slice(0, 4),
        topGaps: parsed.topGaps || missingKeywords.slice(0, 3),
        questions: parsed.questions.map((q: InterviewQuestion, i: number) => ({
          ...q,
          id: q.id || `q-${i + 1}`,
        })),
      };
    }
    return generateInterviewPrepLocally({ matchedKeywords, missingKeywords });
  } catch (err) {
    console.warn('AI interview prediction failed, using local generator:', err);
    return generateInterviewPrepLocally({ matchedKeywords, missingKeywords });
  }
}
