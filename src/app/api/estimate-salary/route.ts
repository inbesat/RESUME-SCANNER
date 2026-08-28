import { NextRequest, NextResponse } from 'next/server';
import { generateSalaryEstimate } from '@/lib/generators/salary-estimator';
import { ApiResponse, SkillSalaryEstimate } from '@/types';

export const maxDuration = 30;

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<SkillSalaryEstimate>>> {
  try {
    const body = await request.json();
    const { resumeText, jobDescription = '', matchedKeywords = [], missingKeywords = [] } = body;

    if (!resumeText || typeof resumeText !== 'string' || !resumeText.trim()) {
      return NextResponse.json(
        { success: false, error: 'Resume text is required' },
        { status: 400 }
      );
    }

    const data = await generateSalaryEstimate(
      resumeText.trim(),
      typeof jobDescription === 'string' ? jobDescription.trim() : '',
      Array.isArray(matchedKeywords) ? matchedKeywords : [],
      Array.isArray(missingKeywords) ? missingKeywords : []
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in /api/estimate-salary:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to estimate salary',
      },
      { status: 500 }
    );
  }
}
