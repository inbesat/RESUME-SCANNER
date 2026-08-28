'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParsedResume } from '@/types';
import { validateFileType, formatFileSize, parseApiResponse } from '@/lib/utils/helpers';
import { cn } from '@/lib/utils/helpers';

interface ResumeUploaderProps {
  onParseComplete: (resume: ParsedResume) => void;
  onError: (error: string) => void;
  onParseStart?: () => void;
  isLoading?: boolean;
}

export function ResumeUploader({ onParseComplete, onError, onParseStart, isLoading }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedResume | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    const validation = validateFileType(selectedFile);
    if (!validation.valid) {
      onError(validation.error!);
      return;
    }

    setFile(selectedFile);
    setParseProgress(0);
    onParseStart?.();

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setParseProgress(30);
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      setParseProgress(70);
      const result = await parseApiResponse<ParsedResume>(response);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to parse resume');
      }

      setParseProgress(100);
      setPreview(result.data);
      onParseComplete(result.data);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to parse resume');
    } finally {
      setTimeout(() => setParseProgress(0), 500);
    }
  }, [onError, onParseComplete, onParseStart]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    if (!isLoading) fileInputRef.current?.click();
  }, [isLoading]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  if (preview) {
    return (
      <div className={cn('rounded-xl border bg-card', 'border-primary/30')}>
        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-success/10 rounded-lg flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{preview.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {preview.fileType.toUpperCase()} • {formatFileSize(preview.wordCount * 6)} • {preview.wordCount} words
                  {preview.pageCount && ` • ${preview.pageCount} pages`}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRemove} aria-label="Remove resume">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-3 p-3 bg-muted/60 rounded-lg max-h-40 overflow-auto text-sm font-mono text-muted-foreground">
            {preview.text.slice(0, 500)}{preview.text.length > 500 ? '...' : ''}
          </div>

          <div className="mt-3 flex justify-end">
            <Button variant="outline" size="sm" onClick={handleRemove} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Replace Resume
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-xl p-5 sm:p-8 text-center cursor-pointer transition-colors',
        dragActive
          ? 'border-primary bg-primary/5'
          : 'border-border  hover:border-primary/50 hover:bg-primary/[0.02]'
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Upload a resume — drag and drop or click to browse"
      onKeyDown={(e) => {
        if (!isLoading && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-busy={isLoading}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
        onChange={handleInputChange}
        className="sr-only"
        id="resume-upload"
        disabled={isLoading}
      />
      
      <div className={cn('mx-auto mb-3 sm:mb-4 flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full transition-colors', dragActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary')}>
        <Upload className="h-6 w-6 sm:h-7 sm:w-7" />
      </div>
      <p className="text-sm sm:text-base font-semibold mb-1">
        {file ? 'Click to change file' : 'Drag & drop resume or click to upload'}
      </p>
      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
        PDF, DOCX, TXT, PNG, or JPEG (max 10MB)
      </p>
      
      {file && (
        <div className="inline-flex items-center gap-2 text-sm bg-muted/60 rounded-md px-3 py-1.5">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{file.name}</span>
          <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
        </div>
      )}

      {parseProgress > 0 && parseProgress < 100 && (
        <div className="mt-4 max-w-md mx-auto">
          <div className="flex justify-between text-sm mb-1" role="status" aria-live="polite">
            <span>Parsing resume...</span>
            <span>{parseProgress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${parseProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}