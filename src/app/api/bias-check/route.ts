import { NextRequest, NextResponse } from 'next/server';
import { checkBias } from '@/lib/bias-check';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { resumeText, keywords, mode } = body;

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Resume text is required' },
        { status: 400 }
      );
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Keywords are required' },
        { status: 400 }
      );
    }

    const result = await checkBias(resumeText, keywords, { mode: mode === 'ai' ? 'ai' : 'local' });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Bias check error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Bias check failed' },
      { status: 500 }
    );
  }
}