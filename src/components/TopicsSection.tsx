'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { TopicType } from '@/types/tarot';

interface TopicsSectionProps {
  onSelectTopic: (topic: TopicType, spread?: 'three_cards' | 'daily') => void;
}

export const TopicsSection: React.FC<TopicsSectionProps> = ({ onSelectTopic }) => {
  const topics = [
    {
      id: 'love' as TopicType,
      spread: 'three_cards' as const,
      title: 'Bói Tarot Tình Yêu',
      description: 'Lắng nghe cảm xúc thật và gỡ bỏ khúc mắc trong mối quan hệ.',
      image: '/cards/06_Lovers.jpg'
    },
    {
      id: 'career' as TopicType,
      spread: 'three_cards' as const,
      title: 'Bói Tarot Công Việc',
      description: 'Định hình bước đi nghề nghiệp và nhận diện cơ hội tiềm ẩn.',
      image: '/cards/01_Magician.jpg'
    },
    {
      id: 'general' as TopicType,
      spread: 'three_cards' as const,
      title: 'Định Hướng Bản Thân',
      description: 'Khám phá nội tâm và tìm thấy điểm tựa vững vàng bên trong.',
      image: '/cards/17_Star.jpg'
    },
    {
      id: 'general' as TopicType,
      spread: 'daily' as const,
      title: 'Thông Điệp Hôm Nay',
      description: 'Rút một lá bài để nhận thông điệp tích cực cho ngày mới.',
      image: '/cards/19_Sun.jpg'
    }
  ];

  return (
    <section id="topics" className="scroll-mt-20 py-12 sm:py-20 lg:py-28 px-3 sm:px-6 lg:px-8 bg-[#080708] border-t border-[#1F1914] overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto"
        >
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#C9A85C] font-heading block">
            Các góc nhìn chuyên sâu
          </span>
          <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-normal text-[#C9A85C] leading-snug">
            CÁC CHỦ ĐỀ BÓI BÀI TAROT
          </h2>
          <p className="text-xs sm:text-[16px] leading-relaxed sm:leading-[1.75] text-[#BDB4A8] font-body max-w-xl mx-auto">
            Mỗi trải bài mở ra một lăng kính rõ nét cho từng khía cạnh bạn đang quan tâm.
          </p>
        </motion.div>

        {/* 4 Cards Grid - 2 cột nhỏ gọn trên mobile, 4 cột trên desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {topics.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => onSelectTopic(t.id, t.spread)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectTopic(t.id, t.spread);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Bắt đầu ${t.title}`}
              className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#110F15] border border-[#2B231C] hover:border-[#C9A85C] transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between cursor-pointer shadow-[0_6px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_35px_rgba(201,168,92,0.15)]"
            >
              <div className="space-y-2.5 sm:space-y-4">
                {/* Ảnh lá bài đại diện */}
                <div className="w-full h-32 sm:h-auto sm:aspect-[2/3] relative rounded-lg sm:rounded-xl overflow-hidden border border-[#3A3022] group-hover:border-[#C9A85C] transition-colors bg-[#080708]">
                  <Image
                    src={t.image}
                    alt={t.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080708]/80 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  <h3 className="font-heading text-sm sm:text-xl font-medium text-[#EEE6D8] group-hover:text-[#C9A85C] transition-colors leading-snug line-clamp-1 sm:line-clamp-none">
                    {t.title}
                  </h3>
                  <p className="text-[11px] sm:text-sm text-[#BDB4A8] leading-normal sm:leading-relaxed font-body line-clamp-2 sm:line-clamp-none">
                    {t.description}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 sm:pt-4 mt-2 sm:mt-0 border-t border-[#231C16] flex items-center justify-between text-[11px] sm:text-xs text-[#C9A85C] font-medium font-body group-hover:translate-x-0.5 transition-transform">
                <span>Trải bài ngay</span>
                <span>→</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
