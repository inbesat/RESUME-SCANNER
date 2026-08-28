import { describe, it, expect } from 'vitest';
import { parseTXT } from './txt';
import { parseResume } from './index';

describe('Parsers', () => {
  it('parses plain text correctly', async () => {
    const text = 'John Doe\nReact developer with 5 years experience.';
    const buffer = Buffer.from(text, 'utf-8');
    const parsed = await parseTXT(buffer, 'resume.txt');
    expect(parsed.fileName).toBe('resume.txt');
    expect(parsed.fileType).toBe('txt');
    expect(parsed.text).toBe(text);
    expect(parsed.wordCount).toBe(8);
  });

  it('routes txt files through parseResume', async () => {
    const text = 'Jane Doe\nTypeScript expert.';
    const buffer = Buffer.from(text, 'utf-8');
    const parsed = await parseResume(buffer, 'test.txt', 'text/plain');
    expect(parsed.text).toBe(text);
    expect(parsed.fileType).toBe('txt');
  });

  it('parses PDF files without DOMMatrix errors', async () => {
    const samplePdf = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(John Doe - Software Engineer) Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000234 00000 n \n0000000327 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n404\n%%EOF'
    );
    const parsed = await parseResume(samplePdf, 'resume.pdf', 'application/pdf');
    expect(parsed.fileName).toBe('resume.pdf');
    expect(parsed.fileType).toBe('pdf');
    expect(parsed.text).toContain('John Doe - Software Engineer');
  });
});
