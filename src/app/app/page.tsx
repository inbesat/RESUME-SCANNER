'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2, Check, FileText, ListChecks, Gauge, ShieldAlert, FileDown, Users, User, Terminal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResumeUploader } from '@/components/ResumeUploader';
import { JobDescriptionInput } from '@/components/JobDescriptionInput';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { BiasCheck } from '@/components/BiasCheck';
import { RecruiterMode } from '@/components/RecruiterMode';
import ThemeToggle from '@/components/ThemeToggle';
import { cn } from '@/lib/utils/helpers';
import { Keyword, ParsedResume, ScoreResult } from '@/types';

const KEYWORDS_KEY = 'ars-keywords';

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
  { id: 'bias', label: 'Bias check', icon: ShieldAlert },
  { id: 'report', label: 'Report', icon: FileDown },
];

export default function AppPage() {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === 'undefined') return 'seeker';
    return new URLSearchParams(window.location.search).get('mode') === 'recruiter' ? 'recruiter' : 'seeker';
  });

  const [resume, setResume] = useState<ParsedResume | null>(null);
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

  const errorBannerRef = useRef<HTMLDivElement>(null);
  const errorSeenRef = useRef(false);

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
      const data = await response.json();
      if (id !== requestIdRef.current) return;
      if (!data.success) throw new Error(data.error || 'Scoring failed');
      setScoreResult(data.data);
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

  const handleExtractClick = useCallback(() => {
    setScoreResult(null);
    setError(null);
  }, []);

  const handleExtractError = useCallback((message: string) => {
    setError(message);
    errorSeenRef.current = true;
  }, []);

  const handleExportPDF = useCallback(async () => {
    if (!resume || !scoreResult) return;
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, keywords, scoreResult }),
      });
      if (!response.ok) throw new Error('PDF export failed');
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

  const stepDone: Record<string, boolean> = {
    resume: !!resume,
    keywords: keywords.length > 0,
    score: !!scoreResult,
    bias: false,
    report: !!scoreResult,
  };

  let currentStepIndex = 0;
  if (stepDone.resume) currentStepIndex = 1;
  if (stepDone.keywords) currentStepIndex = 2;
  if (stepDone.score) currentStepIndex = 3;

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

        <div className="mb-8">
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
              : 'Upload your resume, paste the job description, and get an evidence-backed fit score in under a minute.'}
          </p>
        </div>

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
                />
              </CardContent>
            </Card>
            <RecruiterMode keywords={keywords} isLoading={false} />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
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
                  />
                </CardContent>
              </Card>
            </div>

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
                      <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>
                    </div>
                  ) : (
                    <ScoreDisplay result={scoreResult} onExportPDF={scoreResult ? handleExportPDF : undefined} />
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/60">
                <CardContent className="p-5 sm:p-6">
                  <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                    Bias check
                  </h2>
                  {resume ? (
                    <BiasCheck resumeText={resume.text} keywords={keywords} />
                  ) : (
                    <p className="rounded-xl border border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                      Upload a resume to run the anonymized fairness check.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const STEP_NUMBERS = ['01', '02', '03', '04', '05'];