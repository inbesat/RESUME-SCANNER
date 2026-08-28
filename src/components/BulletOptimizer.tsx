'use client';

import { useState, useCallback } from 'react';
import { Sparkles, Copy, Check, Loader2, ArrowRight, Wand2, PlusCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BulletSuggestion, BulletOptimizationResult } from '@/types';
import { parseApiResponse, cn } from '@/lib/utils/helpers';

interface BulletOptimizerProps {
  missingKeywords: string[];
  resumeContext?: string;
  jobDescription?: string;
  onInsertBullet?: (bullet: string) => void;
}

export function BulletOptimizer({
  missingKeywords,
  resumeContext = '',
  jobDescription = '',
  onInsertBullet,
}: BulletOptimizerProps) {
  const [selectedSkill, setSelectedSkill] = useState<string>(missingKeywords[0] || '');
  const [customInput, setCustomInput] = useState<string>('');
  const [currentBullet, setCurrentBullet] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BulletSuggestion[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (targetSkill: string) => {
    const skillToUse = targetSkill.trim() || selectedSkill || customInput;
    if (!skillToUse && !currentBullet) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/optimize-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: skillToUse,
          currentBullet,
          resumeContext,
          jobDescription,
        }),
      });

      const data = await parseApiResponse<BulletOptimizationResult>(response);
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to generate bullet optimizations');
      }

      setResults(data.data.bullets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSkill, customInput, currentBullet, resumeContext, jobDescription]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card className="border-primary/25 bg-gradient-to-b from-card/80 to-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wand2 className="h-4 w-4" />
            </span>
            AI Bullet Point Optimizer
            <Badge variant="outline" className="border-primary/30 text-primary text-[10px] uppercase font-mono">
              XYZ Formula
            </Badge>
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Transform missing keywords or weak bullets into high-impact, quantifiable achievements that pass ATS scanners.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {missingKeywords.length > 0 && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Click a missing skill to craft bullet points:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {missingKeywords.slice(0, 8).map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => {
                    setSelectedSkill(kw);
                    handleGenerate(kw);
                  }}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 font-medium',
                    selectedSkill === kw
                      ? 'border-primary bg-primary/15 text-primary shadow-sm'
                      : 'border-border/80 bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  )}
                >
                  <PlusCircle className="h-3 w-3" />
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            placeholder="Or enter custom skill / existing bullet point..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate(customInput)}
            className="text-xs h-9"
          />
          <Button
            size="sm"
            onClick={() => handleGenerate(customInput || selectedSkill)}
            disabled={isLoading || (!selectedSkill && !customInput && !currentBullet)}
            className="gap-1.5 h-9"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Generate Bullets
          </Button>
        </div>

        {error && (
          <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg" role="alert">
            {error}
          </p>
        )}

        {results && results.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-warning" />
                Tailored ATS Bullet Suggestions:
              </span>
            </div>

            {results.map((item, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl border border-border/70 bg-muted/30 p-3.5 transition-all hover:border-primary/40 hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-sans leading-relaxed text-foreground/90">
                    {item.bullet}
                  </p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(item.bullet, idx)}
                      className="h-8 px-2 text-xs gap-1"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-success" />
                          <span className="text-success font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 font-mono font-medium text-primary">
                    📊 {item.metricUsed}
                  </span>
                  <span className="text-muted-foreground/80">• {item.explanation}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
