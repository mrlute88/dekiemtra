import { NextRequest, NextResponse } from 'next/server';
import { extractText } from 'unpdf';
import mammoth from 'mammoth';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy tệp đính kèm.' }, { status: 400 });
    }

    const fileName = file.name || 'document';
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const arrayBuffer = await file.arrayBuffer();

    let extractedText = '';

    if (ext === 'pdf') {
      try {
        const uint8Array = new Uint8Array(arrayBuffer);
        const res = await extractText(uint8Array);
        extractedText = Array.isArray(res.text) ? res.text.join('\n\n') : String(res.text || '');
      } catch (pdfErr: any) {
        console.error('PDF parsing error:', pdfErr);
        return NextResponse.json({
          error: `Không thể đọc tệp PDF: ${pdfErr.message || 'Lỗi định dạng'}`,
        }, { status: 500 });
      }
    } else if (ext === 'docx' || ext === 'doc') {
      try {
        const buffer = Buffer.from(arrayBuffer);
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || '';
      } catch (docErr: any) {
        console.error('Docx parsing error:', docErr);
        return NextResponse.json({
          error: `Không thể đọc tệp Word: ${docErr.message || 'Lỗi định dạng'}`,
        }, { status: 500 });
      }
    } else if (ext === 'txt' || ext === 'md' || ext === 'csv' || ext === 'json') {
      extractedText = Buffer.from(arrayBuffer).toString('utf-8');
    } else {
      // Default to utf-8 text fallback
      extractedText = Buffer.from(arrayBuffer).toString('utf-8');
    }

    // Clean up excessive whitespace but preserve paragraph structure
    const cleanedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!cleanedText || cleanedText.length < 5) {
      return NextResponse.json({
        error: 'Tệp không chứa văn bản có thể trích xuất (có thể là tệp PDF scan ảnh thuần túy hoặc tệp rỗng).',
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      fileName,
      charCount: cleanedText.length,
      text: cleanedText,
    });
  } catch (err: any) {
    console.error('Text extraction general error:', err);
    return NextResponse.json({
      error: `Lỗi xử lý tệp: ${err.message || 'Không xác định'}`,
    }, { status: 500 });
  }
}
