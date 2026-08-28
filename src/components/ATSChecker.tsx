'use client';

import { useMemo } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, FileCheck, Zap, Hash, AlignLeft, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { auditResumeATS, ATSAuditResult } from '@/lib/ats-checker';
import { cn } from '@/lib/utils/helpers';

interface ATSCheckerProps {
  resumeText: string;
}

export function ATSChecker({ resumeText }: ATSCheckerProps) {
  const audit: ATSAuditResult = useMemo(() => {
    return auditResumeATS(resumeText);
  }, [resumeText]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 65) return 'text-warning';
    return 'text-destructive';
  };

  const getGradeBg = (grade: ATSAuditResult['grade']) => {
    if (grade === 'A+' || grade === 'A') return 'bg-success/15 text-success border-success/30';
    if (grade === 'B') return 'bg-warning/15 text-warning border-warning/30';
    return 'bg-destructive/15 text-destructive border-destructive/30';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'contact': return UserCheck;
      case 'structure': return FileCheck;
      case 'impact': return Hash;
      case 'verbs': return Zap;
      default: return AlignLeft;
    }
  };

  return (
    <Card className="border-border/70 bg-gradient-to-b from-card/80 to-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="h-4 w-4" />
              </span>
              ATS Format &amp; Readability Audit
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Automated parser check for contact completeness, standard headings, metric density, and strong action verbs.
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 bg-muted/40 sm:bg-transparent p-2 sm:p-0 rounded-xl border border-border/60 sm:border-0 w-full sm:w-auto">
            <div className="text-left sm:text-right">
              <div className="text-[10px] sm:text-xs text-muted-foreground font-mono">ATS Readiness</div>
              <div className={cn('text-xl sm:text-2xl font-bold font-display', getScoreColor(audit.overallScore))}>
                {audit.overallScore}%
              </div>
            </div>
            <Badge variant="outline" className={cn('text-xs sm:text-sm px-2.5 sm:px-3 py-1 font-bold font-mono', getGradeBg(audit.grade))}>
              {audit.grade}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-xs text-foreground/90 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-primary block mb-0.5">Auditor Summary:</span>
            {audit.verdict}
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {audit.checks.map((check) => {
            const Icon = getCategoryIcon(check.category);
            return (
              <div
                key={check.id}
                className={cn(
                  'rounded-xl border p-3.5 space-y-2 bg-card/60 transition-all',
                  check.passed ? 'border-border/80' : 'border-warning/40 bg-warning/[0.02]'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-muted text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-xs font-semibold">{check.name}</span>
                  </div>
                  <span className={cn('text-xs font-bold font-mono', getScoreColor(check.score))}>
                    {check.score}%
                  </span>
                </div>

                <Progress value={check.score} className="h-1.5" />

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {check.feedback}
                </p>

                {check.suggestions && check.suggestions.length > 0 && (
                  <ul className="text-[11px] text-warning/90 space-y-1 pt-1 border-t border-border/40">
                    {check.suggestions.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <AlertTriangle className="h-3 w-3 text-warning shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Verbs & Metrics Insight Strip */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[11px] block">Metric Density</span>
            <span className="font-semibold text-foreground font-mono">
              {audit.metricDensityPercentage}% of statements ({audit.metricBulletsCount}/{audit.totalBulletsCount} lines)
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[11px] block">Power Verbs Found</span>
            <span className="font-semibold text-foreground font-mono">
              {audit.strongVerbsFound.length} strong verbs
            </span>
          </div>

          {audit.weakPhrasesFound.length > 0 && (
            <div className="space-y-0.5">
              <span className="text-destructive text-[11px] block">Passive Phrases</span>
              <span className="font-semibold text-destructive font-mono">
                {audit.weakPhrasesFound.length} detected
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
