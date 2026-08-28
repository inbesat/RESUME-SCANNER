import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '@/lib/parsers';
import { validateFileType } from '@/lib/utils/helpers';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    const validation = validateFileType(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseResume(buffer, file.name, file.type);
    
    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error('Parse resume error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to parse resume' 
      },
      { status: 500 }
    );
  }
}