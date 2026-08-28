'use client';

import { useState } from 'react';
import { ShieldAlert, ShieldCheck, Loader2, RefreshCw, Gauge, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Keyword } from '@/types';
import { cn } from '@/lib/utils/helpers';

interface BiasCheckProps {
  resumeText: string;
  keywords: Keyword[];
}

interface BiasResult {
  originalFit: number;
  anonymizedFit: number;
  delta: number;
  impact: 'negligible' | 'moderate' | 'significant';
  verdict: string;
  anonymizedPreview: string;
  flippedKeywords: { keyword: string; category: string; originalMatched: boolean; anonymizedMatched: boolean }[];
  mode: 'local' | 'ai';
  processingTime: number;
}

export function BiasCheck({ resumeText, keywords }: BiasCheckProps) {
  const [result, setResult] = useState<BiasResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'local' | 'ai'>('local');

  const handleCheck = async () => {
    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch('/api/bias-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, keywords, mode }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bias check failed');
    } finally {
      setIsChecking(false);
    }
  };

  const impactStyles = {
    negligible: 'border-success/30 bg-success/5',
    moderate: 'border-warning/30 bg-warning/5',
    significant: 'border-destructive/30 bg-destructive/5',
  };

  const impactText = {
    negligible: 'text-success',
    moderate: 'text-warning',
    significant: 'text-destructive',
  };

  const impactIcon = {
    negligible: ShieldCheck,
    moderate: ShieldAlert,
    significant: ShieldAlert,
  };

  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Bias check scoring mode" className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-muted">
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'local'}
          onClick={() => setMode('local')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5',
            mode === 'local' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Gauge className="h-3.5 w-3.5" />
          Fast (keyword)
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'ai'}
          onClick={() => setMode('ai')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5',
            mode === 'ai' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Deep (AI)
        </button>
      </div>
      <Button
        variant="outline"
        onClick={handleCheck}
        disabled={isChecking}
        className="w-full gap-2"
      >
        {isChecking ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Check for Scoring Bias (anonymize name/school)
      </Button>

      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}

      {result && (
        <Card className={cn('border', impactStyles[result.impact])}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              {(() => {
                const Icon = impactIcon[result.impact];
                return (
                  <Icon
                    className={cn('h-5 w-5 mt-0.5 flex-shrink-0', impactText[result.impact])}
                  />
                );
              })()}
              <div className="space-y-1">
                <p className="text-sm font-medium" role="status" aria-live="polite">
                  Original: {result.originalFit}% → Anonymized: {result.anonymizedFit}%
                </p>
                <p className="text-xs">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase',
                      impactStyles[result.impact],
                      impactText[result.impact]
                    )}
                  >
                    {result.impact} impact
                  </span>
                  <span className="ml-2 text-muted-foreground">Δ {result.delta} pts · {result.mode === 'ai' ? 'AI' : 'keyword'} · {result.processingTime}ms</span>
                </p>
                <p className="text-sm">{result.verdict}</p>
              </div>
            </div>

            {result.flippedKeywords.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Match status changed for:</p>
                <ul className="space-y-1">
                  {result.flippedKeywords.slice(0, 6).map((fk, i) => (
                    <li key={i} className="text-xs">
                      <span className="font-medium">{fk.keyword}</span> ({fk.category})
                      <span className="text-muted-foreground"> — {fk.originalMatched ? 'was matched' : 'was missing'} → {fk.anonymizedMatched ? 'matched' : 'missing'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer">Preview anonymized resume</summary>
              <pre className="mt-2 p-3 rounded-md bg-muted/50 whitespace-pre-wrap font-mono text-xs max-h-40 overflow-y-auto">
                {result.anonymizedPreview}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  );
}