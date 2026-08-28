import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { ParsedResume } from '@/types';
import path from 'path';

const projectRoot = process.cwd();
const workerPath = path.join(projectRoot, 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.min.mjs');

pdfjsLib.GlobalWorkerOptions.workerSrc = `file://${workerPath.replace(/\\/g, '/')}`;

interface PDFTextItem {
  str: string;
}

export async function parsePDF(buffer: Buffer, fileName: string): Promise<ParsedResume> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter(isTextItem)
        .map((item) => (item as PDFTextItem).str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return {
      text: fullText.trim(),
      fileName,
      fileType: 'pdf',
      wordCount: fullText.split(/\s+/).filter(Boolean).length,
      pageCount: pdf.numPages,
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file. The file may be corrupted or password-protected.');
  }
}

function isTextItem(item: unknown): item is { str: string } {
  return typeof item === 'object' && item !== null && 'str' in item;
}