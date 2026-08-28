'use client';

import { Loader2, FileText, Sparkles, Brain, CircleCheck } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface LoadingStateProps {
  step: 'idle' | 'parsing' | 'extracting' | 'scoring' | 'complete';
  message?: string;
}

const STEPS = [
  { id: 'parsing', label: 'Parsing Resume', icon: FileText },
  { id: 'extracting', label: 'Extracting Keywords', icon: Sparkles },
  { id: 'scoring', label: 'Scoring Match', icon: Brain },
] as const;

export function LoadingState({ step, message }: LoadingStateProps) {
  const currentStepIndex = STEPS.findIndex(s => s.id === step);

  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-busy={step !== 'complete'}>
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const isComplete = i < currentStepIndex;
        const isCurrent = i === currentStepIndex;
        const isPending = i > currentStepIndex;

        return (
          <div
            key={s.id}
            className={cn(
              'flex items-center gap-4 p-3 rounded-lg transition-all',
              isComplete && 'bg-success/10',
              isCurrent && 'bg-primary/10 border border-primary/20',
              isPending && 'bg-muted/30 opacity-50'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all',
                isComplete && 'bg-success text-success-foreground',
                isCurrent && 'bg-primary text-primary-foreground animate-pulse',
                isPending && 'bg-muted text-muted-foreground'
              )}
            >
              {isComplete ? (
                <CircleCheck className="h-5 w-5" />
              ) : isCurrent ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Icon className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <p className={cn('font-medium', isCurrent && 'text-primary')}>
                {s.label}
              </p>
              {isCurrent && message && (
                <p className="text-sm text-muted-foreground">{message}</p>
              )}
              {isComplete && (
                <p className="text-sm text-success">Done</p>
              )}
            </div>
            {isCurrent && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
          </div>
        );
      })}

      {step === 'complete' && (
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mb-3">
            <CircleCheck className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-lg font-semibold">Analysis Complete!</h3>
          <p className="text-muted-foreground mt-1">Your resume fit score is ready</p>
        </div>
      )}
    </div>
  );
}