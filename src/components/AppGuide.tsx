'use client';

import { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Gauge,
  Wand2,
  Sliders,
  ShieldCheck,
  Target,
  Mail,
  ShieldAlert,
  Users,
  FileDown,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Zap,
  Flame,
  DollarSign,
  PanelLeftClose,
  Layers,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/helpers';

interface GuideFeature {
  id: string;
  category: 'scoring' | 'superpowers' | 'outreach' | 'recruiter';
  icon: typeof Wand2;
  title: string;
  badge: string;
  summary: string;
  steps: string[];
  proTip: string;
  mockup: {
    type: 'score' | 'bullet' | 'simulator' | 'ats' | 'interview' | 'outreach' | 'presets' | 'recruiter';
    previewTitle: string;
    previewDetails: string[];
    previewBadges?: string[];
  };
}

const GUIDE_FEATURES: GuideFeature[] = [
  {
    id: 'fixer',
    category: 'superpowers',
    icon: Sparkles,
    title: '1-Click Magic Resume Auto-Fixer & Canvas',
    badge: 'Flagship AI Tool',
    summary: 'Rewrites and transforms your existing resume into a 95%+ ATS-optimized document by injecting missing keywords into Google XYZ bullets, eliminating weak verbs, and rendering an editable paper canvas.',
    steps: [
      'Click the "✨ Auto-Fixer" tab in the Copilot Suite.',
      'Click "✨ Auto-Fix My Resume" to generate a tailored 95%+ fit resume.',
      'Switch between the Interactive Document Canvas, Before/After Diff, and Audit Changelog.',
      'Toggle between Harvard ATS, Silicon Valley Tech, and Executive templates, and click "Print / Save PDF" or "TXT".',
    ],
    proTip: 'Use the "Edit Text" toggle to fine-tune company names or specific metrics directly on the paper canvas before printing!',
    mockup: {
      type: 'bullet',
      previewTitle: 'Projected Score Jump: 64% → 96% (+32% Boost)',
      previewDetails: [
        '🏛️ Harvard ATS Template • 100% Injected Missing Keywords',
        'Spearheaded the migration of core services to Docker & AWS, reducing p99 latency by 42% and cutting infrastructure spend by $120K annually (Google XYZ Formula).',
        'Architected automated CI/CD pipelines with Kubernetes & Prometheus, accelerating deployment velocity 4x daily.',
      ],
      previewBadges: ['96% Fit', '+32% Boost', 'Top 5% Tier', '100% ATS Indexable'],
    },
  },
  {
    id: 'roast',
    category: 'superpowers',
    icon: Flame,
    title: 'Brutal Recruiter Roast & Mentor Feedback',
    badge: 'Viral Superpower',
    summary: 'Experience a savage, hilarious FAANG recruiter critique that exposes cliché buzzwords, lack of numbers, and passive verbs—or switch to an encouraging Career Mentor with 1-click solutions.',
    steps: [
      'Click the "🔥 Recruiter Roast" tab in the Copilot Suite.',
      'Toggle between "🔥 Savage Roast" and "🤝 Career Mentor".',
      'Review your 6-Second Survival Score, Red Flags, and Buzzword Crime Scene.',
      'Click "Auto-Fix These Issues in 1-Click" to jump straight into the Auto-Fixer.',
    ],
    proTip: 'Share your roast score on X or LinkedIn using the 1-click share button to showcase your resume transformation!',
    mockup: {
      type: 'bullet',
      previewTitle: 'Survival Score: 24% (Instant Shredder)',
      previewDetails: [
        '🔥 Headline: "Reads like a job description you copied from HR. Where are the numbers?"',
        '🚨 Buzzword Crime: "Responsible for various tasks" → Fix with: "Spearheaded / Architected"',
        '👁️ 6-Second Glance: "Lots of tech names, zero business proof. Next candidate!"',
      ],
      previewBadges: ['24% Survival', '3 Buzzword Crimes', 'Instant Shredder'],
    },
  },
  {
    id: 'salary',
    category: 'superpowers',
    icon: DollarSign,
    title: 'Skill Salary & Market Value Estimator',
    badge: 'ROI Weapon',
    summary: 'Calculates your estimated 2026 market compensation band, regional salary benchmarks (USD, INR, EUR, GBP), and ranks missing skills by their exact dollar salary boost.',
    steps: [
      'Click the "💰 Salary ROI" tab in the Copilot Suite.',
      'Select your target currency (USD $, INR ₹, EUR €, GBP £).',
      'View your Seniority Tier, Median Salary, and Regional Compensation Benchmarks.',
      'Check the "Missing Skill Dollar ROI" leaderboard to see which skills unlock +$10k–$15k annual pay increases.',
      'Copy customized Salary Negotiation Talking Points for recruiter compensation calls.',
    ],
    proTip: 'Use the "Auto-Fix Resume to Unlock This Range" button to inject the highest-paying skills into your resume immediately!',
    mockup: {
      type: 'bullet',
      previewTitle: 'Market Value: $168,000 / yr median ($148k - $205k)',
      previewDetails: [
        '📈 +AWS: +$14,500/yr (+8.6% Salary Boost) - Very High Demand',
        '📈 +Kubernetes: +$13,800/yr (+8.2% Salary Boost) - Very High Demand',
        '🌐 Benchmarks: US Remote ($148k-$205k) • SF/NYC ($175k-$246k) • Bangalore (₹32L-₹49L)',
      ],
      previewBadges: ['$168k Median', 'Top 10% Tier', '+$14.5k AWS Boost'],
    },
  },
  {
    id: 'presets',
    category: 'scoring',
    icon: Zap,
    title: '1-Click Role Presets (Instant Demo)',
    badge: 'Fastest Start',
    summary: 'Test drive the entire screener with realistic industry resumes and job descriptions with a single click—no file upload needed.',
    steps: [
      'Locate the "Instant 1-Click Demo Presets" banner at the top of the workspace.',
      'Click any role: Senior Frontend, AI/ML Engineer, Technical PM, or Data Analyst.',
      'The resume, job description, and categorized keywords load instantly and trigger the scoring pipeline in 1 second.',
    ],
    proTip: 'Perfect for exploring all AI tools immediately on mobile or before preparing your personal resume.',
    mockup: {
      type: 'presets',
      previewTitle: '⚡ Instant 1-Click Role Presets',
      previewBadges: ['⚡ Senior Frontend', '🤖 AI / ML Engineer', '💼 Technical PM', '📊 Data Analyst'],
      previewDetails: [
        'Pre-loaded with real-world job descriptions',
        'Includes parsed resumes and 10+ categorized keywords',
        'Scores automatically in under 1 second',
      ],
    },
  },
  {
    id: 'hybrid-scoring',
    category: 'scoring',
    icon: Gauge,
    title: 'Hybrid Multi-Layer Scoring Engine',
    badge: '40% Local + 60% AI',
    summary: 'Combines deterministic TF-IDF cosine similarity with deep Groq AI semantic analysis for an accurate, evidence-backed fit score.',
    steps: [
      'Upload your resume (PDF, DOCX, TXT, PNG, JPEG).',
      'Paste the job description and click "Extract Keywords with AI".',
      'The engine breaks skills into Technical, Experience, Education, and Soft Skills.',
      'View your Overall Fit % with verified evidence quotes matching your resume directly to requirements.',
    ],
    proTip: 'Click "Details & Evidence" in the Fit Score card to see the exact lines in your resume that satisfied each requirement.',
    mockup: {
      type: 'score',
      previewTitle: 'Overall Fit: 88% — High Confidence',
      previewBadges: ['Technical: 92%', 'Experience: 85%', 'Education: 100%', 'Soft Skills: 80%'],
      previewDetails: [
        '✓ Matched: TypeScript, React, Next.js, Tailwind CSS, GraphQL',
        '✕ Missing: Docker, AWS Cloud Deployments',
        '“Architected enterprise dashboard using Next.js 14...” (Evidence Quote)',
      ],
    },
  },
  {
    id: 'bullet-optimizer',
    category: 'superpowers',
    icon: Wand2,
    title: 'AI Bullet Point Optimizer (XYZ Formula)',
    badge: 'Google Standard',
    summary: 'Turn missing keywords and weak descriptions into quantifiable, high-impact resume bullets following Google’s XYZ formula.',
    steps: [
      'Navigate to the "Bullet Optimizer" tab in the Copilot Suite.',
      'Click any missing skill chip (e.g., "Docker" or "Kubernetes").',
      'AI automatically generates 3 XYZ-formatted bullet variations (Accomplished [X], as measured by [Y], by doing [Z]).',
      'Click "Copy" to drop the high-impact bullet straight into your resume.',
    ],
    proTip: 'You can also paste your own existing weak bullet point into the custom input to let AI rewrite and quantify it!',
    mockup: {
      type: 'bullet',
      previewTitle: 'Formula: Accomplished [X], measured by [Y], by doing [Z]',
      previewDetails: [
        'Option 1: “Orchestrated multi-stage Docker containerization pipeline, reducing deployment cycle times by 42% across 14 microservices.”',
        'Option 2: “Engineered scalable Docker containers for cloud microservices, cutting server infrastructure costs by $18k annually.”',
        'Metric Highlight: 42% latency reduction • Metric Breakdown included',
      ],
      previewBadges: ['XYZ Compliant', 'ATS High-Signal', 'Quantified Metric'],
    },
  },
  {
    id: 'skill-simulator',
    category: 'superpowers',
    icon: Sliders,
    title: 'What-If Skill Simulator',
    badge: 'Real-Time Trajectory',
    summary: 'Simulate the score boost of learning or adding missing skills before modifying your resume document.',
    steps: [
      'Open the "Skill Simulator" tab.',
      'Review the "Highest ROI Skills" ranking that reveals which skills provide the biggest score jump.',
      'Toggle missing skills on/off to watch your simulated score jump in real-time.',
      'Type custom skills (e.g., "Rust", "Terraform") to test hypothetical job alignment.',
    ],
    proTip: 'Target the top 2 Highest ROI skills first to cross the 85%+ threshold into the top candidate tier.',
    mockup: {
      type: 'simulator',
      previewTitle: 'Simulated Fit: 94% (+16% gain from 78%)',
      previewBadges: ['🏆 Top 10% Candidate Tier', '+16% Score Boost'],
      previewDetails: [
        'Highest ROI #1: Docker (+10% boost)',
        'Highest ROI #2: AWS Cloud (+6% boost)',
        'Checklist: [✓ Docker] [✓ AWS] [✓ GraphQL] [  Kubernetes]',
      ],
    },
  },
  {
    id: 'ats-checker',
    category: 'scoring',
    icon: ShieldCheck,
    title: 'ATS Format & Readability Audit',
    badge: 'Format Hygiene',
    summary: 'Automated 5-point scanner checking for contact info completeness, standard headings, metric density, and power verbs.',
    steps: [
      'Switch to the "ATS Audit" tab.',
      'Check your overall ATS Readiness score and Grade (A+, A, B, C, D).',
      'Verify Contact Completeness (Email, Phone, Location, Portfolio links).',
      'Audit Metric Density: ensures 40%+ of your bullet points contain concrete numbers and measurable results.',
      'Scan Action Verb Strength to eliminate passive phrases like "assisted with" or "responsible for".',
    ],
    proTip: 'Resumes with >40% quantifiable metric density receive 3x more interview callbacks from automated screening software.',
    mockup: {
      type: 'ats',
      previewTitle: 'ATS Readiness: 92% (Grade: A+)',
      previewBadges: ['Contact: 100%', 'Headings: 100%', 'Metric Density: 48%', 'Verbs: 95%'],
      previewDetails: [
        '✓ All essential contact information detected (Email, Phone, Location, GitHub)',
        '✓ Standard ATS section headings verified',
        '✓ Found 8 strong leadership & engineering power verbs (Architected, Spearheaded)',
        '✓ 0 passive phrases detected',
      ],
    },
  },
  {
    id: 'interview-prep',
    category: 'outreach',
    icon: Target,
    title: 'Interview Question Predictor & STAR Cheat Sheet',
    badge: 'Interview Ready',
    summary: 'Anticipates the top 5 hardest technical, architectural, behavioral, and gap questions hiring managers will ask about your specific profile.',
    steps: [
      'Open the "Interview Prep" tab and click "Generate Interview Questions".',
      'Review Executive Candidate Fit summary highlighting your core strengths vs risk gaps.',
      'Expand any predicted question to view the full STAR method breakdown (Situation, Task, Action, Result).',
      'Study the sample answers and talking points before walking into the interview room.',
    ],
    proTip: 'Pay special attention to the "Skill Gap" question—it provides a structured formula for turning missing skills into learning agility stories.',
    mockup: {
      type: 'interview',
      previewTitle: 'Top 5 Anticipated Interview Questions & STAR Guide',
      previewBadges: ['Technical Depth', 'System Design', 'Skill Gap Probe', 'Behavioral STAR'],
      previewDetails: [
        'Question: “How would you optimize Web Performance & Core Web Vitals in Next.js?”',
        '• Situation: High latency and large initial bundle payload impacting user conversion.',
        '• Task: Cut load times by 50% without dropping key features.',
        '• Action: Implemented dynamic imports, tree-shaking, and image optimization.',
        '• Result: Lighthouse score improved from 64 to 96, cutting bounce rate by 22%.',
      ],
    },
  },
  {
    id: 'outreach-generator',
    category: 'outreach',
    icon: Mail,
    title: '1-Click Cover Letter & Recruiter Outreach',
    badge: 'High Conversion',
    summary: 'Generates a tailored 3-paragraph cover letter, a <120-word LinkedIn cold DM, and a 5-day post-application follow-up email in seconds.',
    steps: [
      'Open the "Outreach / DM" tab and click "Generate Cover Letter & DM".',
      'Toggle between Cover Letter, LinkedIn DM, and Follow-Up Email.',
      'Directly edit any text in the live editor.',
      'Click "Copy Current" to paste directly into your application portal or LinkedIn message.',
    ],
    proTip: 'Send the LinkedIn Recruiter DM within 2 hours of submitting your application online to increase profile view rates by up to 5x.',
    mockup: {
      type: 'outreach',
      previewTitle: '1-Click Application Outreach Package',
      previewBadges: ['3-Paragraph Cover Letter', 'LinkedIn DM (<120 words)', '5-Day Follow-Up'],
      previewDetails: [
        'Subject: Application for Senior Frontend Engineer — Alex Chen',
        '“Hi [Hiring Manager], I recently applied for the Senior Frontend Engineer role at [Company]. Having scaled Next.js platforms to 2M+ users with 99.9% uptime...”',
        'Includes 1-click copy with instant visual badge feedback.',
      ],
    },
  },
  {
    id: 'bias-check',
    category: 'scoring',
    icon: ShieldAlert,
    title: 'Anonymized Fairness & Bias Audit',
    badge: 'Ethical AI',
    summary: 'Redacts candidate names, phone numbers, emails, graduation dates, and universities to re-score purely on skills and merit.',
    steps: [
      'Open the "Fairness Check" tab.',
      'The engine automatically anonymizes personally identifiable information (PII).',
      'The resume is re-scored blindly and compares the score against the original.',
      'A 0% score delta confirms that screening is 100% fair and unbiased.',
    ],
    proTip: 'Demonstrates to employers that candidate evaluation is strictly merit-based and compliance-ready.',
    mockup: {
      type: 'score',
      previewTitle: 'Bias Audit: 0% Delta — Verified Fair',
      previewBadges: ['Anonymized Score: 88%', 'Standard Score: 88%', 'Delta: 0%'],
      previewDetails: [
        'Redacted: Alex Chen → [CANDIDATE NAME]',
        'Redacted: UC Berkeley → [UNIVERSITY]',
        'Verified: Score driven 100% by technical competency and experience matches.',
      ],
    },
  },
  {
    id: 'recruiter-mode',
    category: 'recruiter',
    icon: Users,
    title: 'Recruiter Mode (Bulk Candidate Ranking)',
    badge: 'Up to 20 Resumes',
    summary: 'Screen and rank up to 20 resumes against a single job description to generate an instant leaderboard with evidence and CSV export.',
    steps: [
      'Switch the toggle in the top-right navbar from "Job Seeker" to "Recruiter".',
      'Paste the target job description to extract core competencies.',
      'Drag and drop a folder of candidate resumes (PDF, DOCX, TXT, PNG).',
      'Choose "Instant Local" for lightning ranking or "Deep AI" for semantic analysis.',
      'Inspect the leaderboard and click "Export CSV" to share with hiring managers.',
    ],
    proTip: 'Toggle between Local and Deep AI modes depending on whether you need sub-second screening or comprehensive semantic reasoning.',
    mockup: {
      type: 'recruiter',
      previewTitle: 'Candidate Leaderboard (Ranked #1 to #20)',
      previewBadges: ['#1 Alex Chen (92%)', '#2 Jordan Lee (87%)', '#3 Priya Sharma (81%)'],
      previewDetails: [
        'Gold/Silver/Bronze badges for top 3 candidates',
        'Expandable breakdown per candidate showing matched and missing skills',
        '1-Click full CSV report download for ATS sync',
      ],
    },
  },
  {
    id: 'report-export',
    category: 'scoring',
    icon: FileDown,
    title: 'Verified PDF & CSV Report Export',
    badge: 'Shareable Artifact',
    summary: 'Export an executive-ready PDF report or shareable digital report card badge to share on LinkedIn, GitHub, or portfolio.',
    steps: [
      'Click "Export PDF Report" on your score card to download a formatted PDF breakdown.',
      'Scroll to the "Shareable Fit Score Card" at the bottom of the workspace.',
      'Click "Share on X" or "LinkedIn" to broadcast your score.',
      'Click "Copy Badge MD" to add a verified shields.io fit badge to your GitHub README.',
    ],
    proTip: 'Add your score badge directly to your GitHub repo or resume header to stand out to technical recruiters.',
    mockup: {
      type: 'score',
      previewTitle: 'Verified PDF & Digital Fit Report Badge',
      previewBadges: ['PDF Download', 'Markdown Shield Badge', 'LinkedIn / X Share'],
      previewDetails: [
        'Contains fit percentage, confidence metrics, and processing timestamp',
        'Includes complete breakdown of matched competencies and evidence lines',
        'Formatted for clean printing or email attachment',
      ],
    },
  },
  {
    id: 'sidebar-studio',
    category: 'superpowers',
    icon: PanelLeftClose,
    title: 'Modern SaaS Collapsible Studio Sidebar (Linear / Notion Style)',
    badge: 'Desktop & Mobile UX',
    summary: 'Full-height collapsible navigation studio that gives every AI superpower tool a dedicated full-screen workspace with zero tab clutter.',
    steps: [
      'Click the top toggle icon (or collapse sidebar) to switch between full sidebar (w-72) and compact icon rail (w-16).',
      'Select any workspace: Score Overview, Auto-Fixer, Recruiter Roast, Salary ROI, Bullet Optimizer, Skill Simulator, or ATS Audit.',
      'The persistent sticky top bar keeps your active resume name and live fit score pill visible at all times.',
      'Click the live score pill anytime to jump straight back to your score breakdown.',
      'On mobile devices, open the full navigation drawer via the top-left hamburger menu.',
    ],
    proTip: 'Collapsing the sidebar gives you an edge-to-edge full-screen canvas when editing A4 paper templates in the Auto-Fixer!',
    mockup: {
      type: 'presets',
      previewTitle: '⚡ Collapsible Studio Rail + Full-Screen Workspaces',
      previewBadges: ['Linear / Notion Style', 'Persistent Score Pill', 'Mobile Touch Drawer'],
      previewDetails: [
        'Left Sidebar: Categorized workspaces with live status pills',
        'Top Header: File name badge + clickable 69% Match live score pill',
        'Full-Screen Workspaces: Maximum desktop real-estate for deep editing',
      ],
    },
  },
  {
    id: 'apple-3d-glass',
    category: 'superpowers',
    icon: Layers,
    title: 'Apple Vision 3D Spatial Cards & Glassmorphism 2.0',
    badge: 'ui-ux-pro-max Standard',
    summary: 'Elevated spatial user experience featuring 1px top specular metallic light reflections, interactive 3D mouse-tilt with cursor glare, ambient floating auroras, and fluid spring micro-physics.',
    steps: [
      'Move your pointer across Role Presets, Copilot Tiles, and Certificate cards to feel the spring 3D perspective tilt.',
      'Observe the dynamic cursor-tracking specular light reflection that follows your mouse across card surfaces.',
      'Enjoy the soft floating neon ambient orbs that drift gently in the background with zero performance lag.',
      'Watch fit score percentages and salary figures smoothly count up into place with spring deceleration.',
    ],
    proTip: 'All 3D tilt effects automatically detect touchscreens and mobile viewports to ensure battery efficiency and smooth 60fps scrolling!',
    mockup: {
      type: 'score',
      previewTitle: '🍏 VisionOS Specular Frosted Glass + 3D Tilt',
      previewBadges: ['1px Top Specular Rim', '3D Cursor Glare', 'Floating Auroras', 'Spring Count-Up'],
      previewDetails: [
        'border-t: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
        'perspective(1000px) rotateX(...) rotateY(...) scale3d(1.02, 1.02, 1.02)',
        'Live Glowing Neon Halo behind the Radial Fit Score Gauge',
      ],
    },
  },
];

export function AppGuide() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'scoring' | 'superpowers' | 'outreach' | 'recruiter'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('presets');

  const filteredFeatures = GUIDE_FEATURES.filter((f) => {
    const matchesCat = activeCategory === 'all' || f.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section id="guide" className="scroll-mt-20 space-y-6 pt-4">
      {/* Section Header */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-primary/5 to-background p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary mb-1.5">
              <BookOpen className="h-4 w-4" />
              Complete User Guide &amp; Feature Masterclass
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
              How to Get the Maximum Value from AI Resume Screener
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
              Explore interactive walkthroughs, visual UI previews, Google XYZ bullet formulas, ATS checklists, and recruiter superpowers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs px-3 py-1.5 font-mono">
              {GUIDE_FEATURES.length} Feature Guides
            </Badge>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-6 border-t border-border/60">
          <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
            <Button
              size="sm"
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('all')}
              className="text-xs h-10 sm:h-8"
            >
              All Features ({GUIDE_FEATURES.length})
            </Button>
            <Button
              size="sm"
              variant={activeCategory === 'scoring' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('scoring')}
              className="text-xs h-10 sm:h-8 gap-1"
            >
              <Gauge className="h-3 w-3" /> Scoring &amp; ATS
            </Button>
            <Button
              size="sm"
              variant={activeCategory === 'superpowers' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('superpowers')}
              className="text-xs h-10 sm:h-8 gap-1"
            >
              <Sparkles className="h-3 w-3" /> AI Superpowers
            </Button>
            <Button
              size="sm"
              variant={activeCategory === 'outreach' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('outreach')}
              className="text-xs h-10 sm:h-8 gap-1"
            >
              <Mail className="h-3 w-3" /> Outreach &amp; Prep
            </Button>
            <Button
              size="sm"
              variant={activeCategory === 'recruiter' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('recruiter')}
              className="text-xs h-10 sm:h-8 gap-1"
            >
              <Users className="h-3 w-3" /> Recruiter Mode
            </Button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              aria-label="Search features"
              placeholder="Search features (e.g. ATS, bullets)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 sm:py-1.5 text-xs rounded-lg border border-border bg-card/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid gap-4 sm:gap-6">
        {filteredFeatures.map((feature, index) => {
          const Icon = feature.icon;
          const isExpanded = expandedId === feature.id;

          return (
            <Card
              key={feature.id}
              className={cn(
                'border transition-all duration-200 overflow-hidden',
                isExpanded ? 'border-primary/50 shadow-md bg-card' : 'border-border/70 hover:border-primary/30 bg-card/60'
              )}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : feature.id)}
                className="p-5 sm:p-6 cursor-pointer flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none"
              >
                <div className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{String(index + 1).padStart(2, '0')}.</span>
                      <h3 className="text-base sm:text-lg font-bold font-display text-foreground">
                        {feature.title}
                      </h3>
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                        {feature.badge}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                      {feature.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    {isExpanded ? 'Hide Details' : 'View Full Guide & Screenshot'}
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </span>
                </div>
              </div>

              {/* Expanded Walkthrough & UI Visual Preview */}
              {isExpanded && (
                <div className="px-5 pb-6 sm:px-6 border-t border-border/60 pt-5 space-y-6 bg-muted/10">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left: Step-by-Step Instructions */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Step-by-Step Instructions
                      </h4>
                      <ol className="space-y-2.5">
                        {feature.steps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary font-mono mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>

                      {/* Pro Tip Box */}
                      <div className="rounded-xl border border-warning/30 bg-warning/5 p-3.5 text-xs text-warning/90 space-y-1">
                        <span className="font-bold flex items-center gap-1.5 text-warning">
                          <Sparkles className="h-3.5 w-3.5" /> Pro Insider Tip:
                        </span>
                        <p className="leading-relaxed">{feature.proTip}</p>
                      </div>
                    </div>

                    {/* Right: Rich UI Visual Screenshot / Mockup */}
                    <div className="rounded-xl border border-border bg-gradient-to-b from-background to-card p-4 space-y-3 shadow-inner">
                      <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60 inline-block" />
                          <span className="h-2.5 w-2.5 rounded-full bg-warning/60 inline-block" />
                          <span className="h-2.5 w-2.5 rounded-full bg-success/60 inline-block" />
                          <span className="text-[11px] font-mono text-muted-foreground ml-1.5">
                            UI Screenshot: {feature.mockup.previewTitle}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[9px] font-mono uppercase bg-primary/5 text-primary border-primary/20">
                          Live UI Preview
                        </Badge>
                      </div>

                      {/* Mockup Badges */}
                      {feature.mockup.previewBadges && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {feature.mockup.previewBadges.map((b, bIdx) => (
                            <Badge key={bIdx} variant="outline" className="text-[10px] bg-card border-border/80 text-foreground">
                              {b}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Mockup Lines */}
                      <div className="space-y-2 pt-1 font-sans">
                        {feature.mockup.previewDetails.map((line, lIdx) => (
                          <div
                            key={lIdx}
                            className="p-2.5 rounded-lg border border-border/60 bg-card/70 text-xs text-foreground/90 font-mono leading-relaxed break-all"
                          >
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* FAQ & Tips Footer */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          Frequently Asked Questions &amp; Scoring Science
        </h3>

        <div className="grid md:grid-cols-2 gap-4 text-xs text-muted-foreground leading-relaxed pt-2">
          <div className="space-y-1.5 p-3.5 rounded-xl border border-border/60 bg-muted/20">
            <span className="font-semibold text-foreground block">
              Q: How does the Hybrid Scorer calculate my score?
            </span>
            <p>
              40% comes from deterministic TF-IDF cosine similarity across categorized skills, and 60% comes from Groq AI semantic reasoning evaluating experience depth and context.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-xl border border-border/60 bg-muted/20">
            <span className="font-semibold text-foreground block">
              Q: Why is Google’s XYZ formula recommended for bullets?
            </span>
            <p>
              Recruiters and automated ATS filters look for quantifiable business outcomes (*Accomplished [X], as measured by [Y], by doing [Z]*), which increases interview callback rates by up to 3x.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-xl border border-border/60 bg-muted/20">
            <span className="font-semibold text-foreground block">
              Q: Is my resume data saved or shared?
            </span>
            <p>
              No. Text parsing runs in memory on isolated serverless workers with zero persistent database storage. Your resume data is never stored or used to train public models.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-xl border border-border/60 bg-muted/20">
            <span className="font-semibold text-foreground block">
              Q: What is the benefit of the Collapsible Left Sidebar Studio?
            </span>
            <p>
              It eliminates tab clutter by giving every AI tool (Auto-Fixer, Roast, Salary ROI, Bullet Optimizer) its own dedicated full-screen workspace, while keeping candidate context and a clickable live fit score pinned to the top.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-xl border border-border/60 bg-muted/20">
            <span className="font-semibold text-foreground block">
              Q: How do the 3D Spatial Cards and Glassmorphism 2.0 work?
            </span>
            <p>
              Built following Apple VisionOS and ui-ux-pro-max standards, cards feature 1px top specular metallic light reflections, interactive mouse-tilt with cursor glare, floating ambient gradient orbs, and fluid spring number count-up physics.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
