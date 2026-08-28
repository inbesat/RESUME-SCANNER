import { Keyword, ParsedResume } from '@/types';

export interface SamplePreset {
  id: string;
  roleTitle: string;
  roleIcon: string;
  badge: string;
  company: string;
  jobDescription: string;
  resume: ParsedResume;
  keywords: Keyword[];
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'frontend-engineer',
    roleTitle: 'Senior Frontend Engineer',
    roleIcon: '⚡',
    badge: 'Popular',
    company: 'Vercel / Stripe Style High-Scale SaaS',
    jobDescription: `Job Title: Senior Frontend Engineer
Location: Remote (US / Global)

About the Role:
We are seeking a Senior Frontend Engineer with deep expertise in modern TypeScript, React, and Next.js to architect high-performance web applications.

Required Qualifications:
- 5+ years of production experience building complex frontend applications.
- Strong proficiency with TypeScript, React 18+, Next.js (App Router), and modern state management.
- Hands-on mastery of Tailwind CSS, responsive UI/UX architecture, and Web Performance / Core Web Vitals optimization.
- Proven experience with REST APIs, GraphQL, and client-side caching (React Query / SWR).
- Commitment to automated testing with Jest, Vitest, or Playwright.

Preferred Qualifications:
- Familiarity with Docker, CI/CD deployment pipelines, and cloud hosting (AWS / Vercel).
- Passion for design systems and building accessible components (WCAG standards).
- Excellent cross-functional communication and mentorship skills.`,
    resume: {
      fileName: 'alex_chen_frontend_resume.pdf',
      fileType: 'pdf',
      wordCount: 385,
      pageCount: 1,
      text: `Alex Chen
San Francisco, CA | alex.chen@example.com | (555) 234-5678 | github.com/alexchen | linkedin.com/in/alexchen

SUMMARY
Senior Frontend Engineer with 6+ years of experience specializing in React, Next.js, and TypeScript. Track record of scaling SaaS platforms to 2M+ MAU with 99.9% uptime and sub-second page loads.

TECHNICAL SKILLS
- Languages: TypeScript, JavaScript (ES6+), HTML5, CSS3, SQL
- Frontend: React, Next.js, Tailwind CSS, Redux Toolkit, Zustand, GraphQL, Webpack, Vite
- Testing & Tools: Vitest, Jest, Cypress, Git, Figma, Agile / Scrum

PROFESSIONAL EXPERIENCE

Senior Frontend Developer | CloudScale Technologies (2022 - Present)
- Architected enterprise dashboard using Next.js 14, TypeScript, and Tailwind CSS, improving Lighthouse performance score from 64 to 96.
- Spearheaded migration of legacy state management to Zustand, cutting re-renders by 55% across 250k daily active users.
- Built reusable accessible design system components adhering to WCAG 2.1 AA standards.
- Collaborated cross-functionally with product managers and backend teams to integrate GraphQL and REST APIs.

Frontend Software Engineer | DataPulse Inc. (2019 - 2022)
- Engineered responsive client portal in React and TypeScript, boosting customer conversion rates by 22%.
- Implemented comprehensive automated test suite with Jest and Cypress, maintaining 90%+ code coverage.
- Optimized bundle sizes and lazy-loaded assets, reducing initial bundle payload by 40%.

EDUCATION
B.S. in Computer Science | University of California, Berkeley (2015 - 2019)`,
    },
    keywords: [
      { id: 'kw-fe-1', text: 'TypeScript', category: 'technical', source: 'ai', importance: 'required' },
      { id: 'kw-fe-2', text: 'React', category: 'technical', source: 'ai', importance: 'required' },
      { id: 'kw-fe-3', text: 'Next.js', category: 'technical', source: 'ai', importance: 'required' },
      { id: 'kw-fe-4', text: 'Tailwind CSS', category: 'technical', source: 'ai', importance: 'required' },
      { id: 'kw-fe-5', text: 'GraphQL', category: 'technical', source: 'ai', importance: 'required' },
      { id: 'kw-fe-6', text: '5+ years', category: 'experience', source: 'ai', importance: 'required' },
      { id: 'kw-fe-7', text: 'Docker', category: 'technical', source: 'ai', importance: 'preferred' },
      { id: 'kw-fe-8', text: 'AWS', category: 'technical', source: 'ai', importance: 'preferred' },
      { id: 'kw-fe-9', text: 'BS in Computer Science', category: 'education', source: 'ai', importance: 'preferred' },
      { id: 'kw-fe-10', text: 'Communication', category: 'softSkills', source: 'ai', importance: 'preferred' },
      { id: 'kw-fe-11', text: 'Mentorship', category: 'softSkills', source: 'ai', importance: 'preferred' },
    ],
  },
  {
    id: 'ai-ml-engineer',
    roleTitle: 'AI / Machine Learning Engineer',
    roleIcon: '🤖',
    badge: 'Trending',
    company: 'Anthropic / OpenAI Ecosystem Scale',
    jobDescription: `Job Title: AI / Machine Learning Engineer
Department: Applied AI & LLM Systems

Overview:
We are looking for an Applied AI Engineer to design, deploy, and optimize production LLM pipelines and machine learning infrastructure.

Responsibilities:
- Build low-latency inference services and RAG (Retrieval Augmented Generation) pipelines using Python, LangChain, and vector databases (Pinecone / Qdrant).
- Fine-tune and evaluate open-source models using PyTorch and Hugging Face.
- Deploy scalable AI endpoints using FastAPI, Docker, and Kubernetes on AWS or GCP.
- Collaborate with software engineers to integrate AI models into high-throughput production applications.

Requirements:
- 3+ years experience in Applied Machine Learning, NLP, or LLM engineering.
- Deep expertise in Python, PyTorch, Transformers, and Vector Search.
- Experience with Docker, Kubernetes, and Cloud ML deployment.
- Bachelor's or Master's degree in Computer Science, Data Science, or related STEM field.`,
    resume: {
      fileName: 'priya_sharma_ai_engineer.pdf',
      fileType: 'pdf',
      wordCount: 360,
      pageCount: 1,
      text: `Priya Sharma
Austin, TX | priya.sharma@example.com | (555) 789-0123 | github.com/priyasharma | linkedin.com/in/priyasharma

PROFESSIONAL SUMMARY
Machine Learning Engineer with 4 years of experience building and deploying generative AI pipelines, RAG systems, and transformer architectures.

TECHNICAL SKILLS
- Languages: Python, SQL, C++, Bash
- ML & AI: PyTorch, Transformers (Hugging Face), LangChain, LlamaIndex, OpenAI API, Scikit-Learn, Vector DBs (Pinecone, Chroma)
- Backend & Cloud: FastAPI, Docker, AWS (SageMaker, S3, EC2), PostgreSQL, Git

EXPERIENCE

Machine Learning Engineer | NeuroTech AI (2022 - Present)
- Developed enterprise RAG pipeline utilizing Python, LangChain, and Pinecone, reducing customer support query resolution time by 45%.
- Fine-tuned transformer models for domain-specific classification, achieving 94.2% F1 score across 1M+ document corpus.
- Built and containerized high-throughput FastAPI inference microservices with Docker, sustaining 1,200 RPS at sub-80ms latency.
- Implemented automated evaluation benchmarks to monitor LLM hallucination rates in real-time production.

Associate Data Scientist | QuantMatrix Analytics (2020 - 2022)
- Built predictive churn models using Python and PyTorch, identifying at-risk accounts and saving $450k in annual recurring revenue.
- Orchestrated data processing pipelines using PostgreSQL and Pandas for 50GB daily telemetry feeds.

EDUCATION
M.S. in Computer Science (Machine Learning Focus) | University of Texas at Austin (2018 - 2020)
B.S. in Electrical Engineering | Purdue University (2014 - 2018)`,
    },
    keywords: [
      { id: 'kw-ai-1', text: 'Python', category: 'technical', source: 'ai', importance: 'required' },
      { id: 'kw-ai-2', text: 'PyTorch', category: 'technical', source: 'ai', importance: 'required' },
      { id: 'kw-ai-3', text: 'LangChain', category: 'technical', source: 'ai', importance: 'required' },
      { id: 'kw-ai-4', text: 'FastAPI', category: 'technical', source: 'ai', importance: 'required' },
      { id: 'kw-ai-5', text: 'Docker', category: 'technical', source: 'ai', importance: 'required' },
      { id: 'kw-ai-6', text: '3+ years', category: 'experience', source: 'ai', importance: 'required' },
      { id: 'kw-ai-7', text: 'Kubernetes', category: 'technical', source: 'ai', importance: 'preferred' },
      { id: 'kw-ai-8', text: 'AWS', category: 'technical', source: 'ai', importance: 'preferred' },
      { id: 'kw-ai-9', text: 'Master of Science', category: 'education', source: 'ai', importance: 'preferred' },
      { id: 'kw-ai-10', text: 'Collaboration', category: 'softSkills', source: 'ai', importance: 'preferred' },
    ],
  },
  {
    id: 'product-manager',
    roleTitle: 'Technical Product Manager',
    roleIcon: '💼',
    badge: 'Leadership',
    company: 'Fintech & Enterprise Platform',
    jobDescription: `Role: Technical Product Manager
Industry: Fintech / High-Growth Platform

Key Responsibilities:
- Define product vision, strategy, and data-backed roadmap for our core payments and developer API platform.
- Write crisp PRDs, user stories, and acceptance criteria in an Agile / Scrum framework.
- Collaborate with engineering, design, and executive leadership to prioritize backlogs and launch features on schedule.
- Track business metrics, run A/B experiments, and drive user adoption and retention.

Requirements:
- 4+ years of Technical Product Management experience delivering B2B SaaS or platform APIs.
- Strong technical literacy: ability to query SQL databases, inspect API contracts, and partner deeply with engineering.
- Proven track record of defining product roadmaps and driving cross-functional alignment.
- Excellent written and verbal communication skills.`,
    resume: {
      fileName: 'marcus_vance_pm_resume.pdf',
      fileType: 'pdf',
      wordCount: 350,
      pageCount: 1,
      text: `Marcus Vance
New York, NY | marcus.vance@example.com | (555) 345-6789 | linkedin.com/in/marcusvance

PROFESSIONAL SUMMARY
Technical Product Manager with 5+ years of experience leading developer platform and API products from discovery through hyper-growth.

CORE COMPETENCIES
- Product Strategy: Product Roadmaps, PRD Creation, Agile / Scrum, User Research, Backlog Grooming, A/B Testing
- Technical & Analytical: SQL, REST APIs, System Architecture basics, Postman, Mixpanel, Jira, Confluence
- Leadership: Stakeholder Management, Cross-Functional Alignment, Executive Presentations

EXPERIENCE

Technical Product Manager | PayFlow Platform (2021 - Present)
- Spearheaded developer API platform roadmap, increasing API transaction volume by 140% and driving $3.2M net-new ARR.
- Authored 30+ comprehensive PRDs and user stories, leading a squad of 8 engineers and 2 designers in 2-week Agile sprints.
- Designed and analyzed A/B onboarding experiments using SQL and Mixpanel, boosting 30-day developer activation by 27%.
- Aligned executive stakeholders across legal, compliance, and sales to launch multi-currency payment settlement ahead of schedule.

Product Owner | FinEdge Solutions (2019 - 2021)
- Managed core ledger product backlog, prioritizing feature enhancements and technical debt remediation.
- Conducted 50+ customer discovery interviews, translating enterprise user pain points into actionable release milestones.

EDUCATION
B.S. in Industrial Engineering & Economics | Northwestern University (2015 - 2019)`,
    },
    keywords: [
      { id: 'kw-pm-1', text: 'Product Roadmap', category: 'technical', source: 'ai', importance: 'required' },
      { id: 'kw-pm-2', text: 'Agile', category: 'technical', source: 'ai', importance: 'required' },
      { id: 'kw-pm-3', text: 'SQL', category: 'technical', source: 'ai', importance: 'required' },
      { id: 'kw-pm-4', text: 'A/B Testing', category: 'technical', source: 'ai', importance: 'required' },
      { id: 'kw-pm-5', text: '4+ years', category: 'experience', source: 'ai', importance: 'required' },
      { id: 'kw-pm-6', text: 'REST APIs', category: 'technical', source: 'ai', importance: 'preferred' },
      { id: 'kw-pm-7', text: 'Cross-functional', category: 'softSkills', source: 'ai', importance: 'required' },
      { id: 'kw-pm-8', text: 'Stakeholder Management', category: 'softSkills', source: 'ai', importance: 'preferred' },
      { id: 'kw-pm-9', text: 'Bachelor\'s Degree', category: 'education', source: 'ai', importance: 'preferred' },
    ],
  },
  {
    id: 'data-analyst',
    roleTitle: 'Data Analyst / BI Engineer',
    roleIcon: '📊',
    badge: 'Analytics',
    company: 'High-Growth E-Commerce & Retail',
    jobDescription: `Position: Senior Data Analyst & BI Engineer
Department: Growth & Business Intelligence

Responsibilities:
- Write complex SQL queries to extract, transform, and aggregate multi-terabyte datasets across Snowflake and BigQuery.
- Design, build, and maintain executive Tableau and PowerBI dashboards for revenue, retention, and funnel conversion.
- Perform statistical exploratory data analysis in Python (Pandas, NumPy) to surface growth opportunities.
- Partner with marketing and product leaders to design A/B experiments and present executive insights.

Requirements:
- 3+ years experience as a Data Analyst, BI Developer, or Analytics Engineer.
- Advanced SQL proficiency (window functions, CTEs, query optimization).
- Hands-on mastery of Tableau, PowerBI, or Looker.
- Solid Python skills for data manipulation and statistical analysis.`,
    resume: {
      fileName: 'jordan_lee_data_analyst.pdf',
      fileType: 'pdf',
      wordCount: 340,
      pageCount: 1,
      text: `Jordan Lee
Seattle, WA | jordan.lee@example.com | (555) 456-7890 | github.com/jordanlee | linkedin.com/in/jordanlee

SUMMARY
Data Analyst with 4 years of experience turning complex transactional data into high-impact executive dashboards and growth strategies.

TECHNICAL SKILLS
- Query & Databases: Advanced SQL (PostgreSQL, Snowflake, BigQuery), ETL Pipelines, dbt
- Visualization & BI: Tableau, PowerBI, Looker, Metabase, Excel / Sheets Modeling
- Programming: Python (Pandas, NumPy, Matplotlib), R, Git

WORK EXPERIENCE

Senior Data Analyst | CommerceWave (2022 - Present)
- Architected centralized Snowflake data models and 15+ automated Tableau dashboards used daily by C-suite executives.
- Wrote optimized SQL queries cutting daily ETL compute runtime by 38% and saving $24k in monthly cloud warehouse costs.
- Partnered with growth marketing to analyze A/B campaign experiments in Python, optimizing ad spend allocation to drive +19% ROAS.
- Mentored 3 junior analysts in modern SQL styling, data modeling, and dashboard UX principles.

Business Intelligence Analyst | RetailGrid (2020 - 2022)
- Built automated inventory forecasting dashboard in PowerBI, reducing out-of-stock incidents by 16% across 200+ retail locations.
- Extracted and cleaned customer retention cohorts using PostgreSQL to identify top churn drivers.

EDUCATION
B.S. in Statistics & Data Science | University of Washington (2016 - 2020)`,
    },
    keywords: [
      { id: 'kw-da-1', text: 'SQL', category: 'technical', source: 'ai', importance: 'required' },
      { id: 'kw-da-2', text: 'Tableau', category: 'technical', source: 'ai', importance: 'required' },
      { id: 'kw-da-3', text: 'Python', category: 'technical', source: 'ai', importance: 'required' },
      { id: 'kw-da-4', text: 'Snowflake', category: 'technical', source: 'ai', importance: 'required' },
      { id: 'kw-da-5', text: '3+ years', category: 'experience', source: 'ai', importance: 'required' },
      { id: 'kw-da-6', text: 'PowerBI', category: 'technical', source: 'ai', importance: 'preferred' },
      { id: 'kw-da-7', text: 'ETL Pipelines', category: 'technical', source: 'ai', importance: 'preferred' },
      { id: 'kw-da-8', text: 'Bachelor of Science', category: 'education', source: 'ai', importance: 'preferred' },
      { id: 'kw-da-9', text: 'Communication', category: 'softSkills', source: 'ai', importance: 'preferred' },
    ],
  },
];
