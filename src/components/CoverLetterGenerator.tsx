'use client';

import { useState, useCallback } from 'react';
import { Mail, Send, Copy, Check, Loader2, Sparkles, FileText, MessageSquare, Clock, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { OutreachResult } from '@/types';
import { parseApiResponse, cn } from '@/lib/utils/helpers';

interface CoverLetterGeneratorProps {
  resumeText: string;
  jobDescription: string;
  matchedKeywords: string[];
}

export function CoverLetterGenerator({
  resumeText,
  jobDescription,
  matchedKeywords,
}: CoverLetterGeneratorProps) {
  const [data, setData] = useState<OutreachResult | null>(null);
  const [activeTab, setActiveTab] = useState<'coverLetter' | 'linkedinDm' | 'followUpEmail'>('coverLetter');
  const [editableContent, setEditableContent] = useState<Record<string, string>>({
    coverLetter: '',
    linkedinDm: '',
    followUpEmail: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!resumeText || !jobDescription) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          matchedKeywords,
        }),
      });

      const result = await parseApiResponse<OutreachResult>(response);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to generate outreach package');
      }

      setData(result.data);
      setEditableContent({
        coverLetter: result.data.coverLetter,
        linkedinDm: result.data.linkedinDm,
        followUpEmail: result.data.followUpEmail,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  }, [resumeText, jobDescription, matchedKeywords]);

  const handleCopy = (key: string) => {
    const textToCopy = editableContent[key] || (data ? data[key as keyof OutreachResult] : '');
    if (typeof textToCopy === 'string') {
      navigator.clipboard.writeText(textToCopy);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <Card className="border-border/70 bg-gradient-to-b from-card/80 to-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </span>
              1-Click Cover Letter &amp; Recruiter Outreach
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Personalized, high-converting cover letter and LinkedIn cold DM leading with your top matched skills.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={isLoading || !resumeText || !jobDescription}
            className="gap-2 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {data ? 'Regenerate Outreach' : 'Generate Cover Letter & DM'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg" role="alert">
            {error}
          </p>
        )}

        {!data && !isLoading && (
          <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-muted/20">
            <Send className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
            <p className="text-sm font-medium">Ready to craft your application outreach</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Click &quot;Generate Cover Letter &amp; DM&quot; above to produce tailored outreach templates for this job.
            </p>
          </div>
        )}

        {data && (
          <div className="space-y-3 pt-1">
            {data.keyStrengthsUsed?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground pb-1">
                <span className="font-medium text-foreground">Highlighted Strengths:</span>
                {data.keyStrengthsUsed.map((s, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                    ★ {s}
                  </Badge>
                ))}
              </div>
            )}

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <TabsList className="grid grid-cols-3 w-full sm:max-w-md">
                  <TabsTrigger value="coverLetter" className="text-xs gap-1.5 py-1.5 px-2">
                    <FileText className="h-3.5 w-3.5" />
                    Cover Letter
                  </TabsTrigger>
                  <TabsTrigger value="linkedinDm" className="text-xs gap-1.5 py-1.5 px-2">
                    <MessageSquare className="h-3.5 w-3.5" />
                    LinkedIn DM
                  </TabsTrigger>
                  <TabsTrigger value="followUpEmail" className="text-xs gap-1.5 py-1.5 px-2">
                    <Clock className="h-3.5 w-3.5" />
                    Follow-Up
                  </TabsTrigger>
                </TabsList>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(activeTab)}
                  className="gap-1.5 text-xs h-8 w-full sm:w-auto"
                >
                  {copiedKey === activeTab ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-success" />
                      <span className="text-success font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Current</span>
                    </>
                  )}
                </Button>
              </div>

              <TabsContent value="coverLetter" className="space-y-2 mt-0">
                <div className="relative">
                  <Textarea
                    value={editableContent.coverLetter}
                    onChange={(e) => setEditableContent((prev) => ({ ...prev, coverLetter: e.target.value }))}
                    rows={11}
                    className="font-sans text-xs sm:text-sm leading-relaxed p-3.5 bg-muted/30 border-border/70 resize-y"
                    placeholder="Cover letter will appear here..."
                  />
                  <div className="absolute bottom-2.5 right-3 text-[10px] text-muted-foreground flex items-center gap-1 pointer-events-none">
                    <Edit3 className="h-3 w-3" /> Editable
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="linkedinDm" className="space-y-2 mt-0">
                <div className="relative">
                  <Textarea
                    value={editableContent.linkedinDm}
                    onChange={(e) => setEditableContent((prev) => ({ ...prev, linkedinDm: e.target.value }))}
                    rows={6}
                    className="font-sans text-xs sm:text-sm leading-relaxed p-3.5 bg-muted/30 border-border/70 resize-y"
                    placeholder="LinkedIn Recruiter DM will appear here..."
                  />
                  <div className="absolute bottom-2.5 right-3 text-[10px] text-muted-foreground flex items-center gap-1 pointer-events-none">
                    <Edit3 className="h-3 w-3" /> Under 120 words
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="followUpEmail" className="space-y-2 mt-0">
                <div className="relative">
                  <Textarea
                    value={editableContent.followUpEmail}
                    onChange={(e) => setEditableContent((prev) => ({ ...prev, followUpEmail: e.target.value }))}
                    rows={6}
                    className="font-sans text-xs sm:text-sm leading-relaxed p-3.5 bg-muted/30 border-border/70 resize-y"
                    placeholder="Follow-up email template will appear here..."
                  />
                  <div className="absolute bottom-2.5 right-3 text-[10px] text-muted-foreground flex items-center gap-1 pointer-events-none">
                    <Edit3 className="h-3 w-3" /> 5-7 days post-application
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
