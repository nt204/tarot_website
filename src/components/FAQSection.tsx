'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'CÁCH XEM BÀI ONLINE TẠI TRẠM TAROT?',
      a: 'Bạn chỉ cần chọn chủ đề đang băn khoăn (Tổng quan, Tình cảm hoặc Công việc), chia sẻ câu hỏi của bạn và nhấn "Tiếp tục chọn bài". Sau vài giây tĩnh tâm trong lúc xào bài, bạn dùng trực giác chạm chọn các lá bài và lật từng lá để đón nhận thông điệp luận giải ấm áp, chân thành.'
    },
    {
      q: 'TÔI CÓ THỂ HỎI NHIỀU CÂU HỎI CHO TRẢI BÀI KHÔNG?',
      a: 'Đối với mỗi lần dừng chân tại Trạm Tarot, bạn nên tập trung vào một câu hỏi cốt lõi duy nhất để tâm trí có được sự thấu suốt tốt nhất. Sau khi đọc xong thông điệp, bạn hoàn toàn có thể khởi tạo một trải bài mới cho câu hỏi khác bất kỳ lúc nào.'
    },
    {
      q: 'ĐỘ CHÍNH XÁC CỦA TRẢI BÀI TẠI TRẠM TAROT?',
      a: 'Tarot là chiếc gương phản chiếu nội tâm và các khả năng tiềm ẩn chứ không phải lời tiên tri bất di bất dịch. Độ chính xác nằm ở việc giúp bạn nhận diện những nút thắt cảm xúc, nhìn thấu các lựa chọn để từ đó tìm thấy sự bình an và hướng đi đúng đắn.'
    },
    {
      q: 'TÔI CÓ THỂ LIÊN HỆ TRẠM TAROT Ở ĐÂU?',
      a: 'Bạn có thể gửi phản hồi, chia sẻ tâm tư hoặc câu chuyện của mình qua email: support@tramtarot.vn. Trạm luôn lắng nghe và đồng hành cùng hành trình thấu hiểu bản thân của bạn.'
    }
  ];

  return (
    <section id="faq" className="scroll-mt-20 py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#09080A] border-t border-[#1F1914] overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-3"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-[#C9A85C] font-heading block">
            Giải đáp thắc mắc
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-normal text-[#C9A85C] leading-snug">
            CÂU HỎI THƯỜNG GẶP
          </h2>
          <p className="text-[16px] leading-[1.75] text-[#BDB4A8] font-body">
            Những điều bạn có thể băn khoăn khi dừng chân tại Trạm Tarot.
          </p>
        </motion.div>

        {/* Accordion List */}
        <div className="divide-y divide-[#2A221A] border-y border-[#2A221A]">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="py-5 sm:py-6"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                >
                  <span className="font-heading text-lg sm:text-xl font-normal text-[#EEE6D8] group-hover:text-[#C9A85C] transition-colors pr-4 leading-snug">
                    {faq.q}
                  </span>
                  <span className="text-xl text-[#C9A85C] shrink-0 font-body">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 pr-6">
                        <p className="text-[16px] leading-[1.8] text-[#BDB4A8] font-body">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
