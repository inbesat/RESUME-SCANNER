import { NextRequest, NextResponse } from 'next/server';
import { predictInterviewQuestions } from '@/lib/generators/interview-predictor';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { resumeText, jobDescription, keywords, matchedKeywords, missingKeywords } = body;

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { success: false, error: 'Resume text and job description are required' },
        { status: 400 }
      );
    }

    const result = await predictInterviewQuestions({
      resumeText,
      jobDescription,
      keywords: keywords || [],
      matchedKeywords: matchedKeywords || [],
      missingKeywords: missingKeywords || [],
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Predict interview error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to predict interview questions',
      },
      { status: 500 }
    );
  }
}
