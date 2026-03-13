import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import fs from 'fs/promises';

export async function extractTextFromPDF(filePath) {
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);
  return {
    text: data.text,
    pageCount: data.numpages,
  };
}
