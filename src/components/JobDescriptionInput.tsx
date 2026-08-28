'use client';

import { useState, useCallback } from 'react';
import { Sparkles, Loader2, Trash2, FileText, CircleCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { KeywordEditor } from './KeywordEditor';
import { Keyword } from '@/types';
import { cn } from '@/lib/utils/helpers';

const JD_KEY = 'ars-job-description';

interface JobDescriptionInputProps {
  initialKeywords?: Keyword[];
  onKeywordsChange: (keywords: Keyword[]) => void;
  onExtractClick: () => void;
  onExtractError?: (error: string) => void;
}

export function JobDescriptionInput({
  initialKeywords = [],
  onKeywordsChange,
  onExtractClick,
  onExtractError,
}: JobDescriptionInputProps) {
  const [jobDescription, setJobDescription] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      return sessionStorage.getItem(JD_KEY) || '';
    } catch {
      return '';
    }
  });
  const [showKeywords, setShowKeywords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleExtract = useCallback(async () => {
    if (!jobDescription.trim()) return;
    onExtractClick();
    setLoading(true);
    setError(null);
    setSuccessCount(null);
    try {
      const response = await fetch('/api/extract-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, manualKeywords: [] }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to extract keywords');
      }
      onKeywordsChange(result.data.keywords);
      setShowKeywords(true);
      setSuccessCount(result.data.keywords.length);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to extract keywords — please add them manually';
      setError(message);
      if (onExtractError) {
        onExtractError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [jobDescription, onExtractClick, onKeywordsChange, onExtractError]);

  const handleKeywordsChange = useCallback((keywords: Keyword[]) => {
    onKeywordsChange(keywords);
  }, [onKeywordsChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="job-description" className="text-sm font-medium">
          Job Description
        </Label>
        <span className="text-xs text-muted-foreground" role="status" aria-live="polite">
          {jobDescription.length > 0 ? `${jobDescription.length} characters` : 'Paste the job description to extract keywords automatically'}
        </span>
      </div>
      <Textarea
        id="job-description"
        value={jobDescription}
        onChange={(e) => {
          setJobDescription(e.target.value);
          try {
            sessionStorage.setItem(JD_KEY, e.target.value);
          } catch {
            // ignore storage errors
          }
        }}
        placeholder="Paste the full job description here..."
        rows={6}
        className="font-mono text-sm resize-y min-h-[96px]"
      />

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleExtract}
          disabled={!jobDescription.trim() || loading}
          className="gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? 'Extracting keywords...' : 'Extract Keywords with AI'}
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowKeywords(!showKeywords)}
          disabled={initialKeywords.length === 0 && !showKeywords}
          className={cn(showKeywords && 'border-primary/50 text-primary', initialKeywords.length === 0 && !showKeywords && 'opacity-50')}
        >
          <FileText className="h-4 w-4 mr-2" />
          {showKeywords ? 'Hide Keywords' : 'Show Keywords'}
        </Button>

        {jobDescription.trim() && (
          <Button variant="ghost" onClick={() => { setJobDescription(''); setError(null); setSuccessCount(null); try { sessionStorage.removeItem(JD_KEY); } catch {} }}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-2 text-sm text-destructive" role="alert">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </p>
      )}

      {successCount !== null && !error && (
        <p className="flex items-center gap-2 text-sm text-success" role="status">
          <CircleCheck className="h-4 w-4 flex-shrink-0" />
          Extracted {successCount} keywords from the job description.
        </p>
      )}

      {showKeywords && (
        <KeywordEditor
          keywords={initialKeywords}
          onChange={handleKeywordsChange}
        />
      )}
    </div>
  );
}