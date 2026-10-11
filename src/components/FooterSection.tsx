'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface FooterSectionProps {
  onOpenCatalog?: () => void;
  onScrollToTable?: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ onOpenCatalog, onScrollToTable }) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  const scrollToSection = (id: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#060507] border-t border-[#1F1914] text-[#BDB4A8] font-body text-sm pt-14 pb-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-7xl mx-auto space-y-10"
      >
        {/* Desktop 3 Cột: Thương hiệu bên trái, Trải bài ở giữa, Khám phá bên phải */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Cột 1: Thương hiệu và Email (bên trái) */}
          <div className="md:col-span-6 lg:col-span-5 space-y-3.5 text-left">
            <a href="/" className="inline-flex items-center gap-3.5 group cursor-pointer">
              <img
                src="/logo/logo_icon.png"
                alt="Logo Trạm Tarot"
                className="h-12 sm:h-14 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-[0_0_12px_rgba(201,168,92,0.35)]"
              />
              <span className="font-heading tracking-[0.08em] text-2xl sm:text-[26px] font-normal text-[#EEE6D8] group-hover:text-[#C9A85C] transition-colors">
                Trạm Tarot
              </span>
              <span className="text-[#C9A85C] text-sm">✦</span>
            </a>

            <p className="text-[#C9A85C] font-heading text-base italic">
              Dừng một chút, hiểu mình hơn.
            </p>

            <p className="text-[15px] leading-relaxed text-[#BDB4A8] max-w-md font-body">
              Khám phá góc nhìn mới về bản thân và những lựa chọn qua 78 lá bài Tarot.
            </p>

            <div className="pt-1 text-sm text-[#8C7A65]">
              <span>Liên hệ: </span>
              <a
                href="mailto:support@tramtarot.vn"
                className="text-[#EEE6D8] hover:text-[#C9A85C] underline underline-offset-4 transition-colors"
              >
                support@tramtarot.vn
              </a>
            </div>
          </div>

          {/* Cột 2: Trải bài (ở giữa) */}
          <div className="md:col-span-3 lg:col-span-3 space-y-3 text-left">
            <h4 className="font-heading text-lg font-normal text-[#EEE6D8] tracking-[0.05em] uppercase">
              Trải bài
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={onScrollToTable ? onScrollToTable : () => scrollToSection('tarot-table')}
                  className="hover:text-[#C9A85C] transition-colors cursor-pointer text-left"
                >
                  Tarot 3 lá
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onScrollToTable ? onScrollToTable : () => scrollToSection('tarot-table')}
                  className="hover:text-[#C9A85C] transition-colors cursor-pointer text-left"
                >
                  Thông điệp hôm nay
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('topics')}
                  className="hover:text-[#C9A85C] transition-colors cursor-pointer text-left"
                >
                  Tình cảm
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('topics')}
                  className="hover:text-[#C9A85C] transition-colors cursor-pointer text-left"
                >
                  Công việc
                </button>
              </li>
            </ul>
          </div>

          {/* Cột 3: Khám phá (bên phải) */}
          <div className="md:col-span-3 lg:col-span-4 space-y-3 text-left">
            <h4 className="font-heading text-lg font-normal text-[#EEE6D8] tracking-[0.05em] uppercase">
              Khám phá
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={onOpenCatalog ? onOpenCatalog : () => scrollToSection('about-tarot')}
                  className="hover:text-[#C9A85C] transition-colors cursor-pointer text-left"
                >
                  Ý nghĩa 78 lá bài
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('about-tarot')}
                  className="hover:text-[#C9A85C] transition-colors cursor-pointer text-left"
                >
                  Về Tarot
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('faq')}
                  className="hover:text-[#C9A85C] transition-colors cursor-pointer text-left"
                >
                  Câu hỏi thường gặp
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Dòng bản quyền nằm riêng bên dưới */}
        <div className="pt-8 border-t border-[#1C1612] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C7A65] gap-3">
          <p>© 2026 Trạm Tarot</p>
          <div className="flex items-center gap-3">
            <span>·</span>
            <button
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="hover:text-[#C9A85C] transition-colors cursor-pointer"
            >
              Chính sách riêng tư
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setActiveModal('terms')}
              className="hover:text-[#C9A85C] transition-colors cursor-pointer"
            >
              Điều khoản sử dụng
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modal Chính sách riêng tư & Điều khoản sử dụng */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-lg bg-[#0E0C10] border border-[#3A3022] rounded-xl p-6 sm:p-8 space-y-4 text-left shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1A161E] border border-[#3A3022] text-[#BDB4A8] hover:text-[#EEE6D8] flex items-center justify-center transition-colors"
              aria-label="Đóng"
            >
              ✕
            </button>

            {activeModal === 'privacy' ? (
              <>
                <h3 className="font-heading text-xl text-[#C9A85C] tracking-wide">
                  Chính sách riêng tư
                </h3>
                <div className="space-y-3 text-xs sm:text-sm text-[#BDB4A8] leading-relaxed">
                  <p>
                    Tại <strong>Trạm Tarot</strong>, chúng tôi tôn trọng tuyệt đối quyền riêng tư và những bộc bạch nội tâm của bạn.
                  </p>
                  <p>
                    • <strong>Bảo mật câu hỏi:</strong> Tất cả câu hỏi và nội dung bạn nhập trong phiên trải bài được xử lý trực tiếp để tạo lời luận giải và không được lưu trữ nhằm mục đích thương mại.
                  </p>
                  <p>
                    • <strong>Dữ liệu cá nhân:</strong> Chúng tôi không yêu cầu cung cấp số điện thoại, tài khoản mạng xã hội hay thông tin nhạy cảm để sử dụng dịch vụ.
                  </p>
                  <p>
                    Mọi thắc mắc về quyền riêng tư, vui lòng gửi thư về: <a href="mailto:support@tramtarot.vn" className="text-[#C9A85C] underline">support@tramtarot.vn</a>.
                  </p>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-heading text-xl text-[#C9A85C] tracking-wide">
                  Điều khoản sử dụng
                </h3>
                <div className="space-y-3 text-xs sm:text-sm text-[#BDB4A8] leading-relaxed">
                  <p>
                    Chào mừng bạn đến với <strong>Trạm Tarot</strong>. Khi sử dụng trang web, bạn đồng ý với các nguyên tắc sau:
                  </p>
                  <p>
                    • <strong>Mục đích chiêm nghiệm:</strong> Thông điệp từ các lá bài mang tính chất gợi mở góc nhìn, hỗ trợ suy ngẫm nội tâm và tinh thần tích cực.
                  </p>
                  <p>
                    • <strong>Quyền tự quyết:</strong> Tarot không thay thế cho các lời khuyên chuyên môn về y tế, pháp lý hay tài chính. Mọi quyết định trong cuộc sống luôn thuộc về sự chủ động của bạn.
                  </p>
                  <p>
                    • <strong>Tôn trọng cộng đồng:</strong> Vui lòng giữ tinh thần lành mạnh, văn minh khi sử dụng nền tảng.
                  </p>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-[#231C16] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-white text-black hover:bg-[#C9A85C] hover:text-[#080708] rounded text-xs font-medium uppercase tracking-wider transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
