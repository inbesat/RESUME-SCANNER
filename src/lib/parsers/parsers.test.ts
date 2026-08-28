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

  it('throws for unsupported file type', async () => {
    const buffer = Buffer.from('hello', 'utf-8');
    await expect(parseResume(buffer, 'test.xyz', 'application/xyz')).rejects.toThrow('Unsupported file type');
  });
});
