import { NextRequest, NextResponse } from 'next/server';
import { ParsedResume, Keyword, ScoreResult } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { resume, keywords, scoreResult } = body;

    if (!resume || !scoreResult) {
      return NextResponse.json(
        { success: false, error: 'Missing required data' },
        { status: 400 }
      );
    }

    const pdfContent = generatePDFContent(resume, keywords, scoreResult);
    
    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume-fit-report-${resume.fileName.replace(/\.[^/.]+$/, '')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

function generatePDFContent(resume: ParsedResume, keywords: Keyword, scoreResult: ScoreResult): string {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const categoryConfig = {
    technical: { label: 'Technical Skills', icon: '🔧' },
    experience: { label: 'Experience', icon: '📋' },
    education: { label: 'Education', icon: '🎓' },
    softSkills: { label: 'Soft Skills', icon: '🤝' },
  } as const;

  const getScoreBar = (score: number, width = 200) => {
    const filled = Math.round((score / 100) * width);
    return '█'.repeat(Math.max(0, filled / 5)) + '░'.repeat(Math.max(0, (width - filled) / 5));
  };

  let pdf = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
    /F2 6 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 5 0 R
>>
stream
BT
/F1 24 Tf
50 720 Td
(AI Resume Screener - Fit Report) Tj
ET

BT
/F1 12 Tf
50 690 Td
(Generated on ${date}) Tj
ET

BT
/F1 12 Tf
50 670 Td
(Resume: ${resume.fileName} (${resume.fileType.toUpperCase()}, ${resume.wordCount} words)) Tj
ET

BT
/F2 18 Tf
50 630 Td
(Overall Fit: ${scoreResult.fitPercentage}%) Tj
ET

BT
/F1 10 Tf
50 610 Td
(Scorer: ${scoreResult.scorerUsed === 'hybrid' ? 'Hybrid (Local + AI)' : scoreResult.scorerUsed === 'ai' ? 'AI (Groq)' : 'Local Algorithm'}) Tj
ET

BT
/F1 10 Tf
50 590 Td
(Processing Time: ${scoreResult.processingTime}ms) Tj
ET

BT
/F1 10 Tf
50 575 Td
(Confidence: ${scoreResult.confidence || 'n/a'}${scoreResult.confidence === 'low' && scoreResult.confidenceReason ? ' - ' + scoreResult.confidenceReason : ''}) Tj
ET

BT
/F1 14 Tf
50 535 Td
(Category Breakdown) Tj
ET`;

  let yPos = 515;
  
  Object.entries(scoreResult.breakdown).forEach(([key, category]) => {
    const config = categoryConfig[key as keyof typeof categoryConfig];
    const score = category.score;
    
    pdf += `
BT
/F1 12 Tf
50 ${yPos} Td
(${config.icon} ${config.label}: ${score}%) Tj
ET

BT
/F1 10 Tf
70 ${yPos - 15} Td
(Matched: ${category.matched.length} | Missing: ${category.missing.length}) Tj
ET

BT
/F2 10 Tf
70 ${yPos - 30} Td
(${getScoreBar(score, 100)}) Tj
ET`;

    if (category.matched.length > 0) {
      pdf += `
BT
/F1 9 Tf
70 ${yPos - 45} Td
(Matched: ${category.matched.slice(0, 8).join(', ')}${category.matched.length > 8 ? '...' : ''}) Tj
ET`;
      yPos -= 15;
    }
    
    if (category.missing.length > 0) {
      pdf += `
BT
/F1 9 Tf
70 ${yPos - 45} Td
(Missing: ${category.missing.slice(0, 8).join(', ')}${category.missing.length > 8 ? '...' : ''}) Tj
ET`;
      yPos -= 15;
    }
    
    yPos -= 60;
  });

  if (scoreResult.suggestions.length > 0) {
    yPos -= 20;
    pdf += `
BT
/F1 14 Tf
50 ${yPos} Td
(Suggestions) Tj
ET`;
    yPos -= 25;
    
    scoreResult.suggestions.forEach((suggestion, i) => {
      pdf += `
BT
/F1 10 Tf
70 ${yPos} Td
(${i + 1}. ${suggestion}) Tj
ET`;
      yPos -= 18;
    });
  }

  pdf += `
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
/Encoding /WinAnsiEncoding
>>
endobj

6 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
/Encoding /WinAnsiEncoding
>>
endobj

xref
0 7
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000110 00000 n 
0000000200 00000 n 
0000000000 00000 n 
0000000000 00000 n 
trailer
<<
/Size 7
/Root 1 0 R
>>
startxref
0
%%EOF`;

  return pdf;
}