'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  onStartReading: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartReading }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-24 bg-[#080708]">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8C6D34]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading & Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-3"
            >
              <span className="text-xs sm:text-sm font-serif tracking-[0.25em] text-[#D4AF37] uppercase block font-medium">
                DÀNH MỘT KHOẢNG LẶNG CHO CHÍNH MÌNH
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#E8D7BE] leading-[1.2]">
                Điều gì đang khiến bạn băn khoăn?
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-[#B3A492] text-sm sm:text-base leading-relaxed max-w-2xl font-sans font-light"
            >
              Có những lúc, bạn cần một góc nhìn khác để hiểu rõ điều mình đang trải qua. Hãy mang theo câu hỏi của bạn, chọn những lá bài và khám phá lời gợi mở cho bước tiếp theo.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <button
                onClick={onStartReading}
                className="w-fit px-8 py-3.5 bg-[#FAF6EE] hover:bg-[#D4AF37] text-[#14100D] font-serif font-bold text-sm tracking-[0.15em] uppercase rounded-sm transition-all shadow-[0_4px_25px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.45)] hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 group cursor-pointer"
              >
                <span className="text-[#8C6D34] group-hover:text-[#14100D] transition-colors">✦</span>
                Bắt đầu trải bài
              </button>

              <div className="text-xs text-[#8C7A65] tracking-wide font-medium">
                Tình cảm · Công việc · Những lựa chọn trong cuộc sống
              </div>
            </motion.div>
          </div>

          {/* Right Column: Celestial Zodiac Wheel */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] lg:w-[460px] lg:h-[460px]"
            >
              {/* Subtle outer glowing rings */}
              <div className="absolute inset-0 rounded-full border border-[#D4AF37]/20 scale-105 animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-[#8C6D34]/30 scale-110" />

              {/* Rotating Celestial Zodiac Image */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 160, repeat: Infinity, ease: 'linear' }}
                className="w-full h-full relative rounded-full overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.15)] cursor-pointer"
                onClick={onStartReading}
                title="Bấm để bắt đầu trải bài Tarot"
              >
                <Image
                  src="/zodiac_wheel.jpg"
                  alt="Vòng Hoàng Đạo Thiên Thể Cổ Điển"
                  fill
                  sizes="(max-width: 768px) 320px, (max-width: 1024px) 420px, 460px"
                  className="object-cover rounded-full select-none"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
