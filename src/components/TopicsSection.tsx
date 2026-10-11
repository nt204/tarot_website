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
    <section id="topics" className="scroll-mt-20 py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#080708] border-t border-[#1F1914] overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-3 max-w-3xl mx-auto"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-[#C9A85C] font-heading block">
            Các góc nhìn chuyên sâu
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-normal text-[#C9A85C] leading-snug">
            CÁC CHỦ ĐỀ BÓI BÀI TAROT
          </h2>
          <p className="text-[16px] leading-[1.75] text-[#BDB4A8] font-body">
            Mỗi trải bài mở ra một lăng kính rõ nét cho từng khía cạnh bạn đang quan tâm.
          </p>
        </motion.div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topics.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.65, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
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
              className="p-5 rounded-2xl bg-[#110F15] border border-[#2B231C] hover:border-[#C9A85C] transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_35px_rgba(201,168,92,0.15)]"
            >
              <div className="space-y-4">
                {/* Ảnh lá bài đại diện */}
                <div className="w-full aspect-[2/3] relative rounded-xl overflow-hidden border border-[#3A3022] group-hover:border-[#C9A85C] transition-colors bg-[#080708]">
                  <Image
                    src={t.image}
                    alt={t.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080708]/80 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-heading text-xl font-medium text-[#EEE6D8] group-hover:text-[#C9A85C] transition-colors leading-snug">
                    {t.title}
                  </h3>
                  <p className="text-sm text-[#BDB4A8] leading-relaxed font-body">
                    {t.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#231C16] flex items-center justify-between text-xs text-[#C9A85C] font-medium font-body group-hover:translate-x-0.5 transition-transform">
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
