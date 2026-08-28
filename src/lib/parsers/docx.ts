import { extractRawText } from 'mammoth';
import { ParsedResume } from '@/types';

export async function parseDOCX(buffer: Buffer, fileName: string): Promise<ParsedResume> {
  try {
    const result = await extractRawText({ buffer });
    const text = result.value;
    return {
      text,
      fileName,
      fileType: 'docx',
      wordCount: text.split(/\s+/).filter(Boolean).length,
    };
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file. The file may be corrupted.');
  }
}