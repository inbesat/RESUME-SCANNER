'use client';

import { useRef, useState, useCallback } from 'react';
import { UploadCloud, Loader2, Download, Trophy, ChevronDown, ChevronUp, FileWarning, X, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Keyword } from '@/types';
import { cn, parseApiResponse } from '@/lib/utils/helpers';

interface BulkCandidate {
  fileName: string;
  fileType: string;
  wordCount: number;
  fitPercentage: number;
  confidence: 'high' | 'medium' | 'low';
  breakdown: Record<string, { score: number; matched: string[]; missing: string[] }>;
  suggestions: string[];
  error?: string;
}

interface RecruiterModeProps {
  keywords: Keyword[];
  isLoading: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  technical: 'text-primary',
  experience: 'text-success',
  education: 'text-purple-500',
  softSkills: 'text-accent',
};

const RANK_BADGES: Record<number, string> = {
  1: 'bg-yellow-500 text-white',
  2: 'bg-slate-400 text-white',
  3: 'bg-orange-400 text-white',
};

export function RecruiterMode({ keywords, isLoading }: RecruiterModeProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<BulkCandidate[] | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoringMode, setScoringMode] = useState<'local' | 'hybrid'>('local');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter(f =>
      /\.(pdf|docx|txt|png|jpe?g)$/i.test(f.name)
    );
    if (valid.length < selected.length) {
      setError('Some files were skipped (only PDF, DOCX, TXT, PNG, JPEG allowed)');
    }
    setFiles(prev => [...prev, ...valid]);
    setError(null);
    if (e.target.value) e.target.value = '';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = Array.from(e.dataTransfer.files);
    const valid = dropped.filter(f => /\.(pdf|docx|txt|png|jpe?g)$/i.test(f.name));
    setFiles(prev => [...prev, ...valid]);
    setError(null);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleScore = useCallback(async () => {
    if (files.length === 0 || keywords.length === 0) return;

    setIsScoring(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      formData.append('keywords', JSON.stringify(keywords));
      formData.append('scoring', scoringMode);

      const response = await fetch('/api/bulk-score', {
        method: 'POST',
        body: formData,
      });

      const data = await parseApiResponse<{ results: BulkCandidate[] }>(response);
      if (!data.success || !data.data) throw new Error(data.error || 'Bulk scoring failed');
      setResults(data.data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk scoring failed');
    } finally {
      setIsScoring(false);
    }
  }, [files, keywords, scoringMode]);

  const handleExportCSV = useCallback(() => {
    if (!results) return;

    const header = 'Rank,File,Type,Fit %,Confidence,Technical,Experience,Education,Soft Skills,Matched,Missing,Suggestions';
    const rows = results.map((r, i) => {
      const tech = r.breakdown.technical?.matched || [];
      const allMissing = Object.values(r.breakdown).flatMap(b => b.missing || []);
      return [
        i + 1,
        `"${r.fileName}"`,
        r.fileType,
        r.fitPercentage,
        r.confidence,
        r.breakdown.technical?.score ?? '-',
        r.breakdown.experience?.score ?? '-',
        r.breakdown.education?.score ?? '-',
        r.breakdown.softSkills?.score ?? '-',
        `"${tech.join('; ')}"`,
        `"${allMissing.join('; ').slice(0, 200)}"`,
        `"${(r.suggestions || []).join(' ') }"`,
      ].join(',');
    });

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidate-ranking-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [results]);

  const getFitColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getFitBg = (score: number) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  const canRun = files.length > 0 && keywords.length > 0 && !isScoring;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Bulk Candidate Ranking</h3>
            </div>
            <div className="flex items-center gap-1 rounded-lg border p-0.5">
              <button
                onClick={() => setScoringMode('local')}
                className={cn('px-2.5 py-1 text-xs rounded-md transition-colors', scoringMode === 'local' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
              >
                Fast
              </button>
              <button
                onClick={() => setScoringMode('hybrid')}
                className={cn('px-2.5 py-1 text-xs rounded-md transition-colors', scoringMode === 'hybrid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
              >
                Deep AI
              </button>
            </div>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => !isScoring && inputRef.current?.click()}
            onKeyDown={(e) => {
              if (!isScoring && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Upload resume files — drag and drop or click to browse"
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
              dragActive ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
            )}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
              className="sr-only"
              onChange={handleFileSelect}
            />
            <div className={cn('mx-auto mb-3 flex items-center justify-center h-12 w-12 rounded-full transition-colors', dragActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary')}>
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">Drop resumes here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, PNG, JPEG — up to 20 files</p>
          </div>

          {files.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{files.length} file{files.length === 1 ? '' : 's'} selected</p>
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear all
                </button>
              </div>
              {files.map((f, i) => (
                <div key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 text-sm bg-muted/60 rounded-lg px-3 py-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </span>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-muted-foreground hover:text-destructive flex-shrink-0 p-0.5 rounded hover:bg-destructive/10 transition-colors"
                    aria-label={`Remove ${f.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive flex items-center gap-2">
              <FileWarning className="h-4 w-4 flex-shrink-0" />
              {error}
            </p>
          )}

          <Button onClick={handleScore} disabled={!canRun} className="w-full gap-2">
            {isScoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
            {isScoring ? 'Scoring candidates...' : files.length === 0 ? 'Add resumes to rank' : keywords.length === 0 ? 'Add keywords first' : `Rank ${files.length} candidate${files.length === 1 ? '' : 's'}`}
          </Button>
          {isLoading && files.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">AI scoring each resume — this can take a few seconds per file</p>
          )}
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">Leaderboard</h4>
                <Badge variant="outline" className="text-xs">
                  {results.length} candidates
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
            </div>

            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={r.fileName} className={cn('rounded-lg border', r.error ? 'border-destructive/30 bg-destructive/5' : 'bg-card')}>
                  <button
                    className="w-full text-left p-3 flex items-center gap-3 hover:bg-muted/30 rounded-lg transition-colors"
                    onClick={() => r.error ? null : setExpanded(expanded === i ? null : i)}
                  >
                    <span className={cn('w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0', RANK_BADGES[i + 1] || 'bg-muted text-muted-foreground')}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.error ? r.error : `${r.fileType.toUpperCase()} • ${r.wordCount} words • ${r.confidence} confidence`}
                      </p>
                    </div>
                    {!r.error && (
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={cn('text-lg font-bold', getFitColor(r.fitPercentage))}>{r.fitPercentage}%</span>
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
                          <div className={cn('h-full rounded-full', getFitBg(r.fitPercentage))} style={{ width: `${r.fitPercentage}%` }} />
                        </div>
                      </div>
                    )}
                    {!r.error && (expanded === i ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />)}
                  </button>

                  {!r.error && expanded === i && (
                    <div className="px-4 pb-4 pt-1 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(r.breakdown).map(([key, cat]) => (
                          <div key={key} className="rounded-md bg-muted/40 p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className={cn('text-xs font-medium capitalize', CATEGORY_COLORS[key])}>{key}</span>
                              <span className={cn('text-sm font-bold', getFitColor(cat.score))}>{cat.score}%</span>
                            </div>
                            {cat.matched.length > 0 && (
                              <p className="text-[11px] text-success">
                                + {cat.matched.slice(0, 4).join(', ')}{cat.matched.length > 4 ? ` +${cat.matched.length - 4}` : ''}
                              </p>
                            )}
                            {cat.missing.length > 0 && (
                              <p className="text-[11px] text-destructive">
                                − {cat.missing.slice(0, 3).join(', ')}{cat.missing.length > 3 ? ` +${cat.missing.length - 3}` : ''}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      {r.suggestions && r.suggestions.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Suggestions</p>
                          <ul className="text-xs space-y-0.5">
                            {r.suggestions.slice(0, 3).map((s, j) => (
                              <li key={j} className="text-muted-foreground">• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}