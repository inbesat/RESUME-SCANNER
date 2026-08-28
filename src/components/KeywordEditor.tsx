'use client';

import { useState, useCallback } from 'react';
import { Plus, X, Wrench, ClipboardList, GraduationCap, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Keyword, KeywordCategory } from '@/types';
import { generateId, cn } from '@/lib/utils/helpers';

const CATEGORY_ICONS: Record<KeywordCategory, typeof Wrench> = {
  technical: Wrench,
  experience: ClipboardList,
  education: GraduationCap,
  softSkills: Handshake,
};

const CATEGORIES: { key: KeywordCategory; label: string }[] = [
  { key: 'technical', label: 'Technical' },
  { key: 'experience', label: 'Experience' },
  { key: 'education', label: 'Education' },
  { key: 'softSkills', label: 'Soft Skills' },
];

interface KeywordEditorProps {
  keywords: Keyword[];
  onChange: (keywords: Keyword[]) => void;
}

export function KeywordEditor({ keywords, onChange }: KeywordEditorProps) {
  const [activeTab, setActiveTab] = useState<KeywordCategory>('technical');
  const [manualInputs, setManualInputs] = useState<Record<KeywordCategory, string>>({
    technical: '',
    experience: '',
    education: '',
    softSkills: '',
  });

  const filteredKeywords = keywords.filter(k => k.category === activeTab);

  const handleAddManual = useCallback((category: KeywordCategory) => {
    const input = manualInputs[category].trim();
    if (!input) return;

    const newKeywords = input.split(',').map(k => k.trim()).filter(Boolean);
    
    const updated = [...keywords];
    newKeywords.forEach(text => {
      if (!updated.some(k => k.text.toLowerCase() === text.toLowerCase())) {
        updated.push({
          id: generateId(),
          text,
          category,
          source: 'manual',
        });
      }
    });
    
    onChange(updated);
    setManualInputs(prev => ({ ...prev, [category]: '' }));
  }, [keywords, manualInputs, onChange]);

  const handleRemove = useCallback((id: string) => {
    onChange(keywords.filter(k => k.id !== id));
  }, [keywords, onChange]);

  const handleCategoryChange = useCallback((id: string, category: KeywordCategory) => {
    onChange(keywords.map(k => k.id === id ? { ...k, category } : k));
  }, [keywords, onChange]);

  const handleImportanceToggle = useCallback((id: string) => {
    onChange(keywords.map(k => k.id === id ? { ...k, importance: k.importance === 'preferred' ? 'required' : 'preferred' } : k));
  }, [keywords, onChange]);

  const categoryKeywords = CATEGORIES.map(({ key, label }) => {
    const catKeywords = keywords.filter(k => k.category === key);
    return { key, label, count: catKeywords.length };
  });

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as KeywordCategory)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {categoryKeywords.map(({ key, label, count }) => {
            const Icon = CATEGORY_ICONS[key];
            return (
              <TabsTrigger 
                key={key} 
                value={key}
                className="gap-1.5 py-2 text-xs"
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
                {count > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 text-[10px] rounded bg-primary/10 text-primary">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {CATEGORIES.map(({ key, label }) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {filteredKeywords.map(kw => (
                <Badge
                  key={kw.id}
                  variant={kw.source === 'ai' ? 'default' : 'secondary'}
                  className="gap-1.5 px-2 py-1"
                >
                  <span className="truncate max-w-[150px]">{kw.text}</span>
                  <button
                    onClick={() => handleImportanceToggle(kw.id)}
                    title={kw.importance === 'preferred' ? 'Nice-to-have (click to make required)' : 'Required (click to make nice-to-have)'}
                    className={cn(
                      'px-1 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide transition-colors',
                      kw.importance === 'preferred'
                        ? 'bg-warning/15 text-warning'
                        : 'bg-destructive/15 text-destructive'
                    )}
                  >
                    {kw.importance === 'preferred' ? 'Nice-to-have' : 'Required'}
                  </button>
                  <span className="text-[10px] opacity-70">
                    {kw.source === 'ai' ? 'AI' : 'Manual'}
                  </span>
                  <select
                    value={kw.category}
                    onChange={(e) => handleCategoryChange(kw.id, e.target.value as KeywordCategory)}
                    className="bg-transparent border-none text-[10px] px-1 py-0.5 rounded"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemove(kw.id)}
                    className="ml-1 p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                    aria-label="Remove keyword"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={manualInputs[key]}
                onChange={(e) => setManualInputs(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={`Add ${label.toLowerCase()} keywords (comma separated)`}
                onKeyDown={(e) => e.key === 'Enter' && handleAddManual(key)}
                className="flex-1"
              />
              <Button size="sm" onClick={() => handleAddManual(key)}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Total: {keywords.length} keywords • 
          {keywords.filter(k => k.source === 'ai').length} AI • 
          {keywords.filter(k => k.source === 'manual').length} Manual
        </p>
      </div>
    </div>
  );
}