'use client';

import { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, Sparkles, Trophy, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreResult, ParsedResume } from '@/types';
import { cn } from '@/lib/utils/helpers';
import { triggerConfetti, playAudioFeedback } from '@/lib/utils/effects';

interface ShareableReportCardProps {
  scoreResult: ScoreResult;
  resume: ParsedResume;
  roleTitle?: string;
}

export function ShareableReportCard({ scoreResult, resume, roleTitle = 'Target Role' }: ShareableReportCardProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const fit = scoreResult.fitPercentage;
  const matchedCount = Object.values(scoreResult.breakdown).reduce((acc, b) => acc + (b.matched?.length || 0), 0);
  const topMatched = Object.values(scoreResult.breakdown).flatMap(b => b.matched || []).slice(0, 5);

  const getScoreGradient = (s: number) => {
    if (s >= 80) return 'from-emerald-500/20 via-primary/20 to-primary/5 border-emerald-500/30';
    if (s >= 65) return 'from-amber-500/20 via-primary/20 to-primary/5 border-amber-500/30';
    return 'from-red-500/20 via-primary/20 to-primary/5 border-red-500/30';
  };

  const handleCopyMarkdown = () => {
    const md = `[![Resume Fit Score](https://img.shields.io/badge/Resume_Fit_Score-${fit}%25-${fit >= 80 ? 'success' : 'yellow'}?style=for-the-badge&logo=target)](https://resume-scanner-drab.vercel.app/app)\n\n**Candidate Fit Report for ${roleTitle}**\n- **Overall Fit:** ${fit}%\n- **Matched Skills:** ${matchedCount} (${topMatched.join(', ')})\n- **Confidence:** ${scoreResult.confidence.toUpperCase()}\n- *Verified via AI Resume Screener (Hybrid Scorer)*`;
    navigator.clipboard.writeText(md);
    setCopied('md');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyShareLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://resume-scanner-drab.vercel.app/app';
    navigator.clipboard.writeText(url);
    setCopied('link');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShareTwitter = () => {
    const text = `Just scanned my resume against ${roleTitle} on AI Resume Screener — scored ${fit}% fit with ${matchedCount} matched skills! ⚡ Check your fit score:`;
    const url = 'https://resume-scanner-drab.vercel.app/app';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = 'https://resume-scanner-drab.vercel.app/app';
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-b from-card to-background p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Share2 className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              Shareable Fit Score Card
              {fit >= 80 && (
                <Badge variant="outline" className="bg-success/15 text-success border-success/30 text-[10px]">
                  🏆 Top Candidate Tier
                </Badge>
              )}
            </h4>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            triggerConfetti();
            playAudioFeedback('success');
          }}
          className="text-xs h-8 gap-1.5 border-primary/30 hover:border-primary/60 text-primary"
        >
          <Sparkles className="h-3.5 w-3.5" /> Celebrate 🎊
        </Button>
      </div>

      {/* Card Preview */}
      <div className={cn('rounded-xl border p-5 bg-gradient-to-br space-y-4 shadow-sm', getScoreGradient(fit))}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary block">
              Verified Candidate Report
            </span>
            <h3 className="text-lg font-bold font-display text-foreground mt-0.5">
              {roleTitle}
            </h3>
            <p className="text-xs text-muted-foreground">
              {resume.fileName} • {resume.wordCount} words
            </p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-extrabold font-display text-foreground tracking-tight">
              {fit}%
            </div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              {scoreResult.confidence} confidence
            </span>
          </div>
        </div>

        {topMatched.length > 0 && (
          <div className="space-y-1.5 border-t border-border/40 pt-3">
            <span className="text-[11px] text-muted-foreground font-medium block">
              Top Matched Competencies ({matchedCount} total):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {topMatched.map((m, i) => (
                <Badge key={i} variant="outline" className="text-[10px] bg-background/80 text-foreground border-border/60">
                  ✓ {m}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleShareTwitter}
            className="h-8 text-xs gap-1.5 text-foreground hover:text-primary flex-1 sm:flex-initial"
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleShareLinkedIn}
            className="h-8 text-xs gap-1.5 text-foreground hover:text-primary flex-1 sm:flex-initial"
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.63 1.63 0 0 0-1.63 1.63c0 .9.73 1.63 1.63 1.63a1.63 1.63 0 0 0 1.63-1.63c0-.9-.73-1.63-1.63-1.63Z" />
            </svg>
            LinkedIn
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyMarkdown}
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground flex-1 sm:flex-initial"
          >
            {copied === 'md' ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copied === 'md' ? 'Copied' : 'Copy Badge'}
          </Button>

          <Button
            size="sm"
            onClick={handleCopyShareLink}
            className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground flex-1 sm:flex-initial"
          >
            {copied === 'link' ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
            {copied === 'link' ? 'Copied Link' : 'Copy Link'}
          </Button>
        </div>
      </div>
    </div>
  );
}
