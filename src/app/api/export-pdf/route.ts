import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import fs from 'fs';

export const runtime = 'nodejs';
export const maxDuration = 60;

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  process.env.CHROME_BIN,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
].filter(Boolean) as string[];

export async function POST(req: NextRequest) {
  try {
    const { html, filename } = await req.json();

    if (!html) {
      return NextResponse.json({ error: 'Nội dung HTML không hợp lệ.' }, { status: 400 });
    }

    const executablePath = CHROME_PATHS.find(p => fs.existsSync(p));
    if (!executablePath) {
      return NextResponse.json({
        error: 'Không tìm thấy trình duyệt Chrome hoặc Edge trên máy tính để tạo file PDF.',
      }, { status: 500 });
    }

    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
      ],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    // Tạo PDF chuẩn A4 landscape, lề 0 vì trong CSS @page đã định nghĩa lề chuẩn
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    });

    await browser.close();

    const outputName = filename || 'Ma_tran_va_Ban_dac_ta.pdf';

    return new Response(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(outputName)}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Error in export-pdf API:', error);
    return NextResponse.json({
      error: `Lỗi xuất PDF: ${error.message || 'Không xác định'}`,
    }, { status: 500 });
  }
}
