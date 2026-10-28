# RA ĐỀ KIỂM TRA AI – 3 CẤP (Tiểu học • THCS • THPT • Mọi môn học)

Ứng dụng web serverless xây dựng bằng **Next.js (App Router)** sẵn sàng deploy lên **Vercel**, hỗ trợ giáo viên Việt Nam thiết lập ma trận, bản đặc tả và đề kiểm tra định kỳ/thường xuyên theo chuẩn **Chương trình GDPT 2018** (Công văn 3280/BGDĐT-GDTrH, Thông tư 22/27/26).

---

## ✨ Tính Năng Nổi Bật

1. **Hỗ trợ đầy đủ 3 cấp & mọi môn học:**
   - **Tiểu học:** Lớp 1 - 5.
   - **THCS:** Lớp 6 - 9.
   - **THPT:** Lớp 10 - 12.
   - Toàn bộ môn học phổ biến + ô *"Nhập tên môn học khác"*.

2. **Quy trình thiết lập 10 bước chuẩn khảo thí:**
   - Bước 1 & 2: Chọn Cấp học & Khối lớp.
   - Bước 3: Chọn Môn học.
   - Bước 4: Nhập nội dung kiến thức, chủ đề, yêu cầu cần đạt, dán nội dung bài học.
   - Bước 5: Tài liệu tham chiếu (tải PDF/Word/Text; tùy chọn *"Chỉ sử dụng tài liệu tải lên"*).
   - Bước 6: Loại đề (Giữa kỳ, Cuối kỳ, 15 phút, Ôn tập...) & Thời gian làm bài (10 - 120 phút).
   - Bước 7: Hình thức câu hỏi (Trắc nghiệm 4 lựa chọn, Đúng/Sai, Trả lời ngắn, Tự luận, Giải bài tập...).
   - Bước 8: 4 mức độ nhận thức GDPT 2018 (Nhận biết 40%, Thông hiểu 30%, Vận dụng 20%, Vận dụng cao 10%) với kiểm tra tổng 100%.
   - Bước 9: Thang điểm (Mặc định 10đ, 20đ, 100đ hoặc tự nhập).
   - Bước 10: Tùy chọn nâng cao: Sinh nhiều mã đề (Mã 101, 102, 103, 104) đảo câu & đáp án thông minh.

3. **Trợ lý Chatbot AI ("Bé Bút AI") phong cách Dialogflow:**
   - Avatar nhân vật hoạt hình chibi dễ thương theo đúng hình ảnh cung cấp.
   - Hướng dẫn giáo viên từng bước ra đề, giải thích chuẩn ma trận 3280, nạp nhanh đề mẫu, hỗ trợ lấy API Key.

4. **Tự quản lý API Key:**
   - Người dùng tự nhập Google Gemini API Key (khuyên dùng, miễn phí tại [aistudio.google.com](https://aistudio.google.com/)) hoặc OpenAI Key.
   - Lưu trữ an toàn trong `localStorage` của trình duyệt, không lưu trên server bên thứ 3.

5. **5 Tab hiển thị & Xuất bản chuyên nghiệp:**
   - **Tab 1: Đề kiểm tra:** Tiêu đề chuẩn Bộ GD&ĐT, các câu hỏi kèm nút 🔄 *Tạo lại*, ✏️ *Chỉnh sửa*, 🗑 *Xóa*, ➕ *Thêm câu*.
   - **Tab 2: Đáp án:** Bảng trắc nghiệm (Câu - Đáp án - Điểm) & Lời giải chi tiết tự luận.
   - **Tab 3: Hướng dẫn chấm:** Biểu điểm thành phần đến 0.25đ & Lưu ý chấm.
   - **Tab 4: Ma trận đề:** Khung ma trận 4 mức độ nhận thức khớp 100% với đề.
   - **Tab 5: Bản đặc tả:** Chi tiết đơn vị kiến thức & hình thức đánh giá.
   - **Bộ kiểm tra chất lượng tự động:** 12 tiêu chí kiểm duyệt sư phạm.

6. **In ấn & Xuất file:**
   - 📄 **In đề (Khổ A4):** Định dạng trang in chuyên nghiệp, ẩn toàn bộ nút giao diện.
   - ⬇ **Xuất file Word (.docx):** Xuất trực tiếp đề thi và đáp án dạng `.docx`.
   - 📋 **Sao chép đề:** Định dạng sẵn sàng dán sang Word hoặc Google Docs.
   - 💾 **Ngân hàng câu hỏi:** Lưu trữ và tái sử dụng câu hỏi.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

```bash
# Cài đặt dependencies
npm install

# Chạy môi trường phát triển (Dev server)
npm run dev
```

Mở trình duyệt tại: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Triển Khai Lên Vercel (Deploy to Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmrlute88%2Fdekiemtra)

Dự án hoàn toàn tương thích và tối ưu hóa 100% cho Vercel Serverless:

### Cách 1: Triển khai 1-Click qua Vercel Web (Khuyên dùng)
1. Bấm vào nút **Deploy with Vercel** ở trên hoặc truy cập liên kết:  
   👉 **[https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmrlute88%2Fdekiemtra](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmrlute88%2Fdekiemtra)**
2. Đăng nhập bằng tài khoản GitHub `mrlute88`.
3. Bấm **Create** / **Deploy**. Vercel sẽ tự động build và cấp tên miền miễn phí (dạng `dekiemtra.vercel.app`) sau khoảng 1 phút!
4. Mọi lần Thầy/Cô cập nhật code và `git push`, Vercel sẽ tự động cập nhật webapp online.

### Cách 2: Sử dụng Vercel CLI từ máy tính
```bash
npx vercel
```
Làm theo hướng dẫn trên màn hình để liên kết tài khoản và deploy.

