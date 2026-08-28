import { ParsedResume } from '@/types';

// Polyfill browser globals required by pdfjs-dist in Node.js / Vercel serverless environments
if (typeof globalThis.DOMMatrix === 'undefined') {
  // @ts-expect-error - minimal polyfill for pdfjs
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true;
    isIdentity = true;
    constructor(init?: unknown) {
      if (Array.isArray(init) && init.length === 6) {
        this.a = this.m11 = init[0];
        this.b = this.m12 = init[1];
        this.c = this.m21 = init[2];
        this.d = this.m22 = init[3];
        this.e = this.m41 = init[4];
        this.f = this.m42 = init[5];
      }
    }
    multiplySelf() { return this; }
    preMultiplySelf() { return this; }
    translate() { return this; }
    scale() { return this; }
    invertSelf() { return this; }
    transformPoint(p?: unknown) { return p || { x: 0, y: 0, z: 0, w: 1 }; }
  };
}

if (typeof globalThis.ImageData === 'undefined') {
  // @ts-expect-error - minimal polyfill for pdfjs
  globalThis.ImageData = class ImageData {
    width: number;
    height: number;
    data: Uint8ClampedArray;
    constructor(w: number = 1, h: number = 1) {
      this.width = w;
      this.height = h;
      this.data = new Uint8ClampedArray(w * h * 4);
    }
  };
}

if (typeof globalThis.Path2D === 'undefined') {
  // @ts-expect-error - minimal polyfill for pdfjs
  globalThis.Path2D = class Path2D {
    addPath() {}
    closePath() {}
    moveTo() {}
    lineTo() {}
    bezierCurveTo() {}
    quadraticCurveTo() {}
    arc() {}
    arcTo() {}
    ellipse() {}
    rect() {}
  };
}

function extractRawPDFText(buffer: Buffer): string {
  const content = buffer.toString('latin1');
  const textChunks: string[] = [];
  const textRegex = /\(([^)]+)\)\s*Tj/g;
  let match;
  while ((match = textRegex.exec(content)) !== null) {
    textChunks.push(match[1]);
  }
  return textChunks.join(' ').replace(/\\([()\\])/g, '$1').trim();
}

export async function parsePDF(buffer: Buffer, fileName: string): Promise<ParsedResume> {
  try {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const text = textResult.text || '';
    const numPages = textResult.pages?.length || 1;

    await parser.destroy();

    const cleanedText = text
      .replace(/-- \d+ of \d+ --/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (cleanedText.length > 0) {
      return {
        text: cleanedText,
        fileName,
        fileType: 'pdf',
        wordCount: cleanedText.split(/\s+/).filter(Boolean).length,
        pageCount: numPages,
      };
    }
  } catch (err) {
    console.warn('PDFParse failed, attempting fallback raw text extraction:', err);
  }

  // Fallback raw text extraction
  try {
    const rawText = extractRawPDFText(buffer);
    if (rawText.length > 0) {
      return {
        text: rawText,
        fileName,
        fileType: 'pdf',
        wordCount: rawText.split(/\s+/).filter(Boolean).length,
        pageCount: 1,
      };
    }
  } catch (fallbackErr) {
    console.error('Fallback PDF parsing error:', fallbackErr);
  }

  throw new Error('Failed to parse PDF file. The file may be corrupted, image-only, or password-protected.');
}