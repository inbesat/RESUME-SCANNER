import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '@/lib/parsers';
import { scoreLocally } from '@/lib/scoring/local-scorer';
import { Keyword, ScoreResult } from '@/types';

const MAX_FILES = 20;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();

    const keywordsRaw = formData.get('keywords') as string | null;
    const scoringMode = (formData.get('scoring') as string | null) || 'local';

    let keywords: Keyword[];
    try {
      keywords = keywordsRaw ? JSON.parse(keywordsRaw) : [];
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid keywords JSON' },
        { status: 400 }
      );
    }

    if (!keywords || keywords.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Keywords are required' },
        { status: 400 }
      );
    }

    const files = formData.getAll('files') as File[];
    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files uploaded' },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const results = await Promise.allSettled(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const parsed = await parseResume(buffer, file.name, file.type || '');

        return { file, parsed };
      })
    );

    const ranked: {
      fileName: string;
      fileType: string;
      wordCount: number;
      fitPercentage: number;
      confidence: ScoreResult['confidence'];
      breakdown: ScoreResult['breakdown'];
      suggestions: string[];
      error?: string;
    }[] = [];

    for (const result of results) {
      if (result.status === 'rejected') {
        const fileName = String(result.reason?.message || 'unknown').includes('Unsupported')
          ? 'unsupported-file'
          : 'parse-failed';
        ranked.push({
          fileName,
          fileType: 'unknown',
          wordCount: 0,
          fitPercentage: 0,
          confidence: 'low',
          breakdown: {
            technical: { score: 0, matched: [], missing: [] },
            experience: { score: 0, matched: [], missing: [] },
            education: { score: 0, matched: [], missing: [] },
            softSkills: { score: 0, matched: [], missing: [] },
          },
          suggestions: [],
          error: result.reason instanceof Error ? result.reason.message : 'Failed to parse',
        });
        continue;
      }

      const { parsed } = result.value;

      let scoreResult: ScoreResult | null = null;
      try {
        if (scoringMode === 'hybrid') {
          const { scoreHybrid } = await import('@/lib/scoring');
          scoreResult = await scoreHybrid(parsed.text, keywords);
        } else {
          scoreResult = scoreLocally(parsed.text, keywords);
        }
      } catch (err) {
        console.error(`Scoring failed for ${parsed.fileName}:`, err);
      }

      if (!scoreResult) {
        ranked.push({
          fileName: parsed.fileName,
          fileType: parsed.fileType,
          wordCount: parsed.wordCount,
          fitPercentage: 0,
          confidence: 'low',
          breakdown: {
            technical: { score: 0, matched: [], missing: [] },
            experience: { score: 0, matched: [], missing: [] },
            education: { score: 0, matched: [], missing: [] },
            softSkills: { score: 0, matched: [], missing: [] },
          },
          suggestions: [],
          error: 'Scoring failed',
        });
        continue;
      }

      ranked.push({
        fileName: parsed.fileName,
        fileType: parsed.fileType,
        wordCount: parsed.wordCount,
        fitPercentage: scoreResult.fitPercentage,
        confidence: scoreResult.confidence,
        breakdown: scoreResult.breakdown,
        suggestions: scoreResult.suggestions,
      });
    }

    ranked.sort((a, b) => b.fitPercentage - a.fitPercentage);

    return NextResponse.json({
      success: true,
      data: {
        results: ranked,
        scoringMode: scoringMode === 'hybrid' ? 'hybrid' : 'local',
        processedCount: ranked.filter(r => !r.error).length,
        totalCount: ranked.length,
        processingTime: Date.now() - startTime,
      },
    });
  } catch (error) {
    console.error('Bulk score error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Bulk scoring failed' },
      { status: 500 }
    );
  }
}