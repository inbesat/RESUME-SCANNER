'use client';

import { useState } from 'react';
import {
  Flame,
  HeartHandshake,
  Skull,
  AlertTriangle,
  Sparkles,
  Share2,
  Copy,
  Check,
  Loader2,
  Trophy,
  HelpCircle,
  TrendingDown,
  Quote,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TiltCard } from '@/components/ui/TiltCard';
import { RecruiterRoastResult } from '@/types';
import { parseApiResponse, cn } from '@/lib/utils/helpers';
import { triggerConfetti, playAudioFeedback } from '@/lib/utils/effects';

interface RecruiterRoastProps {
  resumeText: string;
  jobDescription?: string;
}

export function RecruiterRoast({ resumeText, jobDescription = '' }: RecruiterRoastProps) {
  const [mode, setMode] = useState<'roast' | 'mentor'>('roast');
  const [data, setData] = useState<RecruiterRoastResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRunAnalysis = async (selectedMode = mode) => {
    if (!resumeText) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/roast-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          mode: selectedMode,
        }),
      });

      const result = await parseApiResponse<RecruiterRoastResult>(response);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to roast resume');
      }

      setData(result.data);
      if (selectedMode === 'mentor' || result.data.roastScore >= 75) {
        triggerConfetti();
      }
      playAudioFeedback('click');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resume');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (newMode: 'roast' | 'mentor') => {
    setMode(newMode);
    if (data) {
      handleRunAnalysis(newMode);
    }
  };

  const handleShareTwitter = () => {
    if (!data) return;
    const text = encodeURIComponent(
      `${data.shareablePunchline}\n\nCheck your fit score and get your resume roasted here:`
    );
    const url = encodeURIComponent('https://resume-scanner-drab.vercel.app/app');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleCopySummary = () => {
    if (!data) return;
    const text = `🔥 AI Recruiter Roast Verdict (${data.survivalTier} - ${data.roastScore}% Survival Rate):
"${data.roastHeadline}"

6-Second Recruiter Impression:
${data.firstImpressionIn6Seconds}

Top Flags:
${data.redFlags.map((f) => `• ${f}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTierColor = (tier: RecruiterRoastResult['survivalTier']) => {
    switch (tier) {
      case 'Instant Shredder':
        return 'bg-destructive/15 text-destructive border-destructive/30';
      case 'Phone Screen Gamble':
        return 'bg-warning/15 text-warning border-warning/30';
      case 'Strong Contender':
        return 'bg-primary/15 text-primary border-primary/30';
      case 'FAANG Onsite Ready':
        return 'bg-success/15 text-success border-success/30';
    }
  };

  return (
    <Card className="border-border/80 bg-gradient-to-b from-card via-card/95 to-background shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-primary mb-1">
              <Flame className="h-3.5 w-3.5 text-destructive animate-pulse" />
              <span>Brutal FAANG Recruiter Feedback vs. Friendly Coach</span>
            </div>
            <CardTitle className="flex items-center gap-2 text-xl font-display">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
                {mode === 'roast' ? <Flame className="h-4 w-4" /> : <HeartHandshake className="h-4 w-4 text-primary" />}
              </span>
              {mode === 'roast' ? 'Brutal Recruiter Roast' : 'Encouraging Career Mentor'}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              {mode === 'roast'
                ? 'Savage, hilarious, and brutally honest critique from a FAANG recruiter who reviews 50,000 resumes. No sugarcoating.'
                : 'Warm, supportive, and strategic career guidance highlighting your strengths with constructive step-by-step polish.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/70">
              <button
                type="button"
                onClick={() => handleModeChange('roast')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  mode === 'roast'
                    ? 'bg-destructive text-destructive-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Flame className="h-3.5 w-3.5" />
                🔥 Savage Roast
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('mentor')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  mode === 'mentor'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <HeartHandshake className="h-3.5 w-3.5" />
                🤝 Career Mentor
              </button>
            </div>

            <Button
              onClick={() => handleRunAnalysis(mode)}
              disabled={isLoading || !resumeText}
              className={cn(
                'gap-2 font-semibold shadow-md w-full sm:w-auto',
                mode === 'roast'
                  ? 'bg-gradient-to-r from-destructive to-orange-500 text-destructive-foreground hover:opacity-90'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'roast' ? <Flame className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {data ? (mode === 'roast' ? 'Re-Roast My Resume' : 'Re-Analyze Resume') : mode === 'roast' ? '🔥 Roast My Resume' : '🤝 Get Mentor Feedback'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-center gap-2" role="alert">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!data && !isLoading && (
          <div className="rounded-2xl border-2 border-dashed border-destructive/20 p-8 sm:p-12 text-center bg-gradient-to-b from-destructive/5 via-card to-background space-y-4">
            <div className="h-14 w-14 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center shadow-inner">
              <Skull className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display text-lg font-bold text-foreground">
                Can your resume survive a 6-second FAANG recruiter glance?
              </h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Get an unvarnished, entertaining roast exposing your cringe buzzwords, missing metrics, and weak verbs—paired with exact formulas to fix them immediately.
              </p>
            </div>
            <div className="pt-2">
              <Button
                size="lg"
                onClick={() => handleRunAnalysis('roast')}
                disabled={!resumeText}
                className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20 font-semibold"
              >
                <Flame className="h-4 w-4" />
                Roast My Resume (Brutal Truth)
              </Button>
            </div>
          </div>
        )}

        {data && (
          <div className="space-y-5">
            {/* Survival Score & Headline Banner */}
            <TiltCard maxTilt={5} scale={1.01} className="p-0 border-0">
              <div className={cn('rounded-2xl border p-5 sm:p-6 shadow-lg space-y-4 glass-specular', mode === 'roast' ? 'bg-gradient-to-br from-destructive/10 via-card/90 to-card border-destructive/30' : 'bg-gradient-to-br from-primary/10 via-card/90 to-card border-primary/30')}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn('h-14 w-14 rounded-2xl flex flex-col items-center justify-center font-display font-bold shadow-md shrink-0 text-foreground border', mode === 'roast' ? 'bg-destructive/20 border-destructive/40' : 'bg-primary/20 border-primary/40')}>
                      <span className="text-xl leading-none">{data.roastScore}%</span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">Survival</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-lg font-bold text-foreground">
                          {data.survivalTier}
                        </h3>
                        <Badge variant="outline" className={cn('text-xs font-semibold px-2.5 py-0.5', getTierColor(data.survivalTier))}>
                          {data.survivalTier === 'Instant Shredder' ? '🗑️ Instant Shredder' : data.survivalTier === 'Phone Screen Gamble' ? '🎲 50/50 Coin Flip' : data.survivalTier === 'Strong Contender' ? '⭐ Strong Contender' : '🏆 FAANG Onsite Ready'}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-foreground/90 mt-1 italic">
                        &quot;{data.roastHeadline}&quot;
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleShareTwitter}
                      className="h-8 text-xs gap-1.5 border-border/80 hover:text-primary hover:border-primary/50"
                    >
                      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      Share Roast
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopySummary}
                      className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copied' : 'Copy Roast'}
                    </Button>
                  </div>
                </div>

                {/* 6-Second Glance Simulation */}
                <div className="rounded-xl border border-border/70 bg-card/80 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <Eye className="h-3.5 w-3.5" />
                  <span>The 6-Second Recruiter Glance (Internal Monologue):</span>
                </div>
                <p className="text-xs text-foreground/90 font-mono leading-relaxed bg-muted/40 p-3 rounded-lg border border-border/60">
                  {data.firstImpressionIn6Seconds}
                </p>
              </div>
            </div>
          </TiltCard>

            {/* Red Flags / Core Observations */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                {mode === 'roast' ? 'Top Red Flags & Immediate Disqualifiers' : 'Key Areas for Strategic Polish'}
              </h4>
              <div className="grid gap-2 sm:grid-cols-3">
                {data.redFlags.map((flag, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border/60 bg-muted/30 text-xs text-foreground/90 flex items-start gap-2">
                    <span className="text-destructive font-bold">✕</span>
                    <span className="leading-snug">{flag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Buzzword Crime Scene */}
            {data.buzzwordCrimes && data.buzzwordCrimes.length > 0 && (
              <div className="rounded-xl border border-destructive/25 bg-destructive/[0.02] p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-destructive flex items-center gap-2">
                    <Skull className="h-4 w-4" />
                    🚨 Buzzword Crime Scene ({data.buzzwordCrimes.length} generic clichés detected)
                  </h4>
                  <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">
                    Replace with Google XYZ
                  </Badge>
                </div>

                <div className="space-y-3">
                  {data.buzzwordCrimes.map((crime, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-border/80 bg-card/70 space-y-2 text-xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-semibold text-destructive px-2 py-0.5 rounded bg-destructive/10 border border-destructive/20">
                          &quot;{crime.buzzword}&quot;
                        </span>
                        <span className="text-[11px] text-muted-foreground">Found in sentence:</span>
                      </div>
                      <p className="text-muted-foreground font-mono text-[11px] bg-muted/40 p-2 rounded border border-border/50 italic">
                        &quot;{crime.sentence}&quot;
                      </p>
                      <p className="text-foreground/90 font-medium">
                        🔥 <strong>Recruiter Reaction:</strong> {crime.roast}
                      </p>
                      <div className="p-2 bg-success/10 rounded-lg border border-success/20 text-success text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span><strong>Fix It With:</strong> {crime.replacement}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Savage Critiques & Actionable Fixes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                Category Deep-Dive &amp; Actionable Solutions
              </h4>

              <div className="grid gap-3 sm:grid-cols-3">
                {data.savageTakeaways.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-border/80 bg-card/60 p-4 space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/30 font-semibold">
                        {item.category}
                      </Badge>
                      <p className="text-xs text-foreground/90 leading-relaxed font-sans">
                        {item.critique}
                      </p>
                      <blockquote className="border-l-2 border-primary/40 pl-2.5 py-1 text-[11px] text-muted-foreground italic bg-muted/20 rounded-r">
                        {item.roastQuote}
                      </blockquote>
                    </div>
                    <div className="pt-2 border-t border-border/60 text-[11px] text-success">
                      <strong>Solution:</strong> {item.fix}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Verdict Callout */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between flex-col sm:flex-row gap-3">
              <div>
                <span className="font-semibold text-xs text-primary uppercase tracking-wide block mb-0.5">
                  Final Hiring Decision:
                </span>
                <p className="text-xs sm:text-sm text-foreground font-medium">
                  {data.verdict}
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => {
                  const fixerTab = document.querySelector('button[role="tab"][value="fixer"]') as HTMLButtonElement;
                  fixerTab?.click();
                }}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 w-full sm:w-auto"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Auto-Fix These Issues in 1-Click →
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
