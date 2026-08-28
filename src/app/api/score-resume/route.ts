import { NextRequest, NextResponse } from 'next/server';
import { scoreHybrid } from '@/lib/scoring';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { resumeText, keywords } = body;
    
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
    
    const result = await scoreHybrid(resumeText, keywords);
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Score resume error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to score resume' 
      },
      { status: 500 }
    );
  }
}