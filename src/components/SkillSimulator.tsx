'use client';

import { useState, useMemo } from 'react';
import { Sliders, TrendingUp, Sparkles, Plus, Check, ArrowRight, Zap, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Keyword, ScoreResult } from '@/types';
import { scoreLocally } from '@/lib/scoring/local-scorer';
import { cn } from '@/lib/utils/helpers';

interface SkillSimulatorProps {
  resumeText: string;
  keywords: Keyword[];
  baseScoreResult: ScoreResult | null;
  onOptimizeSkill?: (skill: string) => void;
}

export function SkillSimulator({
  resumeText,
  keywords,
  baseScoreResult,
  onOptimizeSkill,
}: SkillSimulatorProps) {
  const baseFit = baseScoreResult?.fitPercentage || 0;

  // Extract initial matched & missing sets
  const initialMatchedSet = useMemo(() => {
    if (!baseScoreResult) return new Set<string>();
    const matched = Object.values(baseScoreResult.breakdown).flatMap(b => b.matched || []);
    return new Set(matched.map(m => m.toLowerCase()));
  }, [baseScoreResult]);

  const allMissingKeywords = useMemo(() => {
    return keywords.filter(k => !initialMatchedSet.has(k.text.toLowerCase()));
  }, [keywords, initialMatchedSet]);

  const [simulatedSkills, setSimulatedSkills] = useState<Set<string>>(new Set());
  const [customSkillInput, setCustomSkillInput] = useState('');

  // Toggle simulated addition of a missing skill
  const toggleSkill = (skillText: string) => {
    const next = new Set(simulatedSkills);
    const key = skillText.toLowerCase();
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSimulatedSkills(next);
  };

  // Add custom skill to simulation
  const addCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    const next = new Set(simulatedSkills);
    next.add(customSkillInput.trim().toLowerCase());
    setSimulatedSkills(next);
    setCustomSkillInput('');
  };

  // Calculate simulated score live using local scorer
  const simulatedResult = useMemo(() => {
    if (!resumeText || keywords.length === 0) return null;

    // Append simulated skills to simulated resume text
    const simulatedText = `${resumeText}\n\nSIMULATED SKILLS & EXPERIENCE: ${Array.from(simulatedSkills).join(', ')}`;
    return scoreLocally(simulatedText, keywords);
  }, [resumeText, keywords, simulatedSkills]);

  const simulatedFit = simulatedResult?.fitPercentage || baseFit;
  const scoreDelta = Math.round(simulatedFit - baseFit);

  // Calculate ROI per missing skill (marginal gain of adding each skill alone)
  const topRoiSkills = useMemo(() => {
    if (!resumeText || allMissingKeywords.length === 0) return [];

    return allMissingKeywords.map(k => {
      const testText = `${resumeText}\n\n${k.text}`;
      const res = scoreLocally(testText, keywords);
      const gain = Math.max(0, Math.round(res.fitPercentage - baseFit));
      return {
        keyword: k,
        gain,
      };
    }).sort((a, b) => b.gain - a.gain).slice(0, 4);
  }, [resumeText, allMissingKeywords, keywords, baseFit]);

  return (
    <Card className="border-primary/25 bg-gradient-to-b from-card/90 to-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sliders className="h-4 w-4" />
              </span>
              What-If Skill Simulator
              <Badge variant="outline" className="border-primary/30 text-primary text-[10px] uppercase font-mono">
                Real-Time
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Toggle missing skills to see how your fit score jumps in real-time before updating your resume.
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 bg-muted/40 p-2 rounded-xl border border-border/60 w-full sm:w-auto">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-muted-foreground block font-mono">Simulated Fit</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-display text-foreground">{simulatedFit}%</span>
                <span className="text-xs text-muted-foreground">({baseFit}%)</span>
              </div>
            </div>
            {scoreDelta > 0 && (
              <Badge variant="outline" className="bg-success/15 text-success border-success/30 font-mono text-xs px-2 py-1">
                +{scoreDelta}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score trajectory callout */}
        {scoreDelta > 0 ? (
          <div className="rounded-xl border border-success/30 bg-success/5 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-success">
              <TrendingUp className="h-4 w-4 shrink-0" />
              <span>
                Adding <strong>{simulatedSkills.size} skill{simulatedSkills.size > 1 ? 's' : ''}</strong> elevates your fit score from <strong>{baseFit}%</strong> to <strong>{simulatedFit}%</strong>!
              </span>
            </div>
            {simulatedFit >= 85 && (
              <Badge variant="outline" className="bg-success text-success-foreground border-transparent text-[10px] gap-1 shrink-0 mt-1 sm:mt-0">
                <Trophy className="h-3 w-3" /> Top 10% Tier
              </Badge>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary shrink-0" />
            <span>Select missing skills below to preview their immediate impact on your score.</span>
          </div>
        )}

        {/* Highest ROI Skills */}
        {topRoiSkills.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Highest ROI Skills to Add:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topRoiSkills.map(({ keyword, gain }) => {
                const isToggled = simulatedSkills.has(keyword.text.toLowerCase());
                return (
                  <div
                    key={keyword.id}
                    className={cn(
                      'p-2.5 rounded-lg border flex items-center justify-between gap-2 transition-all',
                      isToggled ? 'border-primary bg-primary/10' : 'border-border/70 bg-card/60'
                    )}
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-medium truncate block text-foreground">
                        {keyword.text}
                      </span>
                      <span className="text-[10px] text-success font-mono font-semibold">
                        +{gain}% score boost
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant={isToggled ? 'default' : 'outline'}
                        onClick={() => toggleSkill(keyword.text)}
                        className="h-7 px-2 text-xs"
                      >
                        {isToggled ? <Check className="h-3 w-3" /> : 'Simulate'}
                      </Button>
                      {onOptimizeSkill && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onOptimizeSkill(keyword.text)}
                          className="h-7 px-1.5 text-xs text-muted-foreground hover:text-primary"
                          title="Generate bullet with AI"
                        >
                          <Sparkles className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Missing Skills Checklist */}
        {allMissingKeywords.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-muted-foreground block">
              All Missing Skills Checklist ({allMissingKeywords.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {allMissingKeywords.map((k) => {
                const isToggled = simulatedSkills.has(k.text.toLowerCase());
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => toggleSkill(k.text)}
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 font-medium',
                      isToggled
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border/80 bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    )}
                  >
                    {isToggled ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    {k.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Add custom skill input */}
        <div className="flex gap-2 pt-1">
          <Input
            placeholder="Type custom skill to test (e.g. AWS, Kubernetes, Terraform)..."
            value={customSkillInput}
            onChange={(e) => setCustomSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()}
            className="text-xs h-8.5"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={addCustomSkill}
            disabled={!customSkillInput.trim()}
            className="h-8.5 text-xs gap-1"
          >
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
