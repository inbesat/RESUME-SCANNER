import { NextRequest, NextResponse } from 'next/server';
import { optimizeBullet } from '@/lib/generators/bullet-optimizer';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { skill, currentBullet, resumeContext, jobDescription } = body;

    if (!skill && !currentBullet) {
      return NextResponse.json(
        { success: false, error: 'Target skill or existing bullet point is required' },
        { status: 400 }
      );
    }

    const result = await optimizeBullet({
      skill: skill || 'General Optimization',
      currentBullet,
      resumeContext,
      jobDescription,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Optimize bullet error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate bullet optimizations',
      },
      { status: 500 }
    );
  }
}
