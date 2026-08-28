import { NextRequest, NextResponse } from 'next/server';
import { generateOutreach } from '@/lib/generators/outreach-generator';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { resumeText, jobDescription, matchedKeywords } = body;

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { success: false, error: 'Resume text and job description are required' },
        { status: 400 }
      );
    }

    const result = await generateOutreach({
      resumeText,
      jobDescription,
      matchedKeywords: matchedKeywords || [],
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Generate outreach error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate outreach package',
      },
      { status: 500 }
    );
  }
}
