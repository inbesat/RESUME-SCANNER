import { PDFParse } from 'pdf-parse';
import { ParsedResume } from '@/types';

export async function parsePDF(buffer: Buffer, fileName: string): Promise<ParsedResume> {
  try {
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const text = textResult.text;
    const numPages = textResult.pages.length;

    await parser.destroy();

    return {
      text: text.trim(),
      fileName,
      fileType: 'pdf',
      wordCount: text.split(/\s+/).filter(Boolean).length,
      pageCount: numPages,
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file. The file may be corrupted or password-protected.');
  }
}