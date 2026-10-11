'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PRICING_PACKAGES } from '@/data/pricingData';
import { PaymentModal } from '@/components/PaymentModal';
import { Order } from '@/types/business';

interface VipExtendCardProps {
  readingId?: string;
  isVipUnlocked?: boolean;
  onVipUnlocked?: (order: Order) => void;
  onStartPickExtraCards: () => void;
  isExtending?: boolean;
}

export const VipExtendCard: React.FC<VipExtendCardProps> = ({
  readingId,
  isVipUnlocked = false,
  onVipUnlocked,
  onStartPickExtraCards,
  isExtending = false
}) => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const deepPkg = PRICING_PACKAGES.find((p) => p.id === 'deep') || PRICING_PACKAGES[1];

  const handleCtaClick = () => {
    if (isVipUnlocked) {
      onStartPickExtraCards();
    } else {
      setIsPaymentOpen(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 rounded-2xl bg-[#0D0B10] border border-[#2B231B] p-6 sm:p-9 shadow-2xl relative overflow-hidden text-center sm:text-left space-y-7"
      >
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C9A85C]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header banner */}
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C9A85C] font-heading font-semibold block">
            ✦ HÀNH TRÌNH CHƯA DỪNG LẠI ✦
          </span>
          <h3 className="font-heading text-2xl sm:text-3xl text-[#EEE6D8] font-normal leading-tight">
            Ba lá bài đã kể một phần câu chuyện.
          </h3>
          <p className="text-xs sm:text-sm text-[#A6998A] font-light leading-relaxed">
            Nếu bạn muốn nhìn vấn đề từ những góc độ khác, hãy mở rộng trải bài với hai lá bổ sung.
          </p>
        </div>

        {/* Visual 5 Cards Representation: I, II, III (sáng) & IV, V (úp / khóa) */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-4 py-2">
          {/* Lá 1 - Đã mở */}
          <div className="w-14 sm:w-18 h-22 sm:h-28 rounded-lg bg-[#151219] border border-[#C9A85C]/50 flex flex-col items-center justify-between p-2 shadow-md">
            <span className="text-[#C9A85C] text-xs">☼</span>
            <span className="font-heading text-xs sm:text-sm text-[#EEE6D8] font-medium">I</span>
            <span className="text-[9px] text-[#8E7E6E] hidden sm:block">Hiện tại</span>
          </div>

          {/* Lá 2 - Đã mở */}
          <div className="w-14 sm:w-18 h-22 sm:h-28 rounded-lg bg-[#151219] border border-[#C9A85C]/50 flex flex-col items-center justify-between p-2 shadow-md">
            <span className="text-[#C9A85C] text-xs">☼</span>
            <span className="font-heading text-xs sm:text-sm text-[#EEE6D8] font-medium">II</span>
            <span className="text-[9px] text-[#8E7E6E] hidden sm:block">Chú ý</span>
          </div>

          {/* Lá 3 - Đã mở */}
          <div className="w-14 sm:w-18 h-22 sm:h-28 rounded-lg bg-[#151219] border border-[#C9A85C]/50 flex flex-col items-center justify-between p-2 shadow-md">
            <span className="text-[#C9A85C] text-xs">☼</span>
            <span className="font-heading text-xs sm:text-sm text-[#EEE6D8] font-medium">III</span>
            <span className="text-[9px] text-[#8E7E6E] hidden sm:block">Hành động</span>
          </div>

          {/* Dấu phân cách nhẹ */}
          <div className="w-[1px] h-14 bg-[#2D241C]" />

          {/* Lá 4 - Khóa VIP */}
          <div className="w-14 sm:w-18 h-22 sm:h-28 rounded-lg bg-gradient-to-b from-[#1C1622] to-[#110D16] border border-dashed border-[#C9A85C]/70 flex flex-col items-center justify-between p-2 shadow-[0_0_15px_rgba(201,168,92,0.1)] relative group">
            <span className="text-[#DEC078] text-xs">🔒</span>
            <span className="font-heading text-xs sm:text-sm text-[#DEC078] font-bold">IV</span>
            <span className="text-[8px] text-[#C9A85C] font-mono">✦ VIP</span>
          </div>

          {/* Lá 5 - Khóa VIP */}
          <div className="w-14 sm:w-18 h-22 sm:h-28 rounded-lg bg-gradient-to-b from-[#1C1622] to-[#110D16] border border-dashed border-[#C9A85C]/70 flex flex-col items-center justify-between p-2 shadow-[0_0_15px_rgba(201,168,92,0.1)] relative group">
            <span className="text-[#DEC078] text-xs">🔒</span>
            <span className="font-heading text-xs sm:text-sm text-[#DEC078] font-bold">V</span>
            <span className="text-[8px] text-[#C9A85C] font-mono">✦ VIP</span>
          </div>
        </div>

        {/* Mô tả ý nghĩa 2 lá mở rộng */}
        <div className="max-w-xl mx-auto space-y-2 text-left bg-[#130F17] p-3.5 sm:p-4 rounded-xl border border-[#251D17]">
          <div className="flex items-start gap-2.5 text-xs sm:text-sm text-[#EEE6D8]">
            <span className="text-[#C9A85C] shrink-0 mt-0.5">✧</span>
            <div>
              <strong className="text-[#DEC078]">Lá thứ 4 · Điều bạn chưa xem xét:</strong>{' '}
              <span className="text-[#A6998A]">Gợi mở điểm mù hoặc yếu tố ẩn giấu bạn có thể đang vô tình bỏ qua.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5 text-xs sm:text-sm text-[#EEE6D8]">
            <span className="text-[#C9A85C] shrink-0 mt-0.5">✧</span>
            <div>
              <strong className="text-[#DEC078]">Lá thứ 5 · Một góc nhìn khác để tiến về phía trước:</strong>{' '}
              <span className="text-[#A6998A]">Chỉ ra lựa chọn mới và động lực để bạn tự tin giải phóng bế tắc.</span>
            </div>
          </div>
        </div>

        {/* CTA Callout */}
        <div className="text-center space-y-3 pt-1">
          <h4 className="font-heading text-lg sm:text-xl text-[#EEE6D8] font-medium">
            Mở rộng trải bài với VIP
          </h4>
          <p className="text-xs sm:text-sm text-[#A6998A] max-w-lg mx-auto">
            Không cần bắt đầu lại. Giữ nguyên 3 lá đã rút và tự tay chọn thêm 2 lá mới từ bộ bài.
          </p>

          <div className="pt-2 max-w-md mx-auto">
            <button
              onClick={handleCtaClick}
              disabled={isExtending}
              className="w-full py-3.5 sm:py-4 px-6 rounded-xl font-heading text-sm sm:text-base font-semibold tracking-wide uppercase bg-gradient-to-r from-[#C9A85C] via-[#DEC078] to-[#C9A85C] text-[#0A080C] hover:shadow-[0_0_25px_rgba(201,168,92,0.45)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isExtending ? 'Đang chuẩn bị bộ bài...' : 'Khám phá thêm 2 lá · VIP'}</span>
              <span>→</span>
            </button>
            <p className="text-[11px] text-[#7C6C5C] mt-2">
              {isVipUnlocked
                ? '✦ Quyền lợi VIP đã kích hoạt. Bấm để tự tay rút 2 lá bổ sung ngay.'
                : 'Quyền lợi áp dụng theo gói VIP của bạn (Chỉ 29.000 đ / lượt)'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Modal thanh toán nếu chưa kích hoạt VIP */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        packageItem={deepPkg}
        readingId={readingId}
        onPaymentSuccess={(order) => {
          if (onVipUnlocked) onVipUnlocked(order);
          setIsPaymentOpen(false);
          // Ngay sau thanh toán, kích hoạt rút 2 lá thêm
          onStartPickExtraCards();
        }}
      />
    </>
  );
};
