'use client';

import { useState, useCallback } from 'react';
import { Target, HelpCircle, ChevronDown, ChevronUp, Copy, Check, Loader2, Sparkles, ShieldAlert, Award, Compass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InterviewPrepResult, InterviewQuestion, Keyword } from '@/types';
import { parseApiResponse, cn } from '@/lib/utils/helpers';

interface InterviewPredictorProps {
  resumeText: string;
  jobDescription: string;
  keywords: Keyword[];
  matchedKeywords: string[];
  missingKeywords: string[];
}

const CATEGORY_BADGES: Record<InterviewQuestion['category'], { label: string; color: string }> = {
  technical: { label: 'Technical Depth', color: 'bg-primary/10 text-primary border-primary/30' },
  experience: { label: 'Experience & Trade-offs', color: 'bg-success/10 text-success border-success/30' },
  behavioral: { label: 'Leadership & STAR', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  gap: { label: 'Skill Gap Probe', color: 'bg-destructive/10 text-destructive border-destructive/30' },
};

export function InterviewPredictor({
  resumeText,
  jobDescription,
  keywords,
  matchedKeywords,
  missingKeywords,
}: InterviewPredictorProps) {
  const [data, setData] = useState<InterviewPrepResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = useCallback(async () => {
    if (!resumeText || !jobDescription) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/predict-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          keywords,
          matchedKeywords,
          missingKeywords,
        }),
      });

      const result = await parseApiResponse<InterviewPrepResult>(response);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to predict interview questions');
      }

      setData(result.data);
      if (result.data.questions?.length > 0) {
        setExpandedId(result.data.questions[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setIsLoading(false);
    }
  }, [resumeText, jobDescription, keywords, matchedKeywords, missingKeywords]);

  const handleCopyAnswer = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card className="border-border/70 bg-gradient-to-b from-card/80 to-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                <Target className="h-4 w-4" />
              </span>
              Interview Question Predictor &amp; STAR Cheat Sheet
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              AI anticipates the exact technical and behavioral questions hiring managers will ask about your strengths and gaps.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handlePredict}
            disabled={isLoading || !resumeText || !jobDescription}
            className="gap-2 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {data ? 'Regenerate Questions' : 'Predict Interview Questions'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg" role="alert">
            {error}
          </p>
        )}

        {!data && !isLoading && (
          <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-muted/20">
            <Compass className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
            <p className="text-sm font-medium">Ready to predict your interview questions</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Click &quot;Predict Interview Questions&quot; above to simulate an interview with structured STAR answers.
            </p>
          </div>
        )}

        {data && (
          <div className="space-y-4 pt-1">
            {/* Executive Summary */}
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Award className="h-4 w-4" />
                <span>Interviewer Perspective &amp; Candidate Summary</span>
              </div>
              <p className="text-xs leading-relaxed text-foreground/90 font-sans">
                {data.candidateSummary}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {data.keyStrengths.map((s, idx) => (
                  <Badge key={idx} variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">
                    ✓ {s}
                  </Badge>
                ))}
                {data.topGaps.map((g, idx) => (
                  <Badge key={idx} variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">
                    ⚠ Prepare: {g}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Top 5 Anticipated Interview Questions ({data.questions.length}):
              </h4>

              {data.questions.map((q, idx) => {
                const isExpanded = expandedId === q.id;
                const badgeInfo = CATEGORY_BADGES[q.category] || CATEGORY_BADGES.technical;

                return (
                  <div
                    key={q.id || idx}
                    className={cn(
                      'rounded-xl border transition-all',
                      isExpanded
                        ? 'border-primary/50 bg-card shadow-sm'
                        : 'border-border/70 bg-muted/20 hover:border-border hover:bg-muted/40'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : q.id)}
                      className="w-full p-4 text-left flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-primary">0{idx + 1}</span>
                          <span className={cn('px-2 py-0.5 text-[10px] rounded-full border font-medium', badgeInfo.color)}>
                            {badgeInfo.label}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground leading-snug">
                          {q.question}
                        </p>
                      </div>
                      <div className="p-1 rounded-md text-muted-foreground shrink-0">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-border/40 text-xs">
                        {/* Why asked */}
                        <div className="flex items-start gap-2 bg-muted/40 p-2.5 rounded-lg text-muted-foreground">
                          <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <p><strong className="text-foreground">Why they ask:</strong> {q.whyAsked}</p>
                        </div>

                        {/* STAR Guide */}
                        {q.starGuide && (
                          <div className="space-y-2">
                            <span className="font-semibold text-foreground text-[11px] uppercase tracking-wide">
                              STAR Framework Breakdown:
                            </span>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <div className="rounded-lg border border-border/50 bg-card/60 p-2.5">
                                <span className="font-bold text-primary block mb-1">S — Situation</span>
                                <span className="text-muted-foreground">{q.starGuide.situation}</span>
                              </div>
                              <div className="rounded-lg border border-border/50 bg-card/60 p-2.5">
                                <span className="font-bold text-primary block mb-1">T — Task</span>
                                <span className="text-muted-foreground">{q.starGuide.task}</span>
                              </div>
                              <div className="rounded-lg border border-border/50 bg-card/60 p-2.5">
                                <span className="font-bold text-primary block mb-1">A — Action</span>
                                <span className="text-muted-foreground">{q.starGuide.action}</span>
                              </div>
                              <div className="rounded-lg border border-border/50 bg-card/60 p-2.5">
                                <span className="font-bold text-primary block mb-1">R — Result</span>
                                <span className="text-muted-foreground">{q.starGuide.result}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Sample Talking Points */}
                        <div className="rounded-lg border border-border/60 bg-muted/50 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground text-[11px] uppercase tracking-wide">
                              Suggested Strong Answer:
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyAnswer(q.sampleAnswer, q.id)}
                              className="h-7 px-2 text-xs gap-1"
                            >
                              {copiedId === q.id ? (
                                <>
                                  <Check className="h-3 w-3 text-success" />
                                  <span className="text-success">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy Answer</span>
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="font-sans leading-relaxed text-foreground/90 italic">
                            &quot;{q.sampleAnswer}&quot;
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
