import { createWorker } from 'tesseract.js';
import { ParsedResume } from '@/types';

let workerPromise: Promise<Awaited<ReturnType<typeof createWorker>>> | null = null;

async function getWorker() {
  if (!workerPromise) {
    // Use default CDN-based paths which work in all environments (local + Vercel)
    workerPromise = createWorker('eng').catch(err => {
      workerPromise = null;
      throw err;
    });
  }
  return workerPromise;
}

export async function parseImage(buffer: Buffer, fileName: string, mimeType: string): Promise<ParsedResume> {
  try {
    const worker = await getWorker();

    const { data: { text } } = await worker.recognize(buffer);

    const fileType = mimeType === 'image/png' ? 'png' : 'jpg';

    return {
      text: text.trim(),
      fileName,
      fileType,
      wordCount: text.split(/\s+/).filter(Boolean).length,
    };
  } catch (error) {
    console.error('Image OCR error:', error);
    throw new Error('Failed to extract text from image. Please ensure the image is clear and contains readable text.');
  }
}

export async function terminateWorker() {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = null;
  }
}