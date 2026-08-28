'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Check,
  FileText,
  ListChecks,
  Gauge,
  ShieldAlert,
  FileDown,
  Users,
  User,
  Terminal,
  Wand2,
  Target,
  Mail,
  Sparkles,
  Sliders,
  ShieldCheck,
  BookOpen,
  Flame,
  DollarSign,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  ChevronRight,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResumeUploader } from '@/components/ResumeUploader';
import { JobDescriptionInput } from '@/components/JobDescriptionInput';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { BiasCheck } from '@/components/BiasCheck';
import { RecruiterMode } from '@/components/RecruiterMode';
import { BulletOptimizer } from '@/components/BulletOptimizer';
import { InterviewPredictor } from '@/components/InterviewPredictor';
import { CoverLetterGenerator } from '@/components/CoverLetterGenerator';
import { SkillSimulator } from '@/components/SkillSimulator';
import { ATSChecker } from '@/components/ATSChecker';
import { ResumeFixer } from '@/components/ResumeFixer';
import { RecruiterRoast } from '@/components/RecruiterRoast';
import { SalaryEstimator } from '@/components/SalaryEstimator';
import { SamplePresets } from '@/components/SamplePresets';
import { ShareableReportCard } from '@/components/ShareableReportCard';
import { TiltCard } from '@/components/ui/TiltCard';
import ThemeToggle from '@/components/ThemeToggle';
import { cn, parseApiResponse } from '@/lib/utils/helpers';
import { triggerConfetti, playAudioFeedback } from '@/lib/utils/effects';
import { Keyword, ParsedResume, ScoreResult } from '@/types';
import { SamplePreset } from '@/lib/presets/sample-data';

const KEYWORDS_KEY = 'ars-keywords';
const JD_KEY = 'ars-job-description';

type Mode = 'seeker' | 'recruiter';
type AppSection = 'overview' | 'fixer' | 'roast' | 'salary' | 'optimizer' | 'simulator' | 'ats' | 'interview' | 'outreach' | 'bias';

interface FunnelStep {
  id: string;
  label: string;
  icon: typeof FileText;
}

const FUNNEL: FunnelStep[] = [
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'keywords', label: 'Keywords', icon: ListChecks },
  { id: 'score', label: 'Score', icon: Gauge },
  { id: 'copilot', label: 'AI Copilot', icon: Sparkles },
  { id: 'report', label: 'Report', icon: FileDown },
];

export default function AppPage() {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === 'undefined') return 'seeker';
    return new URLSearchParams(window.location.search).get('mode') === 'recruiter' ? 'recruiter' : 'seeker';
  });

  const [activeSection, setActiveSection] = useState<AppSection>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [jobDescription, setJobDescription] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      return sessionStorage.getItem(JD_KEY) || '';
    } catch {
      return '';
    }
  });

  const [keywords, setKeywords] = useState<Keyword[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = sessionStorage.getItem(KEYWORDS_KEY);
      return raw ? (JSON.parse(raw) as Keyword[]) : [];
    } catch {
      return [];
    }
  });

  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const errorBannerRef = useRef<HTMLDivElement>(null);
  const errorSeenRef = useRef(false);
  const requestIdRef = useRef(0);

  // Body scroll lock when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isMobileMenuOpen]);

  // Escape key to close mobile drawer + Ctrl+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
      if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const scoreResume = useCallback(async () => {
    if (!resume || keywords.length === 0) return;

    const id = ++requestIdRef.current;
    setIsScoring(true);
    setError(null);

    try {
      const response = await fetch('/api/score-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resume.text,
          keywords,
        }),
      });

      const result = await parseApiResponse<ScoreResult>(response);

      if (id !== requestIdRef.current) return;

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to score resume');
      }

      setScoreResult(result.data);
      if (result.data.fitPercentage >= 80) {
        triggerConfetti();
        playAudioFeedback('chime');
      } else {
        playAudioFeedback('success');
      }
    } catch (err) {
      if (id !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : 'Scoring failed');
    } finally {
      if (id === requestIdRef.current) {
        setIsScoring(false);
      }
    }
  }, [resume, keywords]);

  useEffect(() => {
    if (resume && keywords.length > 0) {
      scoreResume();
    }
  }, [resume, keywords, scoreResume]);

  useEffect(() => {
    try {
      sessionStorage.setItem(KEYWORDS_KEY, JSON.stringify(keywords));
    } catch {
      // ignore
    }
  }, [keywords]);

  useEffect(() => {
    try {
      sessionStorage.setItem(JD_KEY, jobDescription);
    } catch {
      // ignore
    }
  }, [jobDescription]);

  useEffect(() => {
    if (error && !errorSeenRef.current) {
      errorBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      errorSeenRef.current = true;
    }
    if (!error) {
      errorSeenRef.current = false;
    }
  }, [error]);

  const handleParseComplete = (parsed: ParsedResume) => {
    setResume(parsed);
    setActivePresetId(null);
  };

  const handleKeywordsChange = (newKeywords: Keyword[]) => {
    setKeywords(newKeywords);
  };

  const handleJobDescriptionChange = (text: string) => {
    setJobDescription(text);
  };

  const handleExtractClick = async () => {
    if (!jobDescription.trim()) return;

    try {
      const response = await fetch('/api/extract-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      });

      const result = await parseApiResponse<{ keywords: Keyword[] }>(response);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to extract keywords');
      }

      setKeywords(result.data.keywords);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Keyword extraction failed');
    }
  };

  const handleExtractError = (err: string) => {
    setError(err);
  };

  const handleSelectPreset = (preset: SamplePreset) => {
    setActivePresetId(preset.id);
    setError(null);

    setJobDescription(preset.jobDescription);
    setKeywords(preset.keywords);
    setResume(preset.resume);
  };

  const handleOptimizeMissingSkill = (skill: string) => {
    setActiveSection('optimizer');
  };

  const matchedKeywordsList = scoreResult
    ? Object.values(scoreResult.breakdown).flatMap((b) => b.matched)
    : [];

  const missingKeywordsList = scoreResult
    ? Object.values(scoreResult.breakdown).flatMap((b) => b.missing)
    : [];

  const stepDone: Record<string, boolean> = {
    resume: !!resume,
    keywords: keywords.length > 0,
    score: !!scoreResult,
    copilot: !!scoreResult,
    report: !!scoreResult,
  };

  const STEP_NUMBERS = ['01', '02', '03', '04', '05'];
  let currentStepIndex = 0;
  if (stepDone.resume) currentStepIndex = 1;
  if (stepDone.keywords) currentStepIndex = 2;
  if (stepDone.score) currentStepIndex = 3;
  if (stepDone.copilot) currentStepIndex = 4;

  const NAV_ITEMS = [
    {
      id: 'overview' as AppSection,
      label: 'Score & Workspace',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Resume & Job Inputs, Fit Score',
    },
    {
      id: 'fixer' as AppSection,
      label: '✨ Auto-Fixer',
      icon: Sparkles,
      badge: '95%+ AI',
      desc: '1-Click ATS Rewriter & Canvas',
    },
    {
      id: 'roast' as AppSection,
      label: '🔥 Recruiter Roast',
      icon: Flame,
      badge: 'Savage',
      desc: 'Brutal FAANG Roast & Mentor',
    },
    {
      id: 'salary' as AppSection,
      label: '💰 Salary ROI',
      icon: DollarSign,
      badge: '2026',
      desc: 'Market Value & Skill ROI',
    },
    {
      id: 'optimizer' as AppSection,
      label: 'Bullet Optimizer',
      icon: Wand2,
      badge: 'XYZ',
      desc: 'Google Formula Bullet Points',
    },
    {
      id: 'simulator' as AppSection,
      label: 'Skill Simulator',
      icon: Sliders,
      badge: null,
      desc: 'What-If Skill Addition',
    },
    {
      id: 'ats' as AppSection,
      label: 'ATS Audit',
      icon: ShieldCheck,
      badge: 'A+ Grade',
      desc: 'Readability & Heading Hygiene',
    },
    {
      id: 'interview' as AppSection,
      label: 'Interview Prep',
      icon: Target,
      badge: 'STAR',
      desc: 'Question & Answer Predictor',
    },
    {
      id: 'outreach' as AppSection,
      label: 'Outreach / DM',
      icon: Mail,
      badge: null,
      desc: 'Cover Letter & Recruiter DM',
    },
    {
      id: 'bias' as AppSection,
      label: 'Fairness Check',
      icon: ShieldAlert,
      badge: '0-PII',
      desc: 'Anonymized Bias Delta Test',
    },
  ];

  return (
    <div className="flex h-dvh overflow-hidden bg-background relative">
      {/* VisionOS Ambient Glow Auroras */}
      <div className="ambient-glow-orange -top-24 -left-24" />
      <div className="ambient-glow-cyan -bottom-24 -right-24" />

      {/* ============================================================ */}
      {/* 1. LEFT COLLAPSIBLE SIDEBAR (Desktop)                         */}
      {/* ============================================================ */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-border/80 glass-panel glass-specular transition-all duration-300 z-30 shrink-0 select-none shadow-2xl',
          isSidebarOpen ? 'w-72' : 'w-16'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-3.5 border-b border-border/70">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden" aria-label="AI Resume Screener home">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#ff5f42] font-mono text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 shrink-0">
              AI
            </span>
            {isSidebarOpen && (
              <span className="font-mono text-sm font-semibold tracking-tight truncate">
                RESUME_SCREENER
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="h-8 w-8 rounded-lg border border-border/70 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
            title={isSidebarOpen ? 'Collapse sidebar (Ctrl+B)' : 'Expand sidebar'}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>
        </div>

        {/* Screener Mode Switcher */}
        {isSidebarOpen ? (
          <div className="p-3 border-b border-border/60">
            <div className="flex items-center gap-1 rounded-xl bg-muted/40 p-1 border border-border/70 text-xs" role="tablist" aria-label="Screener mode">
              <button
                role="tab"
                aria-selected={mode === 'seeker'}
                onClick={() => setMode('seeker')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium transition-all',
                  mode === 'seeker' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <User className="h-3.5 w-3.5" />
                Job Seeker
              </button>
              <button
                role="tab"
                aria-selected={mode === 'recruiter'}
                onClick={() => setMode('recruiter')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium transition-all',
                  mode === 'recruiter' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Users className="h-3.5 w-3.5" />
                Recruiter
              </button>
            </div>
          </div>
        ) : (
          <div className="p-2 border-b border-border/60 flex justify-center">
            <button
              onClick={() => setMode(mode === 'seeker' ? 'recruiter' : 'seeker')}
              className="h-8 w-8 rounded-lg border border-border/70 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50"
              title={`Mode: ${mode === 'seeker' ? 'Job Seeker' : 'Recruiter'}`}
            >
              {mode === 'seeker' ? <User className="h-4 w-4 text-primary" /> : <Users className="h-4 w-4 text-primary" />}
            </button>
          </div>
        )}

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {mode === 'seeker' ? (
            <>
              <div className={cn('px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground', !isSidebarOpen && 'hidden')}>
                Workspace
              </div>

              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      setActiveSection(item.id);
                      playAudioFeedback('click');
                    }}
                    className={cn(
                      'w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-all text-left group relative',
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/30 font-semibold shadow-xs'
                        : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    )}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                    {isSidebarOpen && (
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/30 text-primary shrink-0 ml-1">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </>
          ) : (
            <div className="p-2 space-y-2 text-xs text-muted-foreground">
              <div className={cn('px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground', !isSidebarOpen && 'hidden')}>
                Recruiter Suite
              </div>
              <div className="p-3 rounded-xl border border-border/70 bg-card/60 space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary" />
                  <span>20-Candidate Batch</span>
                </div>
                {isSidebarOpen && (
                  <p className="text-[11px] text-muted-foreground">
                    Upload multiple resumes and rank them instantly on a live leaderboard.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-2.5 border-t border-border/70 flex items-center justify-between gap-2">
          {isSidebarOpen ? (
            <>
              <Link
                href="/guide"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/40 transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span>Guide &amp; Tips</span>
              </Link>
              <ThemeToggle />
            </>
          ) : (
            <div className="w-full flex justify-center">
              <ThemeToggle />
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN APP CANVAS & STICKY HEADER                            */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col h-dvh overflow-hidden">
        {/* Top Sticky Header */}
        <header className="h-16 border-b border-border/80 glass-panel glass-specular px-4 sm:px-6 flex items-center justify-between gap-4 z-20 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden h-10 w-10 rounded-lg border border-border/70 flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile / Header Logo */}
            <Link href="/" className="flex items-center gap-2 mr-2 shrink-0" aria-label="AI Resume Screener home">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#ff5f42] font-mono text-xs font-bold text-primary-foreground shadow-xs">
                AI
              </span>
              <span className="font-mono text-xs font-bold tracking-tight hidden sm:inline">
                RESUME_SCREENER
              </span>
            </Link>

            {/* Candidate / Role Context Badge */}
            {resume && (
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="outline" className="hidden sm:inline-flex bg-card font-mono text-xs px-2.5 py-1 gap-1.5 border-border/80 truncate">
                  <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate max-w-[180px]">{resume.fileName}</span>
                </Badge>

                {scoreResult && (
                  <button
                    type="button"
                    onClick={() => setActiveSection('overview')}
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-primary/10 border border-primary/30 text-xs font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer shimmer-badge"
                    title="Click to view full score breakdown"
                  >
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span>{scoreResult.fitPercentage}% Match</span>
                    <span className="hidden sm:inline text-[10px] text-muted-foreground font-normal">({scoreResult.confidence} conf)</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeSection !== 'overview' && mode === 'seeker' && (
              <button
                type="button"
                onClick={() => setActiveSection('overview')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-border/70 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Score Overview</span>
              </button>
            )}

            <Link
              href="/guide"
              className="hidden md:flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/60 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>Guide</span>
            </Link>

            <ThemeToggle />
          </div>
        </header>

        {/* Main Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {error && (
              <div
                ref={errorBannerRef}
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                <span className="min-w-0 break-words">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto flex-shrink-0 rounded p-2 hover:bg-destructive/10"
                  aria-label="Dismiss error"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Recruiter Mode Canvas */}
            {mode === 'recruiter' ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary mb-1">
                    <Terminal className="h-3.5 w-3.5" />
                    <span>recruiter / bulk candidate ranking</span>
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                    Rank candidates against one job
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    Paste the job description, upload up to 20 candidate resumes, and get a ranked leaderboard with instant evidence.
                  </p>
                </div>

                <Card className="border-border/60 bg-card/60">
                  <CardContent className="p-5 sm:p-6">
                    <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold">
                      <ListChecks className="h-5 w-5 text-primary" />
                      Job description &amp; keywords
                    </h2>
                    <JobDescriptionInput
                      initialKeywords={keywords}
                      onKeywordsChange={handleKeywordsChange}
                      onExtractClick={handleExtractClick}
                      onExtractError={handleExtractError}
                      onJobDescriptionChange={handleJobDescriptionChange}
                    />
                  </CardContent>
                </Card>
                <RecruiterMode keywords={keywords} isLoading={false} />
              </div>
            ) : (
              /* Job Seeker Workspaces */
              <div className="space-y-6">
                {/* 1-Click Role Presets */}
                <SamplePresets onSelectPreset={handleSelectPreset} activePresetId={activePresetId} />

                {/* Section 1: Overview & Input */}
                {activeSection === 'overview' && (
                  <div className="space-y-6">
                    {/* Funnel Progress Indicator */}
                    <nav aria-label="Progress" className="mb-4">
                      <ol className="flex items-center gap-1 overflow-x-auto pb-1">
                        {FUNNEL.map((step, i) => {
                          const Icon = step.icon;
                          const done = stepDone[step.id];
                          const active = i === currentStepIndex && !stepDone[step.id];
                          return (
                            <li key={step.id} className="flex items-center gap-1">
                              <span
                                className={cn(
                                  'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap',
                                  done && 'border-success/40 bg-success/10 text-success',
                                  active && 'border-primary/50 bg-primary/10 text-primary',
                                  !done && !active && 'border-border text-muted-foreground'
                                )}
                              >
                                {done ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                                <span className="hidden sm:inline">{STEP_NUMBERS[i]}</span>
                                {step.label}
                              </span>
                              {i < FUNNEL.length - 1 && <span className="h-px w-4 bg-border" />}
                            </li>
                          );
                        })}
                      </ol>
                    </nav>

                    {/* 2-Column Inputs & Score */}
                    <div className="grid gap-6 lg:grid-cols-2 items-start">
                      {/* Left: Uploader & Job Description */}
                      <div className="space-y-6">
                        <Card className="border-border/60 bg-card/60">
                          <CardContent className="p-5 sm:p-6">
                            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold">
                              <FileText className="h-5 w-5 text-primary" />
                              Resume
                            </h2>
                            <ResumeUploader
                              onParseComplete={handleParseComplete}
                              onError={setError}
                              onParseStart={() => setScoreResult(null)}
                            />
                          </CardContent>
                        </Card>

                        <Card className="border-border/60 bg-card/60">
                          <CardContent className="p-5 sm:p-6">
                            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold">
                              <ListChecks className="h-5 w-5 text-primary" />
                              Job description &amp; keywords
                            </h2>
                            <JobDescriptionInput
                              initialKeywords={keywords}
                              onKeywordsChange={handleKeywordsChange}
                              onExtractClick={handleExtractClick}
                              onExtractError={handleExtractError}
                              onJobDescriptionChange={handleJobDescriptionChange}
                            />
                          </CardContent>
                        </Card>
                      </div>

                      {/* Right: Fit Score Radial Gauge */}
                      <div className="space-y-6">
                        <Card className="border-border/60 bg-card/60">
                          <CardContent className="p-5 sm:p-6">
                            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold">
                              <Gauge className="h-5 w-5 text-primary" />
                              Fit score
                            </h2>
                            {isScoring ? (
                              <div className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 py-12 text-sm text-muted-foreground" role="status">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                Scoring your resume...
                              </div>
                            ) : resume && keywords.length === 0 ? (
                              <p className="rounded-xl border border-border bg-muted/40 px-4 py-12 text-center text-sm text-muted-foreground">
                                Extract keywords from a job description to score your resume.
                              </p>
                            ) : !resume ? (
                              <p className="rounded-xl border border-border bg-muted/40 px-4 py-12 text-center text-sm text-muted-foreground">
                                Upload a resume to see your score.
                              </p>
                            ) : scoreResult ? (
                              <ScoreDisplay
                                result={scoreResult}
                                onOptimizeMissingSkill={handleOptimizeMissingSkill}
                              />
                            ) : null}
                          </CardContent>
                        </Card>

                        {/* Shareable Card */}
                        {scoreResult && resume && (
                          <ShareableReportCard
                            scoreResult={scoreResult}
                            resume={resume}
                          />
                        )}
                      </div>
                    </div>

                    {/* Copilot Suite Navigation Grid */}
                    {scoreResult && resume && (
                      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                              <Sparkles className="h-4 w-4" />
                              AI Application Copilot Suite
                            </div>
                            <h3 className="text-xl font-display font-bold text-foreground mt-0.5">
                              Ready to supercharge your application?
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Select any AI tool below or from the sidebar to launch its full-screen workspace:
                            </p>
                          </div>
                        </div>

                        {/* Copilot Navigation Tiles */}
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {NAV_ITEMS.filter((n) => n.id !== 'overview').map((item) => {
                            const Icon = item.icon;
                            return (
                              <TiltCard
                                key={item.id}
                                maxTilt={7}
                                scale={1.02}
                                className="p-0 border-0 bg-transparent"
                              >
                                <div
                                  onClick={() => {
                                    setActiveSection(item.id);
                                    playAudioFeedback('click');
                                  }}
                                  className="h-full p-4 rounded-2xl glass-card cursor-pointer transition-all flex items-start justify-between gap-3 group"
                                >
                                  <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                                      <span className="font-semibold text-xs text-foreground truncate">{item.label}</span>
                                      {item.badge && (
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/30 text-primary">
                                          {item.badge}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                                </div>
                              </TiltCard>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Section 2: ✨ 1-Click Magic Resume Auto-Fixer */}
                {activeSection === 'fixer' && (
                  <div className="space-y-4">
                    {resume ? (
                      <ResumeFixer
                        resumeText={resume.text}
                        jobDescription={jobDescription}
                        missingKeywords={missingKeywordsList}
                        currentScore={scoreResult?.fitPercentage || 65}
                      />
                    ) : (
                      <Card className="p-8 text-center bg-card/60">
                        <p className="text-sm text-muted-foreground">Please upload a resume or select a preset first.</p>
                      </Card>
                    )}
                  </div>
                )}

                {/* Section 3: 🔥 Brutal FAANG Recruiter Roast */}
                {activeSection === 'roast' && (
                  <div className="space-y-4">
                    {resume ? (
                      <RecruiterRoast
                        resumeText={resume.text}
                        jobDescription={jobDescription}
                      />
                    ) : (
                      <Card className="p-8 text-center bg-card/60">
                        <p className="text-sm text-muted-foreground">Please upload a resume or select a preset first.</p>
                      </Card>
                    )}
                  </div>
                )}

                {/* Section 4: 💰 Skill Salary & Market Value Estimator */}
                {activeSection === 'salary' && (
                  <div className="space-y-4">
                    {resume ? (
                      <SalaryEstimator
                        resumeText={resume.text}
                        jobDescription={jobDescription}
                        matchedKeywords={matchedKeywordsList}
                        missingKeywords={missingKeywordsList}
                      />
                    ) : (
                      <Card className="p-8 text-center bg-card/60">
                        <p className="text-sm text-muted-foreground">Please upload a resume or select a preset first.</p>
                      </Card>
                    )}
                  </div>
                )}

                {/* Section 5: Bullet Optimizer */}
                {activeSection === 'optimizer' && (
                  <div className="space-y-4">
                    <BulletOptimizer
                      missingKeywords={missingKeywordsList}
                      resumeContext={resume?.text || ''}
                      jobDescription={jobDescription}
                    />
                  </div>
                )}

                {/* Section 6: Skill Simulator */}
                {activeSection === 'simulator' && (
                  <div className="space-y-4">
                    {resume ? (
                      <SkillSimulator
                        resumeText={resume.text}
                        keywords={keywords}
                        baseScoreResult={scoreResult}
                        onOptimizeSkill={handleOptimizeMissingSkill}
                      />
                    ) : (
                      <Card className="p-8 text-center bg-card/60">
                        <p className="text-sm text-muted-foreground">Please upload a resume or select a preset first.</p>
                      </Card>
                    )}
                  </div>
                )}

                {/* Section 7: ATS Audit */}
                {activeSection === 'ats' && (
                  <div className="space-y-4">
                    {resume ? (
                      <ATSChecker resumeText={resume.text} />
                    ) : (
                      <Card className="p-8 text-center bg-card/60">
                        <p className="text-sm text-muted-foreground">Please upload a resume or select a preset first.</p>
                      </Card>
                    )}
                  </div>
                )}

                {/* Section 8: Interview Prep */}
                {activeSection === 'interview' && (
                  <div className="space-y-4">
                    {resume ? (
                      <InterviewPredictor
                        resumeText={resume.text}
                        jobDescription={jobDescription}
                        keywords={keywords}
                        matchedKeywords={matchedKeywordsList}
                        missingKeywords={missingKeywordsList}
                      />
                    ) : (
                      <Card className="p-8 text-center bg-card/60">
                        <p className="text-sm text-muted-foreground">Please upload a resume or select a preset first.</p>
                      </Card>
                    )}
                  </div>
                )}

                {/* Section 9: Outreach & Cover Letter */}
                {activeSection === 'outreach' && (
                  <div className="space-y-4">
                    {resume ? (
                      <CoverLetterGenerator
                        resumeText={resume.text}
                        jobDescription={jobDescription}
                        matchedKeywords={matchedKeywordsList}
                      />
                    ) : (
                      <Card className="p-8 text-center bg-card/60">
                        <p className="text-sm text-muted-foreground">Please upload a resume or select a preset first.</p>
                      </Card>
                    )}
                  </div>
                )}

                {/* Section 10: Fairness & Bias Check */}
                {activeSection === 'bias' && (
                  <div className="space-y-4">
                    {resume && scoreResult ? (
                      <BiasCheck
                        resumeText={resume.text}
                        keywords={keywords}
                      />
                    ) : (
                      <Card className="p-8 text-center bg-card/60">
                        <p className="text-sm text-muted-foreground">Score a resume first to run the fairness check.</p>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ============================================================ */}
      {/* 3. MOBILE SLIDE-OUT DRAWER / MENU                             */}
      {/* ============================================================ */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true" aria-label="Navigation Menu">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm bg-card border-r border-border h-full flex flex-col z-50 p-4 shadow-2xl space-y-4 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary font-mono text-xs font-bold text-primary-foreground">
                  AI
                </span>
                <span className="font-mono text-xs font-bold">RESUME_SCREENER</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-10 w-10 rounded-lg border border-border/70 flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Close navigation menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 rounded-xl bg-muted/40 p-1 border border-border/70 text-xs">
              <button
                onClick={() => {
                  setMode('seeker');
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-center font-medium',
                  mode === 'seeker' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                )}
              >
                Job Seeker
              </button>
              <button
                onClick={() => {
                  setMode('recruiter');
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-center font-medium',
                  mode === 'recruiter' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                )}
              >
                Recruiter
              </button>
            </div>

            {/* Nav list */}
            <div className="flex-1 overflow-y-auto space-y-1">
              {mode === 'seeker' ? (
                NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setIsMobileMenuOpen(false);
                        playAudioFeedback('click');
                      }}
                      className={cn(
                        'w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left transition-all',
                        isActive ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-muted/40'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-current shrink-0 ml-1">
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-2 space-y-2 text-xs text-muted-foreground">
                  <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Recruiter Suite
                  </div>
                  <div className="p-3 rounded-xl border border-border/70 bg-card/60 space-y-1">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-primary" />
                      <span>20-Candidate Batch</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Upload multiple resumes and rank them instantly on a live leaderboard.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 text-primary text-[11px] font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Coming soon for Enterprise</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-border/80 flex items-center justify-between">
              <Link
                href="/guide"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span>Feature Guide</span>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}