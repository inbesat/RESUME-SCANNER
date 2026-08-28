import { parsePDF } from './pdf';
import { parseDOCX } from './docx';
import { parseTXT } from './txt';
import { parseImage } from './image';
import { ParsedResume } from '@/types';

export async function parseResume(buffer: Buffer, fileName: string, mimeType: string): Promise<ParsedResume> {
  const extension = fileName.toLowerCase().split('.').pop();
  
  if (mimeType === 'application/pdf' || extension === 'pdf') {
    return parsePDF(buffer, fileName);
  }
  
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || extension === 'docx') {
    return parseDOCX(buffer, fileName);
  }
  
  if (mimeType === 'text/plain' || extension === 'txt') {
    return parseTXT(buffer, fileName);
  }
  
  if (mimeType === 'image/png' || mimeType === 'image/jpeg' || mimeType === 'image/jpg' || extension === 'png' || extension === 'jpg' || extension === 'jpeg') {
    return parseImage(buffer, fileName, mimeType);
  }
  
  throw new Error(`Unsupported file type: ${mimeType}. Please upload PDF, DOCX, TXT, PNG, or JPEG files.`);
}