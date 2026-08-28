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
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import { SamplePresets } from '@/components/SamplePresets';
import { ShareableReportCard } from '@/components/ShareableReportCard';
import ThemeToggle from '@/components/ThemeToggle';
import { cn, parseApiResponse } from '@/lib/utils/helpers';
import { triggerConfetti, playAudioFeedback } from '@/lib/utils/effects';
import { Keyword, ParsedResume, ScoreResult } from '@/types';
import { SamplePreset } from '@/lib/presets/sample-data';

const KEYWORDS_KEY = 'ars-keywords';
const JD_KEY = 'ars-job-description';

type Mode = 'seeker' | 'recruiter';

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
  const [activeCopilotTab, setActiveCopilotTab] = useState<'optimizer' | 'simulator' | 'ats' | 'interview' | 'outreach' | 'bias'>('optimizer');

  const errorBannerRef = useRef<HTMLDivElement>(null);
  const errorSeenRef = useRef(false);
  const copilotSectionRef = useRef<HTMLDivElement>(null);

  const requestIdRef = useRef(0);

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
      const data = await parseApiResponse<ScoreResult>(response);
      if (id !== requestIdRef.current) return;
      if (!data.success || !data.data) throw new Error(data.error || 'Scoring failed');
      setScoreResult(data.data);
      if (data.data.fitPercentage >= 80) {
        triggerConfetti();
        playAudioFeedback('success');
      }
    } catch (err) {
      if (id !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : 'Scoring failed');
    } finally {
      if (id === requestIdRef.current) setIsScoring(false);
    }
  }, [resume, keywords]);

  useEffect(() => {
    if (mode !== 'seeker') return;
    if (!resume || keywords.length === 0) return;
    const t = setTimeout(() => {
      scoreResume();
    }, 350);
    return () => clearTimeout(t);
  }, [mode, resume, keywords, scoreResume]);

  const handleParseComplete = useCallback((parsed: ParsedResume) => {
    setResume(parsed);
    setScoreResult(null);
    setActivePresetId(null);
  }, []);

  const handleKeywordsChange = useCallback((next: Keyword[]) => {
    setKeywords(next);
    setScoreResult(null);
    try {
      sessionStorage.setItem(KEYWORDS_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleJobDescriptionChange = useCallback((jd: string) => {
    setJobDescription(jd);
  }, []);

  const handleExtractClick = useCallback(() => {
    setScoreResult(null);
    setError(null);
  }, []);

  const handleExtractError = useCallback((message: string) => {
    setError(message);
    errorSeenRef.current = true;
  }, []);

  const handleSelectPreset = useCallback((preset: SamplePreset) => {
    setActivePresetId(preset.id);
    setResume(preset.resume);
    setJobDescription(preset.jobDescription);
    setKeywords(preset.keywords);
    setError(null);

    try {
      sessionStorage.setItem(JD_KEY, preset.jobDescription);
      sessionStorage.setItem(KEYWORDS_KEY, JSON.stringify(preset.keywords));
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleOptimizeMissingSkill = useCallback((skill: string) => {
    setActiveCopilotTab('optimizer');
    copilotSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleExportPDF = useCallback(async () => {
    if (!resume || !scoreResult) return;
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, keywords, scoreResult }),
      });
      if (!response.ok) {
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json.error || 'PDF export failed');
        } catch {
          throw new Error(text || `PDF export failed (${response.status})`);
        }
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fit-report-${resume.fileName.replace(/\.[^/.]+$/, '')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF export failed');
    }
  }, [resume, keywords, scoreResult]);

  useEffect(() => {
    if (error && !errorSeenRef.current) {
      errorBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    errorSeenRef.current = false;
  }, [error]);

  const matchedKeywordsList = scoreResult
    ? Object.values(scoreResult.breakdown).flatMap((b) => b.matched || [])
    : [];

  const missingKeywordsList = scoreResult
    ? Object.values(scoreResult.breakdown).flatMap((b) => b.missing || [])
    : [];

  const stepDone: Record<string, boolean> = {
    resume: !!resume,
    keywords: keywords.length > 0,
    score: !!scoreResult,
    copilot: !!scoreResult,
    report: !!scoreResult,
  };

  let currentStepIndex = 0;
  if (stepDone.resume) currentStepIndex = 1;
  if (stepDone.keywords) currentStepIndex = 2;
  if (stepDone.score) currentStepIndex = 3;
  if (stepDone.copilot) currentStepIndex = 4;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5" aria-label="AI Resume Screener home">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#ff5f42] font-mono text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25">
                AI
              </span>
              <span className="font-mono text-sm font-semibold tracking-tight">
                RESUME_SCREENER
              </span>
            </Link>
            <Badge variant="outline" className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline-flex">
              hybrid scoring
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border p-0.5" role="tablist" aria-label="Screener mode">
              <button
                role="tab"
                aria-selected={mode === 'seeker'}
                onClick={() => setMode('seeker')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  mode === 'seeker' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <User className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Job Seeker</span>
              </button>
              <button
                role="tab"
                aria-selected={mode === 'recruiter'}
                onClick={() => setMode('recruiter')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  mode === 'recruiter' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Users className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Recruiter</span>
              </button>
            </div>

            <Link
              href="/guide"
              className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/60 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
              title="Feature Guide & Screenshots"
            >
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Guide &amp; Tips</span>
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {error && (
          <div
            ref={errorBannerRef}
            role="alert"
            className="mb-6 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            <span className="mt-0.5 flex-shrink-0">⚠</span>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto flex-shrink-0 rounded px-1 hover:bg-destructive/10"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
            <Terminal className="h-3.5 w-3.5" />
            {mode === 'recruiter' ? 'recruiter / bulk ranking' : 'job seeker / self-score'}
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {mode === 'recruiter' ? 'Rank candidates against one job' : 'Score your resume against a job'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {mode === 'recruiter'
              ? 'Paste the job description, add up to 20 resumes, and get a ranked leaderboard with evidence.'
              : 'Upload your resume, paste the job description, and get an evidence-backed fit score with AI optimization tools in seconds.'}
          </p>
        </div>

        {/* 1-Click Demo Sample Presets */}
        <SamplePresets onSelectPreset={handleSelectPreset} activePresetId={activePresetId} />

        <nav aria-label="Progress" className="mb-8">
          <ol className="flex items-center gap-1 overflow-x-auto pb-1">
            {FUNNEL.map((step, i) => {
              const Icon = step.icon;
              const done = mode === 'recruiter' ? (step.id === 'resume' ? true : stepDone[step.id]) : stepDone[step.id];
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

        {mode === 'recruiter' ? (
          <div className="space-y-6">
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
          <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
              {/* Left Column: Inputs */}
              <div className="grid gap-6">
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

              {/* Right Column: Score Display */}
              <div className="grid gap-6">
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
                      <div className="rounded-xl border border-border bg-muted/40 px-4 py-12 text-center">
                        <p className="text-sm text-muted-foreground">No resume uploaded yet. Click any sample preset above to test drive!</p>
                      </div>
                    ) : (
                      <ScoreDisplay
                        result={scoreResult}
                        onExportPDF={scoreResult ? handleExportPDF : undefined}
                        onOptimizeMissingSkill={handleOptimizeMissingSkill}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* AI Application Copilot Workspace (Superpowers) */}
            {resume && (
              <div ref={copilotSectionRef} className="space-y-4 pt-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-display text-2xl font-semibold tracking-tight flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Application Copilot Suite
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Optimize bullets, simulate skill additions, audit ATS compatibility, predict interview questions, and craft outreach.
                    </p>
                  </div>
                </div>

                <Tabs value={activeCopilotTab} onValueChange={(v) => setActiveCopilotTab(v as typeof activeCopilotTab)} className="w-full">
                  <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 max-w-4xl">
                    <TabsTrigger value="optimizer" className="text-xs gap-1.5 py-2">
                      <Wand2 className="h-3.5 w-3.5" />
                      Bullet Optimizer
                    </TabsTrigger>
                    <TabsTrigger value="simulator" className="text-xs gap-1.5 py-2">
                      <Sliders className="h-3.5 w-3.5" />
                      Skill Simulator
                    </TabsTrigger>
                    <TabsTrigger value="ats" className="text-xs gap-1.5 py-2">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      ATS Audit
                    </TabsTrigger>
                    <TabsTrigger value="interview" className="text-xs gap-1.5 py-2">
                      <Target className="h-3.5 w-3.5" />
                      Interview Prep
                    </TabsTrigger>
                    <TabsTrigger value="outreach" className="text-xs gap-1.5 py-2">
                      <Mail className="h-3.5 w-3.5" />
                      Outreach / DM
                    </TabsTrigger>
                    <TabsTrigger value="bias" className="text-xs gap-1.5 py-2">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Fairness Check
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="optimizer" className="mt-4">
                    <BulletOptimizer
                      missingKeywords={missingKeywordsList}
                      resumeContext={resume.text}
                      jobDescription={jobDescription}
                    />
                  </TabsContent>

                  <TabsContent value="simulator" className="mt-4">
                    <SkillSimulator
                      resumeText={resume.text}
                      keywords={keywords}
                      baseScoreResult={scoreResult}
                      onOptimizeSkill={handleOptimizeMissingSkill}
                    />
                  </TabsContent>

                  <TabsContent value="ats" className="mt-4">
                    <ATSChecker resumeText={resume.text} />
                  </TabsContent>

                  <TabsContent value="interview" className="mt-4">
                    <InterviewPredictor
                      resumeText={resume.text}
                      jobDescription={jobDescription}
                      keywords={keywords}
                      matchedKeywords={matchedKeywordsList}
                      missingKeywords={missingKeywordsList}
                    />
                  </TabsContent>

                  <TabsContent value="outreach" className="mt-4">
                    <CoverLetterGenerator
                      resumeText={resume.text}
                      jobDescription={jobDescription}
                      matchedKeywords={matchedKeywordsList}
                    />
                  </TabsContent>

                  <TabsContent value="bias" className="mt-4">
                    <Card className="border-border/60 bg-card/60">
                      <CardContent className="p-5 sm:p-6">
                        <BiasCheck resumeText={resume.text} keywords={keywords} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {scoreResult && (
                  <div className="pt-2">
                    <ShareableReportCard
                      scoreResult={scoreResult}
                      resume={resume}
                      roleTitle={activePresetId ? 'Target Role' : 'Job Application'}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const STEP_NUMBERS = ['01', '02', '03', '04', '05'];