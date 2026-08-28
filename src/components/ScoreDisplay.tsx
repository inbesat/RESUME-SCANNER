'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Download, Sparkles, Brain, Cpu, ShieldQuestion, Wrench, ClipboardList, GraduationCap, Handshake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScoreResult, ScoreBreakdown, KeywordCategory } from '@/types';
import { cn } from '@/lib/utils/helpers';

interface ScoreDisplayProps {
  result: ScoreResult | null;
  onExportPDF?: () => void;
  onOptimizeMissingSkill?: (skill: string) => void;
}

const CATEGORY_ICONS: Record<KeywordCategory, typeof Wrench> = {
  technical: Wrench,
  experience: ClipboardList,
  education: GraduationCap,
  softSkills: Handshake,
};

const CATEGORY_CONFIG = {
  technical: { label: 'Technical Skills', color: 'blue' },
  experience: { label: 'Experience', color: 'green' },
  education: { label: 'Education', color: 'purple' },
  softSkills: { label: 'Soft Skills', color: 'orange' },
} as const;

export function ScoreDisplay({ result, onExportPDF, onOptimizeMissingSkill }: ScoreDisplayProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  if (!result) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No Results Yet</h3>
          <p className="text-muted-foreground">Upload a resume and add keywords to see the fit score</p>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-success/15 text-success';
    if (score >= 60) return 'bg-warning/15 text-warning';
    return 'bg-destructive/15 text-destructive';
  };

  return (
    <div className="space-y-4">
      {result.aiFallbackNote && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/25 text-warning flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p className="text-xs">{result.aiFallbackNote}</p>
        </div>
      )}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className={cn(getScoreColor(result.fitPercentage), 'transition-all duration-1000')}
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (result.fitPercentage / 100) * 251.2}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">
                    {result.fitPercentage}%
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">Overall Fit</h3>
                  {result.confidence && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs capitalize',
                        result.confidence === 'high' && 'text-success border-success/40',
                        result.confidence === 'medium' && 'text-warning border-warning/40',
                        result.confidence === 'low' && 'text-destructive border-destructive/40'
                      )}
                      title={result.confidenceReason || `Confidence: ${result.confidence}`}
                    >
                      <ShieldQuestion className="h-3 w-3 mr-1" />
                      {result.confidence} confidence
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Scored using {result.scorerUsed === 'hybrid' ? 'Hybrid (Local + AI)' : result.scorerUsed === 'ai' ? 'AI (Groq)' : 'Local Algorithm'}
                </p>
                {result.confidenceReason && result.confidence === 'low' && (
                  <p className="text-xs text-destructive mt-1 max-w-xs">
                    {result.confidenceReason}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {result.scorerUsed === 'hybrid' && (
                    <>
                      <Brain className="h-4 w-4 text-primary" />
                      <Cpu className="h-4 w-4 text-secondary" />
                    </>
                  )}
                  {result.scorerUsed === 'ai' && <Brain className="h-4 w-4 text-primary" />}
                  {result.scorerUsed === 'local' && <Cpu className="h-4 w-4 text-secondary" />}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {onExportPDF && (
                <Button onClick={onExportPDF} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export PDF Report
                </Button>
              )}
              <div className="text-sm text-muted-foreground">
                Processed in {result.processingTime}ms
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'details')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details & Evidence</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {Object.entries(result.breakdown).map(([key, category]) => {
            const config = CATEGORY_CONFIG[key as keyof ScoreBreakdown];
            const score = category.score;
            const Icon = CATEGORY_ICONS[key as KeywordCategory];
            return (
              <Card key={key}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <div>
                        <h4 className="font-medium">{config.label}</h4>
                        <p className="text-xs text-muted-foreground">
                          {category.matched.length} matched • {category.missing.length} missing
                        </p>
                      </div>
                    </div>
                    <div className={cn('text-2xl font-bold', getScoreColor(score))}>
                      {score}%
                    </div>
                  </div>
                  <Progress value={score} className="h-3" />
                </CardContent>
              </Card>
            );
          })}

          {result.suggestions.length > 0 && (
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-warning mb-2">Suggestions to Improve</h4>
                    <ul className="space-y-1 text-sm text-warning/90">
                      {result.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-warning flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {Object.entries(result.breakdown).map(([key, category]) => {
            const config = CATEGORY_CONFIG[key as keyof ScoreBreakdown];
            const Icon = CATEGORY_ICONS[key as KeywordCategory];
            return (
              <Card key={key}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      {config.label}
                      <Badge variant="outline" className={cn('ml-2', getScoreBg(category.score), getScoreColor(category.score))}>
                        {category.score}%
                      </Badge>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.matched.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-success mb-2 flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Matched ({category.matched.length})
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {category.matched.map((kw: string) => (
                          <Badge key={kw} variant="success" className="text-xs">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {category.missing.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-destructive mb-2 flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" />
                        Missing ({category.missing.length})
                        {onOptimizeMissingSkill && (
                          <span className="text-[10px] text-muted-foreground font-normal ml-2">
                            (click any skill to generate tailored bullets)
                          </span>
                        )}
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {category.missing.map((kw: string) => (
                          <button
                            key={kw}
                            type="button"
                            onClick={() => onOptimizeMissingSkill?.(kw)}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all',
                              'bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25 hover:border-destructive/50 cursor-pointer'
                            )}
                            title={`Click to generate XYZ bullet for ${kw}`}
                          >
                            <Sparkles className="h-3 w-3 opacity-70" />
                            {kw}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {category.evidence && category.evidence.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-2">Matching Evidence</h5>
                      <ul className="space-y-1.5">
                        {[...new Set(category.evidence as string[])].slice(0, 5).map((line: string, i) => (
                          <li key={i} className="text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2 border-l-2 border-success">
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {category.matched.length === 0 && category.missing.length === 0 && (
                    <p className="text-sm text-muted-foreground">No keywords in this category</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}