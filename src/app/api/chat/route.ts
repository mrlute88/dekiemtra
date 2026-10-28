import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { message, apiKey, provider } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Nội dung tin nhắn không được để trống' }, { status: 400 });
    }

    if (apiKey && (provider === 'gemini' || !provider)) {
      const systemPrompt = `Bạn là Bé Bút AI - Trợ lý Khảo thí thông minh, thân thiện, đáng yêu (nhân vật hoạt hình chibi màu xanh dương đeo tai nghe, cầm bút và sách) chuyên hỗ trợ giáo viên Việt Nam thiết lập đề kiểm tra, xây dựng ma trận và bản đặc tả theo chương trình GDPT 2018 (Công văn 3280, Thông tư 22/27/26). Trả lời ngắn gọn, sư phạm, nhiệt tình, có icon sinh động.`;
      const candidateModels = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash'];

      for (const m of candidateModels) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey.trim()}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: [{ text: `${systemPrompt}\n\nCâu hỏi của giáo viên: "${message}"` }] },
              ],
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) {
              return NextResponse.json({ reply });
            }
          }
        } catch {
          continue;
        }
      }
    }

    // Default conversational responses
    return NextResponse.json({
      reply: `Dạ em đã nhận được câu hỏi của Thầy/Cô về "${message}". Em khuyến khích Thầy/Cô sử dụng quy trình từng bước ở cột bên trái: Chọn cấp -> Chọn môn -> Nhập nội dung -> Nhấn nút '✨ Tạo đề kiểm tra'. Thầy/Cô có thể bấm vào nút 'Cài đặt API' ở góc trên để kết nối trực tiếp với trí tuệ nhân tạo Gemini nhé ạ!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
