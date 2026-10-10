'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { TarotTable } from '@/components/TarotTable';
import { CardCatalogModal } from '@/components/CardCatalogModal';

export default function Home() {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const scrollToTable = () => {
    const el = document.getElementById('tarot-table');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#080708] text-[#F3E7D3] flex flex-col selection:bg-[#D4AF37]/30 selection:text-[#F3E7D3]">
      {/* 1. Header */}
      <Header
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onScrollToTable={scrollToTable}
      />

      {/* 2. Hero Section (Design matched with reference screenshot) */}
      <HeroSection onStartReading={scrollToTable} />

      {/* 3. Main Interactive Reading Board */}
      <main className="flex-1 w-full">
        <TarotTable />

        {/* 4. Section: Giới thiệu các kiểu trải bài */}
        <section id="spreads" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#221D17]">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-serif">
              ✦ CÁC THỂ THỨC TRẢI BÀI ✦
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F3E7D3]">
              Lựa Chọn Kiểu Trải Bài Phù Hợp
            </h2>
            <p className="text-sm text-[#A89885] max-w-xl mx-auto">
              Mỗi kiểu trải bài mang một cấu trúc năng lượng riêng biệt, giúp bạn tiếp cận câu trả lời từ nhiều góc độ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Spread 1: Một lá hôm nay */}
            <div className="p-8 rounded-2xl bg-[#121014] border border-[#3A3226] space-y-4 hover:border-[#D4AF37] transition-all">
              <span className="w-10 h-10 rounded-full bg-[#2A2216] text-[#D4AF37] flex items-center justify-center font-serif text-lg font-bold border border-[#7C6339]">
                1
              </span>
              <h3 className="font-serif text-xl font-bold text-[#F3E7D3]">
                Một Lá Hôm Nay (Daily Focus)
              </h3>
              <p className="text-xs sm:text-sm text-[#B3A492] leading-relaxed">
                Rút 1 lá bài duy nhất để cảm nhận dòng chảy năng lượng chủ đạo trong ngày. Lá bài này cố định cho mỗi người dùng trong ngày (theo múi giờ Việt Nam), giúp bạn giữ tâm thế an tĩnh và định hướng hành vi đúng đắn.
              </p>
              <ul className="text-xs text-[#A89885] space-y-1.5 pt-2 border-t border-[#221D17]">
                <li>✦ Vị trí: Điều nên chú ý hôm nay</li>
                <li>✦ Tự động lưu giữ kết quả khi tải lại trang</li>
              </ul>
            </div>

            {/* Spread 2: Ba lá định hướng */}
            <div className="p-8 rounded-2xl bg-[#121014] border border-[#3A3226] space-y-4 hover:border-[#D4AF37] transition-all">
              <span className="w-10 h-10 rounded-full bg-[#2A2216] text-[#D4AF37] flex items-center justify-center font-serif text-lg font-bold border border-[#7C6339]">
                3
              </span>
              <h3 className="font-serif text-xl font-bold text-[#F3E7D3]">
                Ba Lá Định Hướng (3-Card Guidance)
              </h3>
              <p className="text-xs sm:text-sm text-[#B3A492] leading-relaxed">
                Mô hình giải quyết vấn đề 3 chiều kinh điển: phân tích hoàn cảnh hiện tại, nhận diện điểm mù/trở ngại cần cẩn trọng và gợi mở hành động đột phá tiếp theo.
              </p>
              <ul className="text-xs text-[#A89885] space-y-1.5 pt-2 border-t border-[#221D17]">
                <li>✦ Lá 1: Năng lượng hiện tại bạn đang đối diện</li>
                <li>✦ Lá 2: Trở ngại tiềm ẩn hoặc điểm cần lưu tâm</li>
                <li>✦ Lá 3: Hướng hành động mang lại kết quả tích cực</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. Section: Đạo Đức & Nguyên Tắc Xem Tarot */}
        <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0C0B0E] border-t border-[#221D17]">
          <div className="max-w-4xl mx-auto space-y-8 text-center">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-serif">
              ✦ TRIẾT LÝ TAROT CHÂN CHÍNH ✦
            </span>
            <h2 className="text-3xl font-serif font-bold text-[#F3E7D3]">
              Tarot Là Tấm Gương Phản Chiếu Tâm Trí
            </h2>
            <div className="text-sm text-[#B3A492] leading-relaxed space-y-4 text-justify font-sans">
              <p>
                Tại <strong>TarotReader.me</strong>, chúng tôi xem Tarot như một công cụ chiêm nghiệm tâm lý học chiều sâu và thấu thị bản thân, thay vì bói toán định mệnh cố định. Tương lai luôn nằm trong tay bạn qua từng lựa chọn ở hiện tại.
              </p>
              <p>
                <strong>Nguyên tắc đạo đức của hệ thống:</strong>
                <br />
                • <strong>Không bói trộm suy nghĩ người khác:</strong> Khi bạn hỏi về cảm xúc của ai đó, hệ thống và AI sẽ luôn hướng bạn trở về tự nhận thức cảm xúc và ranh giới lành mạnh của chính mình.
                <br />
                • <strong>Lá bài ngược không phải là xui xẻo:</strong> Năng lượng ngược phản ánh sự nghẽn lại, cần soi xét nội tâm sâu hơn trước khi bộc lộ ra bên ngoài.
                <br />
                • <strong>Quyền tự quyết:</strong> Mọi thông điệp từ lá bài và AI chỉ mang tính chất tham vấn và gợi mở tư duy, không thay thế cho quyết định pháp lý, y tế hoặc chuyên gia tâm lý.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Section: FAQ */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-[#221D17]">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-serif">
              ✦ GIẢI ĐÁP THẮC MẮC ✦
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F3E7D3]">
              Câu Hỏi Thường Gặp
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            {[
              {
                q: 'Website có thu phí xem bài không?',
                a: 'Hoàn toàn miễn phí 100%! Bạn có thể rút bài, đọc nghĩa cơ bản và trải nghiệm luận giải cùng AI mà không mất bất kỳ khoản phí nào.'
              },
              {
                q: 'Nếu không có kết nối AI, tôi vẫn xem bài được chứ?',
                a: 'Chắc chắn rồi! Hệ thống hoạt động theo Mô hình Lai (Hybrid). Toàn bộ 78 lá bài đã được dịch sẵn dữ liệu tiếng Việt chuyên sâu trong cơ sở dữ liệu. Bạn có thể đọc nghĩa đầy đủ ngay lập tức với tốc độ 0ms.'
              },
              {
                q: 'Khi tôi tải lại trang (reload), các lá bài có bị mất không?',
                a: 'Không. Phiên trải bài được lưu trữ trên server với ID định danh riêng. Khi reload hoặc truy cập lại, các lá bài, chiều xuôi/ngược và luận giải đều được giữ nguyên vẹn.'
              }
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-xl bg-[#121014] border border-[#2B231C]">
                <h4 className="font-serif font-bold text-[#D4AF37] mb-2 text-sm sm:text-base">
                  {faq.q}
                </h4>
                <p className="text-[#B3A492] leading-relaxed font-sans">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <footer className="w-full py-8 border-t border-[#221D17] bg-[#060506] text-center text-xs text-[#8C7A65] space-y-2">
        <p className="font-serif tracking-widest uppercase text-[#B3A492]">
          ✦ TAROTREADER.ME – KẾT NỐI NĂNG LƯỢNG VŨ TRỤ ✦
        </p>
        <p>© 2026 Tarot Reader Web. Bộ bài chuẩn Rider-Waite-Smith 78 Cards. Tích hợp AI Gemini 3.7 Flash.</p>
      </footer>

      {/* 8. Bách khoa toàn thư Modal */}
      <CardCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
      />
    </div>
  );
}
