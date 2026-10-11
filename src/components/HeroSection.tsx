'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  onStartReading: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartReading }) => {
  const renderZodiacWheel = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="relative w-[250px] h-[250px] sm:w-[340px] sm:h-[340px] lg:w-[460px] lg:h-[460px]"
    >
      {/* Subtle outer glowing rings */}
      <div className="absolute inset-0 rounded-full border border-[#C9A85C]/20 scale-105 animate-pulse" />
      <div className="absolute inset-0 rounded-full border border-[#8C6D34]/30 scale-110" />

      {/* Rotating Celestial Zodiac Image - 100% GPU Compositor animation */}
      <div
        className="w-full h-full relative rounded-full overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_20px_rgba(201,168,92,0.15)] cursor-pointer animate-[spin_160s_linear_infinite] will-change-transform"
        onClick={onStartReading}
        title="Bấm để bắt đầu trải bài Tarot"
      >
        <Image
          src="/zodiac_wheel.jpg"
          alt="Vòng Hoàng Đạo Thiên Thể Cổ Điển"
          fill
          sizes="(max-width: 768px) 250px, (max-width: 1024px) 340px, 460px"
          className="object-cover rounded-full select-none"
          priority
        />
      </div>
    </motion.div>
  );

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:py-24 bg-transparent">
      {/* Background radial gradient glow - Zero GPU blur cost */}
      <div
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(140, 109, 52, 0.16) 0%, transparent 70%)'
        }}
      />
      <div
        className="absolute top-1/3 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(201, 168, 92, 0.12) 0%, transparent 70%)'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading Trạm Tarot & Tagline */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-3"
            >
              <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[#C9A85C] font-heading block">
                ✦ Điểm dừng chân chiêm nghiệm nội tâm
              </span>
              <h1 className="font-heading text-[38px] sm:text-[48px] lg:text-[58px] font-normal leading-[1.15] text-[#C9A85C] tracking-tight pb-1">
                TRẠM TAROT
              </h1>
              <p className="font-heading text-2xl sm:text-3xl text-[#EEE6D8] font-normal italic">
                Dừng một chút, hiểu mình hơn.
              </p>
            </motion.div>

            {/* Mobile & Tablet only: La bàn xuất hiện ngay trước đoạn văn bản */}
            <div className="flex lg:hidden justify-center py-2 sm:py-4">
              {renderZodiacWheel()}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-[#BDB4A8] text-[16px] leading-[1.75] max-w-2xl font-normal font-body"
            >
              Mỗi lá bài Tarot là một khoảng lặng để bạn kết nối lại với chính mình. Dù bạn đang băn khoăn về tình cảm, chững lại trong công việc hay đứng trước những lựa chọn lớn, hãy bước vào một trải bài tĩnh tâm để lắng nghe những lời gợi mở chân thành và ấm áp nhất.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <button
                onClick={onStartReading}
                className="w-fit px-8 py-3.5 bg-white hover:bg-[#C9A85C] text-[#14100D] font-medium text-[16px] rounded-sm transition-all shadow-[0_4px_25px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_30px_rgba(201,168,92,0.45)] hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5 group cursor-pointer"
              >
                <span className="text-[#936D42] group-hover:text-[#14100D] transition-colors text-base">✦</span>
                <span>Bắt đầu trải bài</span>
              </button>

              <div className="text-[15px] text-[#BDB4A8] font-normal font-body">
                Tình cảm · Công việc · Định hướng cuộc sống
              </div>
            </motion.div>
          </div>

          {/* Desktop Right Column: Celestial Zodiac Wheel */}
          <div className="hidden lg:flex lg:col-span-5 justify-end relative">
            {renderZodiacWheel()}
          </div>
        </div>
      </div>
    </section>
  );
};
