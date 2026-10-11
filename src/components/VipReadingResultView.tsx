'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DrawnCard, VipExtensionResult } from '@/types/tarot';

interface VipReadingResultViewProps {
  vipResult: VipExtensionResult;
  vipCards: DrawnCard[]; // 2 lá bổ sung (lá 4 & lá 5)
}

export const VipReadingResultView: React.FC<VipReadingResultViewProps> = ({
  vipResult,
  vipCards
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mt-12 rounded-3xl bg-gradient-to-b from-[#16111C] via-[#0F0D14] to-[#0A080E] border-2 border-[#C9A85C] p-6 sm:p-10 lg:p-12 shadow-[0_0_50px_rgba(201,168,92,0.2)] text-left space-y-9 relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/3 w-[500px] h-[300px] bg-[#C9A85C]/8 blur-[100px] rounded-full pointer-events-none" />

      {/* Header VIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#35291E] gap-4 relative z-10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[#C9A85C] text-sm">✦</span>
            <span className="text-xs font-heading font-semibold uppercase tracking-[0.25em] text-[#C9A85C]">
              PHẦN MỞ RỘNG · VIP ĐẶC QUYỀN
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-heading text-[#EEE6D8] font-normal">
            {vipResult.extension_headline}
          </h3>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A85C]/15 border border-[#C9A85C]/40 text-[#DEC078] text-xs font-mono font-medium self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>TRẢI BÀI 5 LÁ TOÀN CẢNH</span>
        </div>
      </div>

      {/* 2 Lá bài mới (Lá 4 & Lá 5) hiển thị trực quan */}
      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-[#C9A85C]">✧</span>
          <h4 className="text-sm uppercase tracking-wider font-heading text-[#DEC078] font-semibold">
            Hai góc nhìn mới được hé mở
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {vipResult.new_card_readings.map((reading, idx) => {
            const cardObj = vipCards[idx]?.card;
            const orientation = vipCards[idx]?.orientation;
            const isUp = orientation === 'upright';

            return (
              <div
                key={reading.card_id || idx}
                className="p-5 sm:p-6 rounded-2xl bg-[#120E17] border border-[#35291E] hover:border-[#C9A85C]/60 transition-all space-y-4 shadow-md flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  {/* Ảnh thu nhỏ của lá bài nếu có */}
                  {cardObj && (
                    <div className="w-16 sm:w-20 h-24 sm:h-30 rounded-lg overflow-hidden border border-[#523F27] shrink-0 bg-[#0A080C] shadow-md">
                      <img
                        src={cardObj.image}
                        alt={cardObj.name_vi}
                        className={`w-full h-full object-cover ${!isUp ? 'rotate-180' : ''}`}
                      />
                    </div>
                  )}

                  <div className="space-y-1 flex-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#C9A85C] font-heading font-semibold block">
                      {idx === 0 ? 'Lá thứ 4 · Điều bạn chưa xem xét' : 'Lá thứ 5 · Góc nhìn mới tiến lên'}
                    </span>
                    <h5 className="font-heading text-lg sm:text-xl text-[#EEE6D8]">
                      {cardObj?.name_vi || reading.card_name}
                    </h5>
                    <span className="text-xs text-[#8C7A65] block">
                      {isUp ? 'Chiều xuôi (Upright)' : 'Chiều ngược (Reversed)'}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#DDD2C4] leading-relaxed pt-2 border-t border-[#231A14]">
                  {reading.interpretation}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Khi cả 5 lá cùng lên tiếng (Expanded Synthesis) */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#14101A] border-l-4 border-[#C9A85C] border-y border-r border-[#2C2117] space-y-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-[#C9A85C] text-sm">✦</span>
          <h4 className="text-xs uppercase tracking-widest text-[#C9A85C] font-heading font-semibold">
            Khi cả năm lá cùng lên tiếng
          </h4>
        </div>
        <p className="text-sm sm:text-[15px] text-[#EEE6D8] font-body leading-relaxed">
          {vipResult.expanded_synthesis}
        </p>
      </div>

      {/* Hai góc nhìn đúc kết mới (New Insights) */}
      {vipResult.new_insights && vipResult.new_insights.length > 0 && (
        <div className="space-y-3 relative z-10">
          <span className="text-xs uppercase tracking-wider text-[#DEC078] font-heading font-semibold block">
            Điểm tựa nhận thức mở rộng
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vipResult.new_insights.map((insight, iIdx) => (
              <div
                key={iIdx}
                className="p-4 rounded-xl bg-[#110D15] border border-[#2B2117] text-xs sm:text-sm text-[#C5B8A8] flex items-start gap-2.5"
              >
                <span className="text-[#C9A85C] mt-0.5">✧</span>
                <span className="leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ba điều bạn có thể thử tiếp theo (VIP Actions) */}
      <div className="space-y-3 relative z-10">
        <span className="text-xs uppercase tracking-widest text-[#C9A85C] font-heading font-semibold block">
          Ba điều bạn có thể thử tiếp theo
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {vipResult.actions.map((act, aIdx) => (
            <div
              key={aIdx}
              className="p-4 rounded-xl bg-[#110E16] border border-[#2B2319] space-y-2 hover:border-[#C9A85C]/40 transition-colors"
            >
              <span className="font-heading text-xs font-semibold text-[#C9A85C] block">
                Gợi ý 0{aIdx + 1}
              </span>
              <p className="text-xs text-[#DDD2C4] leading-relaxed">
                {act}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Câu hỏi suy ngẫm dài hạn */}
      {vipResult.reflection_question && (
        <div className="p-5 rounded-2xl bg-[#0F0C14] border border-[#2B2117] text-center space-y-1.5 relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-[#C9A85C] font-heading block">
            Câu hỏi soi chiếu dài hạn
          </span>
          <p className="text-sm sm:text-base text-[#EEE6D8] font-heading italic">
            &ldquo;{vipResult.reflection_question}&rdquo;
          </p>
        </div>
      )}

      {/* Footer export */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C7A65] border-t border-[#261E16] gap-3 relative z-10">
        <span>Toàn bộ 5 lá bài và phân tích chuyên sâu đã được Trạm ghi nhớ và lưu giữ cho bạn.</span>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg bg-[#1C1622] hover:bg-[#282030] text-[#DEC078] border border-[#3A2F22] hover:border-[#C9A85C] transition-all cursor-pointer"
        >
          Xuất bản in / Lưu toàn bộ 5 lá
        </button>
      </div>
    </motion.div>
  );
};
