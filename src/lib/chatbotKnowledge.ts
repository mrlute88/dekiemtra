export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickReplies?: { label: string; action: string; payload?: any }[];
}

export const INITIAL_BOT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome-1',
    sender: 'bot',
    text: 'Xin chào Thầy/Cô! Em là Bé Bút AI 🎓 – Trợ lý Khảo thí & Hướng dẫn ra đề kiểm tra 3 cấp học theo chuẩn Bộ GD&ĐT.',
    timestamp: 'Vừa xong',
  },
  {
    id: 'msg-welcome-2',
    sender: 'bot',
    text: 'Thầy/Cô cần em hỗ trợ điều gì hôm nay ạ? Thầy/Cô có thể bấm vào các gợi ý bên dưới hoặc nhắn tin trực tiếp cho em nhé!',
    timestamp: 'Vừa xong',
    quickReplies: [
      { label: '🚀 Hướng dẫn 4 bước ra đề', action: 'guide_steps' },
      { label: '🔑 Nhập API Key miễn phí', action: 'guide_api_key' },
      { label: '📐 Chuẩn Ma trận GDPT 2018', action: 'guide_matrix_standard' },
      { label: '✨ Tải đề mẫu Toán 6 Giữa kỳ', action: 'load_preset_toan6' },
      { label: '📚 Tải đề mẫu Văn 9', action: 'load_preset_van9' },
      { label: '🖨 Hướng dẫn in & xuất Word', action: 'guide_export' },
    ],
  },
];

export const KNOWLEDGE_BASE_RESPONSES: Record<string, string> = {
  guide_steps: `📋 **QUY TRÌNH 4 BƯỚC RA ĐỀ CHUẨN:**

1️⃣ **Chọn Cấp & Môn:** Chọn Tiểu học / THCS / THPT, chọn Lớp và Môn học (hoặc gõ tên môn bất kỳ).
2️⃣ **Nội dung & Tài liệu:** Nhập tên bài, yêu cầu cần đạt hoặc tải lên tài liệu PDF/Word. Thầy/Cô có thể chọn *"Chỉ sử dụng tài liệu tải lên"* để AI không tự ý lấy kiến thức ngoài.
3️⃣ **Cấu hình dạng câu & Mức độ:** Chọn số lượng câu hỏi Trắc nghiệm, Đúng/Sai, Trả lời ngắn, Tự luận và phân bổ 4 mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao.
4️⃣ **Bấm ✨ TẠO ĐỀ KIỂM TRA:** Hệ thống sẽ tự động xây dựng Ma trận, Bản đặc tả, đề kiểm tra, đáp án và chạy bộ kiểm tra 12 tiêu chí chất lượng!`,

  guide_api_key: `🔑 **HƯỚNG DẪN LẤY GOOGLE GEMINI API KEY MIỄN PHÍ:**

1. Truy cập trang chính thức của Google: [aistudio.google.com](https://aistudio.google.com/)
2. Đăng nhập bằng tài khoản Google (Gmail) bất kỳ.
3. Bấm vào nút **"Get API key"** -> **"Create API key"**.
4. Sao chép chuỗi mã khóa (bắt đầu bằng *AIza...*).
5. Quay lại app này, bấm nút **"Cài đặt API"** ở góc trên bên phải, dán mã vào và bấm **"Lưu cấu hình"**.
*(Lưu ý: Khóa được lưu hoàn toàn trên trình duyệt của Thầy/Cô, không gửi lên máy chủ nào khác, đảm bảo bảo mật 100%).*`,

  guide_matrix_standard: `📐 **QUY CHUẨN MA TRẬN & BẢN ĐẶC TẢ GDPT 2018:**

- Theo Công văn 3280/BGDĐT-GDTrH và Thông tư 22/2021:
  - **Nhận biết (40%):** Nhớ lại dữ kiện, khái niệm, công thức trực tiếp.
  - **Thông hiểu (30%):** Hiểu bản chất, giải thích, áp dụng công thức 1 bước.
  - **Vận dụng (20%):** Giải quyết tình huống bài toán quen thuộc, 2-3 bước tư duy.
  - **Vận dụng cao (10%):** Vấn đề liên môn, thực tiễn đời sống, phân loại học sinh giỏi.
- Tỉ lệ điểm và số câu trong Ma trận phải khớp 100% với Bản đặc tả và bộ đề sinh ra.`,

  guide_export: `🖨 **HƯỚNG DẪN IN ĐỀ & XUẤT WORD:**

- **Xuất file Word (.docx):** Bấm nút **"⬇ Xuất Word"** ở góc phải trên phần xem trước đề. File tải về có đầy đủ tiêu đề trường, mã đề, bảng chấm và định dạng đẹp mắt sẵn sàng chỉnh sửa.
- **In đề (Khổ A4):** Bấm nút **"🖨 In đề"**. Hệ thống đã tự động tối ưu ngắt trang, ẩn toàn bộ nút bấm giao diện, giữ lại tiêu đề trang trọng chuẩn Bộ GD&ĐT.
- **Sao chép sang Google Docs:** Bấm **"📋 Sao chép đề"** để dán trực tiếp.`,
};
