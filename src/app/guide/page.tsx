'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles, BookOpen, Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppGuide } from '@/components/AppGuide';
import ThemeToggle from '@/components/ThemeToggle';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5" aria-label="AI Resume Screener home">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#ff5f42] font-mono text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25">
                AI
              </span>
              <span className="font-mono text-sm font-semibold tracking-tight">
                RESUME_SCREENER
              </span>
            </Link>
            <Badge variant="outline" className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline-flex">
              User Guide &amp; Docs
            </Badge>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/app"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              <span>Launch App</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Guide Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-10">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary mb-1">
              <Terminal className="h-3.5 w-3.5" />
              Documentation &amp; Tutorial
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              User Guide &amp; Feature Masterclass
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">
              Step-by-step documentation, interactive UI screenshots, scoring formulas, and tips for job seekers and recruiters.
            </p>
          </div>

          <Link href="/app">
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Sparkles className="h-4 w-4" />
              Open Resume Screener
            </Button>
          </Link>
        </div>

        {/* Feature Guide Component */}
        <AppGuide />

        {/* Bottom CTA Banner */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-card p-8 text-center space-y-4 shadow-sm">
          <h3 className="font-display text-2xl font-bold text-foreground">
            Ready to score your resume?
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Test drive with 1-click sample presets or upload your own resume and job description to get an evidence-backed score in under 60 seconds.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/app">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                Score My Resume Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/app?mode=recruiter">
              <Button size="lg" variant="outline" className="gap-2">
                Try Recruiter Mode
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} AI Resume Screener — Hybrid Local + AI Scoring Engine.</p>
      </footer>
    </div>
  );
}
