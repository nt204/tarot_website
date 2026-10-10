import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TarotReader.me - Bói Bài Tarot Online Miễn Phí & Luận Giải AI',
  description: 'Khám phá thông điệp vũ trụ với 78 lá bài Tarot chuẩn Rider-Waite. Bói bài Tarot tình yêu, công việc, định hướng cuộc sống và luận giải chuyên sâu với AI Gemini 3.7.',
  keywords: ['tarot', 'bói bài tarot', 'tarot online', 'tarot ai', 'rider waite', 'xem bài tarot miễn phí'],
  openGraph: {
    title: 'TarotReader.me - Bói Bài Tarot Online Miễn Phí',
    description: 'Trải nghiệm xem bói bài Tarot trực tuyến với hiệu ứng lật bài 3D sống động và luận giải AI cá nhân hóa.',
    type: 'website'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full bg-[#080708] antialiased">
      <body className="min-h-full flex flex-col bg-[#080708] text-[#F3E7D3]">
        {children}
      </body>
    </html>
  );
}
