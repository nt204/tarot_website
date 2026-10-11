'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface AboutTarotSectionProps {
  onLearnMore?: () => void;
}

export const AboutTarotSection: React.FC<AboutTarotSectionProps> = ({ onLearnMore }) => {
  return (
    <section id="about-tarot" className="scroll-mt-20 py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#09080A] border-t border-[#1F1914] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Cột trái: Ảnh người phụ nữ cầm lá bài che mắt bên bàn nến (Ảnh của người dùng) */}
          <motion.div
            initial={{ opacity: 0, x: -36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative flex justify-center"
          >
            <div className="relative w-full max-w-md aspect-[2/3] rounded-2xl overflow-hidden border border-[#5C4A33] shadow-[0_20px_50px_rgba(0,0,0,0.85)] group">
              <Image
                src="/tram_tarot_reader.jpg"
                alt="Trạm Tarot - Dừng một chút, hiểu mình hơn"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080708]/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 border border-[#C9A85C]/25 rounded-2xl pointer-events-none" />
            </div>
            {/* Họa tiết trang trí góc */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-[#C9A85C]/40 rounded-br-2xl pointer-events-none hidden sm:block" />
          </motion.div>

          {/* Cột phải: Nội dung "TAROT LÀ GÌ?" & Tinh thần Trạm Tarot */}
          <motion.div
            initial={{ opacity: 0, x: 36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-[#C9A85C] font-heading block">
                Triết lý & Điểm dừng chân
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-normal text-[#C9A85C] leading-snug">
                TAROT LÀ GÌ?
              </h2>
            </div>

            <div className="space-y-4 text-[16px] leading-[1.8] text-[#BDB4A8] font-body">
              <p>
                Tarot không định đoạt số phận, mà là chiếc gương phản chiếu tâm lý và cảm xúc của chính bạn. Mỗi biểu tượng nguyên mẫu đại diện cho một trạng thái, thử thách hay bài học cuộc sống. Tại Trạm Tarot, trải bài đóng vai trò như một người bạn lắng nghe và soi tỏ, giúp bạn thấu suốt lòng mình để tự tin đưa ra quyết định vững vàng.
              </p>
              <p className="text-[#C9A85C] italic font-heading text-xl pt-1">
                &ldquo;Dừng một chút, hiểu mình hơn.&rdquo;
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onLearnMore}
                className="px-8 py-3.5 bg-white hover:bg-[#C9A85C] text-[#14100D] font-medium text-sm rounded-sm transition-all shadow-[0_2px_15px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_25px_rgba(201,168,92,0.4)] flex items-center gap-2 group cursor-pointer"
              >
                <span className="text-[#936D42] group-hover:text-[#14100D] transition-colors text-xs">✦</span>
                <span>Khám phá 78 lá bài</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
