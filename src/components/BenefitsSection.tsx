'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface BenefitsSectionProps {
  onStartReading: () => void;
}

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({ onStartReading }) => {
  const benefits = [
    {
      title: 'Riêng tư & Tĩnh lặng',
      desc: 'Không gian an toàn tuyệt đối để bạn tự do đối diện với cảm xúc thật mà không sợ bị phán xét.'
    },
    {
      title: 'Góc nhìn đa chiều',
      desc: '78 biểu tượng nguyên mẫu giúp soi chiếu những điểm mù và mở rộng góc nhìn trước quyết định quan trọng.'
    },
    {
      title: 'Hành động thực tế',
      desc: 'Không nói chung chung, luôn gợi mở những bước đi cụ thể, tích cực để bạn vững vàng làm chủ cuộc sống.'
    }
  ];

  return (
    <section id="benefits" className="scroll-mt-20 py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#080708] border-t border-[#1F1914] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Cột trái: Tiêu đề & 3 ý ngắn gọn */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-2"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-[#C9A85C] font-heading block">
                Giá trị cốt lõi
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-normal text-[#C9A85C] leading-tight">
                GIÁ TRỊ KHI ĐẾN VỚI TRẠM TAROT
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 pt-1">
              {benefits.map((b, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="p-4 rounded-xl bg-[#110F15] border border-[#261E18] hover:border-[#C9A85C]/60 transition-colors flex items-start gap-3.5"
                >
                  <span className="text-[#C9A85C] text-sm mt-0.5">✦</span>
                  <div>
                    <h3 className="font-heading text-lg font-normal text-[#EEE6D8] leading-snug">{b.title}</h3>
                    <p className="text-sm text-[#BDB4A8] font-body mt-0.5 leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
              className="pt-2"
            >
              <button
                onClick={onStartReading}
                className="px-8 py-3.5 bg-white hover:bg-[#C9A85C] text-[#14100D] font-medium text-sm rounded-sm transition-all shadow-[0_2px_15px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_25px_rgba(201,168,92,0.4)] flex items-center gap-2 group cursor-pointer"
              >
                <span className="text-[#936D42] group-hover:text-[#14100D] transition-colors text-xs">✦</span>
                <span>Bắt đầu trải bài</span>
              </button>
            </motion.div>
          </div>

          {/* Cột phải: Ảnh các lá bài giữa vũ trụ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, x: 36 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#5C4A33] shadow-[0_15px_40px_rgba(0,0,0,0.8)] group">
              <Image
                src="/tarot-values-journey.webp"
                alt="Hành trình dưới ánh sáng dẫn lối cho sự chiêm nghiệm tại Trạm Tarot"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080708]/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 border border-[#C9A85C]/20 rounded-2xl pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
