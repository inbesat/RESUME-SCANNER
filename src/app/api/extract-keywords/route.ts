import { NextRequest, NextResponse } from 'next/server';
import { extractKeywordsFromJD } from '@/lib/keyword-extractor';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { jobDescription, manualKeywords } = body;
    
    if (!jobDescription || jobDescription.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Job description is required' },
        { status: 400 }
      );
    }
    
    let keywords = await extractKeywordsFromJD(jobDescription);
    
    if (manualKeywords && Array.isArray(manualKeywords)) {
      const { addManualKeywords } = await import('@/lib/keyword-extractor');
      keywords = addManualKeywords(keywords, manualKeywords, 'technical');
    }
    
    return NextResponse.json({
      success: true,
      data: { keywords, jobDescription },
    });
  } catch (error) {
    console.error('Extract keywords error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to extract keywords' 
      },
      { status: 500 }
    );
  }
}