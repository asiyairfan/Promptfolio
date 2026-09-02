import { PDFParse } from 'pdf-parse';

const MIN_TEXT_CHARS = 100;

export async function extractTextFromPdf(buffer) {
  let parser;
  try {
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = (result?.text || '').trim();

    if (text.length < MIN_TEXT_CHARS) {
      return {
        ok: false,
        text,
        error: 'scanned_or_image_pdf',
        message: 'This PDF contains very little selectable text. It may be a scanned image. Try pasting your resume text instead.'
      };
    }

    return { ok: true, text, chars: text.length };
  } catch (err) {
    return {
      ok: false,
      error: 'parse_failed',
      message: err.message || 'Could not read the PDF.'
    };
  } finally {
    try {
      if (parser && typeof parser.destroy === 'function') {
        await parser.destroy();
      }
    } catch {
      // ignore cleanup errors
    }
  }
}
