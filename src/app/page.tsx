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
      {/* 1. Header tinh gọn */}
      <Header
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onScrollToTable={scrollToTable}
      />

      {/* 2. Hero Section: ngắn, sâu sắc, giữ vòng tròn chiêm tinh */}
      <HeroSection onStartReading={scrollToTable} />

      {/* 3. Khu vực trải bài tương tác */}
      <main className="flex-1 w-full">
        <TarotTable />

        {/* 4. Hướng dẫn ba bước đơn giản */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-[#201B15]">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F3E7D3]">
              Ba bước cho một buổi trải bài
            </h2>
            <p className="text-xs sm:text-sm text-[#8C7A65]">
              Dành một chút thời gian tĩnh lặng để kết nối với chính mình.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-[#121014] border border-[#2B231C] space-y-3">
              <span className="text-xs font-serif text-[#D4AF37] tracking-widest uppercase block">
                Bước 01
              </span>
              <h3 className="font-serif text-lg font-bold text-[#F3E7D3]">
                Đặt câu hỏi
              </h3>
              <p className="text-xs text-[#B3A492] leading-relaxed">
                Nghĩ về điều bạn đang băn khoăn nhất. Một câu hỏi rõ ràng sẽ giúp thông điệp trở nên sâu sắc và có trọng tâm hơn.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#121014] border border-[#2B231C] space-y-3">
              <span className="text-xs font-serif text-[#D4AF37] tracking-widest uppercase block">
                Bước 02
              </span>
              <h3 className="font-serif text-lg font-bold text-[#F3E7D3]">
                Chọn bài
              </h3>
              <p className="text-xs text-[#B3A492] leading-relaxed">
                Lắng lại vài giây trong lúc xào bài, sau đó dùng trực giác để chọn những lá bài bạn cảm thấy thu hút nhất.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#121014] border border-[#2B231C] space-y-3">
              <span className="text-xs font-serif text-[#D4AF37] tracking-widest uppercase block">
                Bước 03
              </span>
              <h3 className="font-serif text-lg font-bold text-[#F3E7D3]">
                Đọc thông điệp
              </h3>
              <p className="text-xs text-[#B3A492] leading-relaxed">
                Khám phá ý nghĩa từng lá bài, sự liên kết giữa chúng và những gợi ý hành động thiết thực cho bước đi tiếp theo.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Một khoảng lặng về Tarot (nhẹ nhàng, không hành chính) */}
        <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0C0B0E] border-t border-[#201B15]">
          <div className="max-w-3xl mx-auto space-y-4 text-center">
            <h2 className="text-2xl font-serif font-bold text-[#F3E7D3]">
              Tarot là tấm gương soi chiếu nội tâm
            </h2>
            <p className="text-xs sm:text-sm text-[#B3A492] leading-relaxed font-sans">
              Tarot không định đoạt tương lai hay thay thế cho những quyết định của bạn. Mỗi lá bài mở ra như một góc nhìn đa chiều, giúp bạn nhận diện những điểm mù, thấu suốt cảm xúc thật và tìm thấy sự bình an để bước tiếp.
            </p>
          </div>
        </section>

        {/* 6. FAQ thu gọn thực tế */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto border-t border-[#201B15]">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl font-serif font-bold text-[#F3E7D3]">
              Những điều bạn có thể thắc mắc
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Tôi nên đặt câu hỏi như thế nào?',
                a: 'Hãy đặt câu hỏi mở và tập trung vào chính bạn, ví dụ: “Tôi nên chú ý điều gì lúc này?” hoặc “Tôi có thể làm gì để cải thiện tình hình?”. Tránh các câu hỏi đóng Có/Không để nhận được góc nhìn sâu sắc hơn.'
              },
              {
                q: 'Tôi có cần biết Tarot trước khi xem không?',
                a: 'Không cần. Mọi lá bài đều có tên gọi, biểu tượng và phần diễn giải chi tiết bằng tiếng Việt để bạn có thể dễ dàng cảm nhận và liên hệ với câu chuyện của mình.'
              },
              {
                q: 'Lá bài ngược có phải là điềm xấu không?',
                a: 'Không. Trong Tarot, lá bài ngược thường chỉ ra nguồn năng lượng đang bị trì trệ, sự chậm lại cần thiết, hoặc lời nhắc nhở bạn nên nhìn sâu vào nội tâm thay vì vội vã hành động.'
              },
              {
                q: 'Tôi có thể xem lại trải bài của mình không?',
                a: 'Có. Phiên trải bài của bạn được lưu lại an toàn trên hệ thống. Khi tải lại trang hoặc quay lại, bạn vẫn có thể xem lại đầy đủ các lá bài và phần luận giải cũ.'
              },
              {
                q: 'Phần luận giải được tạo như thế nào?',
                a: 'Phần luận giải được tạo tự động từ ý nghĩa các lá bài, vị trí trong trải bài và thông tin bạn chia sẻ, kết hợp mô hình phân tích ngôn ngữ để đưa ra câu trả lời sát với hoàn cảnh của bạn nhất.'
              }
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-xl bg-[#121014] border border-[#26201B] space-y-1.5">
                <h4 className="font-serif font-bold text-[#D4AF37] text-sm">
                  {faq.q}
                </h4>
                <p className="text-xs text-[#B3A492] leading-relaxed font-sans">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 7. Footer tinh giản */}
      <footer className="w-full py-8 border-t border-[#201B15] bg-[#060506] text-center text-xs text-[#7A6B5B] space-y-2">
        <p className="font-serif tracking-widest uppercase text-[#A89885]">
          TAROT READER
        </p>
        <p>© 2026 Tarot Reader. Bộ bài chuẩn Rider-Waite 78 lá.</p>
      </footer>

      {/* 8. Bách khoa toàn thư Modal */}
      <CardCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
      />
    </div>
  );
}
