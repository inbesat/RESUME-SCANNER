'use client';

import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Globe,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TiltCard } from '@/components/ui/TiltCard';
import { SkillSalaryEstimate } from '@/types';
import { parseApiResponse, cn } from '@/lib/utils/helpers';
import { playAudioFeedback, triggerConfetti } from '@/lib/utils/effects';

interface SalaryEstimatorProps {
  resumeText: string;
  jobDescription?: string;
  matchedKeywords?: string[];
  missingKeywords?: string[];
}

type Currency = 'USD' | 'INR' | 'EUR' | 'GBP';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
};

const CURRENCY_RATES: Record<Currency, number> = {
  USD: 1,
  INR: 86.5,
  EUR: 0.92,
  GBP: 0.78,
};

export function SalaryEstimator({
  resumeText,
  jobDescription = '',
  matchedKeywords = [],
  missingKeywords = [],
}: SalaryEstimatorProps) {
  const [data, setData] = useState<SkillSalaryEstimate | null>(null);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleEstimate = async () => {
    if (!resumeText) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/estimate-salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          matchedKeywords,
          missingKeywords,
        }),
      });

      const result = await parseApiResponse<SkillSalaryEstimate>(response);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to estimate salary');
      }

      setData(result.data);
      triggerConfetti();
      playAudioFeedback('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate salary estimate');
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency value based on selected currency
  const formatAmount = (usdValue: number): string => {
    if (currency === 'INR') {
      const inrValue = (usdValue * CURRENCY_RATES.INR) / 100000;
      return `₹${inrValue.toFixed(1)} Lakhs`;
    }
    const converted = usdValue * CURRENCY_RATES[currency];
    const symbol = CURRENCY_SYMBOLS[currency];
    return `${symbol}${Math.round(converted / 1000)}k`;
  };

  const handleCopyNegotiation = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    playAudioFeedback('click');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card className="border-border/80 bg-gradient-to-b from-card via-card/95 to-background shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-primary mb-1">
              <DollarSign className="h-3.5 w-3.5 text-success" />
              <span>2026 Tech Market Value &amp; Missing Skill ROI</span>
            </div>
            <CardTitle className="flex items-center gap-2 text-xl font-display">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/15 text-success">
                <TrendingUp className="h-4 w-4" />
              </span>
              Skill Salary &amp; Compensation Estimator
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Calculate your market worth, regional pay benchmarks, and the exact dollar boost of adding missing skills to your resume.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/70 text-xs">
              {(['USD', 'INR', 'EUR', 'GBP'] as Currency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCurrency(c);
                    playAudioFeedback('click');
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-lg font-mono text-xs font-semibold transition-all',
                    currency === c
                      ? 'bg-card text-primary shadow-xs border border-border/80'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            <Button
              onClick={handleEstimate}
              disabled={isLoading || !resumeText}
              className="gap-2 bg-gradient-to-r from-success to-emerald-600 text-success-foreground font-semibold shadow-md hover:opacity-90 w-full sm:w-auto"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
              {data ? 'Recalculate Salary' : '💰 Calculate Market Value'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-center gap-2" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!data && !isLoading && (
          <div className="rounded-2xl border-2 border-dashed border-success/30 p-8 sm:p-12 text-center bg-gradient-to-b from-success/5 via-card to-background space-y-4">
            <div className="h-14 w-14 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center shadow-inner">
              <DollarSign className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display text-lg font-bold text-foreground">
                What are your skills worth in the 2026 tech market?
              </h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Unlock compensation transparency: see your median salary band, regional multipliers, and discover which missing skills yield the highest dollar increase.
              </p>
            </div>
            <div className="pt-2">
              <Button
                size="lg"
                onClick={handleEstimate}
                disabled={!resumeText}
                className="gap-2 bg-success text-success-foreground hover:bg-success/90 shadow-lg shadow-success/20 font-semibold"
              >
                <TrendingUp className="h-4 w-4" />
                Estimate My Compensation &amp; Skill ROI
              </Button>
            </div>
          </div>
        )}

        {data && (
          <div className="space-y-5">
            {/* Hero Salary Gauge Card */}
            <TiltCard maxTilt={5} scale={1.01} className="p-0 border-0">
              <div className="rounded-2xl border border-success/30 bg-gradient-to-br from-success/15 via-card/90 to-card glass-specular p-6 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        Estimated 2026 Market Value
                      </span>
                      <Badge variant="outline" className="bg-success text-success-foreground border-transparent text-[10px] font-mono">
                        {data.seniorityLevel} ({data.yearsOfExperienceEstimated} Yrs Exp)
                      </Badge>
                      <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                        {data.marketTier}
                      </Badge>
                    </div>

                    <div className="flex items-baseline gap-3 mt-2">
                      <span className="text-3xl sm:text-5xl font-display font-bold text-foreground">
                        {formatAmount(data.estimatedSalaryRange.median)}
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground font-mono">
                        / year median
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      Expected Band: <strong className="text-foreground">{formatAmount(data.estimatedSalaryRange.min)}</strong> – <strong className="text-foreground">{formatAmount(data.estimatedSalaryRange.max)}</strong>
                    </p>
                  </div>

                  <div className="bg-muted/40 p-4 rounded-xl border border-border/70 text-right space-y-1 sm:shrink-0">
                    <div className="text-[11px] text-muted-foreground font-mono">Target Role Title</div>
                    <div className="font-semibold text-sm text-foreground">{data.roleTitle}</div>
                    <div className="text-[10px] text-success flex items-center justify-end gap-1 font-mono">
                      <Zap className="h-3 w-3" /> Based on 2026 Tech Index
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Missing Skill Dollar ROI Leaderboard */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    Missing Skill Dollar ROI (Annual Salary Boost)
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Adding these skills to your resume unlocks measurable compensation increases:
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] text-success border-success/30">
                  Top ROI Skills
                </Badge>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {data.missingSkillRoi.map((item, idx) => (
                  <div
                    key={item.skill}
                    className="p-3.5 rounded-xl border border-border/70 bg-card/80 flex items-center justify-between gap-3 hover:border-success/40 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-foreground truncate">{item.skill}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[9px] px-1.5 py-0',
                            item.demandLevel === 'Very High' ? 'bg-success/15 text-success border-success/30' : 'bg-primary/10 text-primary border-primary/20'
                          )}
                        >
                          {item.demandLevel} Demand
                        </Badge>
                      </div>
                      <div className="w-28 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success transition-all duration-500"
                          style={{ width: `${Math.min(100, item.boostPercentage * 10)}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-success font-display">
                        +{formatAmount(item.estimatedAnnualBoost)}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        +{item.boostPercentage}% boost
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Salary Benchmarks */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Regional Compensation Benchmarks
              </h4>
              <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {data.regionalBenchmarks.map((b, idx) => (
                  <div key={b.region} className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{b.flag}</span>
                      <span className="truncate">{b.region}</span>
                    </div>
                    <div className="text-sm font-bold font-display text-foreground">{b.rangeText}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Negotiation Script / Talking Points */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    How to Negotiate This
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    Tap any point to copy to clipboard for recruiter emails or calls.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {data.negotiationPoints.map((point, idx) => (
                  <button
                    key={`point-${idx}`}
                    type="button"
                    onClick={() => handleCopyNegotiation(point, idx)}
                    className="w-full text-left p-3 rounded-xl border border-border/70 bg-card/70 flex items-start justify-between gap-3 cursor-pointer hover:border-primary/50 transition-colors group"
                  >
                    <div className="flex items-start gap-2 text-xs text-foreground/90 leading-relaxed font-sans">
                      <span className="font-mono text-primary font-bold">{idx + 1}.</span>
                      <span>{point}</span>
                    </div>
                    <span className="inline-flex items-center justify-center h-7 w-7 rounded-md shrink-0 text-muted-foreground group-hover:bg-muted/50 group-hover:text-primary transition-colors">
                      {copiedIndex === idx ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Shortcut CTA */}
            <div className="rounded-xl border border-success/30 bg-gradient-to-r from-success/10 via-primary/5 to-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="font-semibold text-xs text-success uppercase tracking-wide block mb-0.5">
                  Unlock Top Tier Salary:
                </span>
                <p className="text-xs text-foreground/90">
                  Injecting your top ROI skills into your resume elevates your candidate ranking into the top 10% bracket.
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => {
                  const fixerTab = document.querySelector('button[role="tab"][value="fixer"]') as HTMLButtonElement;
                  fixerTab?.click();
                }}
                className="gap-2 bg-success text-success-foreground hover:bg-success/90 shrink-0 w-full sm:w-auto font-semibold shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Auto-Fix Resume to Unlock This Range →
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
