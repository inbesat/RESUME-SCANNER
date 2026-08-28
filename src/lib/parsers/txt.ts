import { ParsedResume } from '@/types';

export async function parseTXT(buffer: Buffer, fileName: string): Promise<ParsedResume> {
  try {
    const text = buffer.toString('utf-8');
    return {
      text,
      fileName,
      fileType: 'txt',
      wordCount: text.split(/\s+/).filter(Boolean).length,
    };
  } catch (error) {
    console.error('TXT parsing error:', error);
    throw new Error('Failed to read text file.');
  }
}