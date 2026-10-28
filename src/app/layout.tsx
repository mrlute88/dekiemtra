import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RA ĐỀ KIỂM TRA AI – 3 CẤP (Tiểu học • THCS • THPT)',
  description: 'Ứng dụng hỗ trợ giáo viên tạo ma trận, bản đặc tả và đề kiểm tra tự động theo chương trình GDPT 2018 cho mọi môn học.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
