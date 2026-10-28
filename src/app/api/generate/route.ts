import { NextRequest, NextResponse } from 'next/server';
import { buildPromptForExam } from '@/lib/aiService';
import { ExamConfig } from '@/types/exam';

export const runtime = 'nodejs'; // or 'edge'
export const maxDuration = 60; // 60 seconds on Vercel

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { config, apiKey, provider, model } = body as {
      config: ExamConfig;
      apiKey?: string;
      provider?: string;
      model?: string;
    };

    if (!config) {
      return NextResponse.json({ error: 'Thiếu thông tin cấu hình đề thi.' }, { status: 400 });
    }

    const key = apiKey?.trim();
    if (!key) {
      return NextResponse.json({
        error: 'Vui lòng cung cấp API Key để sử dụng chế độ tạo đề AI trực tiếp qua Serverless.',
      }, { status: 400 });
    }

    const prompt = buildPromptForExam(config);

    if (provider === 'gemini' || !provider) {
      const isDiscontinued = (m?: string) => {
        if (!m) return true;
        const list = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-flash-latest', 'gemini-pro-latest', 'gemini-3.8-pro', 'gemini-3.1-pro'];
        return list.includes(m);
      };

      let preferredModel = isDiscontinued(model) ? 'gemini-flash-lite-latest' : (model || 'gemini-flash-lite-latest');

      const candidateModels = Array.from(new Set([
        preferredModel,
        'gemini-flash-lite-latest',
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-3.6-flash',
        'gemini-3-flash-preview',
      ].filter(m => m && !isDiscontinued(m))));

      let lastErr = '';
      for (let i = 0; i < candidateModels.length; i++) {
        const m = candidateModels[i];
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 8192,
                responseMimeType: 'application/json',
              },
            }),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            lastErr = err?.error?.message || `HTTP ${res.status}`;
            if (i < candidateModels.length - 1) {
              continue;
            }
            throw new Error(lastErr);
          }

          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawText) throw new Error('Không nhận được nội dung trả về từ AI');

          let cleaned = rawText.replace(/^```json/im, '').replace(/```$/im, '').trim();
          const jsonStart = cleaned.indexOf('{');
          const jsonEnd = cleaned.lastIndexOf('}');
          if (jsonStart !== -1 && jsonEnd !== -1) {
            cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
          }
          const parsed = JSON.parse(cleaned);
          return NextResponse.json({ success: true, data: parsed, usedModel: m });
        } catch (e: any) {
          lastErr = e.message;
          if (i < candidateModels.length - 1) {
            continue;
          }
          return NextResponse.json({ error: lastErr }, { status: 503 });
        }
      }
    }

    return NextResponse.json({ error: 'Nhà cung cấp AI chưa được hỗ trợ.' }, { status: 400 });
  } catch (err: any) {
    console.error('Serverless generation error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi xử lý máy chủ' }, { status: 500 });
  }
}
