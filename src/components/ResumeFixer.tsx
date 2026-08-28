'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Wand2,
  Sparkles,
  Download,
  Copy,
  Check,
  FileText,
  Eye,
  Edit3,
  Columns,
  RefreshCw,
  Loader2,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Printer
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FixedResumeData } from '@/types';
import { parseApiResponse, cn } from '@/lib/utils/helpers';
import { triggerConfetti, playAudioFeedback } from '@/lib/utils/effects';

interface ResumeFixerProps {
  resumeText: string;
  jobDescription: string;
  missingKeywords: string[];
  currentScore?: number;
}

type TemplateStyle = 'harvard' | 'silicon' | 'executive';

export function ResumeFixer({
  resumeText,
  jobDescription,
  missingKeywords = [],
  currentScore = 65,
}: ResumeFixerProps) {
  const [data, setData] = useState<FixedResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'canvas' | 'diff' | 'changelog'>('canvas');
  const [template, setTemplate] = useState<TemplateStyle>('harvard');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!resumeText || !jobDescription) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/fix-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          missingKeywords,
          currentScore,
          provider: 'auto',
        }),
      });

      const result = await parseApiResponse<FixedResumeData>(response);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to optimize resume');
      }

      setData(result.data);
      triggerConfetti();
      playAudioFeedback('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate fixed resume');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = useCallback(() => {
    if (!data) return;

    const formatted = `${data.fullName}
${data.title}
${data.email} | ${data.phone} | ${data.location}
${data.links.join(' | ')}

==================================================
PROFESSIONAL SUMMARY
==================================================
${data.summary}

==================================================
TECHNICAL SKILLS
==================================================
• Core Technologies: ${data.skills.technical.join(', ')}
• Cloud, Tools & DevOps: ${data.skills.toolsAndCloud.join(', ')}
• Domain & Leadership: ${data.skills.domainAndSoft.join(', ')}

==================================================
WORK EXPERIENCE
==================================================
${data.experience
  .map(
    (exp) => `${exp.role} | ${exp.company} (${exp.period})
${exp.bullets.map((b) => `• ${b}`).join('\n')}`
  )
  .join('\n\n')}

==================================================
EDUCATION & CERTIFICATIONS
==================================================
${data.education
  .map((edu) => `${edu.degree} - ${edu.institution} (${edu.year})\n${edu.details || ''}`)
  .join('\n')}
${data.certifications?.length ? `\nCertifications: ${data.certifications.join(' | ')}` : ''}`;

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    playAudioFeedback('click');
    setTimeout(() => setCopied(false), 2000);
  }, [data]);

  const handleDownloadTxt = useCallback(() => {
    if (!data) return;
    const element = document.createElement('a');
    const file = new Blob([printableRef.current?.innerText || ''], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${data.fullName.replace(/\s+/g, '_')}_Optimized_Resume.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [data]);

  const handlePrintPDF = useCallback(() => {
    if (!printableRef.current) return;
    const printContent = printableRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=900,height=1100');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data?.fullName || 'Resume'} - ATS Optimized Resume</title>
          <style>
            @page { margin: 15mm 15mm 15mm 15mm; size: auto; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #111;
              background: #fff;
              line-height: 1.45;
              padding: 0;
              margin: 0;
              font-size: 11pt;
            }
            h1 { font-size: 20pt; margin: 0 0 2pt 0; text-transform: uppercase; letter-spacing: 0.5px; }
            h2 { font-size: 11pt; margin: 10pt 0 4pt 0; border-bottom: 1.5px solid #222; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 2pt; }
            .contact { font-size: 9.5pt; margin-bottom: 8pt; color: #444; }
            .exp-header { display: flex; justify-content: space-between; font-weight: bold; margin-top: 6pt; font-size: 10.5pt; }
            .exp-sub { display: flex; justify-content: space-between; font-style: italic; font-size: 9.5pt; color: #333; margin-bottom: 3pt; }
            ul { margin: 2pt 0 6pt 16pt; padding: 0; }
            li { margin-bottom: 3pt; font-size: 9.5pt; text-align: justify; }
            p { margin: 2pt 0 6pt 0; font-size: 9.5pt; text-align: justify; }
            .skills-section p { margin-bottom: 3pt; font-size: 9.5pt; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  }, [data]);

  return (
    <Card className="border-primary/30 bg-gradient-to-b from-card via-card/95 to-background shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-primary mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>1-Click Full Resume Auto-Fixer &amp; ATS Canvas</span>
            </div>
            <CardTitle className="flex items-center gap-2 text-xl font-display">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <Wand2 className="h-4 w-4" />
              </span>
              Magic Resume Auto-Fixer
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Rewrites your entire resume to target a <strong>95%+ fit score</strong> by injecting missing keywords into Google XYZ bullets, eliminating weak verbs, and perfecting ATS structure.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !resumeText || !jobDescription}
              className="gap-2 bg-gradient-to-r from-primary to-[#ff5f42] text-primary-foreground font-semibold shadow-md hover:opacity-90 w-full sm:w-auto shimmer-badge"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {data ? 'Regenerate 95%+ Resume' : '✨ Auto-Fix My Resume'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-center gap-2" role="alert">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!data && !isLoading && (
          <div className="rounded-2xl border-2 border-dashed border-primary/30 p-8 sm:p-12 text-center bg-gradient-to-b from-primary/5 via-card to-background space-y-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center shadow-inner">
              <Wand2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display text-lg font-bold text-foreground">
                Turn your current {currentScore}% score into 95%+ in one click
              </h4>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Our AI engine analyzes your target job description, injects the {missingKeywords.length} missing skill{missingKeywords.length === 1 ? '' : 's'} into Google XYZ formula bullets, removes passive phrasing, and renders a live, editable ATS paper document.
              </p>
            </div>
            <div className="pt-2">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={!resumeText || !jobDescription}
                className="gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 shimmer-badge"
              >
                <Sparkles className="h-4 w-4" />
                Generate Tailored ATS Resume Now
              </Button>
            </div>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            {/* Score Jump & Audit Banner */}
            <div className="rounded-xl border border-success/30 bg-success/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-success text-success-foreground flex items-center justify-center font-display font-bold text-lg shadow-md shrink-0">
                  {data.estimatedScoreJump.projectedScore}%
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">Projected Score Jump</span>
                    <Badge variant="outline" className="bg-success text-success-foreground border-transparent text-[10px] font-mono px-2 py-0.5">
                      +{data.estimatedScoreJump.delta}% Boost
                    </Badge>
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-[10px] hidden md:inline-flex">
                      🏆 Top 5% Applicant Tier
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Engineered with <strong>Google XYZ Formula</strong> &amp; 100% ATS-safe structure • {data.modelUsed}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyText}
                  className="h-8 text-xs gap-1.5 border-border/80 hover:border-primary/50"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy Text'}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadTxt}
                  className="h-8 text-xs gap-1.5 border-border/80 hover:border-primary/50"
                >
                  <Download className="h-3.5 w-3.5" /> TXT
                </Button>

                <Button
                  size="sm"
                  onClick={handlePrintPDF}
                  className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                >
                  <Printer className="h-3.5 w-3.5" /> Print / Save PDF
                </Button>
              </div>
            </div>

            {/* View Selector & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
              <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
                <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                  <TabsTrigger value="canvas" className="text-xs gap-1.5 py-1.5 px-3">
                    <Eye className="h-3.5 w-3.5" /> Document Canvas
                  </TabsTrigger>
                  <TabsTrigger value="diff" className="text-xs gap-1.5 py-1.5 px-3">
                    <Columns className="h-3.5 w-3.5" /> Before / After Diff
                  </TabsTrigger>
                  <TabsTrigger value="changelog" className="text-xs gap-1.5 py-1.5 px-3">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Changes ({data.changesApplied.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {activeView === 'canvas' && (
                <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
                  {/* Template Switcher */}
                  <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/60 text-xs">
                    <span className="text-[10px] text-muted-foreground px-1.5 font-mono">Template:</span>
                    <button
                      type="button"
                      onClick={() => setTemplate('harvard')}
                      className={cn(
                        'px-2 py-1 rounded text-xs transition-colors font-medium',
                        template === 'harvard' ? 'bg-card text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      🏛️ Harvard ATS
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplate('silicon')}
                      className={cn(
                        'px-2 py-1 rounded text-xs transition-colors font-medium',
                        template === 'silicon' ? 'bg-card text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      💻 Modern Tech
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplate('executive')}
                      className={cn(
                        'px-2 py-1 rounded text-xs transition-colors font-medium',
                        template === 'executive' ? 'bg-card text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      👔 Executive
                    </button>
                  </div>

                  <Button
                    size="sm"
                    variant={isEditing ? 'default' : 'ghost'}
                    onClick={() => setIsEditing(!isEditing)}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    {isEditing ? 'Done Editing' : 'Edit Text'}
                  </Button>
                </div>
              )}
            </div>

            {/* View 1: Interactive Document Canvas */}
            {activeView === 'canvas' && (
              <div className="bg-muted/30 p-3 sm:p-8 rounded-2xl border border-border/70 overflow-x-auto flex justify-center">
                <div
                  ref={printableRef}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  className={cn(
                    'w-full max-w-[800px] bg-card text-card-foreground shadow-2xl p-6 sm:p-10 rounded-xl transition-all',
                    isEditing && 'outline-dashed outline-2 outline-primary/50 cursor-text',
                    template === 'harvard' && 'font-serif leading-relaxed',
                    template === 'silicon' && 'font-sans leading-normal border-t-4 border-t-primary',
                    template === 'executive' && 'font-sans leading-tight border-l-4 border-l-primary'
                  )}
                  style={{ minHeight: '1050px' }}
                >
                  {/* Resume Header */}
                  <div className={cn('text-center pb-4 mb-4 border-b border-border/80', template === 'executive' && 'text-left')}>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground uppercase">
                      {data.fullName}
                    </h1>
                    <p className="text-sm font-semibold text-primary mt-0.5 tracking-wide">
                      {data.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 flex flex-wrap items-center justify-center gap-2">
                      <span>{data.email}</span>
                      <span>•</span>
                      <span>{data.phone}</span>
                      <span>•</span>
                      <span>{data.location}</span>
                    </p>
                    {data.links?.length > 0 && (
                      <p className="text-[11px] text-muted-foreground mt-1 flex flex-wrap items-center justify-center gap-2 font-mono">
                        {data.links.map((link, idx) => (
                          <span key={idx}>
                            {idx > 0 && '• '}
                            <span className="text-primary/90 underline">{link}</span>
                          </span>
                        ))}
                      </p>
                    )}
                  </div>

                  {/* Section 1: Professional Summary */}
                  <div className="mb-5">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-foreground pb-1 mb-2 border-b border-border/60">
                      Professional Summary
                    </h2>
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                      {data.summary}
                    </p>
                  </div>

                  {/* Section 2: Technical Skills */}
                  <div className="mb-5">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-foreground pb-1 mb-2 border-b border-border/60">
                      Skills &amp; Competencies
                    </h2>
                    <div className="text-xs sm:text-sm space-y-1.5 text-foreground/90">
                      <p>
                        <strong className="text-foreground">Core Technical:</strong> {data.skills.technical.join(', ')}
                      </p>
                      <p>
                        <strong className="text-foreground">Cloud, Tools &amp; CI/CD:</strong> {data.skills.toolsAndCloud.join(', ')}
                      </p>
                      <p>
                        <strong className="text-foreground">Architecture &amp; Methodologies:</strong> {data.skills.domainAndSoft.join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Section 3: Work Experience */}
                  <div className="mb-5">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-foreground pb-1 mb-2 border-b border-border/60">
                      Professional Experience
                    </h2>
                    <div className="space-y-4">
                      {data.experience.map((exp, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm font-semibold text-foreground">
                            <span>{exp.role} — <span className="text-primary">{exp.company}</span></span>
                            <span className="text-xs text-muted-foreground font-mono">{exp.period}</span>
                          </div>
                          {exp.location && (
                            <p className="text-[11px] text-muted-foreground italic">{exp.location}</p>
                          )}
                          <ul className="list-disc pl-4 space-y-1 text-xs sm:text-sm text-foreground/90 mt-1.5">
                            {exp.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="leading-relaxed">
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 4: Education */}
                  <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-foreground pb-1 mb-2 border-b border-border/60">
                      Education
                    </h2>
                    <div className="space-y-2">
                      {data.education.map((edu, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm">
                          <div>
                            <span className="font-semibold text-foreground">{edu.degree}</span>
                            <span className="text-muted-foreground"> — {edu.institution}</span>
                            {edu.details && <p className="text-[11px] text-muted-foreground">{edu.details}</p>}
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">{edu.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 5: Certifications */}
                  {data.certifications && data.certifications.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-widest text-foreground pb-1 mb-2 border-b border-border/60">
                        Certifications &amp; Credentials
                      </h2>
                      <p className="text-xs sm:text-sm text-foreground/90">
                        {data.certifications.join(' • ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View 2: Side-by-Side Diff */}
            {activeView === 'diff' && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-destructive/30 bg-destructive/[0.03] p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-destructive/20 pb-2">
                    <span className="font-semibold text-xs text-destructive flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Original Resume (Before: {currentScore}%)
                    </span>
                    <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">
                      {missingKeywords.length} Missing Gaps
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono whitespace-pre-wrap max-h-[550px] overflow-y-auto leading-relaxed p-2 bg-card/60 rounded-lg">
                    {resumeText}
                  </div>
                </div>

                <div className="rounded-xl border border-success/30 bg-success/[0.03] p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-success/20 pb-2">
                    <span className="font-semibold text-xs text-success flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Auto-Fixed &amp; Optimized (After: {data.estimatedScoreJump.projectedScore}%)
                    </span>
                    <Badge variant="outline" className="text-[10px] text-success border-success/30">
                      100% Injected Keywords
                    </Badge>
                  </div>
                  <div className="space-y-3 max-h-[550px] overflow-y-auto p-2 bg-card/60 rounded-lg text-xs leading-relaxed">
                    <div className="p-2.5 bg-success/10 rounded border border-success/20">
                      <strong className="text-success block mb-1">Tailored Summary:</strong>
                      <p className="text-foreground/90">{data.summary}</p>
                    </div>
                    <div className="space-y-2">
                      <strong className="text-success block">Optimized XYZ Bullets:</strong>
                      {data.experience.flatMap((exp) => exp.bullets).map((b, i) => (
                        <div key={i} className="p-2 bg-muted/40 rounded border border-border/60">
                          <span className="text-success font-bold mr-1.5">✓</span>
                          <span className="text-foreground/90">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View 3: Changelog */}
            {activeView === 'changelog' && (
              <div className="rounded-xl border border-border/80 bg-card/60 p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Exact Optimization Changelog</span>
                </div>
                <div className="space-y-2.5">
                  {data.changesApplied.map((change, index) => (
                    <div key={index} className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/30 border border-border/60 text-xs">
                      <span className="flex h-5 w-5 rounded-full bg-success/20 text-success text-[10px] font-bold items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-foreground/90 leading-relaxed font-sans">{change}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
