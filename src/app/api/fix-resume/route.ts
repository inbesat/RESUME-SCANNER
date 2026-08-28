import { NextRequest, NextResponse } from 'next/server';
import { generateFixedResume } from '@/lib/generators/resume-fixer';
import { ApiResponse, FixedResumeData } from '@/types';

export const maxDuration = 30;

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<FixedResumeData>>> {
  try {
    const body = await request.json();
    const { resumeText, jobDescription, missingKeywords = [], currentScore = 65, provider = 'auto' } = body;

    if (!resumeText || typeof resumeText !== 'string' || !resumeText.trim()) {
      return NextResponse.json(
        { success: false, error: 'Resume text is required' },
        { status: 400 }
      );
    }

    if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
      return NextResponse.json(
        { success: false, error: 'Job description is required' },
        { status: 400 }
      );
    }

    const data = await generateFixedResume(
      resumeText.trim(),
      jobDescription.trim(),
      Array.isArray(missingKeywords) ? missingKeywords : [],
      Number(currentScore) || 65,
      provider
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in /api/fix-resume:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate fixed resume',
      },
      { status: 500 }
    );
  }
}
