import { ParsedResume } from '@/types';
import { extractText } from 'unpdf';

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
    const uint8Array = new Uint8Array(buffer);
    const { text, totalPages } = await extractText(uint8Array, { mergePages: true });

    const parsedText = (typeof text === 'string' ? text : Array.isArray(text) ? (text as string[]).join('\n\n') : '')
      .replace(/-- \d+ of \d+ --/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (parsedText.length > 0) {
      return {
        text: parsedText,
        fileName,
        fileType: 'pdf',
        wordCount: parsedText.split(/\s+/).filter(Boolean).length,
        pageCount: totalPages || 1,
      };
    }
  } catch (err) {
    console.warn('unpdf extraction failed, attempting fallback raw text extraction:', err);
  }

  // Fallback raw text extraction for uncompressed streams
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