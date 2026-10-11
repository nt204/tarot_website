'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PRICING_PACKAGES } from '@/data/pricingData';
import { PaymentModal } from '@/components/PaymentModal';
import { Order } from '@/types/business';

interface DeepReadingPaywallCardProps {
  readingId?: string;
  isUnlocked?: boolean;
  onUnlocked?: (order: Order) => void;
  question?: string;
}

export const DeepReadingPaywallCard: React.FC<DeepReadingPaywallCardProps> = ({
  readingId,
  isUnlocked = false,
  onUnlocked,
  question
}) => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const deepPkg = PRICING_PACKAGES.find((p) => p.id === 'deep') || PRICING_PACKAGES[1];

  if (isUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 p-5 sm:p-7 rounded-2xl bg-[#14101A] border-2 border-[#C9A85C] space-y-4 shadow-[0_0_30px_rgba(201,168,92,0.15)]"
      >
        <div className="flex items-center justify-between border-b border-[#34291E] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[#C9A85C] text-lg">✦</span>
            <span className="font-heading text-sm sm:text-base text-[#DEC078] font-semibold uppercase tracking-wider">
              Bản phân tích chuyên sâu đã mở khóa
            </span>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-[#C9A85C]/20 text-[#DEC078] border border-[#C9A85C]/40">
            VIP ACTIVE
          </span>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-[#EEE6D8] leading-relaxed">
          <p className="text-[#DEC078] font-medium">
            Phân tích đa chiều dựa trên câu chuyện: &ldquo;{question || 'Câu hỏi của bạn'}&rdquo;
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-[#0D0B10] rounded-xl border border-[#2B231B] space-y-1">
              <span className="text-[#C9A85C] font-semibold text-xs block">
                1. Mối liên kết 3 chiều của trải bài
              </span>
              <p className="text-[#A6998A] text-xs">
                Sợi dây kết nối giữa các lá bài cho thấy mâu thuẫn cốt lõi đang xuất phát từ việc bạn kỳ vọng quá nhanh vào một kết quả mà chưa kịp cho nội tâm mình không gian thích nghi.
              </p>
            </div>
            <div className="p-3 bg-[#0D0B10] rounded-xl border border-[#2B231B] space-y-1">
              <span className="text-[#C9A85C] font-semibold text-xs block">
                2. Hướng hành động trong 7 ngày tới
              </span>
              <p className="text-[#A6998A] text-xs">
                Hãy dành 2 ngày đầu để ghi chép lại các điểm nghẽn mà không phán xét. Đưa ra 1 quyết định nhỏ cụ thể vào giữa tuần thay vì ôm đồm mọi việc cùng lúc.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-[11px] text-[#A6998A]">
          <span>Phiên trải bài đã được lưu vào lịch sử tài khoản của bạn.</span>
          <button
            onClick={() => window.print()}
            className="px-3 py-1 rounded bg-[#1D1724] border border-[#3A2F22] hover:text-[#DEC078] transition-colors"
          >
            Xuất kết quả / In
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#16111C] to-[#0E0C12] border border-[#3D3020] hover:border-[#C9A85C]/60 transition-all shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[#C9A85C] text-sm">✦</span>
              <span className="font-heading text-xs uppercase tracking-wider text-[#C9A85C] font-semibold">
                Nâng cấp trải nghiệm
              </span>
            </div>
            <h4 className="font-heading text-lg sm:text-xl text-[#EEE6D8]">
              Mở khóa Phân tích Chuyên sâu & Hướng hành động
            </h4>
            <p className="text-xs text-[#A6998A] max-w-xl">
              Nhận góc nhìn sắc sảo hơn bám sát câu chuyện bạn chia sẻ, liên kết 3 lá bài theo trục thời gian và gợi ý giải pháp thực tế.
            </p>
          </div>

          <div className="text-left sm:text-right flex-shrink-0">
            <div className="font-heading text-2xl text-[#C9A85C] font-semibold">29.000 đ</div>
            <span className="text-[10px] text-[#8E7E6E] uppercase tracking-wider">Mỗi lượt trải bài</span>
          </div>
        </div>

        {/* Feature bullets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#251E18] text-xs text-[#C5B8A8]">
          <div className="flex items-center gap-2">
            <span className="text-[#C9A85C]">✓</span>
            <span>Phân tích theo bối cảnh riêng</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#C9A85C]">✓</span>
            <span>Kế hoạch hành động 7 ngày</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#C9A85C]">✓</span>
            <span>Lưu & tra cứu kết quả</span>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2">
          <button
            onClick={() => setIsPaymentOpen(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#C9A85C] via-[#DEC078] to-[#C9A85C] text-[#0A080C] font-heading text-xs font-semibold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(201,168,92,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <span>Mở khóa bản chuyên sâu (29.000 đ)</span>
            <span>→</span>
          </button>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        packageItem={deepPkg}
        readingId={readingId}
        onPaymentSuccess={(order) => {
          if (onUnlocked) onUnlocked(order);
        }}
      />
    </>
  );
};
