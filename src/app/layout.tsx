import type { Metadata } from 'next';
import { Cormorant_Garamond, Mulish } from 'next/font/google';
import './globals.css';

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const mulish = Mulish({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-mulish',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Trạm Tarot – Dừng một chút, hiểu mình hơn.',
  description: 'Trạm Tarot là điểm dừng chân lắng đọng để bạn kết nối lại với chính mình qua 78 lá bài Tarot chuẩn Rider-Waite và những lời luận giải ấm áp, thấu cảm.',
  keywords: ['trạm tarot', 'dừng một chút hiểu mình hơn', 'bói bài tarot', 'tarot online', 'tarot ai', 'rider waite', 'trải bài tarot'],
  icons: {
    icon: '/logo/logo_icon.png',
    shortcut: '/logo/logo_icon.png',
    apple: '/logo/logo_icon.png',
  },
  openGraph: {
    title: 'Trạm Tarot – Dừng một chút, hiểu mình hơn.',
    description: 'Trạm dừng chân chiêm nghiệm nội tâm với 78 lá bài Tarot trực tuyến, trải nghiệm lật bài 3D sống động và luận giải thấu cảm.',
    type: 'website'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`h-full bg-[#080708] antialiased ${cormorantGaramond.variable} ${mulish.variable}`}>
      <body className="min-h-full flex flex-col bg-[#080708] text-[#EEE6D8]">
        {children}
      </body>
    </html>
  );
}

