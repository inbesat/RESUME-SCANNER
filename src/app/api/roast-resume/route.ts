import { NextRequest, NextResponse } from 'next/server';
import { generateRecruiterRoast } from '@/lib/generators/recruiter-roast';
import { ApiResponse, RecruiterRoastResult } from '@/types';

export const maxDuration = 30;

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<RecruiterRoastResult>>> {
  try {
    const body = await request.json();
    const { resumeText, jobDescription = '', mode = 'roast' } = body;

    if (!resumeText || typeof resumeText !== 'string' || !resumeText.trim()) {
      return NextResponse.json(
        { success: false, error: 'Resume text is required' },
        { status: 400 }
      );
    }

    const data = await generateRecruiterRoast(
      resumeText.trim(),
      typeof jobDescription === 'string' ? jobDescription.trim() : '',
      mode === 'mentor' ? 'mentor' : 'roast'
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in /api/roast-resume:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate recruiter roast',
      },
      { status: 500 }
    );
  }
}
