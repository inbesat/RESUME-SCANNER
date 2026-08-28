'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, Play, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TiltCard } from '@/components/ui/TiltCard';
import { SAMPLE_PRESETS, SamplePreset } from '@/lib/presets/sample-data';
import { cn } from '@/lib/utils/helpers';

interface SamplePresetsProps {
  onSelectPreset: (preset: SamplePreset) => void;
  activePresetId?: string | null;
}

export function SamplePresets({ onSelectPreset, activePresetId }: SamplePresetsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(activePresetId || null);

  const handleSelect = (preset: SamplePreset) => {
    setSelectedId(preset.id);
    onSelectPreset(preset);
  };

  return (
    <div className="rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-card/75 to-card/60 glass-panel glass-specular p-4 sm:p-5 mb-6 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary shrink-0 shadow-xs">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
              Instant 1-Click Demo Presets
              <span className="text-[10px] lowercase font-normal text-muted-foreground">
                (test full pipeline without uploading files)
              </span>
            </h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {SAMPLE_PRESETS.map((preset) => {
          const isSelected = selectedId === preset.id;
          return (
            <TiltCard
              key={preset.id}
              maxTilt={6}
              scale={1.02}
              className="p-0 border-0 bg-transparent"
            >
              <button
                type="button"
                onClick={() => handleSelect(preset)}
                className={cn(
                  'w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-300 group cursor-pointer',
                  isSelected
                    ? 'border-primary/80 bg-primary/15 shadow-md shadow-primary/10 text-foreground ring-1 ring-primary/40'
                    : 'border-border/70 bg-card/60 hover:border-primary/50 hover:bg-card/90 text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-base">{preset.roleIcon}</span>
                    <span className="text-xs font-medium truncate text-foreground">
                      {preset.roleTitle}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {preset.company}
                  </p>
                </div>

                <div className="shrink-0 flex items-center">
                  {isSelected ? (
                    <Badge variant="outline" className="text-[9px] bg-primary text-primary-foreground border-transparent px-1.5 py-0.5 gap-1">
                      <Check className="h-2.5 w-2.5" />
                      Loaded
                    </Badge>
                  ) : (
                    <span className="p-1 rounded-md text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                      <Play className="h-3 w-3 fill-current" />
                    </span>
                  )}
                </div>
              </button>
            </TiltCard>
          );
        })}
      </div>
    </div>
  );
}
